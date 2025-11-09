import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  IconButton,
  TextField,
  Button,
  Divider,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useBannerConfig } from '../../hooks/BannerConfigContext';
import { settingsApi } from '../../service/apiService';
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
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableItem({ item, isEditing, renderEditForm, onTitleDoubleClick, onToggleItem }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Grid item ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Paper
        variant="outlined"
        sx={{
          p: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: 120,
          height: 62,
          cursor: 'grab',
          borderWidth: 2,
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          transition: 'all 0.2s',
          '&:hover': {
            boxShadow: 2,
            borderColor: 'primary.main',
            backgroundColor: 'action.hover',
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'flex-end' }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggleItem(item.id);
            }}
            sx={{ p: 0.5, cursor: 'pointer' }}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>
        </Box>

        {isEditing ? (
          <Box sx={{ width: '100%', mt: 0.5 }} onClick={(e) => e.stopPropagation()}>
            {renderEditForm(item)}
          </Box>
        ) : (
          <Typography
            variant="body2"
            color="text.primary"
            align="center"
            onDoubleClick={(e) => {
              e.stopPropagation();
              onTitleDoubleClick(item);
            }}
            sx={{ 
              cursor: 'text',
              userSelect: 'none',
              width: '100%',
              '&:hover': {
                color: 'primary.main',
              }
            }}
          >
            {item.config.title || item.id}
          </Typography>
        )}
      </Paper>
    </Grid>
  );
}

export default function TopBannerSettings() {
  const { bannerItems, toggleItem, updateItemConfig, resetConfig, reorderItems } = useBannerConfig();
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = bannerItems.findIndex((item) => item.id === active.id);
      const newIndex = bannerItems.findIndex((item) => item.id === over.id);
      
      const activeItem = bannerItems[oldIndex];
      const overItem = bannerItems[newIndex];
      if (activeItem.type === 'usage' && overItem.type !== 'usage' || 
          activeItem.type !== 'usage' && overItem.type === 'usage') {
        return;
      }

      reorderItems(oldIndex, newIndex);
    }
  };

  // 백엔드에 저장
  const handleSaveToBackend = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const enabledMetrics = bannerItems
        .filter(item => item.enabled)
        .map((item, index) => ({
          key: item.id,
          label: item.config.title,
          order: index,
        }));

      const disabledMetrics = bannerItems
        .filter(item => !item.enabled)
        .map(item => ({
          key: item.id,
          label: item.config.title,
        }));

      await settingsApi.updateBannerConfig({
        enabled: enabledMetrics,
        disabled: disabledMetrics,
      });

      setSuccess(true);
      console.log('✅ 배너 설정 저장 완료');

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('❌ 배너 설정 저장 실패:', err);
      setError('설정 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const renderEditForm = (item) => (
    <TextField
      autoFocus
      label="제목"
      size="small"
      fullWidth
      value={editValues.title || ''}
      onChange={(e) =>
        setEditValues({ ...editValues, title: e.target.value })
      }
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleEditSave(item.id);
        } else if (e.key === 'Escape') {
          handleEditCancel();
        }
      }}
      onBlur={() => handleEditSave(item.id)}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 1,
        }
      }}
    />
  );

  const enabledItems = bannerItems.filter((item) => item.enabled);
  const disabledItems = bannerItems.filter((item) => !item.enabled);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        boxSizing: 'border-box',
      }}
    >
      {/* 왼쪽: 활성화된 항목 */}
      <Paper
        sx={{
          flex: 0.8,
          padding: 2.5,
          boxSizing: 'border-box',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h6">활성화된 항목 ({enabledItems.length})</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              startIcon={<RestartAltIcon />}
              onClick={resetConfig}
              variant="outlined"
            >
              초기화
            </Button>
            <Button
              size="small"
              onClick={handleSaveToBackend}
              variant="contained"
              disabled={saving}
            >
              {saving ? <CircularProgress size={20} /> : '저장'}
            </Button>
          </Box>
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            설정이 성공적으로 저장되었습니다.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={enabledItems.map(i => i.id)} strategy={rectSortingStrategy}>
              <Grid container spacing={1.5}>
                {enabledItems.map((item) => (
                  <SortableItem
                    key={item.id}
                    item={item}
                    isEditing={editingId === item.id}
                    renderEditForm={renderEditForm}
                    onTitleDoubleClick={handleEditStart}
                    onToggleItem={toggleItem}
                  />
                ))}
              </Grid>
            </SortableContext>
          </DndContext>
        </Box>
      </Paper>

      {/* 오른쪽: 비활성화된 항목 */}
      <Paper 
        sx={{ 
          flex: 0.3,
          padding: 2.5,
          boxSizing: 'border-box',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          추가 가능한 항목 ({disabledItems.length})
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <Grid container spacing={1.5}>
            {disabledItems.map((item) => (
              <Grid item key={item.id}>
                {editingId === item.id ? (
                  <Box sx={{ p: 1, width: 120, height: 60 }}>
                    {renderEditForm(item)}
                  </Box>
                ) : (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      width: 120,
                      height: 62,
                      borderWidth: 2,
                      borderColor: 'divider',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: 2,
                        borderColor: 'primary.main',
                        backgroundColor: 'action.hover',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'flex-end' }}>
                      <IconButton
                        size="small"
                        onClick={() => toggleItem(item.id)}
                        sx={{ p: 0.5 }}
                      >
                        <AddIcon fontSize="small" color="primary" />
                      </IconButton>
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.primary"
                      align="center"
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        handleEditStart(item);
                      }}
                      sx={{ 
                        mt: 0.5,
                        cursor: 'text',
                        userSelect: 'none',
                        width: '100%',
                        '&:hover': {
                          color: 'primary.main',
                        }
                      }}
                    >
                      {item.config.title || item.id}
                    </Typography>
                  </Paper>
                )}
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}
