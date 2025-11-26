import React, { useState, useEffect, useRef, useCallback } from 'react';
import DashboardBlock from '../DashboardBlock';
import { Box, Typography, Button, Divider, CircularProgress } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { summaryApi } from '../../service/apiService'; 

// 1. 개별 알림 항목 컴포넌트
const AlertItem = React.memo(({ time, message, status, risk, onConfirm }) => {

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
});


// 2. 메인 컴포넌트 (Alerts.jsx)
export default function Alerts({ onAlertConfirm }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const prevAlertsRef = useRef([]);

  const fetchAlerts = useCallback(async () => {
    try {
      // 초기 로딩일 때만 loading을 true로 설정
      if (isInitialLoad) {
        setLoading(true);
      }

      // 백엔드의 /api/summary/alerts 엔드포인트 호출
      const response = await summaryApi.getAlerts(20);
      const alertsData = response.data || [];

      // Alerts 형식으로 변환
      const formattedAlerts = alertsData.map((alert) => {
        // severity: "긴급" 또는 "경고"
        // status: "신규", "확인중", "조치완료"
        let status = 'analyzing';
        if (alert.hasXaiAnalysis) {
          // XAI 분석이 완료된 경우
          status = alert.severity === '긴급' ? 'report_red' : 'report_yellow';
        }

        const sourceDisplay = alert.sourceAsset || alert.sourceIp || '';
        const targetDisplay = alert.targetAsset || alert.targetIp || '';
        const message = `${alert.threatType || '알 수 없는 위협'} 탐지 (${sourceDisplay} → ${targetDisplay})`;

        return {
          id: alert.threatId,
          timestamp: alert.timestamp, // 원본 timestamp 저장 (비교용)
          time: new Date(alert.timestamp).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          message,
          status,
          risk: '분석중', // 백엔드에서 score를 제공하지 않으므로 기본값
        };
      });

      // 알림 데이터가 변경되었는지 확인 (ID와 상태만 비교, 초기 로드 시에는 무조건 업데이트)
      const currentIds = formattedAlerts.map(a => `${a.id}-${a.status}`).join(',');
      const prevIds = prevAlertsRef.current.map(a => `${a.id}-${a.status}`).join(',');

      if (isInitialLoad || currentIds !== prevIds) {
        setAlerts(formattedAlerts);
        prevAlertsRef.current = formattedAlerts;
      }
    } catch (error) {
      console.error('알림 데이터 조회 실패:', error);
      // 에러 발생 시 빈 배열 (이전과 다를 때만)
      if (prevAlertsRef.current.length !== 0) {
        setAlerts([]);
        prevAlertsRef.current = [];
      }
    } finally {
      // 초기 로딩 완료 후에는 loading을 false로 유지
      if (isInitialLoad) {
        setLoading(false);
        setIsInitialLoad(false);
      }
    }
  }, [isInitialLoad]);

  useEffect(() => {
    fetchAlerts();

    // 5초마다 자동 갱신 (위협 알림은 실시간으로 확인 필요)
    const intervalId = setInterval(fetchAlerts, 5000);

    return () => clearInterval(intervalId);
  }, [fetchAlerts]);

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