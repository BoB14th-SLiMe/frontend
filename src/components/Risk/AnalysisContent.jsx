import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { ANALYSIS_MAP } from '../../mocks/analysisData.js';

const AnalysisSubSection = ({ title, children }) => (
  <Box
    sx={{
      flex: 1,
      backgroundColor: '#F1F1F3',
      borderRadius: 2,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      paddingX: 1.5,
      paddingY: 1,
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}
  >
    <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: 'body1.fontSize', marginBottom: 0.5 }}>
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
        textAlign: 'left',
      }}
    >
      {children}
    </Typography>
  </Box>
);

export default function AnalysisContent({ event, detailData }) {
  // 1. 백엔드 데이터가 있으면 우선 사용
  if (detailData?.analysis) {
    return (
      <Box sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h5" fontWeight="bold" sx={{ fontSize: 20, marginBottom: 1.5, flexShrink: 0 }}>
          분석 내용
        </Typography>

        <Stack spacing={1.5} sx={{ flex: 1, minHeight: 0 }}>
          <AnalysisSubSection title="탐지 내용">
            {detailData.analysis.description || '데이터 없음'}
          </AnalysisSubSection>

          <AnalysisSubSection title="위반 사항">
            {detailData.risks?.summary || '데이터 없음'}
          </AnalysisSubSection>

          <AnalysisSubSection title="결론">
            {detailData.conclusion || '데이터 없음'}
          </AnalysisSubSection>
        </Stack>
      </Box>
    );
  }

  // 2. 백엔드 데이터 없으면 MOCK 데이터 사용 (기존 로직)
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