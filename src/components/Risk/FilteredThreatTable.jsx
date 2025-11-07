import React, { useState, useMemo } from 'react';
import { Stack, Box } from '@mui/material';
import dayjs from 'dayjs';

// 1. 자식 컴포넌트 임포트
import FilterBar from './FilterBar';
import ThreatEventTable from './ThreatEventList';

// ⭐️ [추가] 필터 초기값을 상수로 정의
const initialFilters = {
  severity: 'all',
  status: 'all',
  startDate: dayjs().subtract(1, 'month'),
  endDate: dayjs(),
  searchQuery: ''
};

/**
 * FilterBar와 ThreatEventTable을 묶어주는 컨테이너 컴포넌트
 * - "확인" 버튼 로직을 위해 '임시' 상태와 '적용된' 상태를 분리하여 관리합니다.
 */
export default function FilteredThreatTable({ data, onEventSelect }) {
  
  // ⭐️ 1. [수정] 'draftFilters': 사용자가 UI에서 조작하는 임시 필터 상태
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  
  // ⭐️ 2. [추가] 'appliedFilters': "확인" 버튼을 눌렀을 때만 업데이트되는 실제 필터 상태
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  // ⭐️ 3. [수정] 필터 핸들러는 'draftFilters'만 변경
  const handleFilterChange = (filterName, value) => {
    setDraftFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value
    }));
  };

  // ⭐️ 4. [추가] "확인" 버튼 핸들러
  const handleApplyFilters = () => {
    setAppliedFilters(draftFilters);
  };

  // ⭐️ 5. [추가] "초기화" 버튼 핸들러
  const handleResetFilters = () => {
    setDraftFilters(initialFilters);
    setAppliedFilters(initialFilters);
  };

  // ⭐️ 6. [수정] 필터링 로직(useMemo)은 'appliedFilters'를 의존
  const filteredData = useMemo(() => {
    let tableData = data; // 부모로부터 받은 원본 데이터
    const filters = appliedFilters; // ⭐️ 'appliedFilters'를 기준으로 계산

    // 1. 심각도 필터
    if (filters.severity !== 'all') {
      tableData = tableData.filter(item => item.severity === filters.severity);
    }

    // 2. 처리 상태 필터
    if (filters.status === 'pending') {
      tableData = tableData.filter(item => item.statusValue === 'new' || item.statusValue === 'investigating');
    } else if (filters.status === 'completed') {
      tableData = tableData.filter(item => item.statusValue === 'completed');
    }
    
    // 3. 날짜 필터
    if (filters.startDate) {
      tableData = tableData.filter(item => 
        dayjs(item.timestamp, 'YYYY.MM.DD HH:mm:ss').isAfter(filters.startDate.startOf('day'))
      );
    }
    if (filters.endDate) {
      tableData = tableData.filter(item => 
        dayjs(item.timestamp, 'YYYY.MM.DD HH:mm:ss').isBefore(filters.endDate.endOf('day'))
      );
    }

    // 4. 검색어 필터
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      tableData = tableData.filter(item => 
        item.sourceIp.toLowerCase().includes(query) ||
        item.threatType.toLowerCase().includes(query) ||
        item.targetDevice.toLowerCase().includes(query)
      );
    }
    
    return tableData;
  }, [data, appliedFilters]); // ⭐️ 의존성 배열을 'appliedFilters'로 변경

  return (
    // ⭐️ FilterBar와 ThreatEventTable을 렌더링
    <Stack spacing={1.25} sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexShrink: 0 }}>
        <FilterBar
          filters={draftFilters} // ⭐️ UI는 'draftFilters'를 표시
          onFilterChange={handleFilterChange} // ⭐️ 핸들러 전달
          onApply={handleApplyFilters} // ⭐️ "확인" 핸들러 전달
          onReset={handleResetFilters} // ⭐️ "초기화" 핸들러 전달
        />
      </Box>
      <ThreatEventTable
        data={filteredData} // ⭐️ 필터링된 데이터 전달
        onEventSelect={onEventSelect} // RiskPage의 핸들러를 그대로 전달
      />
    </Stack>
  );
}

