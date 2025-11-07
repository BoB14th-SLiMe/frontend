// src/App.jsx

import React from 'react';
import { Box, CssBaseline } from '@mui/material'; // ⭐️ Container 제거
import { Routes, Route } from 'react-router-dom'; 
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BannerConfigProvider } from './hooks/BannerConfigContext';
import { NetworkDeviceConfigProvider } from './hooks/NetworkDeviceConfigContext';

// 2. 컴포넌트 및 페이지 import
import Header from './components/Header';
import Navigation from './components/Navigation';
import SummaryPage from './pages/SummaryPage';
import RiskPage from './pages/RiskPage';
import SettingsPage from './pages/SettingsPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BannerConfigProvider>
      <NetworkDeviceConfigProvider>
      <Box sx={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#FAFAFB', // 배경색을 최상위로 이동
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          
          <CssBaseline />
          
          {/* 1. 고정 헤더 */}
          <Header />

          {/* 2. 고정 네비게이션 탭 */}
          <Box sx={{ borderBottom: '1px solid #FAFAFB' }}>
            <Navigation />
          </Box>

          {/* 3. ⭐️ 스크롤이 되는 '메인 콘텐츠 영역' ⭐️ */}
          <Box 
            sx={{ 
              flexGrow: 1, // 남은 공간 모두 차지
              overflowY: 'auto', // 중요: 이 영역만 세로 스크롤 허용
              paddingTop: 1,
              paddingBottom:1,
              paddingLeft: 1,
              paddingRight: 1,
            }}
          >
            {/* 4. ⭐️ 페이지 이동이 일어나는 곳 ⭐️ */}
            <Routes>
              <Route path="/" element={<SummaryPage />} />
              <Route path="/risk" element={<RiskPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </Box>

        </Box>
      </NetworkDeviceConfigProvider>
      </BannerConfigProvider>
    </QueryClientProvider>
  );
}

export default App;