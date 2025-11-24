import React, { useState, useEffect } from 'react';
import DashboardBlock from '../DashboardBlock';
import { Box, Typography, Chip, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { threatApi } from '../../service/apiService';

// 위협 수준에 따른 색상 및 텍스트 반환
const getThreatLevelStyle = (threatLevel) => {
  const level = threatLevel?.toLowerCase();
  if (level === 'warning') {
    return { color: '#ef5350', text: '긴급' };
  } else if (level === 'attention') {
    return { color: '#ff9800', text: '공격' };
  }
  return { color: '#9e9e9e', text: '정보' };
};

// 자산 이름 포맷팅 (예: 192.168.10.81 -> HMI2(Labeling))
const getAssetName = (ip) => {
  // 실제로는 자산 매핑 테이블을 사용해야 하지만, 여기서는 간단히 처리
  const assetMap = {
    '192.168.10.81': 'HMI2(Labeling)',
    '192.168.10.82': 'HMI1(Vision)',
    '192.168.10.10': 'LS Electric PLC',
  };
  return assetMap[ip] || ip;
};


// 메인 컴포넌트
export default function Alerts({ onAlertConfirm }) {
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchThreats = async () => {
    try {
      setLoading(true);
      const maxItems = 20;

      // API가 배열을 직접 반환하고, 상태값이 영어로 옴 (new, analyzing, confirmed 등)
      // 1. 먼저 모든 위협 가져오기
      const response = await threatApi.getThreats({
        page: 0,
        size: 100  // 충분한 수를 가져와서 클라이언트에서 필터링
      });

      // response.data가 배열인 경우 처리
      let allThreats = Array.isArray(response.data) ? response.data : [];

      // 2. 클라이언트에서 상태별로 필터링 및 정렬
      // 백엔드가 'new', 'analyzing', 'confirmed' 등 영어로 반환
      const newThreats = allThreats.filter(t => t.status?.toLowerCase() === 'new');
      const otherThreats = allThreats.filter(t =>
        t.status?.toLowerCase() !== 'new' &&
        ['analyzing', 'confirmed'].includes(t.status?.toLowerCase())
      );

      // 3. 신규를 우선 배치하고 최대 개수 제한
      const finalThreats = [...newThreats, ...otherThreats].slice(0, maxItems);

      setThreats(finalThreats);
    } catch (error) {
      console.error('위협 데이터 조회 실패:', error);
      setThreats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreats();

    // 30초마다 자동 갱신
    const intervalId = setInterval(fetchThreats, 30000);

    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <DashboardBlock title="이상 탐지 및 알람" sx={{ height: '100%', flex: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <CircularProgress />
        </Box>
      </DashboardBlock>
    );
  }

  return (
    <DashboardBlock title="이상 탐지 및 알람" sx={{ height: '100%', flex: 5 }}>
      <TableContainer sx={{ maxHeight: 400 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', width: '12%' }}>시간</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', width: '12%' }}>분류</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', width: '30%' }}>경로</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', width: '10%' }}>수준</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', width: '10%' }}>타입</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', width: '8%' }}>심각도</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', width: '10%' }}>상태</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {threats.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  현재 알림이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              threats.map((threat) => {
                // API 응답 필드명 매핑
                const threatLevel = threat.threat_level || threat.threatLevel;
                const sourceIp = threat.src_ip || threat.sourceIp;
                const destIp = threat.dst_ip || threat.destinationIp || threat.destIp;
                const threatType = threat.threat_type || threat.threatType || threat.detection_engine || 'DL';
                const timestamp = new Date(threat['@timestamp'] || threat.timestamp || threat.eventTimestamp);
                const status = threat.status;
                const threatId = threat.threat_id || threat.id;
                const sourceAssetName = threat.source_asset_name || threat.sourceAssetName;
                const targetAssetName = threat.target_asset_name || threat.targetAssetName;

                const levelStyle = getThreatLevelStyle(threatLevel);
                const timeStr = timestamp.toLocaleString('ko-KR', {
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false
                }).replace(/\. /g, '.').replace(/\./g, '/').replace('/', '.').substring(0, 17);

                // 상태 한글 변환
                const statusKorean = status === 'new' ? '신규' :
                                    status === 'analyzing' ? '분석중' :
                                    status === 'confirmed' ? '확인' :
                                    status === 'resolved' ? '조치완료' : status;

                return (
                  <TableRow key={threatId} hover>
                    <TableCell sx={{ fontSize: '0.875rem' }}>{timeStr}</TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>위협탐지</TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>
                      {sourceAssetName || getAssetName(sourceIp)} ({sourceIp}) → {targetAssetName || getAssetName(destIp)}
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                          color: levelStyle.color
                        }}
                      >
                        {levelStyle.text}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>{threatType}</TableCell>
                    <TableCell>
                      <Chip
                        label={statusKorean}
                        size="small"
                        sx={{
                          fontSize: '0.75rem',
                          height: '22px',
                          backgroundColor: status === 'new' ? '#e3f2fd' : '#fff3e0',
                          color: status === 'new' ? '#1976d2' : '#f57c00'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>{statusKorean}</TableCell>
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