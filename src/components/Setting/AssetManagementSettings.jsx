import React from 'react';
import { Paper, Typography } from '@mui/material';

export default function AssetManagementSettings() {
  return (
    <Paper
      sx={{
        height: '100%',
        padding: 2.5,
        boxSizing: 'border-box',
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        자산 관리 설정
      </Typography>
      {/* TODO:
        - 검색 및 필터 (Search bar, Selects)
        - 자산 목록 (Table)
      */}
    </Paper>
  );
}
