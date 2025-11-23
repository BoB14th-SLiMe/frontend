// src/components/Risk/ThreatTypeTop5.jsx

import React, { useState, useEffect } from 'react';
import DashboardBlock from '../DashboardBlock';
import ReactECharts from 'echarts-for-react';
import { Box, CircularProgress } from '@mui/material';
import { threatApi } from '../../service/apiService';

// 색상 팔레트
const COLOR_PALETTE = [
    '#4EBCD5', // 첫 번째 위협 유형
    '#8AD09A', // 두 번째 위협 유형
    '#54B39B', // 세 번째 위협 유형
    '#3D8BFD', // 네 번째 위협 유형
    '#607D8B'  // 다섯 번째 위협 유형
];

export default function ThreatTypeTop5({ showLoading = false }) {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await threatApi.getThreatTopTypes();
                const data = response.data || [];

                setChartData(data);
            } catch (error) {
                console.error('❌ 위협 유형 Top 5 데이터 로드 실패:', error);
                // 에러 시 fallback 데이터
                setChartData([
                    { value: 55, name: '산업 프로토콜 이상 행위' },
                    { value: 25, name: '비인가 제어 시스템 접근' },
                    { value: 10, name: '서비스 거부(DoS) 공격' },
                    { value: 7, name: '비정상 레지스터' },
                    { value: 3, name: '리플레이(Replay) 공격' }
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

    // ECharts 옵션 설정
    const option = {
        animation: false,
        tooltip: {
            trigger: 'item',
            formatter: '{b} : {c}건 ({d}%)' // 호버 시 툴팁 포맷
        },
        // 범례(Legend) 설정
        legend: {
            show: true,
            bottom: 15,           // 차트 하단에서 15px 띄움
            left: 'center',       // 수평 중앙 정렬
            orient: 'horizontal', // 가로 방향으로 배치
            icon: 'circle',       // 아이콘을 원형으로
            itemGap: 12,          // 범례 아이템 간 간격
            textStyle: {
                color: '#333'
            },
            // 범례 데이터 순서를 데이터 이름으로 지정
            data: chartData.map(item => item.name)
        },
        // 색상 적용
        color: COLOR_PALETTE,
        series: [
            {
                name: '위협 유형',
                type: 'pie',
                // 도넛 차트 모양 설정 [내부 반지름, 외부 반지름]
                radius: ['30%', '50%'],
                // 차트 위치 중앙 정렬
                // [가로, 세로] - 세로를 '25%'로 하여 하단 범례 공간 확보
                center: ['50%', '25%'],
                avoidLabelOverlap: false,
                // 차트 조각 위에 표시되는 기본 라벨 숨기기
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
            {showLoading && loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box sx={{ flexGrow: 1, width: '100%', height: '100%' }}>
                    <ReactECharts
                        option={option}
                        style={{ height: '100%', width: '100%' }}
                        notMerge={true}
                        lazyUpdate={true}
                    />
                </Box>
            )}
        </DashboardBlock>
    );
}