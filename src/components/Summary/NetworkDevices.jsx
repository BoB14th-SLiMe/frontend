import React from 'react';
import DashboardBlock from '../DashboardBlock';
import { Box, Stack, Typography, Divider, CircularProgress } from '@mui/material';
import { useNetworkDeviceConfig } from '../../hooks/NetworkDeviceConfigContext';

// 아이콘 임포트
import ComputerIcon from '@mui/icons-material/Computer';
import DataObjectIcon from '@mui/icons-material/DataObject';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import SpeedIcon from '@mui/icons-material/Speed';
import LinkIcon from '@mui/icons-material/Link';

const CARD_HEIGHT = 170;

// ===== 컴포넌트 =====

const DeviceCard = ({ name, ip, color }) => {
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
                <DataObjectIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Typography variant="body2" fontWeight="bold" sx={{ textAlign: 'center', mb: 0.25, fontSize: '0.75rem' }}>
                {name}
            </Typography>
            {ip && <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{ip}</Typography>}
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

const SwitchInfoCard = ({ traffic, connections }) => {
    const formattedTraffic = typeof traffic === 'number'
        ? `${traffic.toFixed(2)} pps`
        : traffic;

    return (
        <Box sx={{
            p: 1.5,
            border: '1px solid #e0e0e0',
            borderRadius: 3,
            minWidth: 160,
            display: 'flex',
            gap: 2,
            backgroundColor: '#fafafa'
        }}>
            <InfoItem icon={SpeedIcon} label="트래픽" value={formattedTraffic} color="#42a5f5" />
            <InfoItem icon={LinkIcon} label="연결" value={connections} color="#42a5f5" />
        </Box>
    );
};

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

// ===== 메인 컴포넌트 =====
export default function NetworkDevices() {
    const { hmiDevices, plcDevices, networkStats, loading } = useNetworkDeviceConfig();

    // 4개씩 끊어서 표시
    const chunkedPLCs = [];
    const CHUNK_SIZE = 4;
    for (let i = 0; i < plcDevices.length; i += CHUNK_SIZE) {
        chunkedPLCs.push(plcDevices.slice(i, i + CHUNK_SIZE));
    }

    if (loading) {
        return (
            <DashboardBlock
                title="네트워크 장치"
                sx={{ height: '100%', flex: 5, display: 'flex', flexDirection: 'column' }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                </Box>
            </DashboardBlock>
        );
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

                {/* 1. 제어 계층 (HMI/SCADA) */}
                <LayerSection label="제어 계층" alignItems="center">
                    <Box display="flex" justifyContent="center" flexWrap="wrap" gap={1.5}>
                        {hmiDevices.length > 0 ? (
                            hmiDevices.map(device => (
                                <DeviceCard
                                    key={device.id}
                                    name={device.name}
                                    ip={device.ip}
                                    color={device.color}
                                />
                            ))
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                HMI/SCADA 장치 없음
                            </Typography>
                        )}
                    </Box>
                </LayerSection>

                {/* 2. 스위치 */}
                <LayerSection label="스위치" alignItems="center">
                    <Box display="flex" justifyContent="center" alignItems="flex-start" gap={3}>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: 80
                        }}>
                            <Box sx={{
                                backgroundColor: '#2196F3',
                                borderRadius: 2,
                                p: 1,
                                mb: 0.5,
                                width: 48,
                                height: 48,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <CompareArrowsIcon sx={{ color: 'white', fontSize: 28 }} />
                            </Box>
                            <Typography variant="body2" fontWeight="bold" sx={{ textAlign: 'center', mb: 0.25 }}>
                                Switch
                            </Typography>
                        </Box>
                        <SwitchInfoCard
                            traffic={networkStats.pps}
                            connections={networkStats.connections}
                        />
                    </Box>
                </LayerSection>

                {/* 3. 장치 (PLC) */}
                <Box
                    sx={{
                        flex: 1,
                        minHeight: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                    }}
                >
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ minWidth: 50, pt: 0.5 }}
                    >
                        {`장치 (${plcDevices.length})`}
                    </Typography>

                    <Box
                        sx={{
                            flex: 1,
                            height: '100%',
                            overflowY: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Stack spacing={2} sx={{ my: 'auto' }}>
                            {chunkedPLCs.length > 0 ? (
                                chunkedPLCs.map((row, idx) => (
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
                                                color={device.color}
                                            />
                                        ))}
                                    </Box>
                                ))
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    PLC 장치 없음
                                </Typography>
                            )}
                        </Stack>
                    </Box>
                </Box>
            </Stack>
        </DashboardBlock>
    );
}
