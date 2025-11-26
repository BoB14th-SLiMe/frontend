import React from 'react';
import { AppBar, Toolbar, Typography, Box, Stack } from '@mui/material';
import logo from '../assets/SLIME_Logo.png';
import useCurrentTime from '../hooks/CurrentTime';
import { useBannerConfig } from '../hooks/BannerConfigContext'; // 1. Import useBannerConfig

function Header() {
  const time = useCurrentTime();
  const { getEnabledItems } = useBannerConfig(); // 2. Get banner config

  // 3. Get threat score and calculate status
  const gaugeItem = getEnabledItems().find((item) => item.type === 'gauge');
  const score = gaugeItem ? gaugeItem.config.score : 0;

  let statusText = '안전';
  let statusColor = '#4CAF50'; // Green

  if (score > 80) {
    statusText = '위험';
    statusColor = '#F44336'; // Red
  } else if (score > 30) {
    statusText = '경고';
    statusColor = '#FF9800'; // Orange
  }

  return (
    <AppBar position="static" sx={{ backgroundColor: '#FAFAFB', color: 'black', boxShadow: 'none'}}>
      <Toolbar sx={{
        justifyContent: 'space-between',
        paddingLeft: '15px',
        paddingRight: '20px'
      }}>
        {/* 왼쪽 로고 및 타이틀 */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <img src={logo} alt="SLIME Logo" style={{ height: 110 }} />
          <Box>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
              OT 보안 모니터링 시스템
            </Typography>
            <Typography variant="body1" sx={{ color: '#888' }}>
              OT 위협 탐지 솔루션
            </Typography>
          </Box>
        </Stack>

        {/* 오른쪽 시스템 현황 및 날짜 */}
        <Stack direction="row" alignItems="center" spacing={1.5}>
          {/* Time and Date */}
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{time.toLocaleDateString()}</Typography>
            <Typography variant="body2" sx={{ color: '#888' }}>{time.toLocaleTimeString()}</Typography>
          </Box>

          {/* Status Badge */}
          <Box
            sx={{
              backgroundColor: statusColor,
              color: 'white',
              fontSize: 12,
              fontWeight: 500,
              borderRadius: 2.5,
              textTransform: 'none',
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              px: 1.5,
            }}
          >
            {statusText}
          </Box>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

export default Header;