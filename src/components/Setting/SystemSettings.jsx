import React, { useState } from 'react';
import { Typography, Select, MenuItem, Slider, TextField, Button, Box } from '@mui/material';
import DashboardBlock from '../DashboardBlock';

const SystemSettings = () => {
  const [refreshRate, setRefreshRate] = useState(30);
  const [dataRetention, setDataRetention] = useState(30);
  const [threshold, setThreshold] = useState(80);
  const [admin, setAdmin] = useState('');

  return (
    <DashboardBlock
      title="시스템 설정"
      sx={{ p: 2, height: '100%' }}
    >
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        시스템 동작 및 데이터 관리 설정을 구성합니다.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          columnGap: 4,
          rowGap: 2.5,
          alignItems: 'start',
          justifyItems: 'center',
        }}
      >
        {/* 화면 자동 갱신 주기 */}
        <Box sx={{ width: '100%', maxWidth: 240 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5, fontSize: '0.85rem' }}>
            화면 자동 갱신 주기 (초)
          </Typography>
          <Select
            value={refreshRate}
            onChange={(e) => setRefreshRate(e.target.value)}
            size="small"
            fullWidth
            sx={{
              fontSize: '0.8rem',
              height: 28,
              '& .MuiSelect-select': { py: 0.2 },
            }}
          >
            <MenuItem value={10}>10초</MenuItem>
            <MenuItem value={30}>30초</MenuItem>
            <MenuItem value={60}>60초</MenuItem>
          </Select>
        </Box>

        {/* 데이터 보관 기간 */}
        <Box sx={{ width: '100%', maxWidth: 240 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5, fontSize: '0.85rem' }}>
            데이터 보관 기간 (일)
          </Typography>
          <Select
            value={dataRetention}
            onChange={(e) => setDataRetention(e.target.value)}
            size="small"
            fullWidth
            sx={{
              fontSize: '0.8rem',
              height: 28,
              '& .MuiSelect-select': { py: 0.2 },
            }}
          >
            <MenuItem value={30}>30일</MenuItem>
            <MenuItem value={60}>60일</MenuItem>
            <MenuItem value={90}>90일</MenuItem>
          </Select>
        </Box>

        {/* 임계값 */}
        <Box sx={{ width: '100%', maxWidth: 240 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5, fontSize: '0.85rem' }}>
            CPU, RAM, GPU 임계값
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Slider
              value={threshold}
              onChange={(e, val) => setThreshold(val)}
              size="small"
              sx={{
                flex: 1,
                height: 3,
                '& .MuiSlider-thumb': { width: 10, height: 10 },
              }}
            />
            <Typography sx={{ fontSize: '0.8rem' }}>{threshold}%</Typography>
          </Box>
        </Box>

        {/* 관리자 등록 */}
        <Box sx={{ width: '100%', maxWidth: 240 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5, fontSize: '0.85rem' }}>
            관리자 등록
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <TextField
              value={admin}
              onChange={(e) => setAdmin(e.target.value)}
              size="small"
              
              sx={{
                '& .MuiInputBase-input': { py: 0.35, fontSize: '0.8rem' },
              }}
            />
            <Button
              variant="outlined"
              size="small"
              sx={{
                fontSize: '0.75rem',
                height: 26,
                minWidth: 50,
              }}
            >
              추가
            </Button>
          </Box>
        </Box>
      </Box>
    </DashboardBlock>
  );
};

export default SystemSettings;
