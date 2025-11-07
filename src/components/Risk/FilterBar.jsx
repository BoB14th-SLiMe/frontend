import React from 'react';
import DashboardBlock from '../DashboardBlock';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  TextField,
  InputAdornment,
  Button,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ko';

export default function FilterBar({
  width,
  height,
  filters,
  onFilterChange,
  onApply,
  onReset,
}) {
  const { severity, status, startDate, endDate, searchQuery } = filters;

  const selectStyle = {
    height: 35,
    borderRadius: 1,
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#e0e0e0',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#bdbdbd',
    },
  };

  const datePickerStyle = {
    width: 180,
    '& .MuiInputBase-root': {
      height: 35,
      borderRadius: 1,
    },
  };

  return (
    <DashboardBlock title="필터 및 검색">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end', // 하단 정렬로 변경
          gap: 2, // 간격 조정
        }}
      >
        <FormControl sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            심각도
          </Typography>
          <Select
            value={severity}
            onChange={(e) => onFilterChange('severity', e.target.value)}
            displayEmpty
            sx={selectStyle}
          >
            <MenuItem value="all">전체</MenuItem>
            <MenuItem value="경고">경고</MenuItem>
            <MenuItem value="긴급">긴급</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            처리 상태
          </Typography>
          <ToggleButtonGroup
            value={status}
            exclusive
            onChange={(e, newValue) => {
              if (newValue !== null) {
                onFilterChange('status', newValue);
              }
            }}
            size="small"
            sx={{
              height: 35,
              '& .MuiToggleButton-root': {
                flex: 1,
                textTransform: 'none',
                border: '1px solid #e0e0e0',
              }
            }}
          >
            <ToggleButton value="all">전체</ToggleButton>
            <ToggleButton value="pending">미처리</ToggleButton>
            <ToggleButton value="completed">처리 완료</ToggleButton>
          </ToggleButtonGroup>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              발생 기간 (시작)
            </Typography>
            <DatePicker
              value={startDate}
              onChange={(newValue) => onFilterChange('startDate', newValue)}
              slotProps={{
                textField: { size: 'small' },
              }}
              sx={datePickerStyle}
              format="YYYY.MM.DD"
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              발생 기간 (종료)
            </Typography>
            <DatePicker
              value={endDate}
              onChange={(newValue) => onFilterChange('endDate', newValue)}
              slotProps={{
                textField: { size: 'small' },
              }}
              sx={datePickerStyle}
              format="YYYY.MM.DD"
              minDate={startDate}
            />
          </Box>
        </LocalizationProvider>

        <Box sx={{ flex: 1.5 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            검색
          </Typography>
          <TextField
            placeholder="IP, 위협명 등 검색"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => onFilterChange('searchQuery', e.target.value)}
            fullWidth
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                height: 35,
                borderRadius: 1,
                backgroundColor: '#f5f5f5',
                '& fieldset': { border: 'none' },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#9e9e9e'}} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box sx={{ flexShrink: 0 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              onClick={onApply}
              sx={{
                height: 35,
                backgroundColor: '#424242',
                color: '#fff',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#616161',
                  boxShadow: 'none',
                },
              }}
            >
              확인
            </Button>
            <Button
              variant="contained"
              onClick={onReset}
              sx={{
                height: 35,
                backgroundColor: '#212121',
                color: '#fff',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#424242',
                  boxShadow: 'none',
                },
              }}
            >
              초기화
            </Button>
          </Box>
        </Box>
      </Box>
    </DashboardBlock>
  );
}
