import React from 'react';
import DashboardBlock from '../DashboardBlock'; 
import { Box, Stack, Typography, Divider } from '@mui/material';
import { useNetworkDeviceConfig } from '../../hooks/NetworkDeviceConfigContext';

// 아이콘 임포트
import ComputerIcon from '@mui/icons-material/Computer';
import DataObjectIcon from '@mui/icons-material/DataObject';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import SpeedIcon from '@mui/icons-material/Speed';
import LinkIcon from '@mui/icons-material/Link';

// 장치 카드
const DeviceCard = ({ name, ip, icon, color }) => {
    const Icon = icon === 'ComputerIcon' ? ComputerIcon : 
                 icon === 'CompareArrowsIcon' ? CompareArrowsIcon : DataObjectIcon;
    
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 100 }}>
            <Box sx={{ 
                backgroundColor: color,
                borderRadius: 2, 
                p: 1.5, 
                mb: 1, 
                width: 56, 
                height: 56, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
            }}>
                <Icon sx={{ color: 'white', fontSize: 32 }} />
            </Box>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ textAlign: 'center', mb: 0.5 }}>
                {name}
            </Typography>
            {ip && <Typography variant="caption" color="text.secondary">{ip}</Typography>}
        </Box>
    );
};

// 스위치 정보 (트래픽/연결)
const InfoItem = ({ icon: Icon, label, value, color }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', color, mb: 0.5 }}> 
            <Icon sx={{ fontSize: 18, mr: 0.5 }} /> 
            <Typography variant="caption" color="text.secondary">{label}</Typography>
        </Box>
        <Typography variant="body1" fontWeight="bold" color={color}>
            {value}
        </Typography>
    </Box>
);

const SwitchInfoCard = ({ traffic, connections }) => (
    <Box sx={{ 
        p: 2, 
        border: '1px solid #e0e0e0', 
        borderRadius: 3, 
        minWidth: 200, 
        display: 'flex', 
        gap: 3, 
        backgroundColor: '#fafafa' 
    }}>
        <InfoItem icon={SpeedIcon} label="트래픽" value={traffic} color="#42a5f5" />
        <InfoItem icon={LinkIcon} label="연결" value={connections} color="#ff9800" />
    </Box>
);


const LayerSection = ({ label, children, showDivider = true, alignItems = "flex-start" }) => (
    <Box>
        <Box 
          display="flex" 
          alignItems={alignItems} /* 👈 prop 값으로 교체 */
          gap={2} 
          mb={2}
        >
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ minWidth: 60 }} /* 👈 mt: 2 삭제 */
            >
                {label}
            </Typography>
            <Box flex={1}>{children}</Box>
        </Box>
        {showDivider && <Divider />}
    </Box>
);

export default function NetworkDevices() {
    const { deviceConfig } = useNetworkDeviceConfig();
    
    // 🚨 chunkedDevices 로직을 삭제합니다.

    return (
        // ⭐️ 1. DashboardBlock에서 overflowY: 'auto' 제거
        <DashboardBlock title="네트워크 장치" sx={{ height: '100%', flex: 6 }}>
            {/* ⭐️ 2. 메인 Stack이 100% 높이를 갖도록 설정 */}
            <Stack spacing={3} sx={{ py: 2, height: '100%' }}> 
                
                {/* 1. 제어 계층 (변경 없음) */}
                <LayerSection label="제어 계층" alignItems="center">
                    <Box display="flex" justifyContent="center">
                        <DeviceCard {...deviceConfig.control} />
                    </Box>
                </LayerSection>

                {/* 2. 스위치 (변경 없음) */}
                <LayerSection label="스위치" alignItems="center">
                    <Box display="flex" justifyContent="center" alignItems="center" gap={3}>
                        <DeviceCard 
                            name={deviceConfig.switch.name}
                            icon={deviceConfig.switch.icon}
                            color={deviceConfig.switch.color}
                        />
                        <SwitchInfoCard
                            traffic={deviceConfig.switch.traffic}
                            connections={deviceConfig.switch.connections}
                        />
                    </Box>
                </LayerSection>

                {/* ⭐️ 3. '장치' 섹션을 LayerSection 대신 수동 Flex Box로 구현 */}
                <Box 
                    sx={{
                        flex: 1, // 남은 세로 공간 모두 차지
                        minHeight: 0, // 내용이 많아도 수축 가능하도록
                        display: 'flex',
                        alignItems: 'center', // 라벨과 콘텐츠 박스 세로 중앙 정렬
                        gap: 2,
                        mb: 2, // LayerSection의 mb={2}와 일치
                    }}
                >
                    {/* 3a. 레이블 (LayerSection과 동일한 스타일) */}
                    <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ minWidth: 60 }}
                    >
                        {`장치 (${deviceConfig.devices.length})`}
                    </Typography>
                    
                    {/* 3b. 콘텐츠 래퍼 (이 박스가 스크롤됨) */}
                    <Box 
                        sx={{
                            flex: 1,
                            height: '100%', // 부모(flex:1)의 높이를 100% 사용
                            overflowY: 'auto', // ⭐️ 장치가 많으면 이 영역만 스크롤
                        }}
                    >
                        {/* 3c. 장치 그리드 (chunked 대신 flex-wrap으로 반응형) */}
                        <Box 
                            sx={{
                                display: 'flex',
                                flexWrap: 'wrap', // ⭐️ 공간이 없으면 자동으로 줄바꿈
                                justifyContent: 'center', // 중앙 정렬
                                gap: 2,
                            }}
                        >
                            {deviceConfig.devices.map(device => (
                                <DeviceCard 
                                    key={device.id}
                                    name={device.name}
                                    ip={device.ip}
                                    icon="DataObjectIcon"
                                    color={device.color}
                                />
                            ))}
                        </Box>
                    </Box>
                </Box>
            </Stack>
        </DashboardBlock>
    );
}