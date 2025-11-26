import React from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme, Snackbar, Alert } from '@mui/material';
import { Routes, Route } from 'react-router-dom'; 
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BannerConfigProvider } from './hooks/BannerConfigContext';
import { NetworkDeviceConfigProvider } from './hooks/NetworkDeviceConfigContext';
import useRealTimeData from './hooks/useRealTimeData';

// Components
import Header from './components/Header';
import Navigation from './components/Navigation';
import SummaryPage from './pages/SummaryPage';
import RiskPage from './pages/RiskPage';
import SettingsPage from './pages/SettingsPage';

const queryClient = new QueryClient();

const theme = createTheme({
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 25,
          textTransform: 'none',
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function AppContent() {
  const [notification, setNotification] = React.useState({ open: false, message: '', severity: 'info' });

  // SSE 실시간 데이터 수신
  const { isConnected, error } = useRealTimeData({
    onConnect: (data) => {
      console.log('✅ 실시간 데이터 연결 성공:', data);
    },
    
    onThreat: (threat) => {
      console.log('🚨 새로운 위협 감지:', threat);
      setNotification({
        open: true,
        message: `새로운 위협이 감지되었습니다: ${threat.threatType || '알 수 없음'}`,
        severity: 'error',
      });
    },
    
    onStats: (stats) => {
      console.log('📊 통계 업데이트:', stats);
      // 배너 통계는 BannerConfigContext에서 자동으로 업데이트됨
    },
    
    onError: (err) => {
      console.error('❌ 실시간 데이터 연결 오류:', err);
    },
  });

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
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
      
      {/* 헤더 */}
      <Header />

      {/* 네비게이션 */}
      <Box sx={{ borderBottom: '1px solid #FAFAFB' }}>
        <Navigation />
      </Box>

      {/* 메인 콘텐츠 영역 */}
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
        <Routes>
          <Route path="/" element={<SummaryPage />} />
          <Route path="/risk" element={<RiskPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Box>

      {/* 실시간 알림 스낵바 */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>

      {/* SSE 연결 상태 표시 (개발용) */}
      {process.env.NODE_ENV === 'development' && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            left: 16,
            px: 2,
            py: 0.5,
            borderRadius: 1,
            backgroundColor: isConnected ? '#4caf50' : '#f44336',
            color: 'white',
            fontSize: '0.75rem',
            zIndex: 9999,
          }}
        >
          SSE: {isConnected ? 'Connected' : 'Disconnected'}
        </Box>
      )}
    </Box>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <BannerConfigProvider>
          <NetworkDeviceConfigProvider>
            <AppContent />
          </NetworkDeviceConfigProvider>
        </BannerConfigProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;