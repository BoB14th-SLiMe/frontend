import React, { useState } from 'react';
import { 
  Paper, Typography, Box, Stack, Divider, Button, IconButton, 
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText, ListItemSecondaryAction, Tooltip
} from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';
import DataObjectIcon from '@mui/icons-material/DataObject';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import SpeedIcon from '@mui/icons-material/Speed';
import LinkIcon from '@mui/icons-material/Link';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PaletteIcon from '@mui/icons-material/Palette';
import { useNetworkDeviceConfig } from "../../hooks/NetworkDeviceConfigContext";

// 색상 팔레트 (...동일...)
const COLOR_PALETTE = [
  { name: '빨강', color: '#ef5350' },
  { name: '파랑', color: '#42a5f5' },
  { name: '초록', color: '#66bb6a' },
  { name: '주황', color: '#ff9800' },
  { name: '보라', color: '#ab47bc' },
  { name: '청록', color: '#26a69a' },
  { name: '분홍', color: '#ec407a' },
  { name: '노랑', color: '#ffca28' },
];

// 장치 카드 (프리뷰용) (...동일...)
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

// 스위치 정보 (...동일...)
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
    backgroundColor: '#fafafa' 
  }}>
    <InfoItem icon={SpeedIcon} label="트래픽" value={traffic} color="#42a5f5" />
    <InfoItem icon={LinkIcon} label="연결" value={connections} color="#ff9800" />
  </Box>
);

// 색상 선택 다이얼로그 (...동일...)
const ColorPickerDialog = ({ open, onClose, currentColor, onSelectColor }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>색상 선택</DialogTitle>
    <DialogContent>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, p: 2 }}>
        {COLOR_PALETTE.map(({ name, color }) => (
          <Tooltip key={color} title={name}>
            <Box
              onClick={() => {
                onSelectColor(color);
                onClose();
              }}
              sx={{
                width: 60,
                height: 60,
                backgroundColor: color,
                borderRadius: 2,
                cursor: 'pointer',
                border: currentColor === color ? '4px solid #000' : '2px solid #e0e0e0',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.1)',
                }
              }}
            />
          </Tooltip>
        ))}
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>닫기</Button>
    </DialogActions>
  </Dialog>
);

// 장치 추가 다이얼로그 (...동일...)
const AddDeviceDialog = ({ open, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [ip, setIp] = useState('');

  const handleAdd = () => {
    if (name && ip) {
      onAdd({ name, ip });
      setName('');
      setIp('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>장비 추가</DialogTitle>
      <DialogContent sx={{ minWidth: 400, pt: 2 }}>
        <Stack spacing={2}>
          <TextField
            label="장비 이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            placeholder="예: PLC-107"
          />
          <TextField
            label="IP 주소"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            fullWidth
            placeholder="예: 192.168.0.107"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleAdd} variant="contained" disabled={!name || !ip}>
          추가
        </Button>
      </DialogActions>
    </Dialog>
  );
};


export default function NetworkTopologySettings() {
  const { deviceConfig, updateNodePosition, updateNodeColor } = useNetworkDeviceConfig();
  const [selectedNode, setSelectedNode] = useState(null);
  const [color, setColor] = useState("#000000");
  const [isEditMode, setIsEditMode] = useState(false); // 편집 모드 상태
  const [addDialogOpen, setAddDialogOpen] = useState(false); // 장비 추가 다이얼로그
  const [colorPickerOpen, setColorPickerOpen] = useState(false); // 색상 선택 다이얼로그
  const [selectedDevice, setSelectedDevice] = useState(null); // 색상 변경 대상 장치

  // TODO: 저장 로직 구현 필요
  const handleSave = () => {
    setIsEditMode(false);
    // 여기에 저장 관련 API 호출 등을 추가할 수 있습니다.
  };

  // TODO: 핸들러 함수 로직 구현 필요
  const handleDeleteDevice = (id) => console.log('Delete device:', id);
  const handleMoveDevice = (index, direction) => console.log('Move device:', index, direction);
  const addFromDiscovered = (device) => console.log('Add from discovered:', device);
  const handleAddDevice = (device) => console.log('Add device:', device);

  // 노드 클릭 핸들러
  const handleNodeClick = (node) => {
    setSelectedNode(node);
    setColor(node.color || "#000000");
  };

  // 색상 변경 핸들러
  const handleColorChange = (newColor) => {
    setColor(newColor);
    if (selectedNode) {
      updateNodeColor(selectedNode.id, newColor);
    }
  };

  const chunkedDevices = [];
  for (let i = 0; i < deviceConfig.devices.length; i += 3) {
      chunkedDevices.push(deviceConfig.devices.slice(i, i + 3));
  }

  return (
    <Paper sx={{ width: '100%', height: '100%', padding: 2.5, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0}}>
        <Typography variant="h6">네트워크 토폴로지 설정</Typography>
        {!isEditMode ? (
          <Button variant="contained" startIcon={<EditIcon />} onClick={() => setIsEditMode(true)}>
            편집
          </Button>
        ) : (
          <Button variant="contained" color="success" onClick={handleSave}>
            완료
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flex: 1, overflow: 'hidden' }}>
        {/* 왼쪽: 프리뷰 */}
        <Paper sx={{ flex: 1, p: 1.5, backgroundColor: '#fafafa', overflow: 'auto' }}>
          {/* ⬇️ spacing={2} -> 1로 변경 */}
          <Stack spacing={1}>
            {/* 제어 계층 */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', position: 'relative', top: 50, left: 10 }}>
                제어 계층
              </Typography>
              <Box display="flex" justifyContent="center">
                <Box sx={{ transform: 'scale(0.85)' }}>
                  <DeviceCard {...deviceConfig.control} />
                </Box>
              </Box>
              {/* ⬇️ mt: 1 -> 0.5로 변경 */}
              <Divider sx={{ mt: 0.5 }} />
            </Box>

            {/* 스위치 */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{display: 'block', position: 'relative', top: 40, left: 10 }}>
                스위치
              </Typography>
              <Box display="flex" justifyContent="center" alignItems="center" gap={2}>
                <Box sx={{ transform: 'scale(0.85)' }}>
                  <DeviceCard 
                    name={deviceConfig.switch.name}
                    icon={deviceConfig.switch.icon}
                    color={deviceConfig.switch.color}
                  />
                </Box>
                <Box sx={{ transform: 'scale(0.85)' }}>
                  <SwitchInfoCard
                    traffic={deviceConfig.switch.traffic}
                    connections={deviceConfig.switch.connections}
                  />
                </Box>
              </Box>
              {/* ⬇️ mt: 1 -> 0.5로 변경 */}
              <Divider sx={{ mt: 0.5 }} />
            </Box>

            {/* 장치 */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{  display: 'block', position: 'relative', top: 90, left: 10 }}>
                장치 ({deviceConfig.devices.length})
              </Typography>
              <Stack spacing={1}>
                {chunkedDevices.map((row, idx) => (
                  <Box key={idx} display="flex" justifyContent="center" gap={1.5}>
                    {row.map(device => (
                      <Box key={device.id} sx={{ transform: 'scale(0.85)' }}>
                        <DeviceCard 
                          {...device}
                          icon="DataObjectIcon"
                        />
                      </Box>
                    ))}
                  </Box>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Paper>

        {/* 오른쪽: 설정 */}
        <Paper sx={{ width: 350, p: 1.5, backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {isEditMode && (
            <Button
              fullWidth
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setAddDialogOpen(true)}
              sx={{ mb: 1.5 }}
              size="small"
            >
              장비 추가
            </Button>
          )}

          <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {/* 활성 장치 */}
            <Box>
              <Typography variant="caption" color="primary" fontWeight="bold" sx={{ mb: 0.5, display: 'block' }}>
                활성 장치 ({deviceConfig.devices.length})
              </Typography>
              <List sx={{ p: 0 }}>
                {deviceConfig.devices.map((device, index) => (
                  <ListItem
                    key={device.id}
                    sx={{
                      backgroundColor: 'white',
                      // ⬇️ mb: 0.5 -> 0.25로 변경
                      mb: 0.25,
                      borderRadius: 1,
                      border: '1px solid #e0e0e0',
                      // ⬇️ p: 1 -> 0.5로 변경
                      p: 0.5
                    }}
                  >
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: device.color,
                        borderRadius: 1,
                        mr: 1.5
                      }}
                    />
                    <ListItemText
                      primary={<Typography variant="body2">{device.name}</Typography>}
                      secondary={<Typography variant="caption">{device.ip}</Typography>}
                    />
                    {isEditMode && (
                      <ListItemSecondaryAction>
                        {/* ... 아이콘 버튼들 ...동일... */}
                        <IconButton
                          size="small"
                          onClick={() => handleMoveDevice(index, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUpwardIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleMoveDevice(index, 'down')}
                          disabled={index === deviceConfig.devices.length - 1}
                        >
                          <ArrowDownwardIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedDevice(device.id);
                            setColorPickerOpen(true);
                          }}
                        >
                          <PaletteIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteDevice(device.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* 발견된 장치 */}
            {deviceConfig.discoveredDevices && deviceConfig.discoveredDevices.length > 0 && (
              <Box>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ mb: 0.5, display: 'block' }}>
                  발견된 장치 ({deviceConfig.discoveredDevices.length})
                </Typography>
                <List sx={{ p: 0 }}>
                  {deviceConfig.discoveredDevices.map((device) => (
                    <ListItem
                      key={device.id}
                      sx={{
                        backgroundColor: '#fff9e6',
                        // ⬇️ mb: 0.5 -> 0.25로 변경
                        mb: 0.25,
                        borderRadius: 1,
                        border: '1px solid #ffe082',
                        // ⬇️ p: 1 -> 0.5로 변경
                        p: 0.5
                      }}
                    >
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          backgroundColor: device.color,
                          borderRadius: 1,
                          mr: 1.5
                        }}
                      />
                      <ListItemText
                        primary={<Typography variant="body2">{device.name}</Typography>}
                        secondary={<Typography variant="caption">{device.ip}</Typography>}
                      />
                      {isEditMode && (
                        <ListItemSecondaryAction>
                          <Tooltip title="추가하기">
                            <IconButton
                              size="small"
                              onClick={() => addFromDiscovered(device)}
                              color="primary"
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      )}
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* 다이얼로그 */}
      <ColorPickerDialog
        open={colorPickerOpen}
        onClose={() => setColorPickerOpen(false)}
        currentColor={deviceConfig?.devices?.find(d => d.id === selectedDevice)?.color}
        onSelectColor={handleColorChange}
      />
      <AddDeviceDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onAdd={handleAddDevice}
      />
    </Paper>
  );
}