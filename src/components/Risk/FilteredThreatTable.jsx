import React, { useState, useEffect } from 'react';
import { Stack, Box, CircularProgress, Alert } from '@mui/material';
import dayjs from 'dayjs';

import FilterBar from './FilterBar';
import ThreatEventTable from './ThreatEventList';
import { threatApi } from '../../service/apiService';

const initialFilters = {
  severity: 'all',
  status: 'all',
  startDate: null,
  endDate: null,
  searchQuery: ''
};

export default function FilteredThreatTable({ onEventSelect }) {
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0
  });

  // 데이터 로드 함수
  const loadThreats = async (filters, page = 0) => {
    setLoading(true);
    setError(null);
    
    try {
      // API 파라미터 구성
      const params = {
        page,
        size: 20,
        sort: 'timestamp,desc'
      };
      
      if (filters.severity !== 'all') {
        params.severity = filters.severity;
      }
      
      if (filters.status !== 'all') {
        params.status = filters.status;
      }
      
      if (filters.startDate) {
        params.startDate = filters.startDate.toISOString();
      }
      
      if (filters.endDate) {
        params.endDate = filters.endDate.toISOString();
      }
      
      if (filters.searchQuery) {
        params.search = filters.searchQuery;
      }
      
      // API 호출
      const response = await threatApi.filterThreats(params);
      
      // 데이터 변환 (백엔드 형식 → 프론트엔드 형식)
      const transformedData = response.data.content.map((threat, index) => ({
        id: index + 1 + (page * 20),
        severity: mapSeverity(threat.threat_level),
        severityLevel: mapSeverityLevel(threat.threat_level),
        severityColor: mapSeverityColor(threat.threat_level),
        timestamp: dayjs(threat['@timestamp']).format('YYYY.MM.DD HH:mm:ss'),
        threatType: threat.threat_type,
        sourceIp: threat.src_ip,
        macAddress: 'N/A', // TODO: 백엔드에 MAC 추가
        targetDevice: threat.dst_ip,
        detectionMethod: threat.attack_signature || 'Rule',
        status: mapStatus(threat.status),
        statusValue: threat.status,
        report: threat.status === 'resolved' ? '완료' : '확인',
        threatId: threat.threat_id // 상세 조회용
      }));
      
      setData(transformedData);
      setPagination({
        page: response.data.number,
        size: response.data.size,
        totalElements: response.data.totalElements,
        totalPages: response.data.totalPages
      });
      
    } catch (err) {
      console.error('위협 데이터 로드 실패:', err);
      setError('위협 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    loadThreats(appliedFilters, 0);
  }, []);

  // 필터 변경 핸들러
  const handleFilterChange = (filterName, value) => {
    setDraftFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // 필터 적용
  const handleApplyFilters = () => {
    setAppliedFilters(draftFilters);
    loadThreats(draftFilters, 0);
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setDraftFilters(initialFilters);
    setAppliedFilters(initialFilters);
    loadThreats(initialFilters, 0);
  };

  // 페이지 변경 (추후 구현)
  const handlePageChange = (newPage) => {
    loadThreats(appliedFilters, newPage);
  };

  // 매핑 함수들
  const mapSeverity = (level) => {
    if (!level) return '경고';
    const normalized = level.toLowerCase();
    const map = {
      'warning': '긴급',
      'attention': '경고'
    };
    return map[normalized] || '경고';
  };

  const mapSeverityLevel = (level) => {
    if (!level) return 1;
    const normalized = level.toLowerCase();
    const map = {
      'warning': 2,
      'attention': 1
    };
    return map[normalized] || 1;
  };

  const mapSeverityColor = (level) => {
    if (!level) return 'warning';
    const normalized = level.toLowerCase();
    const map = {
      'warning': 'error',
      'attention': 'warning'
    };
    return map[normalized] || 'warning';
  };

  const mapStatus = (status) => {
    const map = {
      'detected': '신규',
      'investigating': '확인중',
      'resolved': '조치완료',
      'false_positive': '오탐'
    };
    return map[status] || status;
  };

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

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative' }}>
        {loading && (
          <Box sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            zIndex: 1
          }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <ThreatEventTable
          data={data}
          onEventSelect={onEventSelect}
        />
      </Box>
      
      {/* TODO: 페이지네이션 추가 */}
      {pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          {/* Pagination 컴포넌트 */}
        </Box>
      )}
    </Stack>
  );
}
