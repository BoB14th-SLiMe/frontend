import React from 'react';
// ⭐️ DashboardBlock 경로는 실제 프로젝트에 맞게 확인 필요 (../DashboardBlock)
import DashboardBlock from '../DashboardBlock'; 
import { Box, Typography, Button, Divider } from '@mui/material'; 
import WarningIcon from '@mui/icons-material/Warning'; 
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; 

// 1. 개별 알림 항목 컴포넌트
const AlertItem = ({ time, message, status, risk, onConfirm }) => {
    
    let Icon, iconColor, riskComponent = null, actionButton = null;

    if (status === 'analyzing') {
        Icon = WarningIcon; 
        iconColor = '#ef5350'; 
        riskComponent = ( 
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6" color="text.secondary" sx={{ mr: 1 }}>
                    예상 위험도:
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="#ef5350">
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


// 2. 가상 알림 데이터 (RiskPage의 sampleData와 ID/내용 일치)
const mockAlerts = [
    { time: '17:20:15', message: '비정상 Modbus 쓰기', status: 'analyzing', risk: '91%', id: 5 },
    { time: '17:16:04', message: '명령 시퀀스 이상', status: 'report_yellow', id: 4 },
    { time: '16:45:10', message: '리플레이 공격', status: 'report_red', id: 3 },
    { time: '13:20:56', message: '이상 행위 조치 완료', status: 'completed', id: 2 },
    { time: '13:20:55', message: '이상 행위 조치 완료', status: 'completed', id: 1 },
];


// 3. 메인 컴포넌트 (Alerts.jsx)
// ⭐️ onAlertConfirm prop을 부모(SummaryPage)로부터 받음
export default function Alerts({ onAlertConfirm }) {
  return (
    <DashboardBlock title="최신 알림" sx={{ height: '100%', flex: 5 }}>
            <Box sx={{ mt: 0, '& > div:not(:last-child)': { borderBottom: '1px solid #eee' }, pb: 1 }}> 
                {mockAlerts.map((alert, index) => (
                    <AlertItem
                        key={alert.id}
                        time={alert.time}
                        message={alert.message}
                        status={alert.status}
                        risk={alert.risk}
                        // ⭐️ handleConfirm에 alert.id 전달
                        onConfirm={() => onAlertConfirm(alert.id)}
                    />
                ))}
            </Box>
        </DashboardBlock>
    );
}