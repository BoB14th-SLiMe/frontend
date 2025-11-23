// src/components/Risk/ThreatTypeTop5.jsx

import React, { useState, useEffect } from 'react';
import DashboardBlock from '../DashboardBlock';
import ReactECharts from 'echarts-for-react';
import { Box } from '@mui/material';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Color palette
const COLOR_PALETTE = [
    '#4EBCD5',
    '#8AD09A',
    '#54B39B',
    '#3D8BFD',
    '#607D8B'
];

export default function ThreatTypeTop5() {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/dashboard/threats/top-types`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();

                setChartData(data || []);
                setLoading(false);
            } catch (error) {
                console.error('❌ 위협 유형 Top 5 데이터 로드 실패:', error);
                // Use fallback data on error
                setChartData([
                    { value: 55, name: '산업 프로토콜 이상 행위' },
                    { value: 25, name: '비인가 제어 시스템 접근' },
                    { value: 10, name: '서비스 거부(DoS) 공격' },
                    { value: 7, name: '비정상 레지스터' },
                    { value: 3, name: '리플레이(Replay) 공격' }
                ]);
                setLoading(false);
            }
        };

        fetchData();

        // Refresh every 60 seconds
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    const option = {
        animation: false,
        tooltip: {
            trigger: 'item',
            formatter: '{b} : {c}건 ({d}%)'
        },
        legend: {
            show: true,
            bottom: 15,
            left: 'center',
            orient: 'horizontal',
            icon: 'circle',
            itemGap: 12,
            textStyle: {
                color: '#333'
            },
            data: chartData.map(item => item.name)
        },
        color: COLOR_PALETTE,
        series: [
            {
                name: '위협 유형',
                type: 'pie',
                radius: ['30%', '50%'],
                center: ['50%', '25%'],
                avoidLabelOverlap: false,
                label: {
                    show: false,
                },
                labelLine: {
                    show: false
                },
                data: chartData
            }
        ]
    };

    return (
        <DashboardBlock
            title="위협 유형 Top 5"
            sx={{ height: '100%' }}
        >
            <Box sx={{ flexGrow: 1, width: '100%', height: '100%' }}>
                <ReactECharts
                    option={option}
                    style={{ height: '100%', width: '100%' }}
                    notMerge={true}
                    lazyUpdate={true}
                    showLoading={loading}
                />
            </Box>
        </DashboardBlock>
    );
}