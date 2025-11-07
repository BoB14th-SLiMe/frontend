import React from 'react';
import { Box, Typography, Grid, Stack, Chip } from '@mui/material';

// ⭐️ MOCK 데이터 (부모로부터 event prop이 null일 경우 대비)
const defaultEvent = {
  id: 0,
  timestamp: 'N/A',
  threatType: 'N/A',
  sourceIp: 'N/A',
  targetDevice: 'N/A',
  detectionMethod: 'N/A',
  status: 'N/A',
};

// 키-값 표시용 컴포넌트
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
    <Typography
      variant="body2"
      color="text.secondary"
    >
      {value}
    </Typography>
  </Stack>
);


export default function ReportDetails({ event }) {
  
  // ⭐️ [오류 수정]
  // event가 null일 때 defaultEvent를 사용하도록 || 연산자 추가
  const { 
    id, 
    timestamp, 
    threatType, 
    sourceIp, 
    targetDevice, 
    detectionMethod, 
    status 
  } = event || defaultEvent; 

  return (
    // ⭐️ [수정]
    // 이 컴포넌트는 DetailReport의 자식으로 들어가므로
    // 래퍼 Box는 제거하고 상세 내용 Box만 반환합니다.
    <Box
      sx={{
        backgroundColor: '#F1F1F3',
        p: 1,
        borderRadius: 2,
        boxSizing: 'border-box', // 패딩이 크기에 포함되도록
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

