import React from 'react';
import DashboardBlock from '../DashboardBlock';
import { Stack, Box, Typography, Chip } from '@mui/material'; 

// ⭐️ event가 null일 때(초기 상태) 표시할 기본값
const defaultEvent = {
    id: 0,
    severityColor: 'default'
};

// ⭐️ event prop을 받도록 수정
export default function DetailReport({ event, children }) {
  return (
    <DashboardBlock 
      title={event ? `상세 보고서 #${event.id}` : '상세 보고서'} 
      sx={{ flex: 1, height: '100%' }}
    >
            {/* 자식 컴포넌트(ReportDetails, AnalysisContent)가 여기에 배치됨 */}
            {children}
        </DashboardBlock>
    );
}
