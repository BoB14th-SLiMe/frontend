import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Box, ToggleButtonGroup, ToggleButton } from '@mui/material';
import * as echarts from 'echarts';
import DashboardBlock from '../DashboardBlock';

// Mock 데이터 생성 함수 (24시간용)
const generate24HourData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hour = time.getHours();
        
        // 시간대별 패턴 생성 (오전 9-11시에 피크)
        let baseValue;
        if (hour >= 9 && hour <= 11) {
            baseValue = 70 + Math.random() * 30; // 70-100
        } else if (hour >= 7 && hour <= 14) {
            baseValue = 40 + Math.random() * 40; // 40-80
        } else if (hour >= 0 && hour <= 6) {
            baseValue = 10 + Math.random() * 20; // 10-30
        } else {
            baseValue = 30 + Math.random() * 30; // 30-60
        }
        
        data.push({
            time: time,
            value: Math.round(baseValue)
        });
    }
    
    return data;
};

// Mock 데이터 생성 함수 (7일용)
const generate7DayData = () => {
    const data = [];
    const now = new Date();
    
    // 7일 * 24시간 = 168개 데이터 포인트
    for (let i = 167; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hour = time.getHours();
        const dayOfWeek = time.getDay();
        
        // 평일/주말 및 시간대별 패턴
        let baseValue;
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        if (isWeekend) {
            baseValue = 20 + Math.random() * 30; // 주말은 낮음
        } else if (hour >= 9 && hour <= 17) {
            baseValue = 50 + Math.random() * 40; // 평일 업무시간
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

const RealtimeThreatChart = () => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const [timeRange, setTimeRange] = useState('24h'); // '24h' or '7d'
    const [chartData, setChartData] = useState([]);

    // 1시간마다 데이터 업데이트
    useEffect(() => {
        const updateData = () => {
            if (timeRange === '24h') {
                setChartData(generate24HourData());
            } else {
                setChartData(generate7DayData());
            }
        };

        // 초기 데이터 로드
        updateData();

        // 1시간마다 업데이트
        const interval = setInterval(updateData, 60 * 60 * 1000);

        return () => clearInterval(interval);
    }, [timeRange]);

    // ECharts 초기화 및 업데이트
    useEffect(() => {
        if (!chartRef.current || chartData.length === 0) return;

        // 차트 인스턴스 생성
        if (!chartInstance.current) {
            chartInstance.current = echarts.init(chartRef.current);
        }

        // 라벨 생성
        const labels = chartData.map((d, index) => {
            if (timeRange === '24h') {
                return d.time.getHours().toString().padStart(2, '0');
            } else {
                // 7일: 12시간마다 표시
                if (index % 12 === 0) {
                    const month = (d.time.getMonth() + 1).toString().padStart(2, '0');
                    const day = d.time.getDate().toString().padStart(2, '0');
                    return `${month}/${day}`;
                }
                return '';
            }
        });

        // ECharts 옵션
        const option = {
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
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    color: '#666',
                    fontSize: 11
                },
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
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    color: '#666',
                    fontSize: 11
                },
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
                        color: '#81D4C2',
                        width: 2
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            {
                                offset: 0,
                                color: 'rgba(129, 212, 194, 0.4)'
                            },
                            {
                                offset: 1,
                                color: 'rgba(129, 212, 194, 0.05)'
                            }
                        ])
                    },
                    emphasis: {
                        focus: 'series',
                        itemStyle: {
                            color: '#81D4C2',
                            borderColor: '#fff',
                            borderWidth: 2
                        }
                    }
                }
            ],
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderColor: '#81D4C2',
                borderWidth: 1,
                textStyle: {
                    color: '#fff'
                },
                axisPointer: {
                    type: 'line',
                    lineStyle: {
                        color: '#81D4C2',
                        width: 1,
                        type: 'solid'
                    }
                },
                formatter: (params) => {
                    const dataIndex = params[0].dataIndex;
                    const time = chartData[dataIndex].time;
                    const month = time.getMonth() + 1;
                    const day = time.getDate();
                    const hour = time.getHours();
                    const value = params[0].value;
                    
                    return `${month}/${day} ${hour.toString().padStart(2, '0')}:00<br/>위협 수: ${value}`;
                }
            }
        };

        chartInstance.current.setOption(option);

        // 리사이즈 핸들러
        const handleResize = () => {
            chartInstance.current?.resize();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [chartData, timeRange]);

    // 컴포넌트 언마운트 시 차트 정리
    useEffect(() => {
        return () => {
            chartInstance.current?.dispose();
        };
    }, []);

    const toggleButtons = (
        <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={(e, newValue) => {
                if (newValue !== null) {
                    setTimeRange(newValue);
                }
            }}
            size="small"
            sx={{
                '& .MuiToggleButton-root': {
                    px: 2,
                    py: 0.5,
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    border: '1px solid #e0e0e0',
                    '&.Mui-selected': {
                        backgroundColor: 'rgba(129, 212, 194, 0.2)',
                        color: 'rgba(129, 212, 194, 1)',
                        fontWeight: 600,
                        '&:hover': {
                            backgroundColor: 'rgba(129, 212, 194, 0.3)',
                        }
                    }
                }
            }}
        >
            <ToggleButton value="24h">24시간</ToggleButton>
            <ToggleButton value="7d">7일</ToggleButton>
        </ToggleButtonGroup>
    );

    return (
        <DashboardBlock 
            title="실시간 위협 수"
            controls={toggleButtons}
            sx={{ height: '100%', flex: 1, overflow: 'hidden' }}
        >
            <Box 
                ref={chartRef} 
                sx={{ 
                    width: '100%', 
                    height: 250,
                    minHeight: 200 
                }} 
            />
        </DashboardBlock>
    );
};

export default RealtimeThreatChart;