import React, { useState, useEffect } from 'react';
import DashboardBlock from '../DashboardBlock';
import { Box, Typography, Chip, CircularProgress, Button } from '@mui/material';
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

      // 2. 각 위협에 대해 XAI 분석 여부 확인 (threat_index로)
      const threatsWithXai = allThreats.map((threat) => {
        // threat_index가 있으면 XAI 분석이 완료된 것으로 간주
        const threatIndex = threat.threat_index || threat.threatIndex;
        return {
          ...threat,
          hasXaiAnalysis: threatIndex != null && threatIndex !== undefined
        };
      });

      // 3. 클라이언트에서 상태별로 필터링 및 정렬
      const newThreats = threatsWithXai.filter(t => t.status?.toLowerCase() === 'new');
      const otherThreats = threatsWithXai.filter(t =>
        t.status?.toLowerCase() !== 'new' &&
        ['analyzing', 'confirmed'].includes(t.status?.toLowerCase())
      );

      // 4. 신규를 우선 배치하고 최대 개수 제한
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {threats.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
            <Typography>현재 알림이 없습니다.</Typography>
          </Box>
        ) : (
          threats.map((threat, index) => {
            // API 응답 필드명 매핑
            const threatLevel = threat.threat_level || threat.threatLevel;
            const sourceIp = threat.src_ip || threat.sourceIp;
            const destIp = threat.dst_ip || threat.destinationIp || threat.destIp;
            const detectionEngine = threat.detection_engine || threat.detectionEngine || 'DL';
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
              hour12: false
            }).replace(/\. /g, '.').replace(/\./g, ' ').replace(/\//g, '.');

            // 상태 한글 변환
            const statusKorean = status === 'new' ? '신규' :
                                status === 'analyzing' ? '분석중' :
                                status === 'confirmed' ? '확인' :
                                status === 'resolved' ? '조치완료' : status;

            return (
              <Box
                key={threatId}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  borderBottom: index < threats.length - 1 ? '1px solid #eee' : 'none',
                  '&:hover': { backgroundColor: '#f9f9f9' }
                }}
              >
                {/* 왼쪽: 시간, 제목, 경로 */}
                <Box sx={{ flex: 1, minWidth: 0, mr: 2 }}>
                  {/* 시간 */}
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.3 }}>
                    {timeStr}
                  </Typography>

                  {/* 위협 탐지 제목 */}
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.3 }}>
                    위협 탐지
                  </Typography>

                  {/* 경로 */}
                  <Typography variant="body2" color="text.secondary">
                    {sourceAssetName || getAssetName(sourceIp)} ({sourceIp}) → {targetAssetName || getAssetName(destIp)} ({destIp})
                  </Typography>
                </Box>

                {/* 오른쪽: 레벨, 탐지엔진, 상태, 버튼 */}
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
                  {/* 위험도 레벨 칩 */}
                  <Chip
                    label={levelStyle.text}
                    size="small"
                    sx={{
                      backgroundColor: levelStyle.color,
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.75rem',
                      height: '28px',
                      borderRadius: '14px',
                      px: 1
                    }}
                  />

                  {/* 탐지엔진 칩 */}
                  <Chip
                    label={detectionEngine}
                    size="small"
                    sx={{
                      backgroundColor: '#e0e0e0',
                      color: '#666',
                      fontSize: '0.75rem',
                      height: '28px',
                      borderRadius: '14px',
                      px: 1
                    }}
                  />

                  {/* 상태 */}
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: '50px', textAlign: 'center' }}>
                    {statusKorean}
                  </Typography>

                  {/* XAI 매핑 여부에 따라 버튼 표시 */}
                  {(status === 'new' || status === 'analyzing') && (
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        backgroundColor: threat.hasXaiAnalysis ? '#1976d2' : '#e0e0e0',
                        color: threat.hasXaiAnalysis ? 'white' : '#999',
                        fontSize: '0.75rem',
                        textTransform: 'none',
                        borderRadius: '20px',
                        minWidth: '90px',
                        height: '36px',
                        px: 2,
                        boxShadow: 'none',
                        '&:hover': {
                          backgroundColor: threat.hasXaiAnalysis ? '#1565c0' : '#d0d0d0',
                          boxShadow: 'none'
                        }
                      }}
                    >
                      {threat.hasXaiAnalysis ? '상세보기' : '분석중'}
                    </Button>
                  )}
                </Box>
              </Box>
            );
          })
        )}
      </Box>
    </DashboardBlock>
  );
}