import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Menu,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

import DashboardBlock from '../DashboardBlock';
import { threatApi } from '../../services/apiService';

const smallInputStyle = {
  '& .MuiInputBase-root': {
    height: '36px',
  },
};

export default function AdministratorAction({ selectedEvent }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAction, setSelectedAction] = useState('사후조치 작성');
  const [date, setDate] = useState(dayjs());
  const [manager, setManager] = useState('');
  const [actionContent, setActionContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // 선택된 이벤트가 변경되면 초기화
  useEffect(() => {
    if (selectedEvent) {
      setManager('');
      setActionContent('');
      setDate(dayjs());
      setSuccess(false);
      setError(null);
    }
  }, [selectedEvent]);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSelect = (action) => {
    setSelectedAction(action);
    setAnchorEl(null);
  };

  // 저장 핸들러
  const handleSave = async () => {
    if (!selectedEvent || !selectedEvent.threatId) {
      setError('위협 이벤트가 선택되지 않았습니다.');
      return;
    }

    if (!manager || !actionContent) {
      setError('관리자명과 조치사항을 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await threatApi.saveAdminAction(selectedEvent.threatId, {
        status: '완료',
        author: manager,
        content: actionContent,
        completedAt: date.toISOString(),
      });

      setSuccess(true);
      console.log('✅ 사후조치 저장 성공');

      // 3초 후 성공 메시지 제거
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('❌ 사후조치 저장 실패:', err);
      setError('사후조치 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    setManager('');
    setActionContent('');
    setDate(dayjs());
    setError(null);
    setSuccess(false);
  };

  return (
    <DashboardBlock
      title="관리자 사후조치"
      controls={
        <>
          <Button
            variant="outlined"
            size="small"
            endIcon={<ArrowDropDownIcon />}
            color="inherit"
            onClick={handleClick}
            sx={{
              borderColor: 'rgba(0,0,0,0.25)',
              color: 'text.primary',
              fontSize: 13,
              px: 1.2,
              py: 0.3,
              textTransform: 'none',
              minWidth: 'auto',
            }}
          >
            {selectedAction}
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          >
            <MenuItem onClick={() => handleSelect('사후조치 작성')}>사후조치 작성</MenuItem>
            <MenuItem onClick={() => handleSelect('사후조치 수정')}>사후조치 수정</MenuItem>
          </Menu>
        </>
      }
      sx={{ flex: 0.8, height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {/* 알림 메시지 */}
      {success && (
        <Alert severity="success" sx={{ mb: 1 }}>
          사후조치가 성공적으로 저장되었습니다.
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {!selectedEvent && (
        <Alert severity="info" sx={{ mb: 1 }}>
          위협 이벤트를 선택하면 사후조치를 작성할 수 있습니다.
        </Alert>
      )}

      {/* 폼 영역 */}
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
        <Stack spacing={2} sx={{ mt: 0.5, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            
            {/* 조치일자 */}
            <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 60 }}>
              조치일자
            </Typography>
            <Box sx={{ flex: 1 }}>
              <DatePicker
                value={date}
                onChange={(newValue) => setDate(newValue)}
                format="YYYY.MM.DD"
                disabled={!selectedEvent || loading}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: { ...smallInputStyle },
                  },
                }}
              />
            </Box>

            {/* 관리자 */}
            <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 40, ml: 2 }}>
              관리자
            </Typography>
            <Box sx={{ flex: 0.6 }}>
              <TextField
                value={manager}
                onChange={(e) => setManager(e.target.value)}
                size="small"
                placeholder="관리자명"
                disabled={!selectedEvent || loading}
                sx={{ ...smallInputStyle }}
              />
            </Box>
          </Stack>

          {/* 조치사항 */}
          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: 1.5 
            }}>
              <Typography variant="body2" fontWeight="bold">
                조치사항
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  sx={{ textTransform: 'none' }} 
                  size="small"
                  onClick={handleSave}
                  disabled={!selectedEvent || loading}
                >
                  {loading ? <CircularProgress size={20} /> : '저장'}
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  sx={{ textTransform: 'none' }}
                  size="small"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  취소
                </Button>
              </Box>
            </Box>

            <TextField
              value={actionContent}
              onChange={(e) => setActionContent(e.target.value)}
              multiline
              placeholder="조치사항을 입력하세요"
              fullWidth
              variant="outlined"
              disabled={!selectedEvent || loading}
              sx={{
                flex: 1,
                '& .MuiInputBase-root': {
                  height: '100%',
                  alignItems: 'flex-start',
                },
                '& .MuiInputBase-input': {
                  height: '100% !important',
                  overflow: 'auto !important',
                },
              }}
            />
          </Box>
          
        </Stack>
      </LocalizationProvider>
    </DashboardBlock>
  );
}