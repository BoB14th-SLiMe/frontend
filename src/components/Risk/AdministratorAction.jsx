import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Menu,
  MenuItem,
  TextField,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

// (대시보드 블록 컴포넌트가 필요하지만, 우선 Box로 대체합니다)
const DashboardBlock = ({ title, controls, sx, children }) => (
  <Box
    sx={{
      backgroundColor: '#FFFFFF',
      borderRadius: 2,
      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      p: 2,
      ...sx,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Typography variant="h6" fontWeight="bold" sx={{ fontSize: 16 }}>
        {title}
      </Typography>
      {controls && <Box sx={{ ml: 1 }}>{controls}</Box>}
    </Box>
    {children}
  </Box>
);

// ⭐️ h7(body2) 폰트 크기에 맞게 박스 높이를 조절하기 위한 스타일
const smallInputStyle = {
  '& .MuiInputBase-root': {
    height: '36px', 
  },
};

export default function AdministratorAction() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAction, setSelectedAction] = useState('사후조치 작성');
  const [date, setDate] = useState(dayjs());
  const [manager, setManager] = useState('');
  const [actionContent, setActionContent] = useState('');

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSelect = (action) => {
    setSelectedAction(action);
    setAnchorEl(null);
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
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: {
                      ...smallInputStyle,
                    },
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
                sx={{ 
                  ...smallInputStyle,
                }} 
              />
            </Box>
          </Stack>

          {/* [조치사항] */}
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
                <Button variant="contained" color="primary" sx={{ textTransform: 'none' }} size="small">
                  저장
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  sx={{ textTransform: 'none' }}
                  size="small"
                  onClick={() => {
                    setManager('');
                    setActionContent('');
                  }}
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
