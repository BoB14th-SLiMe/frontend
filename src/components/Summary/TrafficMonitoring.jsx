// src/components/TrafficMonitoring.jsx

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  useTheme,
} from '@mui/material';
import * as echarts from 'echarts';
import DashboardBlock from '../DashboardBlock';
import { trafficApi } from '../../service/apiService';


/** 메인 컴포넌트 */
const TrafficMonitoring = () => {
  const theme = useTheme();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [chartData, setChartData] = useState({ current: [], average: [], labels: [] });
  const [loading, setLoading] = useState(true);

  const attackBarColor = theme.palette.error.main || '#d32f2f';
  const avgLineColor = theme.palette.success.main || '#2e7d32';

  // Elasticsearch 데이터 가져오기
  const fetchTrafficData = async () => {
    try {
      setLoading(true);
      const response = await trafficApi.getTrafficMonitoring();
      const { current, threats, average } = response.data;

      // 현재 트래픽 데이터 처리
      const currentData = current.map((item, index) => {
        const time = new Date(item.time);
        const threatCount = threats[index]?.count || 0;
        const isAttack = threatCount > 5; // 임계값 설정 (5개 이상이면 공격으로 간주)

        return {
          time: time,
          value: item.value || 0,
          isAttack: isAttack,
        };
      });

      // 7일 평균 데이터 처리
      const averageData = average.map((item) => ({
        time: null, // 시간대별 평균이므로 시간 정보 없음
        value: item.value || 0,
        hour: item.hour,
      }));

      // 현재 시간 기준으로 24시간 레이블 생성
      const labels = currentData.map((d) => {
        return d.time.getHours().toString().padStart(2, '0') + '시';
      });

      setChartData({ current: currentData, average: averageData, labels });
      setLoading(false);
    } catch (error) {
      console.error('트래픽 데이터 조회 실패:', error);
      // 에러 발생 시 빈 데이터로 설정
      setChartData({ current: [], average: [], labels: [] });
      setLoading(false);
    }
  };

  // 초기 데이터 로드 및 주기적 업데이트
  useEffect(() => {
    fetchTrafficData();

    // 1분마다 데이터 자동 갱신
    const intervalId = setInterval(() => {
      fetchTrafficData();
    }, 60000); // 60초

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // 2. ECharts 초기화 및 데이터 업데이트
  useEffect(() => {
    if (!chartRef.current || chartData.labels.length === 0) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const defaultBarColor = '#e0e0e0';

    // ⭐️ 범례 고정
    const legendData = ['현재 트래픽', '7일 평균'];

    // ⭐️ 시리즈 고정
    const series = [
      {
        name: '현재 트래픽',
        type: 'bar',
        large: true, 
        barWidth: '70%',
        data: chartData.current.map(d => ({
          value: d.value,
          itemStyle: {
            color: d.isAttack ? attackBarColor : defaultBarColor,
            borderRadius: [2, 2, 0, 0] 
          }
        })),
      },
      {
        name: '7일 평균',
        type: 'line',
        smooth: true,
        showSymbol: true, 
        symbolSize: 5,     
        data: chartData.average.map(d => d.value),
        lineStyle: {
          color: avgLineColor,
          width: 2,
        },
        itemStyle: {
          color: avgLineColor,
        },
      }
    ];

    const option = {
      animation: false,
      legend: {
        data: legendData, // ⭐️ 고정
        right: 10,
        top: 0,
        itemWidth: 10,
        itemHeight: 10,
        textStyle: {
          color: '#333'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '8%',
        top: '18%', 
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: chartData.labels,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#666', fontSize: 11 },
        splitLine: { show: false } 
      },
      yAxis: {
        type: 'value',
        min: 0,
        interval: 10, 
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#666', fontSize: 11 },
        splitLine: {
          show: true,
          lineStyle: {
            color: 'rgba(0, 0, 0, 0.05)', 
            type: 'solid',
          },
        },
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#333',
        textStyle: { color: '#fff' },
        axisPointer: {
          type: 'shadow', 
        },
        formatter: (params) => {
          const dataIndex = params[0].dataIndex;
          if (!chartData.current[dataIndex]) return; 
          
          const time = chartData.current[dataIndex].time;
          const isAttack = chartData.current[dataIndex].isAttack;

          const timeStr = `${time.getMonth() + 1}/${time.getDate()} ${time.getHours().toString().padStart(2, '0')}:00`;
          
          let tooltip = `${timeStr}<br/>`;

          params.forEach(param => {
            tooltip += `${param.marker} ${param.seriesName}: ${param.value} Mbps`;
            if (param.seriesName === '현재 트래픽' && isAttack) {
              tooltip += ` <strong style="color: ${attackBarColor};">(공격 감지)</strong>`;
            }
            tooltip += `<br/>`;
          });
          
          return tooltip.slice(0, -5); 
        },
      },
      series: series, // ⭐️ 고정
    };

    chartInstance.current.setOption(option, true); 

    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [chartData, theme, attackBarColor, avgLineColor]); // ⭐️ timeRange 의존성 제거

  // 컴포넌트 언마운트 시 차트 정리
  useEffect(() => {
    return () => {
      chartInstance.current?.dispose();
    };
  }, []);

  // ⭐️ 토글 버튼 변수(toggleButtons) 제거

  return (
    <DashboardBlock
      title="트래픽 모니터링" 
      sx={{ height: '100%', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
      <Box
        ref={chartRef}
        sx={{
          width: '100%',
          flex: 1,
          minHeight: 0,
        }}
      />
    </DashboardBlock>
  );
};

export default TrafficMonitoring;