// ===============================
// 대시보드 색상 테마 통합 관리
// ===============================

// 1. 기본 색상 (네트워크 장치 & StatBox 기반)
export const COLORS = {
  // 주요 색상
  primary: {
    blue: '#42a5f5',      // 네트워크 장치 파란색
    red: '#ef5350',       // 네트워크 장치 빨간색
    green: '#4CAF50',     // StatBox 안전 초록색
  },
  
  // 상태 색상
  status: {
    safe: '#4CAF50',      // 안전 (초록)
    warning: '#ff9800',   // 경고 (주황)
    danger: '#F44336',    // 위험 (빨강)
  },

  // 차트 색상 팔레트 (진한 파스텔 - 블루 계열)
  chart: {
    // 파이 차트 & 프로토콜 현황 & 위협 유형 Top 5 공통 색상
    palette1: [
      '#424874',  // 다크 인디고
      '#A6B1E1',  // 페리윙클 블루
      '#DCD6F7',  // 소프트 퍼플
      '#F4EEFF',  // 라이트 라벤더
    ],
    
    // 위협 유형 Top 5용 (palette1과 동일)
    threat: [
      '#424874',  // 산업 프로토콜 이상 행위
      '#A6B1E1',  // 비인가 제어 시스템 접근
      '#DCD6F7',  // 서비스 거부(DoS) 공격
      '#F4EEFF',  // 비정상 레지스터
      '#8E99D3',  // 리플레이(Replay) 공격
    ],
    
    // 그라데이션용 (백그라운드나 영역 표시)
    gradient: {
      blue: ['rgba(66, 165, 245, 0.4)', 'rgba(66, 165, 245, 0.05)'],
      green: ['rgba(76, 175, 80, 0.4)', 'rgba(76, 175, 80, 0.05)'],
      red: ['rgba(239, 83, 80, 0.4)', 'rgba(239, 83, 80, 0.05)'],
    },
  },

  // 네트워크 장치 색상
  network: {
    router: '#42a5f5',    // 라우터 (파랑)
    switch: '#66bb6a',    // 스위치 (초록)
    server: '#ef5350',    // 서버 (빨강)
    plc: '#ffa726',       // PLC (오렌지)
  },

  // 배경 & 테두리
  background: {
    paper: '#ffffff',
    default: '#fafafa',
    hover: '#f5f5f5',
  },
  
  border: {
    light: '#e0e0e0',
    default: '#bdbdbd',
  },

  // 텍스트
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#bdbdbd',
  },
};

// 2. 특정 컴포넌트별 색상 매핑
export const COMPONENT_COLORS = {
  // StatBox 게이지 색상
  gauge: {
    safe: COLORS.primary.green,
    warning: COLORS.status.warning,
    danger: COLORS.primary.red,
  },

  // 트래픽 모니터링
  traffic: {
    current: '#e0e0e0',         // 일반 트래픽
    attack: COLORS.primary.red, // 공격 감지
    average: COLORS.primary.green, // 평균선
  },

  // 실시간 위협 수
  threat: {
    line: '#81D4C2',  // 시안 그린
    area: ['rgba(129, 212, 194, 0.4)', 'rgba(129, 212, 194, 0.05)'],
  },

  // 프로토콜 차트 (시간별 & 주간)
  protocol: COLORS.chart.palette1,

  // 위협 유형 Top 5
  threatTypes: COLORS.chart.threat,

  // 네트워크 장치
  devices: COLORS.network,
};

// 3. 헬퍼 함수
/**
 * 배열에서 순환하며 색상 가져오기
 * @param {Array} colors - 색상 배열
 * @param {number} index - 인덱스
 * @returns {string} - 색상
 */
export const getColorByIndex = (colors, index) => {
  return colors[index % colors.length];
};

/**
 * 위험도에 따른 색상 가져오기
 * @param {number} value - 값 (0-100)
 * @returns {string} - 색상
 */
export const getColorByRisk = (value) => {
  if (value <= 30) return COLORS.status.safe;
  if (value <= 80) return COLORS.status.warning;
  return COLORS.status.danger;
};

/**
 * echarts 그라데이션 생성
 * @param {Array} colors - [startColor, endColor]
 * @returns {Object} - echarts gradient object
 */
export const createEchartsGradient = (colors) => ({
  type: 'linear',
  x: 0,
  y: 0,
  x2: 0,
  y2: 1,
  colorStops: [
    { offset: 0, color: colors[0] },
    { offset: 1, color: colors[1] },
  ],
});

export default COLORS;
