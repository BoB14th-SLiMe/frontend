import React from 'react';
import {
  Paper, Typography, Box, Stack, CircularProgress
} from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';
import DataObjectIcon from '@mui/icons-material/DataObject';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import SpeedIcon from '@mui/icons-material/Speed';
import LinkIcon from '@mui/icons-material/Link';
import { useNetworkDeviceConfig } from "../../hooks/NetworkDeviceConfigContext";

// 장치 카드 (프리뷰용)
const DeviceCard = ({ name, ip, icon, color }) => {
  const IconComponent = icon === 'ComputerIcon' ? ComputerIcon :
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
        <IconComponent sx={{ color: 'white', fontSize: 32 }} />
      </Box>
      <Typography variant="subtitle2" fontWeight="bold" sx={{ textAlign: 'center', mb: 0.5 }}>
        {name}
      </Typography>
      {ip && <Typography variant="caption" color="text.secondary">{ip}</Typography>}
    </Box>
  );
};

// 스위치 정보
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
    gap: 1,
    backgroundColor: '#ffffff'
  }}>
    <InfoItem icon={SpeedIcon} label="트래픽" value={traffic} color="#42a5f5" />
    <InfoItem icon={LinkIcon} label="연결" value={connections} color="#ff9800" />
  </Box>
);

export default function NetworkTopologySettings() {
  const { hmiDevices, plcDevices, control, switchInfo, loading } = useNetworkDeviceConfig();

  if (loading) {
    return (
      <Paper sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  // PLC 장치를 3개씩 묶기
  const chunkedDevices = [];
  for (let i = 0; i < plcDevices.length; i += 3) {
    chunkedDevices.push(plcDevices.slice(i, i + 3));
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        네트워크 토폴로지 설정
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        현재 네트워크에 연결된 장치들을 표시합니다. (API에서 자동으로 가져옴)
      </Typography>

      {/* 프리뷰 영역 */}
      <Box sx={{
        p: 3,
        border: '2px dashed #e0e0e0',
        borderRadius: 2,
        backgroundColor: '#fafafa',
        mb: 3
      }}>
        <Stack spacing={3}>

          {/* 제어 시스템 (HMI/SCADA) */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              제어 시스템 (HMI)
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              {hmiDevices.length > 0 ? (
                hmiDevices.map((device) => (
                  <DeviceCard
                    key={device.id}
                    name={device.name}
                    ip={device.ip}
                    icon={device.icon}
                    color={device.color}
                  />
                ))
              ) : (
                <DeviceCard
                  name={control.name}
                  ip={control.ip}
                  icon={control.icon}
                  color={control.color}
                />
              )}
            </Box>
          </Box>

          {/* 스위치 */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              스위치
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
              <DeviceCard
                name={switchInfo.name}
                ip=""
                icon={switchInfo.icon}
                color={switchInfo.color}
              />
              <SwitchInfoCard
                traffic={switchInfo.traffic}
                connections={switchInfo.connections}
              />
            </Box>
          </Box>

          {/* 장치 (PLC) */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              장치 ({plcDevices.length}개)
            </Typography>
            <Stack spacing={2}>
              {chunkedDevices.length > 0 ? (
                chunkedDevices.map((row, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 2,
                      flexWrap: 'wrap'
                    }}
                  >
                    {row.map((device) => (
                      <DeviceCard
                        key={device.id}
                        name={device.name}
                        ip={device.ip}
                        icon={device.icon}
                        color={device.color}
                      />
                    ))}
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  등록된 PLC 장치가 없습니다
                </Typography>
              )}
            </Stack>
          </Box>

        </Stack>
      </Box>

      {/* 안내 메시지 */}
      <Typography variant="caption" color="text.secondary">
        💡 장치 정보는 자산 관리 API에서 자동으로 가져옵니다. 30초마다 자동 갱신됩니다.
      </Typography>
    </Paper>
  );
}
