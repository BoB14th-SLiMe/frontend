import React from 'react'; // use 제거
import { AppBar, Toolbar, Typography, Box, Stack } from '@mui/material'; // 불필요한 LinearProgress, Container 제거
import logo from '../assets/SLIME_Logo.png';
// ⭐️ 커스텀 훅 임포트 (경로에 맞게 수정해주세요)
import useCurrentTime from '../hooks/CurrentTime';

function Header() {
  // ⭐️ 커스텀 훅 사용
  const time = useCurrentTime(); 
  
  return (
    <AppBar position="static" sx={{ backgroundColor: '#FAFAFB', color: 'black', boxShadow: 'none'}}>  
            <Toolbar sx={{
              justifyContent: 'space-between', 
              paddingLeft: '15px', 
              paddingRight: '20px'
            }}>      
        {/* 왼쪽 로고 및 타이틀 */}
        <Stack direction="row" alignItems="center" spacing={1}> 
          <img src={logo} alt="SLIME Logo" style={{ height: 120 }} />
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
        <Stack direction="row" alignItems="center">
          <Box sx={{ textAlign: 'right', marginLeft: 2, borderLeft: '1px solid #e0e0e0', paddingLeft: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{time.toLocaleDateString()}</Typography>
            <Typography variant="body2" sx={{ color: '#888' }}>{time.toLocaleTimeString()}</Typography>
          </Box>
        </Stack>

      </Toolbar>
    </AppBar>
  );
}

export default Header;