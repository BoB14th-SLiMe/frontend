// src/pages/SummaryPage.jsx
import React from 'react';
import { Stack, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // ⭐️ 1. useNavigate 임포트

// 1. 모든 컴포넌트 import (경로는 ../components/ 가 맞습니다)
import StatBoxes from '../components/Summary/StatBoxes';
import ProtocolDistribution from '../components/Summary/hourProtocol';
import WeeklyProtocol from '../components/Summary/WeeklyProtocol';
import TrafficMonitoring from '../components/Summary/TrafficMonitoring';
import NetworkDevices from '../components/Summary/NetworkDevices';
import Alerts from '../components/Summary/Alerts';

export default function SummaryPage() {
    // ⭐️ 2. useNavigate 훅 사용
    const navigate = useNavigate();
    
    const handleAlertConfirm = (id) => {
        console.log(`SummaryPage: ${id}번 이벤트 확인. /risk 페이지로 이동.`);
        navigate(`/risk?eventId=${id}`);
    };

    return (
        <Stack spacing={1.25} sx={{ height: '100%' }}>
            
            <Box sx={{ flexShrink: 0 }}>
              <StatBoxes />
            </Box>

            <Stack direction="row" spacing={1.25} sx={{ flex: 1, overflow: 'hidden' }}>

                {/* 3-1. 왼쪽 열 */}
                <Stack direction="column" spacing={1.25} sx={{ flex: 7 }}>
                    
                    <Stack direction="row" spacing={1.25} sx={{ flex: 1 }}>
                        <ProtocolDistribution />
                        <WeeklyProtocol />
                    </Stack>

                    <TrafficMonitoring />
                </Stack>

                {/* 3-2. 중간 열 */}
                <NetworkDevices />

                {/* 3-3. 오른쪽 열 */}
                <Alerts 
                    // ⭐️ 4. 함수를 onAlertConfirm prop으로 전달
                    onAlertConfirm={handleAlertConfirm}
                />

            </Stack>
        </Stack>
    );
}
