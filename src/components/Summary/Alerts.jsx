import React, { useState, useEffect } from 'react';
import DashboardBlock from '../DashboardBlock';
import { Box, Typography, Button, Divider, CircularProgress } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { xaiApi } from '../../service/apiService'; 

// 1. 개별 알림 항목 컴포넌트
const AlertItem = ({ time, message, status, risk, onConfirm }) => {
    
    let Icon, iconColor, riskComponent = null, actionButton = null;

    if (status === 'analyzing') {
        Icon = WarningIcon; 
        iconColor = '#ef5350'; 
        riskComponent = ( 
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1" color="text.secondary" sx={{ mr: 1 }}>
                    예상 위험도:
                </Typography>
                <Typography variant="body1" fontWeight="bold" color="#ef5350">
                    {risk}
                </Typography>
            </Box>
        );
    } else if (status === 'report_red') {
        Icon = WarningIcon;
        iconColor = '#ef5350'; 
        actionButton = (
            <Button variant="contained" size="medium" onClick={onConfirm} sx={{ 
                minWidth: '60px', 
                backgroundColor: '#f5f5f5', 
                color: '#333', 
                boxShadow: 'none',
                '&:hover': {
                    backgroundColor: '#e0e0e0',
                    boxShadow: 'none',
                }
            }}>
                확인
            </Button>
        );
    } else if (status === 'report_yellow') {
        Icon = WarningIcon;
        iconColor = '#ffb300'; // 주황/노란색
        actionButton = (
            <Button variant="contained" size="medium" onClick={onConfirm} sx={{ 
                minWidth: '60px', 
                backgroundColor: '#f5f5f5', 
                color: '#333', 
                boxShadow: 'none',
                '&:hover': {
                    backgroundColor: '#e0e0e0',
                    boxShadow: 'none',
                }
            }}>
                확인
            </Button>
        );
    } else if (status === 'completed') {
        Icon = CheckCircleIcon;
        iconColor = '#4caf50'; // 초록색
    }

    return (
        <Box 
            sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '12px 0' 
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '80px' }}>
                <Typography variant="body1" color="text.secondary" sx={{ mr: 2 }}>
                    {time}
                </Typography>
                <Icon sx={{ color: iconColor, fontSize: 35, mr: 1.5 }} />
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    {message}
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '120px', justifyContent: 'flex-end' }}>
                {riskComponent}
                {actionButton}
            </Box>
        </Box>
    );
};


// 2. 메인 컴포넌트 (Alerts.jsx)
export default function Alerts({ onAlertConfirm }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await xaiApi.getRecentAnalyses();

      // XAI 데이터를 알림 형식으로 변환 (response.data는 이미 배열)
      const xaiData = Array.isArray(response.data) ? response.data : [];
      const formattedAlerts = xaiData.slice(0, 5).map((xai, index) => {
        const time = new Date(xai.timestamp).toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });

        let status = 'analyzing';
        let message = `${xai.threatType} 탐지`;

        // 상태에 따라 메시지와 상태 결정
        if (xai.status === '확인' || xai.status === '해결') {
          status = 'completed';
          message = `${xai.threatType} 조치 완료`;
        } else if (xai.status === '분석중') {
          status = 'analyzing';
          message = `${xai.threatType} 분석 중...`;
        } else {
          status = index % 2 === 0 ? 'report_red' : 'report_yellow';
          message = `${xai.threatType} 보고서 작성 완료`;
        }

        return {
          id: xai.id,
          time,
          message,
          status,
          risk: '85%', // 고정값 (실제로는 위협 점수 계산 필요)
        };
      });

      setAlerts(formattedAlerts);
    } catch (error) {
      console.error('알림 데이터 조회 실패:', error);
      // 에러 발생 시 빈 배열
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    // 1분마다 자동 갱신
    const intervalId = setInterval(fetchAlerts, 60000);

    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <DashboardBlock title="이상 탐지 및 알람" sx={{ height: '100%', flex: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <CircularProgress />
        </Box>
      </DashboardBlock>
    );
  }

  return (
    <DashboardBlock title="이상 탐지 및 알람" sx={{ height: '100%', flex: 5 }}>
      <Box sx={{ mt: 0, '& > div:not(:last-child)': { borderBottom: '1px solid #eee' }, pb: 1 }}>
        {alerts.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
            <Typography>현재 알림이 없습니다.</Typography>
          </Box>
        ) : (
          alerts.map((alert) => (
            <AlertItem
              key={alert.id}
              time={alert.time}
              message={alert.message}
              status={alert.status}
              risk={alert.risk}
              onConfirm={() => onAlertConfirm?.(alert.id)}
            />
          ))
        )}
      </Box>
    </DashboardBlock>
  );
}