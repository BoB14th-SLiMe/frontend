import React, { useState, useEffect, useRef } from 'react';
import { Box, Select, MenuItem } from '@mui/material';
import * as echarts from 'echarts';
import DashboardBlock from '../DashboardBlock';
import { useTimeRange } from '../../hooks/TimeRangeContext';
import { COMPONENT_COLORS } from '../../theme';

const generateData = (timeRange) => {
    const data = [];
    const now = new Date();
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
        const dayOfWeek = time.getDay();

        let baseValue;
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        if (isWeekend) {
            baseValue = 20 + Math.random() * 30;
        } else if (hour >= 9 && hour <= 17) {
            baseValue = 50 + Math.random() * 40;
        } else {
            baseValue = 20 + Math.random() * 30;
        }

        data.push({
            time: time,
            value: Math.round(baseValue)
        });
    }
    return data;
};


const RealtimeThreatChart = ({ showControls = true, isEmbedded = false }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const { threatTimeRange, setThreatTimeRange } = useTimeRange();
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const updateData = () => {
            setChartData(generateData(threatTimeRange));
        };
        updateData();
    }, [threatTimeRange]);

    useEffect(() => {
        if (!chartRef.current || chartData.length === 0) return;

        if (!chartInstance.current) {
            chartInstance.current = echarts.init(chartRef.current);
        }

        const labels = chartData.map((d, index) => {
            const time = d.time;
            const hour = time.getHours();
            
            if (threatTimeRange === '1h' || threatTimeRange === '6h') {
                if (index % (Math.floor(chartData.length/6)) === 0) {
                    return `${hour.toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
                }
                return '';
            }
            else if (threatTimeRange === '24h') {
                 if (index % 2 === 0) {
                    return hour.toString().padStart(2, '0') + '시';
                 }
                 return '';
            } else { // 7d
                if (index % 24 === 0) {
                    const month = (time.getMonth() + 1).toString().padStart(2, '0');
                    const day = time.getDate().toString().padStart(2, '0');
                    return `${month}/${day}`;
                }
                return '';
            }
        });

        const option = {
            animation: false,
            grid: {
                left: '3%',
                right: '4%',
                bottom: '8%',
                top: '5%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: labels,
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: { color: '#666', fontSize: 11, interval: 'auto' },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        type: 'solid'
                    }
                }
            },
            yAxis: {
                type: 'value',
                min: 0,
                max: 100,
                interval: 25,
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: { color: '#666', fontSize: 11 },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        type: 'solid'
                    }
                }
            },
            series: [
                {
                    type: 'line',
                    data: chartData.map(d => d.value),
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        color: COMPONENT_COLORS.threat.line,
                        width: 2
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            {
                                offset: 0,
                                color: COMPONENT_COLORS.threat.area[0]
                            },
                            {
                                offset: 1,
                                color: COMPONENT_COLORS.threat.area[1]
                            }
                        ])
                    },
                    emphasis: {
                        focus: 'series',
                        itemStyle: {
                            color: COMPONENT_COLORS.threat.line,
                            borderColor: '#fff',
                            borderWidth: 2
                        }
                    }
                }
            ],
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderColor: COMPONENT_COLORS.threat.line,
                borderWidth: 1,
                textStyle: { color: '#fff' },
                axisPointer: {
                    type: 'line',
                    lineStyle: {
                        color: COMPONENT_COLORS.threat.line,
                        width: 1,
                        type: 'solid'
                    }
                },
                formatter: (params) => {
                    const dataIndex = params[0].dataIndex;
                    if (!chartData[dataIndex]) return '';
                    const time = chartData[dataIndex].time;
                    const month = time.getMonth() + 1;
                    const day = time.getDate();
                    const hour = time.getHours();
                    const value = params[0].value;
                    
                    return `${month}/${day} ${hour.toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}<br/>위협 수: ${value}`;
                }
            }
        };

        chartInstance.current.setOption(option, true);

        const handleResize = () => {
            chartInstance.current?.resize();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [chartData, threatTimeRange]);

    useEffect(() => {
        return () => {
            chartInstance.current?.dispose();
        };
    }, []);

    const timeRangeSelector = showControls ? (
        <Select
            value={threatTimeRange}
            onChange={(e) => setThreatTimeRange(e.target.value)}
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
                minHeight: 0
            }} 
        />
    );

    if (isEmbedded) {
        return chartBox;
    }

    return (
        <DashboardBlock 
            title="실시간 위협 수"
            controls={timeRangeSelector}
            sx={{ height: '100%', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        >
            {chartBox}
        </DashboardBlock>
    );
};

export default RealtimeThreatChart;
