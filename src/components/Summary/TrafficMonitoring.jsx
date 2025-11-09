import React, { useState, useEffect, useRef } from 'react';
import { Box, useTheme, Select, MenuItem } from '@mui/material';
import * as echarts from 'echarts';
import DashboardBlock from '../DashboardBlock';
import { useTimeRange } from '../../hooks/TimeRangeContext';
import { COMPONENT_COLORS } from '../../theme';

const generateData = (timeRange) => {
  const now = new Date();
  const data = { current: [], average: [], labels: [] };
  
  let points;
  let interval; // in minutes

  switch (timeRange) {
    case '1h':
      points = 60;
      interval = 1;
      break;
    case '6h':
      points = 360;
      interval = 1;
      break;
    case '24h':
      points = 24;
      interval = 60;
      break;
    case '7d':
      points = 7 * 24;
      interval = 60;
      break;
    default:
      points = 24;
      interval = 60;
  }

  for (let i = points - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * interval * 60 * 1000);
    const hour = time.getHours();
    const day = time.getDay();

    // Current Traffic
    let currentBase = 20 + Math.random() * 10;
    if (hour >= 9 && hour <= 11) currentBase += Math.random() * 15;
    let isAttack = Math.random() < 0.05;
    if (isAttack) currentBase += 20 + Math.random() * 10;
    data.current.push({
      time: time,
      value: Math.round(currentBase),
      isAttack: isAttack,
    });

    // Average Traffic
    let avgBase = (day === 0 || day === 6) ? 15 : 20; // Weekend vs Weekday
    if (hour >= 9 && hour <= 11) avgBase += 5;
    data.average.push({
      time: time,
      value: Math.round(avgBase + (Math.random() - 0.5) * 2),
    });

    // Labels
    if (timeRange === '1h' || timeRange === '6h') {
        if (i % (Math.floor(points/6)) === 0) {
             data.labels.push(`${hour.toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`);
        } else {
            data.labels.push('');
        }
    }
    else if (timeRange === '24h') {
      if (i % 2 === 0) {
        data.labels.push(hour.toString().padStart(2, '0') + '시');
      } else {
        data.labels.push('');
      }
    } else { // 7d
       if (i % 24 === 0) {
         data.labels.push(`${time.getMonth() + 1}/${time.getDate()}`);
       } else {
         data.labels.push('');
       }
    }
  }
    if (timeRange === '7d') {
        data.labels[data.labels.length -1] = 'Today';
    }


  return data;
};


const TrafficMonitoring = ({ title = "트래픽 모니터링", showControls = true, isEmbedded = false }) => {
  const theme = useTheme();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { trafficTimeRange, setTrafficTimeRange } = useTimeRange();
  const [chartData, setChartData] = useState({ current: [], average: [], labels: [] });

  const attackBarColor = COMPONENT_COLORS.traffic.attack;
  const avgLineColor = COMPONENT_COLORS.traffic.average;

  useEffect(() => {
    const data = generateData(trafficTimeRange);
    setChartData(data);
  }, [trafficTimeRange]);

  useEffect(() => {
    if (!chartRef.current || chartData.labels.length === 0) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const defaultBarColor = COMPONENT_COLORS.traffic.current;
    const legendData = ['현재 트래픽', '7일 평균'];

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
        showSymbol: false,
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
        data: legendData,
        right: 10,
        top: 0,
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: '#333' }
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
        axisLabel: { color: '#666', fontSize: 11, interval: 'auto' },
        splitLine: { show: false }
      },
      yAxis: {
        type: 'value',
        min: 0,
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
        axisPointer: { type: 'shadow' },
        formatter: (params) => {
          const dataIndex = params[0].dataIndex;
          if (!chartData.current[dataIndex]) return '';
          
          const time = chartData.current[dataIndex].time;
          const isAttack = chartData.current[dataIndex].isAttack;
          const timeStr = `${time.getMonth() + 1}/${time.getDate()} ${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
          
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
      series: series,
    };

    chartInstance.current.setOption(option, true);

    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [chartData, theme, attackBarColor, avgLineColor, trafficTimeRange]);

  useEffect(() => {
    return () => chartInstance.current?.dispose();
  }, []);

  const timeRangeSelector = showControls ? (
    <Select
        value={trafficTimeRange}
        onChange={(e) => setTrafficTimeRange(e.target.value)}
        size="small"
        sx={{
            fontSize: '0.8rem',
            height: 28,
            '& .MuiSelect-select': { py: 0.2 },
        }}
    >
        <MenuItem value={'1h'}>1시간</MenuItem>
        <MenuItem value={'6h'}>6시간</MenuItem>
        <MenuItem value={'24h'}>24시간</MenuItem>
        <MenuItem value={'7d'}>7일</MenuItem>
    </Select>
  ) : null;

  const chartBox = (
    <Box
      ref={chartRef}
      sx={{
        width: '100%',
        flex: 1,
        minHeight: 0,
      }}
    />
  );

  if (isEmbedded) {
    return chartBox;
  }

  return (
    <DashboardBlock
      title={title}
      controls={timeRangeSelector}
      sx={{ height: '100%', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
      {chartBox}
    </DashboardBlock>
  );
};

export default TrafficMonitoring;