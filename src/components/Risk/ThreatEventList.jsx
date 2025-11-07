import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Select,
  MenuItem,
  Paper,
  IconButton,
} from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
// import DashboardBlock from '../DashboardBlock'; // ⭐️ [수정] 임포트 오류를 해결하기 위해 주석 처리하고 아래에 모의(Mock) 컴포넌트를 생성합니다.

// ⭐️ [추가] DashboardBlock 모의(Mock) 컴포넌트
// 임포트 오류를 해결하기 위해 실제 컴포넌트 대신 임시 컴포넌트를 정의합니다.
// 실제 환경에서는 이 컴포넌트 대신 '../DashboardBlock'에서 올바른 컴포넌트를 임포트해야 합니다.
const DashboardBlock = ({ title, controls, children, sx }) => (
  <Paper
    elevation={0}
    sx={{
      border: '1px solid #e0e0e0',
      borderRadius: 2,
      overflow: 'hidden',
      display: 'flex', 
      flexDirection: 'column',
      ...sx, // ThreatEventTable에서 전달된 sx (height, display, flexDirection)가 여기 적용됩니다.
    }}
  >
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2,
        borderBottom: '1px solid #e0e0e0',
        flexShrink: 0, // 헤더 크기 고정
      }}
    >
      <Typography variant="h6" component="h3" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
        {title}
      </Typography>
      <Box>{controls}</Box>
    </Box>
    {/* children (TableContainer)이 여기에 렌더링됩니다.
      TableContainer에 'flex: 1'이 설정되어 있어 남은 공간을 채우게 됩니다.
    */}
    {children}
  </Paper>
);


// 테이블 헤더 정의 (변경 없음)
const TABLE_HEADERS = [
  { id: 'severity', label: '위험도', minWidth: 80 },
  { id: 'index', label: 'Index', minWidth: 60 },
  { id: 'timestamp', label: '발생 시각', minWidth: 140 },
  { id: 'threatType', label: '위협 유형', minWidth: 140 },
  { id: 'sourceIp', label: '출발지', minWidth: 140 },
  { id: 'targetDevice', label: '목적지 자산', minWidth: 100 },
  { id: 'detectionMethod', label: '탐지 엔진', minWidth: 80 },
  { id: 'status', label: '처리 상태', minWidth: 110 },
  { id: 'report', label: '보고서', minWidth: 80 },
];

// 상태 매핑 (변경 없음)
const STATUS_MAP = {
  new: '신규',
  investigating: '확인중',
  completed: '조치완료',
};

// 정렬 함수 (변경 없음)
const createComparator = (order, orderBy) => {
  const descComp = (a, b, field) => {
    if (field === 'severity') {
      const diff = (b.severityLevel || 0) - (a.severityLevel || 0);
      return diff !== 0 ? diff : b.id - a.id;
    }
    if (field === 'id') {
      return b.id - a.id;
    }
    return b[field] < a[field] ? -1 : b[field] > a[field] ? 1 : 0;
  };
  return order === 'desc'
    ? (a, b) => descComp(a, b, orderBy)
    : (a, b) => -descComp(a, b, orderBy);
};

const stableSort = (array, comparator) => {
  const stabilized = array.map((el, idx) => [el, idx]);
  stabilized.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    return order !== 0 ? order : a[1] - b[1];
  });
  return stabilized.map((el) => el[0]);
};


export default function ThreatEventTable({ width, height, data = [], onEventSelect }) {

  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('desc');
  const [statusValues, setStatusValues] = useState({});

  // ⭐️ [수정] 데이터가 변경될 때 (필터링 등) 기존 상태값과 병합
  useEffect(() => {
    setStatusValues(prevStatus => {
      // 1. 현재 data prop을 기준으로 기본 상태 객체를 만듭니다.
      const newStatusFromData = {};
      data.forEach(item => {
        newStatusFromData[item.id] = item.statusValue || 'new';
      });

      // 2. 기본 상태 위에 기존의 사용자 변경 상태(prevStatus)를 덮어씁니다.
      //    이렇게 하면 사용자의 변경사항이 data prop의 기본값보다 우선순위를 갖게 됩니다.
      //    또한, data에 일시적으로 없는(필터링된) 항목의 상태도 prevStatus에 유지됩니다.
      const mergedStatus = { ...newStatusFromData, ...prevStatus };

      return mergedStatus;
    });
  }, [data]);

  const handleStatusChange = (id, newStatus) => {
    setStatusValues(prev => ({
      ...prev,
      [id]: newStatus
    }));
  };

  const sortedData = useMemo(() => {
    const sorted = stableSort(data, createComparator(sortOrder, sortBy));
    console.log('🔍 ThreatEventTable 받은 데이터:', data.length, '개');
    console.log('🔍 정렬 후 데이터:', sorted.length, '개');
    console.log('🔍 정렬 후 ID 목록:', sorted.map(d => d.id));
    return sorted;
  }, [data, sortOrder, sortBy]);



  const SortControls = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
        정렬 기준:
      </Typography>
      <Select
        value={sortBy}
        onChange={(e) => {
          setSortBy(e.target.value);
          setSortOrder('desc');
        }}
        size="small"
        sx={{ minWidth: 120, height: 32 }}
      >
        <MenuItem value="severity">위험도별 정렬</MenuItem>
        <MenuItem value="id">Index별 정렬</MenuItem>
      </Select>
      <IconButton
        onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
        size="small"
        sx={{
          border: '1px solid #e0e0e0',
          borderRadius: 1,
          p: 0.5,
          color: '#007bff',
          '&:hover': { bgcolor: '#e3f2fd' },
        }}
        title={sortOrder === 'desc' ? '역순 정렬' : '정순 정렬'}
      >
        {sortOrder === 'desc' ? <ArrowDownward fontSize="small" /> : <ArrowUpward fontSize="small" />}
      </IconButton>
    </Box>
  );

  return (
    <DashboardBlock title="위협 이벤트 목록" controls={SortControls} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          flex: 1, // ⭐️ DashboardBlock의 자식으로서 남은 공간을 모두 차지
          minHeight: 0,
          overflow: 'auto',
          '& .MuiTable-root': {
            minWidth: '100%',
          }
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              {TABLE_HEADERS.map((header) => (
                <TableCell
                  key={header.id}
                  align="center"
                  sx={{ fontWeight: 600, bgcolor: '#fafafa', minWidth: header.minWidth }}
                >
                  {header.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={TABLE_HEADERS.length} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    필터 조건에 맞는 데이터가 없습니다.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row, index) => {
                console.log(`  📌 렌더링 중: Index ${index} - ID: ${row.id}, status: ${row.statusValue}, severity: ${row.severity}`);
                return (
                  <TableRow
                    key={row.id}
                    sx={{
                      '&:hover': { bgcolor: '#f5f5f5' },
                      '& td': { py: 1.5 },
                      ...(row.severityLevel >= 2 && (statusValues[row.id] || row.statusValue) !== 'completed' && {
                        bgcolor: row.severityColor === 'error' ? 'rgba(211, 47, 47, 0.04)' : 'rgba(245, 124, 0, 0.04)',
                      }),
                    }}
                  >
                    <TableCell align="center">
                      <Chip
                        label={row.severity}
                        color={row.severityColor}
                        size="small"
                        sx={{ fontWeight: 600, minWidth: 50, height: 24 }}
                      />
                    </TableCell>
                    <TableCell align="center">{row.id}</TableCell>
                    <TableCell align="center">{row.timestamp}</TableCell>
                    <TableCell align="center">{row.threatType}</TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {row.sourceIp}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.macAddress}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{row.targetDevice}</TableCell>
                    <TableCell align="center">{row.detectionMethod}</TableCell>
                    <TableCell align="center">
                      <Select
                        // ⭐️ [수정] value를 statusValues[row.id]만 참조하도록 변경
                        // ⭐️ 'new'는 statusValues에 값이 없을 경우를 대비한 fallback
                        value={statusValues[row.id] || 'new'}
                        onChange={(e) => handleStatusChange(row.id, e.target.value)}
                        size="small"
                        sx={{
                          minWidth: 110,
                          height: 32,
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' },
                        }}
                      >
                        <MenuItem value="new">신규</MenuItem>
                        <MenuItem value="investigating">확인중</MenuItem>
                        <MenuItem value="completed">조치완료</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell align="center">
                      <Typography
                        variant="body2"
                        onClick={() => {
                          if (onEventSelect) {
                            onEventSelect(row);
                          }
                        }}
                        sx={{
                          color: row.report === '확인' ? 'primary.main' : 'text.secondary',
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        {row.report}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </DashboardBlock>
  );
}