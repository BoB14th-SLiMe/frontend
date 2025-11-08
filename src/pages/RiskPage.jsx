import React, { useState, useEffect } from 'react'; // ⭐️ useMemo 제거
import { Stack, Box } from '@mui/material';
import { useSearchParams } from 'react-router-dom'; 
// ⭐️ dayjs 임포트 제거 (이제 자식 컴포넌트가 관리)

// ⭐️ Risk 컴포넌트 Import
// ⭐️ [수정] FilterBar, ThreatEventTable 대신 FilteredThreatTable 임포트
import FilteredThreatTable from '../components/Risk/FilteredThreatTable';
import RealtimeThreatCount from '../components/Risk/RealtimeThreatCount'; // (기존 임포트)
import ThreatTypeTop5 from '../components/Risk/ThreatTypeTop5'; // (기존 임포트)
import ThreatGradeIncidence from '../components/Risk/Totalevent'; // (기존 임포트)
import DetailReport from '../components/Risk/DetailReport'; // (기존 임포트)
import ReportDetails from '../components/Risk/ReportDetails'; // (기존 임포트)
import AdministratorAction from '../components/Risk/AdministratorAction'; // (기존 임포트)
import AnalysisContent from '../components/Risk/AnalysisContent'; // (기존 임포트)

// ⭐️ MOCK 데이터 임포트
import { SAMPLE_DATA } from '../components/Risk/sampleData';

const SPACING = 1.25; 

// 페이지 레이아웃 비율을 변수로 관리
const PAGE_LAYOUT = {
  // 왼쪽 영역과 오른쪽 영역의 너비 비율
  mainColumns: {
    left: 2,
    right: 1,
  },
  // 왼쪽 영역 하단에 있는 3개 그래프의 너비 비율
  bottomCharts: {
    realtime: 2.4,
    top5: 1,
    incidence: 1,
  },
  // 오른쪽 영역의 상세 보고서와 관리자 사후조치 높이 비율
  rightColumn: {
    detailReport: 1.75,
    adminAction: 1,
  },
};

export default function RiskPage() { 
    // ⭐️ URL 파라미터 읽기 (변경 없음)
    const [searchParams] = useSearchParams();
    const eventIdFromUrl = searchParams.get('eventId');

    // 1. RiskPage가 선택된 이벤트를 상태로 관리합니다. (변경 없음)
    const [selectedEvent, setSelectedEvent] = useState(null);

    // ⭐️ URL 파라미터(eventId)가 변경될 때마다 실행되는 useEffect (변경 없음)
    useEffect(() => {
        if (eventIdFromUrl) {
            console.log(`RiskPage: URL에서 eventId(${eventIdFromUrl}) 감지.`);
            // URL 파라미터는 문자열이므로 숫자로 변환
            const event = SAMPLE_DATA.find(e => e.id === parseInt(eventIdFromUrl));
            if (event) {
                // ⭐️ 상태를 강제로 업데이트
                setSelectedEvent(event);
            }
        }
    }, [eventIdFromUrl]); 

    // 4. 테이블에서 직접 클릭 시 실행될 함수 (기존 로직 - 변경 없음)
    const handleEventSelect = (event) => {
        console.log(`RiskPage: 테이블에서 ${event.id}번 클릭됨.`);
        setSelectedEvent(event);
    };

    return (
        <Stack direction="row" spacing={SPACING} sx={{ height: '100%' }}> {/* 전체 컨텐츠를 가로로 나눔 */}
            
            {/* 1. 왼쪽 컨텐츠 영역 */}
            <Stack direction="column" spacing={SPACING} sx={{ flex: PAGE_LAYOUT.mainColumns.left, overflow: 'hidden' }}>
                
                {/* ⭐️ [수정] FilteredThreatTable을 flex로 채우도록 수정 */}
                <FilteredThreatTable
                    data={SAMPLE_DATA}
                    onEventSelect={handleEventSelect}
                />

                {/* 1-B. 하단 그래프 3개 영역 (가로로 배열) */}
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

            {/* 2. 오른쪽 상세 보고서 영역 */}
            <Stack direction="column" spacing={SPACING} sx={{ flex: PAGE_LAYOUT.mainColumns.right }}>
                
                {/* 2-A. 상세 보고서 (래퍼) */}
                <Box sx={{ flex: PAGE_LAYOUT.rightColumn.detailReport, minHeight: 0 }}>
                    <DetailReport
                        event={selectedEvent} // ⭐️ 래퍼에도 event 전달 (타이틀 변경용)
                    >
                        <Stack spacing={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}> 
                            <ReportDetails 
                                event={selectedEvent} // ⭐️ 상태 전달
                            />
                            <AnalysisContent 
                                event={selectedEvent} // ⭐️ 상태 전달
                                sx={{ flex: 1, minHeight: 0 }} // 남은 공간 모두 차지
                            />
                        </Stack>
                    </DetailReport>
                </Box>
                {/* 2-B. 관리자 사후조치 */}
                <Box sx={{ flex: PAGE_LAYOUT.rightColumn.adminAction, minHeight: 0 }}>
                    <AdministratorAction />
                </Box>

            </Stack>
        </Stack>
    );
}