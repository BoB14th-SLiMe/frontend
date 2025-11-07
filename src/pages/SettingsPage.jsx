// src/pages/SettingsPage.jsx
import React from 'react';
import { Stack, Box } from '@mui/material';

// 1. 4개의 설정 컴포넌트를 import 합니다.
// (경로는 pages 폴더 기준 ../components/Setting/ 입니다)
import SystemSettings from '../components/Setting/SystemSettings';
import TopBannerSettings from '../components/Setting/TopBannerSettings';
import AssetManagementSettings from '../components/Setting/AssetManagementSettings';
import NetworkTopologySettings from '../components/Setting/NetworkTopologySettings';

export default function SettingsPage() {
  // ⭐️ Stack의 간격 값
  const spacing = 1.25; 

  return (
    // 3. 2x2 그리드 레이아웃을 Stack으로 구성합니다.
    <Stack spacing={spacing} sx={{ height: '100%' }}>
      
      {/* 3-1. 상단 행 (Top Row) - flex: 1을 주어 높이를 유연하게 조절 */}
      <Stack direction="row" spacing={spacing} sx={{ flex: 0.60, overflow: 'hidden' }}>
        <Box sx={{ flex: 1}}>
          <SystemSettings />
        </Box>
        <Box sx={{ flex: 2 }}>
          <TopBannerSettings />
        </Box>
      </Stack>

      {/* 3-2. 하단 행 (Bottom Row) - flex: 1을 주어 높이를 유연하게 조절 */}
      <Stack direction="row" spacing={spacing} sx={{ flex: 1.25, overflow: 'hidden' }}>
        <Box sx={{ flex: 1 }}>
          <AssetManagementSettings />
        </Box>
        <Box sx={{ flex: 2 }}>
          <NetworkTopologySettings />
        </Box>
      </Stack>
      
    </Stack>
  );
}