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
    console.log('🔍 확인 버튼 클릭 - appliedFilters 업데이트:', draftFilters);
    setAppliedFilters(draftFilters);
  };

  const handleResetFilters = () => {
    console.log('🔄 초기화 버튼 클릭');
    setDraftFilters(initialFilters);
    setAppliedFilters(initialFilters);
  };

  const filteredData = useMemo(() => {
    console.log('📊 필터링 시작 - appliedFilters:', appliedFilters);
    console.log('📊 원본 데이터 개수:', data.length);
    
    let result = [...data];

    // 1. 심각도 필터
    if (appliedFilters.severity !== 'all') {
      console.log('  🔸 심각도 필터 적용:', appliedFilters.severity);
      result = result.filter(item => item.severity === appliedFilters.severity);
      console.log('  → 필터 후 개수:', result.length);
    }

    // 2. 처리 상태 필터
    if (appliedFilters.status !== 'all') {
      console.log('  🔸 처리 상태 필터 적용:', appliedFilters.status);
      if (appliedFilters.status === 'pending') {
        result = result.filter(item => 
          item.statusValue === 'new' || item.statusValue === 'investigating'
        );
      } else if (appliedFilters.status === 'completed') {
        result = result.filter(item => item.statusValue === 'completed');
      }
      console.log('  → 필터 후 개수:', result.length);
    } else {
      console.log('  🔸 처리 상태: 전체 (필터링 안함)');
    }
    
    // 3. 날짜 필터
    if (appliedFilters.startDate) {
      console.log('  🔸 시작 날짜 필터 적용:', appliedFilters.startDate.format('YYYY.MM.DD'));
      result = result.filter(item => 
        dayjs(item.timestamp, 'YYYY.MM.DD HH:mm:ss').isAfter(appliedFilters.startDate.startOf('day'))
      );
      console.log('  → 필터 후 개수:', result.length);
    }
    if (appliedFilters.endDate) {
      console.log('  🔸 종료 날짜 필터 적용:', appliedFilters.endDate.format('YYYY.MM.DD'));
      result = result.filter(item => 
        dayjs(item.timestamp, 'YYYY.MM.DD HH:mm:ss').isBefore(appliedFilters.endDate.endOf('day'))
      );
      console.log('  → 필터 후 개수:', result.length);
    }

    // 4. 검색어 필터
    if (appliedFilters.searchQuery) {
      console.log('  🔸 검색어 필터 적용:', appliedFilters.searchQuery);
      const query = appliedFilters.searchQuery.toLowerCase();
      result = result.filter(item => 
        item.sourceIp.toLowerCase().includes(query) ||
        item.threatType.toLowerCase().includes(query) ||
        item.targetDevice.toLowerCase().includes(query)
      );
      console.log('  → 필터 후 개수:', result.length);
    }
    
    console.log('✅ 최종 필터링 결과 개수:', result.length);
    console.log('✅ 최종 결과 ID 목록:', result.map(r => r.id));
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
