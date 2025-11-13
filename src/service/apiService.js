import axios from 'axios';

// API URL 결정 (동적)
const getApiBaseUrl = () => {
  // 1. 환경 변수 우선
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // 2. 현재 호스트의 IP/도메인 사용 (동적)
  // 브라우저가 접속한 주소를 그대로 사용
  const protocol = window.location.protocol; // http: or https:
  const hostname = window.location.hostname; // 100.126.141.58 or localhost
  
  return `${protocol}//${hostname}:8080/api`;
};

const API_BASE_URL = getApiBaseUrl();
console.log('🌐 API Base URL:', API_BASE_URL);

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
  getBannerStats: () => apiClient.get('/frontend/banner/stats'),
  getDashboardStats: () => apiClient.get('/dashboard/stats'),
  getProtocolDistribution: (period = '1h') => 
    apiClient.get('/dashboard/protocol-distribution', { params: { period } }),
  getTrafficData: (range = '7d') => 
    apiClient.get('/dashboard/traffic', { params: { range } }),
  getTopology: () => apiClient.get('/topology'),
  getAlarms: (status = 'all', limit = 10) => 
    apiClient.get('/alarms', { params: { status, limit } }),
};

// ============================================
// Threat APIs
// ============================================
export const threatApi = {
  filterThreats: (filters) => 
    apiClient.get('/threats/filter', { params: filters }),
  getThreatDetail: (threatId) => 
    apiClient.get(`/threats/${threatId}/detail`),
  saveAdminAction: (threatId, data) => 
    apiClient.post(`/threats/${threatId}/admin-action`, data),
  getThreatTimeline: (range = '24h') => 
    apiClient.get('/threats/timeline', { params: { range } }),
  getThreatStatistics: () => 
    apiClient.get('/threats/statistics'),
  getThreats: (page = 0, size = 20) => 
    apiClient.get('/threats', { params: { page, size } }),
};

// ============================================
// Settings APIs
// ============================================
export const settingsApi = {
  getSystemSettings: () => apiClient.get('/settings/system'),
  updateSystemSettings: (data) => apiClient.put('/settings/system', data),
  getBannerConfig: () => apiClient.get('/settings/banner-config'),
  updateBannerConfig: (data) => apiClient.put('/settings/banner-config', data),
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
// Traffic APIs
// ============================================
export const trafficApi = {
  getTrafficMonitoring: () =>
    apiClient.get('/traffic/monitoring'),
  getHourlyTraffic: () =>
    apiClient.get('/traffic/hourly'),
  getAverageTraffic: () =>
    apiClient.get('/traffic/average'),
  getNetworkStats: () =>
    apiClient.get('/traffic/network-stats'),
};

// ============================================
// XAI Analysis APIs
// ============================================
export const xaiApi = {
  getAnalyses: (page = 0, size = 10) =>
    apiClient.get('/xai/analyses', { params: { page, size } }),
  getRecentAnalyses: () =>
    apiClient.get('/xai/analyses/recent'),
};

// ============================================
// System Metrics APIs
// ============================================
export const metricsApi = {
  getLatestMetrics: () =>
    apiClient.get('/metrics/system/latest'),
  getAverageMetrics: (minutes = 60) =>
    apiClient.get('/metrics/system/average', { params: { minutes } }),
};

// ============================================
// Protocol APIs
// ============================================
export const protocolApi = {
  getHourlyProtocol: () =>
    apiClient.get('/protocols/hourly'),
  getWeeklyProtocol: () =>
    apiClient.get('/protocols/weekly'),
};

// ============================================
// Asset APIs
// ============================================
export const assetApi = {
  getAllAssets: () =>
    apiClient.get('/assets'),
  getAssetsByType: (assetType) =>
    apiClient.get(`/assets/type/${assetType}`),
  getActiveDevices: () =>
    apiClient.get('/assets/active'),
};

// ============================================
// SSE (Server-Sent Events) - 개선됨
// ============================================
export const createSSEConnection = (endpoint, handlers = {}) => {
  // SSE URL 생성 (axios baseURL 제거)
  const sseUrl = `${API_BASE_URL.replace('/api', '')}/api/sse/${endpoint}`;
  console.log('🔗 SSE 연결 시도:', sseUrl);
  
  let eventSource = null;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 10;
  const reconnectDelay = 3000;
  
  const connect = () => {
    try {
      eventSource = new EventSource(sseUrl);
      
      // 연결 성공
      eventSource.onopen = () => {
        console.log('✅ SSE 연결 성공:', sseUrl);
        reconnectAttempts = 0;
        handlers.onConnect?.({ connected: true });
      };
      
      // 연결 이벤트
      eventSource.addEventListener('connect', (event) => {
        console.log('✅ SSE connect 이벤트:', event.data);
        try {
          const data = JSON.parse(event.data);
          handlers.onConnect?.(data);
        } catch (e) {
          handlers.onConnect?.(event.data);
        }
      });
      
      // 위협 이벤트
      eventSource.addEventListener('threat', (event) => {
        console.log('🚨 위협 이벤트:', event.data);
        try {
          const data = JSON.parse(event.data);
          handlers.onThreat?.(data);
        } catch (e) {
          console.error('위협 데이터 파싱 실패:', e);
        }
      });
      
      // 통계 이벤트
      eventSource.addEventListener('stats', (event) => {
        console.log('📊 통계 업데이트:', event.data);
        try {
          const data = JSON.parse(event.data);
          handlers.onStats?.(data);
        } catch (e) {
          console.error('통계 데이터 파싱 실패:', e);
        }
      });
      
      // 하트비트
      eventSource.addEventListener('heartbeat', (event) => {
        console.log('💓 하트비트:', event.data);
        handlers.onHeartbeat?.(event.data);
      });
      
      // 에러 처리
      eventSource.onerror = (error) => {
        console.error('❌ SSE 오류:', error);
        
        // 연결 종료
        if (eventSource) {
          eventSource.close();
        }
        
        // 재연결 시도
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          console.log(`🔄 SSE 재연결 시도 ${reconnectAttempts}/${maxReconnectAttempts}...`);
          setTimeout(connect, reconnectDelay);
        } else {
          console.error('❌ SSE 재연결 실패: 최대 시도 횟수 초과');
          handlers.onError?.({ 
            message: 'SSE 연결 실패',
            attempts: reconnectAttempts 
          });
        }
      };
      
    } catch (error) {
      console.error('❌ SSE 연결 생성 실패:', error);
      handlers.onError?.(error);
    }
  };
  
  // 초기 연결
  connect();
  
  // 연결 종료 함수 반환
  return {
    close: () => {
      console.log('🔌 SSE 연결 종료');
      if (eventSource) {
        eventSource.close();
      }
    },
    reconnect: () => {
      console.log('🔄 SSE 수동 재연결');
      if (eventSource) {
        eventSource.close();
      }
      reconnectAttempts = 0;
      connect();
    }
  };
};

export default apiClient;