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
    
    const chunkedDevices = [];
    for (let i = 0; i < deviceConfig.devices.length; i += 3) {
        chunkedDevices.push(deviceConfig.devices.slice(i, i + 3));
    }
    
    return (
        <DashboardBlock title="네트워크 장치" sx={{ height: '100%', flex: 6, overflowY: 'auto' }}>
            <Stack spacing={3} sx={{ py: 2 }}> 
                
                {/* 제어 계층: 'center' (중앙 정렬) */}
                <LayerSection label="제어 계층" alignItems="center">
                    <Box display="flex" justifyContent="center">
                        <DeviceCard {...deviceConfig.control} />
                    </Box>
                </LayerSection>

                {/* 스위치: 'center' (중앙 정렬) */}
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

                <LayerSection 
                  label={`장치 (${deviceConfig.devices.length})`}
                  alignItems="center" 
                  showDivider={false}
                >
                    <Stack spacing={3}>
                        {chunkedDevices.map((row, idx) => (
                            <Box key={idx} display="flex" justifyContent="center" gap={2} flexWrap="wrap">
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
                </LayerSection>
            </Stack>
        </DashboardBlock>
    );
}