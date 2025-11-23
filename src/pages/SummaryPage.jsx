// src/pages/SummaryPage.jsx
import React from 'react';
import { Stack, Box, keyframes } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// 컴포넌트 import
import StatBoxes from '../components/Summary/StatBoxes';
import ProtocolDistribution from '../components/Summary/hourProtocol';
import WeeklyProtocol from '../components/Summary/WeeklyProtocol';
import TrafficMonitoring from '../components/Summary/TrafficMonitoring';
import NetworkDevices from '../components/Summary/NetworkDevices';
import Alerts from '../components/Summary/Alerts';
import { useBannerConfig } from '../hooks/BannerConfigContext';

// 빨간색 깜빡이는 애니메이션 정의
const blinkAnimation = keyframes`
  0%, 100% {
    border-color: #F44336;
    box-shadow: 0 0 10px rgba(244, 67, 54, 0.8);
  }
  50% {
    border-color: transparent;
    box-shadow: 0 0 0 rgba(244, 67, 54, 0);
  }
`;

export default function SummaryPage() {
    const navigate = useNavigate();
    const { getEnabledItems } = useBannerConfig();

    const handleAlertConfirm = (id) => {
        console.log(`SummaryPage: ${id}번 이벤트 확인. /risk 페이지로 이동.`);
        navigate(`/risk?eventId=${id}`);
    };

    // 긴급 알람과 위협 점수 가져오기
    const allItems = getEnabledItems();
    const criticalAlarmItem = allItems.find(item => item.config?.title === '긴급 알람');
    const threatScoreItem = allItems.find(item => item.type === 'gauge');

    const criticalAlarms = criticalAlarmItem?.config?.number || 0;
    const threatScore = threatScoreItem?.config?.score || 0;

    // 깜빡임 조건: 긴급알람 >= 1 OR 위협점수 >= 50
    const shouldBlink = criticalAlarms >= 1 || threatScore >= 50;

    return (
        <Stack
            spacing={1.25}
            sx={{
                height: '100%',
                ...(shouldBlink && {
                    border: '3px solid #F44336',
                    borderRadius: 2,
                    animation: `${blinkAnimation} 1.5s ease-in-out infinite`,
                })
            }}
        >

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
                    onAlertConfirm={handleAlertConfirm}
                />

            </Stack>
        </Stack>
    );
}
