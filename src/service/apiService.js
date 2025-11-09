// src/service/apiService.js
import axios from 'axios';
import ReconnectingEventSource from 'reconnecting-eventsource';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🔵 API 요청: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ 요청 오류:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API 응답: ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('❌ 응답 오류:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ============================================
// Dashboard APIs
// ============================================
export const dashboardApi = {
  // 배너 통계
  getBannerStats: () => apiClient.get('/frontend/banner/stats'),
  
  // 대시보드 전체 통계
  getDashboardStats: () => apiClient.get('/dashboard/stats'),
  
  // 프로토콜 분포
  getProtocolDistribution: (period = '1h') => 
    apiClient.get('/dashboard/protocol-distribution', { params: { period } }),
  
  // 트래픽 모니터링
  getTrafficData: (range = '7d') => 
    apiClient.get('/dashboard/traffic', { params: { range } }),
  
  // 네트워크 토폴로지
  getTopology: () => apiClient.get('/topology'),
  
  // 알람 목록
  getAlarms: (status = 'all', limit = 10) => 
    apiClient.get('/alarms', { params: { status, limit } }),
};

// ============================================
// Threat APIs
// ============================================
export const threatApi = {
  // 위협 필터링
  filterThreats: (filters) => 
    apiClient.get('/threats/filter', { params: filters }),
  
  // 위협 상세
  getThreatDetail: (threatId) => 
    apiClient.get(`/threats/${threatId}/detail`),
  
  // 관리자 사후조치
  saveAdminAction: (threatId, data) => 
    apiClient.post(`/threats/${threatId}/admin-action`, data),
  
  // 위협 타임라인
  getThreatTimeline: (range = '24h') => 
    apiClient.get('/threats/timeline', { params: { range } }),
  
  // 위협 통계
  getThreatStatistics: () => 
    apiClient.get('/threats/statistics'),
  
  // 위협 목록 (기본)
  getThreats: (page = 0, size = 20) => 
    apiClient.get('/threats', { params: { page, size } }),
};

// ============================================
// Settings APIs
// ============================================
export const settingsApi = {
  // 시스템 설정
  getSystemSettings: () => apiClient.get('/settings/system'),
  updateSystemSettings: (data) => apiClient.put('/settings/system', data),
  
  // 배너 설정
  getBannerConfig: () => apiClient.get('/settings/banner-config'),
  updateBannerConfig: (data) => apiClient.put('/settings/banner-config', data),
  
  // 토폴로지 설정
  getTopologyConfig: () => apiClient.get('/settings/topology'),
  updateTopologyConfig: (data) => apiClient.put('/settings/topology', data),
};

// ============================================
// Packet APIs
// ============================================
export const packetApi = {
  getPackets: (page = 0, size = 20) => 
    apiClient.get('/packets', { params: { page, size } }),
};

// ============================================
// SSE (Server-Sent Events)
// ============================================
export const createSSEConnection = (endpoint, handlers) => {
  const eventSource = new ReconnectingEventSource(`${API_BASE_URL}/sse/${endpoint}`, {
    withCredentials: false,
    max_retry_time: 15000,
    max_retry_count: Infinity,
    min_retry_time: 1000,
  });
  
  // 연결 이벤트
  eventSource.addEventListener('connect', (event) => {
    console.log('✅ SSE 연결:', event.data);
    handlers.onConnect?.(event.data);
  });
  
  // 위협 이벤트
  eventSource.addEventListener('threat', (event) => {
    const data = JSON.parse(event.data);
    console.log('🚨 위협 이벤트:', data);
    handlers.onThreat?.(data);
  });
  
  // 통계 이벤트
  eventSource.addEventListener('stats', (event) => {
    const data = JSON.parse(event.data);
    console.log('📊 통계 업데이트:', data);
    handlers.onStats?.(data);
  });
  
  // 하트비트
  eventSource.addEventListener('heartbeat', (event) => {
    console.log('💓 하트비트:', event.data);
    handlers.onHeartbeat?.(event.data);
  });
  
  // 에러 처리
  eventSource.onerror = (error) => {
    console.error('❌ SSE 오류:', error);
    handlers.onError?.(error);
  };
  
  return eventSource;
};

export default apiClient;
