import React, { useState, useEffect } from 'react';
import { Stack, Box } from '@mui/material';
import { useSearchParams } from 'react-router-dom';

// Components
import FilteredThreatTable from '../components/Risk/FilteredThreatTable';
import RealtimeThreatCount from '../components/Risk/RealtimeThreatCount';
import ThreatTypeTop5 from '../components/Risk/ThreatTypeTop5';
import ThreatGradeIncidence from '../components/Risk/Totalevent';
import DetailReport from '../components/Risk/DetailReport';
import ReportDetails from '../components/Risk/ReportDetails';
import AdministratorAction from '../components/Risk/AdministratorAction';
import AnalysisContent from '../components/Risk/AnalysisContent';

// API
import { threatApi } from '../services/apiService';

const SPACING = 1.25;

const PAGE_LAYOUT = {
  mainColumns: { left: 2, right: 1 },
  bottomCharts: { realtime: 2.4, top5: 1, incidence: 1 },
  rightColumn: { detailReport: 1.75, adminAction: 1 },
};

export default function RiskPage() {
  const [searchParams] = useSearchParams();
  const eventIdFromUrl = searchParams.get('eventId');

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(false);

  // URL 파라미터로부터 이벤트 선택
  useEffect(() => {
    if (eventIdFromUrl) {
      console.log(`RiskPage: URL에서 eventId(${eventIdFromUrl}) 감지`);
      // eventId로 상세 조회 (백엔드 연동 시 활성화)
      // loadThreatDetail(eventIdFromUrl);
    }
  }, [eventIdFromUrl]);

  // 테이블에서 이벤트 선택 시
  const handleEventSelect = (event) => {
    console.log(`RiskPage: 테이블에서 이벤트 선택:`, event);
    setSelectedEvent(event);
    
    // 백엔드에서 상세 정보 로드
    if (event.threatId) {
      loadThreatDetail(event.threatId);
    }
  };

  // 위협 상세 정보 로드
  const loadThreatDetail = async (threatId) => {
    setLoading(true);
    try {
      const response = await threatApi.getThreatDetail(threatId);
      setDetailData(response.data);
      console.log('✅ 위협 상세 정보 로드:', response.data);
    } catch (error) {
      console.error('❌ 위협 상세 조회 실패:', error);
      // 실패 시 기본 데이터 사용
      setDetailData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack direction="row" spacing={SPACING} sx={{ height: '100%' }}>
      
      {/* 왼쪽 영역 */}
      <Stack direction="column" spacing={SPACING} sx={{ flex: PAGE_LAYOUT.mainColumns.left, overflow: 'hidden' }}>
        
        {/* 위협 테이블 */}
        <FilteredThreatTable onEventSelect={handleEventSelect} />

        {/* 하단 차트 3개 */}
        <Stack direction="row" spacing={SPACING} sx={{ flex: 0.65 }}>
          <Box sx={{ flex: `${PAGE_LAYOUT.bottomCharts.realtime} 1 0%`, minWidth: 0 }}>
            <RealtimeThreatCount />
          </Box>
          <Box sx={{ flex: `${PAGE_LAYOUT.bottomCharts.top5} 1 0%`, minWidth: 0 }}>
            <Stack direction="column" spacing={SPACING} sx={{ height: '100%' }}>
              <ThreatTypeTop5 />
            </Stack>
          </Box>
          <Box sx={{ flex: `${PAGE_LAYOUT.bottomCharts.incidence} 1 0%`, minWidth: 0 }}>
            <ThreatGradeIncidence />
          </Box>
        </Stack>
        
      </Stack>

      {/* 오른쪽 영역 */}
      <Stack direction="column" spacing={SPACING} sx={{ flex: PAGE_LAYOUT.mainColumns.right }}>
        
        {/* 상세 보고서 */}
        <Box sx={{ flex: PAGE_LAYOUT.rightColumn.detailReport, minHeight: 0 }}>
          <DetailReport event={selectedEvent}>
            <Stack spacing={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <ReportDetails 
                event={selectedEvent}
                detailData={detailData}
                loading={loading}
              />
              <AnalysisContent 
                event={selectedEvent}
                detailData={detailData}
                sx={{ flex: 1, minHeight: 0 }}
              />
            </Stack>
          </DetailReport>
        </Box>

        {/* 관리자 사후조치 */}
        <Box sx={{ flex: PAGE_LAYOUT.rightColumn.adminAction, minHeight: 0 }}>
          <AdministratorAction 
            selectedEvent={selectedEvent}
          />
        </Box>

      </Stack>
    </Stack>
  );
}