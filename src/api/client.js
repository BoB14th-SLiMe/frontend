const API_BASE_URL = 'http://ot-backend:8080/api';

export const apiClient = {
  // 대시보드 통계
  getDashboardStats: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
    return response.json();
  },

  // 위협 목록
  getThreats: async (page = 0, size = 20) => {
    const response = await fetch(`${API_BASE_URL}/threats?page=${page}&size=${size}`);
    return response.json();
  },

  // 패킷 목록
  getPackets: async (page = 0, size = 20) => {
    const response = await fetch(`${API_BASE_URL}/packets?page=${page}&size=${size}`);
    return response.json();
  },

  // SSE 구독
  subscribeSSE: (onMessage) => {
    const eventSource = new EventSource(`${API_BASE_URL}/sse/subscribe`);
    
    eventSource.addEventListener('threat', (event) => {
      const data = JSON.parse(event.data);
      onMessage('threat', data);
    });
    
    eventSource.addEventListener('stats', (event) => {
      const data = JSON.parse(event.data);
      onMessage('stats', data);
    });
    
    return eventSource;
  }
};