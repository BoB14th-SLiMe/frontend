import React from 'react';
import DashboardBlock from '../DashboardBlock';
import { Stack, Box, Typography, Chip } from '@mui/material'; 

export default function DetailReport({ event, children }) {
  const titleElement = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Typography variant="h6" fontWeight="bold">
        상세 보고서
      </Typography>
      {event && (
        <Chip label={`index: ${event.id}`} color="primary" size="small" />
      )}
    </Box>
  );

  return (
    <DashboardBlock 
      title={titleElement}
      sx={{ flex: 2, height: '100%' }}
    >
            {/* 자식 컴포넌트(ReportDetails, AnalysisContent)가 여기에 배치됨 */}
            {children}
        </DashboardBlock>
    );
}
