// src/components/Risk/ThreatTypeTop5.jsx

import React from 'react';
import DashboardBlock from '../DashboardBlock';
import ReactECharts from 'echarts-for-react';
import { Box } from '@mui/material';

// 1. 이미지의 데이터를 기반으로 Mock 데이터 생성
const MOCK_DATA = [
    { value: 55, name: '산업 프로토콜 이상 행위' },
    { value: 25, name: '비인가 제어 시스템 접근' },
    { value: 10, name: '서비스 거부(DoS) 공격' },
    { value: 7, name: '비정상 레지스터' },
    { value: 3, name: '리플레이(Replay) 공격' }
];

// 2. 이미지의 색상 팔레트
const COLOR_PALETTE = [
    '#4EBCD5', // 산업 프로토콜 이상 행위
    '#8AD09A', // 비인가 제어 시스템 접근
    '#54B39B', // 서비스 거부(DoS) 공격
    '#3D8BFD', // 비정상 레지스터
    '#607D8B'  // 리플레이(Replay) 공격 (이미지상의 색상)
];

export default function ThreatTypeTop5() {

    // 3. ECharts 옵션 설정
    const option = {
        tooltip: {
            trigger: 'item',
            formatter: '{b} : {c}건 ({d}%)' // 호버 시 툴팁 포맷
        },
        // 4. 범례(Legend) 설정 (요구사항 1, 2)
        legend: {
            show: true,
            bottom: 10,           // 차트 하단에서 10px 띄움
            left: 'center',       // 수평 중앙 정렬
            orient: 'horizontal', // 가로 방향으로 배치
            icon: 'circle',       // 아이콘을 이미지처럼 원형으로
            itemGap: 12,          // 범례 아이템 간 간격
            textStyle: {
                color: '#333'
            },
            // 범례 데이터 순서를 Mock 데이터 이름으로 지정
            data: MOCK_DATA.map(item => item.name)
        },
        // 5. 색상 적용
        color: COLOR_PALETTE,
        series: [
            {
                name: '위협 유형',
                type: 'pie',
                // 6. 도넛 차트 모양 설정 [내부 반지름, 외부 반지름]
                radius: ['30%', '50%'],
                // 7. 차트 위치 중앙 정렬 (요구사항 1)
                // [가로, 세로] - 세로를 '45%'로 하여 하단 범례 공간 확보
                center: ['50%', '22.5%'],
                avoidLabelOverlap: false,
                // 차트 조각 위에 표시되는 기본 라벨 숨기기
                label: {
                    show: false,
                },
                labelLine: {
                    show: false
                },
                data: MOCK_DATA
            }
        ]
    };

    return (
        <DashboardBlock 
            title="위협 유형 Top 5" 
            sx={{ height: '100%' }} 
        >
            {/* DashboardBlock이 flex-column이므로
              이 Box가 남은 공간을 모두 차지(flexGrow: 1)하게 하여
              차트가 세로로도 중앙에(정확히는 45% 위치에) 오도록 함
            */}
            <Box sx={{ flexGrow: 1, width: '100%', height: '100%' }}>
                <ReactECharts
                    option={option}
                    style={{ height: '100%', width: '100%' }}
                    notMerge={true}
                    lazyUpdate={true}
                />
            </Box>
        </DashboardBlock>
    );
}