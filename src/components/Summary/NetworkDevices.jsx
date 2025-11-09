import React from 'react';
import DashboardBlock from '../DashboardBlock'; 
import { Box, Stack, Typography, Divider } from '@mui/material';
import { useNetworkDeviceConfig } from '../../hooks/NetworkDeviceConfigContext';
import { COMPONENT_COLORS } from '../../theme';

// 아이콘 임포트
import ComputerIcon from '@mui/icons-material/Computer';
import DataObjectIcon from '@mui/icons-material/DataObject';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import SpeedIcon from '@mui/icons-material/Speed';
import LinkIcon from '@mui/icons-material/Link';

// ------------------------------------
// (축소된) 내부 컴포넌트 (변경 없음)
// ------------------------------------

const DeviceCard = ({ name, ip, icon, color }) => {
    const Icon = icon === 'ComputerIcon' ? ComputerIcon : 
                 icon === 'CompareArrowsIcon' ? CompareArrowsIcon : DataObjectIcon;
    
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 80 }}> 
            <Box sx={{ 
                backgroundColor: color,
                borderRadius: 2, 
                p: 1, 
                mb: 0.5, 
                width: 48, 
                height: 48, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
            }}>
                <Icon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Typography variant="body2" fontWeight="bold" sx={{ textAlign: 'center', mb: 0.25 }}>
                {name}
            </Typography>
            {ip && <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>{ip}</Typography>}
        </Box>
    );
};

const InfoItem = ({ icon: Icon, label, value, color }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', color, mb: 0.5 }}> 
            <Icon sx={{ fontSize: 16, mr: 0.5 }} /> 
            <Typography variant="caption" color="text.secondary">{label}</Typography>
        </Box>
        <Typography variant="subtitle2" fontWeight="bold" color={color}>
            {value}
        </Typography>
    </Box>
);

const SwitchInfoCard = ({ traffic, connections }) => (
    <Box sx={{ 
        p: 1.5, 
        border: '1px solid #e0e0e0', 
        borderRadius: 3, 
        minWidth: 160, 
        display: 'flex', 
        gap: 2, 
        backgroundColor: '#fafafa' 
    }}>
        <InfoItem icon={SpeedIcon} label="트래픽" value={traffic} color={COMPONENT_COLORS.devices.switch} />
        <InfoItem icon={LinkIcon} label="연결" value={connections} color={COMPONENT_COLORS.devices.switch} />
    </Box>
);

const LayerSection = ({ label, children, showDivider = true, alignItems = "flex-start" }) => (
    <Box>
        <Box 
          display="flex" 
          alignItems={alignItems}
          gap={1.5} 
          mb={2}
        >
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ minWidth: 50 }} 
            >
                {label}
            </Typography>
            <Box flex={1}>{children}</Box>
        </Box>
        {showDivider && <Box sx={{ px: 10 }}><Divider /></Box>}
    </Box>
);

// ------------------------------------
// 메인 컴포넌트 (⭐️ 로직 수정)
// ------------------------------------
export default function NetworkDevices() {
    const { deviceConfig } = useNetworkDeviceConfig();

    // 1. 4개씩 끊어서 표시하기 위한 'chunking' 로직
    const chunkedDevices = [];
    const CHUNK_SIZE = 4; // 한 줄에 4개씩
    for (let i = 0; i < deviceConfig.devices.length; i += CHUNK_SIZE) {
        chunkedDevices.push(deviceConfig.devices.slice(i, i + CHUNK_SIZE));
    }
    
    return (
        <DashboardBlock 
            title="네트워크 장치" 
            sx={{ 
                height: '100%', 
                flex: 5, 
                display: 'flex', 
                flexDirection: 'column' 
            }}
        >
            <Stack 
                spacing={3} 
                sx={{ 
                    flex: 1, 
                    minHeight: 0, 
                    display: 'flex',
                    flexDirection: 'column',
                    py: 2, 
                }}
            > 
                
                {/* 1. 제어 계층 */}
                <LayerSection label="제어 계층" alignItems="center">
                    <Box display="flex" justifyContent="center">
                        <DeviceCard {...deviceConfig.control} />
                    </Box>
                </LayerSection>

                {/* 2. 스위치 */}
                <LayerSection label="스위치" alignItems="center">
                    <Box display="flex" justifyContent="center" alignItems="flex-start" gap={3}>
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

                {/* ⭐️ 3. '장치' 섹션 (수정된 부분) */}
                <Box 
                    sx={{
                        flex: 1, 
                        minHeight: 0, 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5, 
                    }}
                >
                    {/* 3a. 레이블 */}
                    <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ minWidth: 50, pt: 0.5 }} // ⭐️ 상단 정렬을 위해 패딩
                    >
                        {`장치 (${deviceConfig.devices.length})`}
                    </Typography>
                    
                    {/* ⭐️ 3b. 콘텐츠 래퍼 (이 부분이 핵심) */}
                    <Box 
                        sx={{
                            flex: 1,
                            height: '100%', 
                            overflowY: 'auto', 
                            
                            // ⭐️ 1. 스크롤 영역을 flex 컨테이너로 만듦
                            display: 'flex',
                            // ⭐️ 2. 자식(Stack)을 '세로' 중앙에 배치
                            alignItems: 'center', 
                            // ⭐️ 3. 자식(Stack)을 '가로' 중앙에 배치
                            justifyContent: 'center',
                        }}
                    >
                        {/* ⭐️ 3c. Stack 자체의 정렬(alignItems)은 제거 */}
                        <Stack spacing={2} sx={{ my: 'auto' }}> 
                            {chunkedDevices.map((row, idx) => (
                                // ⭐️ 3d. 각 줄은 항상 중앙 정렬
                                <Box 
                                    key={idx} 
                                    display="flex" 
                                    justifyContent="center" 
                                    flexWrap="wrap" 
                                    gap={1.5}
                                >
                                    {row.map(device => (
                                        <DeviceCard 
                                            key={device.id}
                                            name={device.name}
                                            ip={device.ip}
                                            icon="DataObjectIcon"
                                            color={device.color}
                                        />
                                    ))}
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                </Box>
            </Stack>
        </DashboardBlock>
    );
}