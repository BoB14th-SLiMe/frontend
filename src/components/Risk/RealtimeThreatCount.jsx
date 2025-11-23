import React, { useState, useEffect, useRef } from 'react';
import { Box, ToggleButtonGroup, ToggleButton } from '@mui/material';
import * as echarts from 'echarts';
import DashboardBlock from '../DashboardBlock';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const RealtimeThreatChart = () => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const [timeRange, setTimeRange] = useState('24h'); // '24h' or '7d'
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fallback data generation
    const generateFallbackData = () => {
        const data = [];
        const now = new Date();
        const hours = timeRange === '24h' ? 24 : 168;

        for (let i = hours - 1; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 60 * 60 * 1000);
            const hour = time.getHours();

            let baseValue;
            if (hour >= 9 && hour <= 11) {
                baseValue = 70 + Math.random() * 30;
            } else if (hour >= 7 && hour <= 14) {
                baseValue = 40 + Math.random() * 40;
            } else if (hour >= 0 && hour <= 6) {
                baseValue = 10 + Math.random() * 20;
            } else {
                baseValue = 30 + Math.random() * 30;
            }

            data.push({
                time: time,
                value: Math.round(baseValue)
            });
        }

        return data;
    };

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/dashboard/threats/timeline?range=${timeRange}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();

                // Transform API data
                const transformedData = (result.data || []).map(item => ({
                    time: new Date(item.timestamp || item.time),
                    value: item.value || 0
                }));

                setChartData(transformedData);
                setLoading(false);
            } catch (error) {
                console.error('❌ 실시간 위협 수 데이터 로드 실패:', error);
                // Use fallback mock data on error
                setChartData(generateFallbackData());
                setLoading(false);
            }
        };

        fetchData();

        // Refresh every 60 seconds
        const interval = setInterval(fetchData, 60000);
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
            sx={{ height: '100%', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        >
            <Box 
                ref={chartRef} 
                sx={{ 
                    width: '100%', 
                    flex: 1,
                    minHeight: 0
                }} 
            />
        </DashboardBlock>
    );
};

export default RealtimeThreatChart;