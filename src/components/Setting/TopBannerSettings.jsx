import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Switch,
  IconButton,
  TextField,
  Button,
  Divider,
  Stack,
  Chip,
  Grid, // Grid 컴포넌트 추가
} from '@mui/material';
// DragIndicatorIcon은 이미지 디자인에 없어 제거했습니다.
import EditIcon from '@mui/icons-material/Edit';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import AddIcon from '@mui/icons-material/Add'; // Add 아이콘 추가
import { useBannerConfig } from '../../hooks/BannerConfigContext';

export default function TopBannerSettings() {
  const { bannerItems, toggleItem, updateItemConfig, resetConfig } = useBannerConfig();
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  const handleEditStart = (item) => {
    setEditingId(item.id);
    setEditValues(item.config);
  };

  const handleEditSave = (id) => {
    updateItemConfig(id, editValues);
    setEditingId(null);
    setEditValues({});
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditValues({});
  };

  // 편집 폼을 별도 컴포넌트로 분리하여 재사용합니다.
  const renderEditForm = (item) => (
    <Box
      sx={{
        mt: 2,
        p: 2,
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack spacing={2}>
        <TextField
          label="제목"
          size="small"
          fullWidth
          value={editValues.title || ''}
          onChange={(e) =>
            setEditValues({ ...editValues, title: e.target.value })
          }
        />

        {item.type === 'stat' && (
          <>
            <TextField
              label="숫자 값"
              size="small"
              type="number"
              fullWidth
              value={editValues.number || 0}
              onChange={(e) =>
                setEditValues({
                  ...editValues,
                  number: parseInt(e.target.value) || 0,
                })
              }
            />
            <TextField
              label="색상 (Hex)"
              size="small"
              fullWidth
              value={editValues.color || ''}
              onChange={(e) =>
                setEditValues({ ...editValues, color: e.target.value })
              }
            />
          </>
        )}

        {item.type === 'gauge' && (
          <TextField
            label="점수 (0-100)"
            size="small"
            type="number"
            fullWidth
            value={editValues.score || 0}
            onChange={(e) =>
              setEditValues({
                ...editValues,
                score: parseInt(e.target.value) || 0,
              })
            }
          />
        )}

        {item.type === 'usage' && (
          <TextField
            label="사용률 (%)"
            size="small"
            type="number"
            fullWidth
            value={editValues.value || 0}
            onChange={(e) =>
              setEditValues({
                ...editValues,
                value: parseInt(e.target.value) || 0,
              })
            }
          />
        )}

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button size="small" onClick={handleEditCancel}>
            취소
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={() => handleEditSave(item.id)}
          >
            저장
          </Button>
        </Box>
      </Stack>
    </Box>
  );

  // 활성화/비활성화된 아이템 분리
  const enabledItems = bannerItems.filter((item) => item.enabled);
  const disabledItems = bannerItems.filter((item) => !item.enabled);

  return (
    <Paper
      sx={{
        width: '100%',
        height: '100%',
        padding: 2.5,
        boxSizing: 'border-box',
        overflow: 'auto',
      }}
    >
      {/* 상단 헤더 (기존과 동일) */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h6">상단 배너 설정</Typography>
        <Button
          size="small"
          startIcon={<RestartAltIcon />}
          onClick={resetConfig}
          variant="outlined"
        >
          초기화
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        대시보드 상단에 표시될 항목을 설정합니다. (최대 6개)
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {/* 1. 활성화된 항목 (이미지의 상단 그리드) */}
      <Grid container spacing={2}>
        {enabledItems.map((item) => (
          <Grid xs={12} sm={6} md={4} lg={2} key={item.id}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                textAlign: 'center',
                position: 'relative',
                height: '100%', // 높이 맞춤
              }}
            >
              <Box sx={{ position: 'absolute', top: 4, right: 4 }}>
                <Switch
                  size="small"
                  checked={item.enabled}
                  onChange={() => toggleItem(item.id)}
                  color="primary"
                />
              </Box>
              <Typography variant="h5" component="div" fontWeight="bold" sx={{ mt: 2 }}>
                {item.config.number !== undefined ? item.config.number : 
                 (item.config.score !== undefined ? item.config.score : 
                  (item.config.value !== undefined ? item.config.value : 'N/A'))}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.5 }}>
                {item.config.title || item.id}
              </Typography>
              <IconButton
                size="small"
                onClick={() => handleEditStart(item)}
                sx={{ position: 'absolute', bottom: 4, right: 4 }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Paper>

            {/* 편집 폼 (선택된 경우) */}
            {editingId === item.id && renderEditForm(item)}
          </Grid>
        ))}
      </Grid>

      {/* 2. 비활성화된 항목 (이미지의 하단 '추가' 영역) */}
      <Divider sx={{ mt: 3, mb: 2 }}>
        <Typography variant="overline">추가 가능한 항목</Typography>
      </Divider>

      <Stack direction="row" spacing={1} flexWrap="wrap">
        {disabledItems.map((item) => (
          <Box key={item.id}>
            <Chip
              label={item.config.title || item.id}
              icon={<AddIcon />}
              onClick={() => toggleItem(item.id)}
              variant="outlined"
              color="primary"
              sx={{ mr: 0.5 }}
            />
            <IconButton size="small" onClick={() => handleEditStart(item)}>
              <EditIcon fontSize="small" />
            </IconButton>

            {/* 편집 폼 (선택된 경우) */}
            {editingId === item.id && renderEditForm(item)}
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}