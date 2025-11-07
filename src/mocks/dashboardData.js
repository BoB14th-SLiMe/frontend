// 상단 KPI 카드 6개 데이터
export const kpiData = [
  { id: 1, title: "이상감지(건)", value: 5, unit: "Day" },
  { id: 2, title: "이상탐지(건)", value: 7, unit: "Week" },
  { id: 3, title: "새롭게 탐지된 IP(개수)", value: 0 },
  { id: 4, title: "평균 지연시간(ms)", value: 5 },
  { id: 5, title: "미확인 알림(건)", value: 1 },
  { id: 6, title: "긴급 알림(건)", value: 3 },
];

// 시스템 사용량 데이터
export const systemUsageData = {
  cpu: 20,
  ram: 87,
  gpu: 93,
};

// 알림 목록 데이터
export const alertData = [
  { id: 1, time: '17:23:05', level: 'danger', message: '이상 탐지 후 분석 중...', status: '91%', statusColor: 'orange' },
  { id: 2, time: '17:16:04', level: 'warning', message: 'SLM 보고서 작성 완료', status: '확인', statusColor: 'green' },
  { id: 3, time: '16:45:47', level: 'warning', message: 'SLM 보고서 작성 완료', status: '확인', statusColor: 'green' },
  { id: 4, time: '13:20:56', level: 'info', message: '이상 행위 조치 완료' },
  { id: 5, time: '13:00:10', level: 'info', message: '이상 행위 조치 완료' },
];