import React, { useState, useEffect, useRef } from 'react';
import { Box, ToggleButtonGroup, ToggleButton } from '@mui/material';
import * as echarts from 'echarts';
import DashboardBlock from '../DashboardBlock';
import { threatApi } from '../../service/apiService';

const RealtimeThreatChart = () => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const [timeRange, setTimeRange] = useState('24h'); // '24h' or '7d'
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    // API에서 데이터 가져오기
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await threatApi.getThreatTimeline(timeRange);
                const apiData = response.data.data || [];

                // API 데이터를 차트 형식으로 변환
                const transformedData = apiData.map(item => ({
                    time: new Date(item.timestamp || item.time),
                    value: item.value || 0
                }));

                setChartData(transformedData);
            } catch (error) {
                console.error('❌ 실시간 위협 수 데이터 로드 실패:', error);
                // 에러 시 빈 데이터
                setChartData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // 1분마다 데이터 업데이트
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

        // 최대값 동적 계산 (데이터 최대값의 1.2배)
        const maxValue = Math.max(...chartData.map(d => d.value));
        const yAxisMax = Math.ceil(maxValue * 1.2 / 10) * 10; // 10 단위로 올림

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
                max: yAxisMax || 100, // 동적 최대값, 데이터 없으면 100
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
