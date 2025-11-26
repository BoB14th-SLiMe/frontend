import React, { useState, useEffect } from 'react';
import {
  Paper, Typography, Box, Stack, Divider, Button,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, CircularProgress
} from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';
import DataObjectIcon from '@mui/icons-material/DataObject';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import SpeedIcon from '@mui/icons-material/Speed';
import LinkIcon from '@mui/icons-material/Link';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { useNetworkDeviceConfig } from "../../hooks/NetworkDeviceConfigContext";
import { assetApi } from '../../service/apiService';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

// 장치 추가 다이얼로그
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

// SortableListItem for Active Devices
function SortableListItem({ device, isEditMode, onDelete, onToggleVisibility }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: device.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      sx={{
        backgroundColor: 'white',
        mb: 0.5,
        borderRadius: 1,
        border: '1px solid #e0e0e0',
        p: 1,
        pr: isEditMode ? 12 : 1,
      }}
    >
      {isEditMode && (
        <Box {...attributes} {...listeners} sx={{ cursor: 'grab', mr: 1.5, touchAction: 'none' }}>
          <DragHandleIcon />
        </Box>
      )}
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
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() => onToggleVisibility(device.id)}
            sx={{ minWidth: '60px' }}
          >
            숨기기
          </Button>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );
}

export default function NetworkTopologySettings() {
  const { hmiDevices, plcDevices, control, switchInfo, loading } = useNetworkDeviceConfig();
  const [isEditMode, setIsEditMode] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [localDevices, setLocalDevices] = useState([]);
  const [hiddenDevices, setHiddenDevices] = useState([]);

  // plcDevices가 변경되면 localDevices 업데이트
  useEffect(() => {
    if (plcDevices.length > 0) {
      setLocalDevices(plcDevices);
    }
  }, [plcDevices]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = localDevices.findIndex((d) => d.id === active.id);
      const newIndex = localDevices.findIndex((d) => d.id === over.id);
      const newDevicesOrder = arrayMove(localDevices, oldIndex, newIndex);
      setLocalDevices(newDevicesOrder);
    }
  };

  const handleSave = async () => {
    try {
      // 숨겨진 장치들을 isVisible=false로 업데이트
      for (const device of hiddenDevices) {
        await assetApi.updateAsset(device.id, { isVisible: false });
      }
      console.log('✅ 설정이 저장되었습니다');
      setIsEditMode(false);
      setHiddenDevices([]);
    } catch (error) {
      console.error('❌ 설정 저장 실패:', error);
    }
  };

  const handleToggleVisibility = (id) => {
    const device = localDevices.find(d => d.id === id);
    if (device) {
      setLocalDevices(prev => prev.filter(d => d.id !== id));
      setHiddenDevices(prev => [...prev, device]);
    }
  };

  const handleRestoreDevice = (id) => {
    const device = hiddenDevices.find(d => d.id === id);
    if (device) {
      setHiddenDevices(prev => prev.filter(d => d.id !== id));
      setLocalDevices(prev => [...prev, device]);
    }
  };

  const handleAddDevice = async (deviceData) => {
    try {
      // PLC 타입으로 새 자산 추가
      const response = await assetApi.createAsset({
        name: deviceData.name,
        ipAddress: deviceData.ip,
        assetType: 'plc',
        isVisible: true,
        status: 'active'
      });

      const newDevice = {
        id: response.data.assetId,
        name: response.data.name,
        ip: response.data.ipAddress,
        color: '#42a5f5',
        icon: 'DataObjectIcon'
      };

      setLocalDevices(prev => [...prev, newDevice]);
      console.log('✅ 장비가 추가되었습니다:', newDevice);
    } catch (error) {
      console.error('❌ 장비 추가 실패:', error);
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  const chunkedDevices = [];
  for (let i = 0; i < localDevices.length; i += 3) {
    chunkedDevices.push(localDevices.slice(i, i + 3));
  }

  return (
    <Paper sx={{ width: '100%', height: '100%', padding: 2.5, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0 }}>
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
        <Paper sx={{ flex: 1, p: 1.5, backgroundColor: '#ffffffff', overflow: 'auto' }}>
          <Stack spacing={1}>
            {/* 제어 계층 */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', position: 'relative', top: 50, left: 10 }}>
                제어 계층
              </Typography>
              <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
                {hmiDevices.length > 0 ? (
                  hmiDevices.map((device) => (
                    <Box key={device.id} sx={{ transform: 'scale(0.85)' }}>
                      <DeviceCard {...device} />
                    </Box>
                  ))
                ) : (
                  <Box sx={{ transform: 'scale(0.85)' }}>
                    <DeviceCard {...control} />
                  </Box>
                )}
              </Box>
              <Divider sx={{ mt: 0.5 }} />
            </Box>

            {/* 스위치 */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', position: 'relative', top: 40, left: 10 }}>
                스위치
              </Typography>
              <Box display="flex" justifyContent="center" alignItems="center" gap={2}>
                <Box sx={{ transform: 'scale(0.85)' }}>
                  <DeviceCard
                    name={switchInfo.name}
                    icon={switchInfo.icon}
                    color={switchInfo.color}
                  />
                </Box>
                <Box sx={{ transform: 'scale(0.85)' }}>
                  <SwitchInfoCard
                    traffic={switchInfo.traffic}
                    connections={switchInfo.connections}
                  />
                </Box>
              </Box>
              <Divider sx={{ mt: 0.5 }} />
            </Box>

            {/* 장치 */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', position: 'relative', top: 90, left: 10 }}>
                장치 ({localDevices.length})
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
        <Paper sx={{ width: 450, p: 1.5, backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
              <Typography variant="caption" color="primary" fontWeight="bold" sx={{ mb: 1, display: 'block' }}>
                활성 장치 ({localDevices.length})
              </Typography>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={localDevices.map(d => d.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <List sx={{ p: 0 }}>
                    {localDevices.map((device) => (
                      <SortableListItem
                        key={device.id}
                        device={device}
                        isEditMode={isEditMode}
                        onToggleVisibility={handleToggleVisibility}
                      />
                    ))}
                  </List>
                </SortableContext>
              </DndContext>
            </Box>

            {/* 숨겨진 장치 */}
            {isEditMode && hiddenDevices.length > 0 && (
              <Box>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ mb: 0.5, display: 'block' }}>
                  숨겨진 장치 ({hiddenDevices.length})
                </Typography>
                <List sx={{ p: 0 }}>
                  {hiddenDevices.map((device) => (
                    <ListItem
                      key={device.id}
                      sx={{
                        backgroundColor: '#f5f5f5',
                        mb: 0.5,
                        borderRadius: 1,
                        border: '1px solid #e0e0e0',
                        p: 1,
                        pr: 10,
                      }}
                    >
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          backgroundColor: device.color,
                          borderRadius: 1,
                          mr: 1.5,
                          opacity: 0.5
                        }}
                      />
                      <ListItemText
                        primary={<Typography variant="body2" color="text.secondary">{device.name}</Typography>}
                        secondary={<Typography variant="caption" color="text.secondary">{device.ip}</Typography>}
                      />
                      <ListItemSecondaryAction>
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          onClick={() => handleRestoreDevice(device.id)}
                          sx={{ minWidth: '60px' }}
                        >
                          복원
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* 다이얼로그 */}
      <AddDeviceDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onAdd={handleAddDevice}
      />
    </Paper>
  );
}
