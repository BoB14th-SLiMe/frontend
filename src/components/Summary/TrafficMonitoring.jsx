// src/components/TrafficMonitoring.jsx

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  useTheme,
} from '@mui/material';
import * as echarts from 'echarts';
import DashboardBlock from '../DashboardBlock';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/** Fallback data generation */
const generateFallbackData = () => {
  const current = [];
  const average = [];
  const labels = [];
  const now = new Date();

  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = time.getHours();
    let baseValue = 20 + Math.random() * 10;
    let isAttack = false;

    if (hour >= 9 && hour <= 11) {
      baseValue += Math.random() * 15;
    }

    if (Math.random() < 0.05) {
      baseValue += 20 + Math.random() * 10;
      isAttack = true;
    }

    current.push({
      time: time,
      value: Math.round(baseValue),
      isAttack: isAttack,
    });

    average.push({
      time: time,
      value: Math.round(20 + (Math.random() - 0.5) * 2),
    });

    labels.push(hour.toString().padStart(2, '0') + '시');
  }

  return { current, average, labels };
};

/** Main component */
const TrafficMonitoring = () => {
  const theme = useTheme();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [chartData, setChartData] = useState({ current: [], average: [], labels: [] });
  const [loading, setLoading] = useState(true);

  const attackBarColor = theme.palette.error.main || '#d32f2f';
  const avgLineColor = theme.palette.success.main || '#2e7d32';

  // Fetch traffic data from API
  useEffect(() => {
    const fetchTrafficData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/traffic/monitoring`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        const current = [];
        const average = [];
        const labels = [];

        // Process current traffic data (last 24 hours)
        (data.current || []).forEach((item, index) => {
          const time = new Date(item.timestamp || item.time);
          const hour = time.getHours();

          // Check if this hour has threats
          const threatItem = (data.threats || []).find(t => {
            const threatTime = new Date(t.timestamp || t.time);
            return threatTime.getHours() === hour;
          });

          current.push({
            time: time,
            value: item.traffic_mbps || item.value || 0,
            isAttack: (threatItem && (threatItem.count || 0) > 0) || false,
          });

          labels.push(hour.toString().padStart(2, '0') + '시');
        });

        // Process average traffic data
        (data.average || []).forEach(item => {
          const time = new Date(item.timestamp || item.time);
          average.push({
            time: time,
            value: item.traffic_mbps || item.value || 0,
          });
        });

        // Ensure we have data for all 24 hours
        if (current.length === 0) {
          const fallback = generateFallbackData();
          setChartData(fallback);
        } else {
          setChartData({ current, average, labels });
        }

        setLoading(false);
      } catch (error) {
        console.error('❌ 트래픽 모니터링 데이터 로드 실패:', error);
        // Use fallback data on error
        const fallback = generateFallbackData();
        setChartData(fallback);
        setLoading(false);
      }
    };

    fetchTrafficData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchTrafficData, 30000);
    return () => clearInterval(interval);
  }, [])

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