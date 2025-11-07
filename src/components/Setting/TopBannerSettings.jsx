import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  IconButton,
  TextField,
  Button,
  Divider,
  Stack,
  Grid,
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useBannerConfig } from '../../hooks/BannerConfigContext';

export default function TopBannerSettings() {
  const { bannerItems, toggleItem, updateItemConfig, resetConfig, reorderItems } =
    useBannerConfig();
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [selectedForSwap, setSelectedForSwap] = useState(null);

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

  const handleTitleDoubleClick = (item) => {
    handleEditStart(item);
  };

  const handleCardClick = (item, index) => {
    if (editingId === item.id) return; // 편집 중이면 무시
    
    if (selectedForSwap === null) {
      // 첫 번째 선택
      setSelectedForSwap({ item, index });
    } else {
      // 두 번째 선택 - 위치 교환
      if (selectedForSwap.item.id === item.id) {
        // 같은 카드 클릭하면 선택 해제
        setSelectedForSwap(null);
        return;
      }
      
      const firstIsUsage = selectedForSwap.item.type === 'usage';
      const secondIsUsage = item.type === 'usage';
      
      // Usage끼리만 바꿀 수 있고, 일반 카드끼리만 바꿀 수 있음
      if (firstIsUsage !== secondIsUsage) {
        // Usage와 일반 카드는 교환 불가 - 선택만 바꿈
        setSelectedForSwap({ item, index });
        return;
      }
      
      const fromGlobalIndex = bannerItems.findIndex(i => i.id === selectedForSwap.item.id);
      const toGlobalIndex = bannerItems.findIndex(i => i.id === item.id);
      
      reorderItems(fromGlobalIndex, toGlobalIndex);
      setSelectedForSwap(null);
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

  // --- 기존 로직 (변경 없음) ---
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
          <Button
            size="small"
            startIcon={<RestartAltIcon />}
            onClick={resetConfig}
            variant="outlined"
          >
            초기화
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <Grid container spacing={1.5}>
            {enabledItems.map((item, index) => (
              <Grid item key={item.id}>
                <Paper
                  variant="outlined"
                  onClick={() => handleCardClick(item, index)}
                  sx={{
                    p: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: 120,
                    height: 62,
                    cursor: 'pointer',
                    borderWidth: 2,
                    borderColor: selectedForSwap?.item.id === item.id ? 'primary.main' : 'divider',
                    backgroundColor: selectedForSwap?.item.id === item.id ? 'action.selected' : 'background.paper',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: 2,
                      borderColor: selectedForSwap?.item.id === item.id ? 'primary.dark' : 'primary.main',
                      backgroundColor: 'action.hover',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'flex-end' }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleItem(item.id);
                      }}
                      sx={{ p: 0.5 }}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  {editingId === item.id ? (
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
                        handleTitleDoubleClick(item);
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
            ))}
          </Grid>
        </Box>
      </Paper>

      {/* 오른쪽:한 항목 */}
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
                        handleTitleDoubleClick(item);
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