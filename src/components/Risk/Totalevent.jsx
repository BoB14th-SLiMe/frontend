// src/components/Risk/ThreatGradeIncidence.jsx
import React, { useState, useEffect } from 'react';
import DashboardBlock from '../DashboardBlock';
import { Box, Typography, CircularProgress } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import { threatApi } from '../../service/apiService';

export default function ThreatGradeIncidence() {
    const [barData, setBarData] = useState([
        { label: '경고', value: 0, color: '#FFA726' },
        { label: '긴급', value: 0, color: '#E91E63' }
    ]);
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await threatApi.getThreatsByLevel();
                const data = response.data;

                // 막대 그래프 데이터 업데이트
                setBarData([
                    { label: '경고', value: data.attention || 0, color: '#FFA726' },
                    { label: '긴급', value: data.warning || 0, color: '#E91E63' }
                ]);

                // 테이블 데이터 업데이트 (상위 3개 목적지)
                const destinations = (data.destinations || []).map(dest => ({
                    ip: dest.ip,
                    count: parseInt(dest.count) || 0
                }));
                setTableData(destinations);

            } catch (error) {
                console.error('❌ 위협 등급별 사건 수 데이터 로드 실패:', error);
                // 에러 시 fallback 데이터
                setBarData([
                    { label: '경고', value: 21, color: '#FFA726' },
                    { label: '긴급', value: 2, color: '#E91E63' }
                ]);
                setTableData([
                    { ip: 'PLC-001', count: 30 },
                    { ip: 'PLC-002', count: 10 },
                    { ip: 'PLC-003', count: 5 },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // 1분마다 갱신
        const interval = setInterval(fetchData, 60000);

        return () => clearInterval(interval);
    }, []);
    // 동적 x축 최대값 계산
    const maxValue = Math.max(...barData.map(item => item.value));
    const xAxisMax = Math.ceil(maxValue * 1.2 / 10) * 10 || 25; // 데이터의 1.2배, 최소 25

    const option = {
        animation: false,
        grid: {
            left: 60,
            right: 30,
            top: 0,
            bottom: 20,
            containLabel: false
        },
        xAxis: {
            type: 'value',
            show: false,
            max: xAxisMax
        },
        yAxis: {
            type: 'category',
            data: barData.map(item => item.label),
            axisLine: { show: true, lineStyle: { color: '#ddd' } },
            axisTick: { show: false },
            axisLabel: {
                fontSize: 14,
                color: '#666',
                fontWeight: 500
            }
        },
        series: [
            {
                type: 'bar',
                data: barData.map(item => ({
                    value: item.value,
                    itemStyle: {
                        color: item.color,
                        borderRadius: [0, 20, 20, 0]
                    },
                    label: {
                        show: true,
                        position: 'right',
                        formatter: '{c}',
                        fontSize: 15,
                        fontWeight: 600,
                        color: '#333'
                    }
                })),
                barWidth: 28,
                barCategoryGap: '40%'
            }
        ]
    };

    return (
        <DashboardBlock 
            title="위협 등급별 사건 수 (7일)" 
            sx={{ height: '100%', flex: 1, minWidth: 0 }} 
        >
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%'
            }}>
                {/* 막대 그래프 */}
                <Box sx={{ height: 80 }}>
                    <ReactECharts 
                        option={option}
                        style={{ height: '100%', width: '100%' }}
                    />
                </Box>
                
                {/* 공격 목적지 자산 테이블 */}
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                    <Typography sx={{ 
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: '#333',
                        mb: 0.5
                    }}>
                        목적지 자산
                    </Typography>
                    
                    <Box sx={{ display: 'flex', mb: 1.5, pb: 0.1, borderBottom: '1px solid #f0f0f0' }}>
                        <Typography sx={{ 
                            flex: 1,
                            fontSize: '0.8rem',
                            color: '#999',
                            fontWeight: 500
                        }}>
                            목적지
                        </Typography>
                        <Typography sx={{ 
                            width: 80,
                            fontSize: '0.8rem',
                            color: '#999',
                            fontWeight: 500,
                            textAlign: 'right'
                        }}>
                            공격 횟수
                        </Typography>
                    </Box>
                    
                    {tableData.map((row, idx) => (
                        <Box key={idx} sx={{ 
                            display: 'flex',
                            py: 0.8,
                            borderBottom: idx < tableData.length - 1 ? '1px solid #f5f5f5' : 'none'
                        }}>
                            <Typography sx={{ 
                                flex: 1,
                                fontSize: '0.85rem',
                                color: '#333'
                            }}>
                                {row.ip}
                            </Typography>
                            <Typography sx={{ 
                                width: 80,
                                fontSize: '0.85rem',
                                color: '#333',
                                textAlign: 'right'
                            }}>
                                {row.count}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>
        </DashboardBlock>
    );
}
