import React, { useState, useMemo } from 'react';
import { Stack, Box } from '@mui/material';
import dayjs from 'dayjs';

import FilterBar from './FilterBar';
import ThreatEventTable from './ThreatEventList';

const initialFilters = {
  severity: 'all',
  status: 'all',
  startDate: null,
  endDate: null,
  searchQuery: ''
};

export default function FilteredThreatTable({ data, onEventSelect }) {
  
  // 확인 버튼 방식: draftFilters(UI 표시) + appliedFilters(실제 필터링)
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  const handleFilterChange = (filterName, value) => {
    setDraftFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(draftFilters);
  };

  const handleResetFilters = () => {
    setDraftFilters(initialFilters);
    setAppliedFilters(initialFilters);
  };

  const filteredData = useMemo(() => {
    let result = [...data];

    // 1. 심각도 필터
    if (appliedFilters.severity !== 'all') {
      result = result.filter(item => item.severity === appliedFilters.severity);
    }

    // 2. 처리 상태 필터
    if (appliedFilters.status !== 'all') {
      if (appliedFilters.status === 'pending') {
        result = result.filter(item => 
          item.statusValue === 'new' || item.statusValue === 'investigating'
        );
      } else if (appliedFilters.status === 'completed') {
        result = result.filter(item => item.statusValue === 'completed');
      }
    }
    
    // 3. 날짜 필터
    if (appliedFilters.startDate) {
      result = result.filter(item => 
        dayjs(item.timestamp, 'YYYY.MM.DD HH:mm:ss').isAfter(appliedFilters.startDate.startOf('day'))
      );
    }
    if (appliedFilters.endDate) {
      result = result.filter(item => 
        dayjs(item.timestamp, 'YYYY.MM.DD HH:mm:ss').isBefore(appliedFilters.endDate.endOf('day'))
      );
    }

    // 4. 검색어 필터
    if (appliedFilters.searchQuery) {
      const query = appliedFilters.searchQuery.toLowerCase();
      result = result.filter(item => 
        item.sourceIp.toLowerCase().includes(query) ||
        item.threatType.toLowerCase().includes(query) ||
        item.targetDevice.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [data, appliedFilters]);

  return (
    <Stack spacing={1.25} sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexShrink: 0 }}>
        <FilterBar
          filters={draftFilters}
          onFilterChange={handleFilterChange}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
        />
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <ThreatEventTable
          data={filteredData}
          onEventSelect={onEventSelect}
        />
      </Box>
    </Stack>
  );
}
