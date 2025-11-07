import React from 'react';
import { Box, Typography, Stack } from '@mui/material';

import { ANALYSIS_MAP } from '../../mocks/analysisData.js';


// 분석 내용 하위 섹션 (변경 없음)
const AnalysisSubSection = ({ title, children }) => (
  <Box
    sx={{
      flex: 1, // 높이를 유연하게 조절
      backgroundColor: '#F1F1F3',
      borderRadius: 2,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      paddingX: 1.5,
      paddingY: 0,
      boxSizing: 'border-box',
      overflow: 'hidden' // 내용이 길 경우를 대비
    }}
  >
    <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: 'body1.fontSize', marginBottom: 0.1 }}>
      {title}
    </Typography>
    <Typography
      variant="h6"
      color="text.secondary"
      sx={{
        fontSize: 'body2.fontSize',
        lineHeight: 1.4,
        whiteSpace: 'normal',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {children}
    </Typography>
  </Box>
);

export default function AnalysisContent({ event }) {
  
  // ⭐️ [수정] event prop에서 threatType을 가져와 MOCK 데이터 매핑
  const threatType = event?.threatType || 'default';
  const content = ANALYSIS_MAP[threatType] || ANALYSIS_MAP['default'];

  return (
    <Box sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" fontWeight="bold" sx={{ fontSize: 20, marginBottom: 1.5, flexShrink: 0 }}>
        분석 내용
      </Typography>

      <Stack spacing={1.5} sx={{ flex: 1, minHeight: 0 }}>
        <AnalysisSubSection title="탐지 내용">
          {content.detection}
        </AnalysisSubSection>

        <AnalysisSubSection title="위반 사항">
          {content.violation}
        </AnalysisSubSection>

        <AnalysisSubSection title="결론">
          {content.conclusion}
        </AnalysisSubSection>
      </Stack>
    </Box>
  );
}
