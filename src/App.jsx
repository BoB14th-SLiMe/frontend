// src/App.jsx

import React from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material'; // ⭐️ ThemeProvider, createTheme 추가
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

// ⭐️ 전역 테마 생성 (버튼 모서리 둥글게)
const theme = createTheme({
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true, // Ripple effect (클릭 시 물결 효과) 비활성화
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 25, // 버튼 모서리를 둥글게
          textTransform: 'none', // 대문자 변환 비활성화
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 12, // 토글 버튼도 둥글게
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 12, // 아이콘 버튼도 둥글게
        },
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <BannerConfigProvider>
          <NetworkDeviceConfigProvider>
            <Box sx={{
              width: '100%',
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#FAFAFB',
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
                  flexGrow: 1,
                  overflowY: 'auto',
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
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;