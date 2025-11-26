import React from 'react';
import { Box, Typography, Grid, Stack, CircularProgress } from '@mui/material';

const defaultEvent = {
  id: 0,
  timestamp: 'N/A',
  threatType: 'N/A',
  sourceIp: 'N/A',
  targetDevice: 'N/A',
  detectionMethod: 'N/A',
  status: 'N/A',
};

const InfoItem = ({ label, value }) => (
  <Stack direction="row" spacing={1} alignItems="center">
    <Typography
      variant="body2"
      sx={{
        color: 'text.primary',
        fontWeight: 700,
        minWidth: '85px',
        flexShrink: 0,
      }}
    >
      {label} :
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {value}
    </Typography>
  </Stack>
);

export default function ReportDetails({ event, detailData, loading }) {
  // 로딩 중
  if (loading) {
    return (
      <Box
        sx={{
          backgroundColor: '#F1F1F3',
          p: 2,
          borderRadius: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 150,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // 백엔드 데이터 우선, 없으면 event prop 사용
  const displayData = detailData || event || defaultEvent;
  
  const {
    id,
    timestamp,
    threatType,
    sourceIp,
    targetDevice,
    detectionMethod,
    status,
  } = displayData;

  return (
    <Box
      sx={{
        backgroundColor: '#F1F1F3',
        p: 1,
        borderRadius: 2,
        boxSizing: 'border-box',
      }}
    >
      <Grid
        container
        columnSpacing={4}
        rowSpacing={0.5}
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridTemplateRows: 'repeat(3, auto)',
        }}
      >
        <Grid item>
          <InfoItem label="발생 시각" value={timestamp} />
        </Grid>
        <Grid item>
          <InfoItem label="위협 유형" value={threatType} />
        </Grid>

        <Grid item>
          <InfoItem label="출발지 IP" value={sourceIp} />
        </Grid>
        <Grid item>
          <InfoItem label="목적지 자산" value={targetDevice} />
        </Grid>

        <Grid item>
          <InfoItem label="탐지 엔진" value={detectionMethod} />
        </Grid>
        <Grid item>
          <InfoItem label="처리 상태" value={status} />
        </Grid>
      </Grid>
    </Box>
  );
}