import React from 'react';
import { Paper, Typography, Box, Select, MenuItem } from '@mui/material';
import TrafficMonitoring from '../Summary/TrafficMonitoring';
import RealtimeThreatCount from '../Risk/RealtimeThreatCount';
import DashboardBlock from '../DashboardBlock';
import { useTimeRange } from '../../hooks/TimeRangeContext';

export default function AssetManagementSettings() {
  const { trafficTimeRange, setTrafficTimeRange, threatTimeRange, setThreatTimeRange } = useTimeRange();

  const trafficSelector = (
    <Select
      value={trafficTimeRange}
      onChange={(e) => setTrafficTimeRange(e.target.value)}
      size="small"
      sx={{
        fontSize: '0.8rem',
        height: 28,
        '& .MuiSelect-select': { py: 0.2 },
      }}
    >
      <MenuItem value={'1h'}>1시간</MenuItem>
      <MenuItem value={'6h'}>6시간</MenuItem>
      <MenuItem value={'24h'}>24시간</MenuItem>
      <MenuItem value={'7d'}>7일</MenuItem>
    </Select>
  );

  const threatSelector = (
    <Select
      value={threatTimeRange}
      onChange={(e) => setThreatTimeRange(e.target.value)}
      size="small"
      sx={{
        fontSize: '0.8rem',
        height: 28,
        '& .MuiSelect-select': { py: 0.2 },
      }}
    >
      <MenuItem value={'1h'}>1시간</MenuItem>
      <MenuItem value={'6h'}>6시간</MenuItem>
      <MenuItem value={'24h'}>24시간</MenuItem>
      <MenuItem value={'7d'}>7일</MenuItem>
    </Select>
  );

  return (
    <Paper
      sx={{
        height: '100%',
        padding: 2.5,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Typography variant="h6">
        자산 관리 설정
      </Typography>

      <Box sx={{ flex: 1, display: 'grid', gridTemplateRows: '1fr 1fr', gap: 2, minHeight: 0 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <DashboardBlock
            title="트래픽 모니터링"
            controls={trafficSelector}
            sx={{ height: '100%', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            <TrafficMonitoring showControls={false} isEmbedded={true} />
          </DashboardBlock>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <DashboardBlock
            title="실시간 위협 수"
            controls={threatSelector}
            sx={{ height: '100%', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            <RealtimeThreatCount showControls={false} isEmbedded={true} />
          </DashboardBlock>
        </Box>
      </Box>
    </Paper>
  );
}