import React, { createContext, useContext, useState, useEffect } from 'react';

const BannerConfigContext = createContext();

export const useBannerConfig = () => {
  const context = useContext(BannerConfigContext);
  if (!context) {
    throw new Error('useBannerConfig must be used within BannerConfigProvider');
  }
  return context;
};

// ⭐️ API 베이스 URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// ⭐️ 통계 아이템을 위한 공통 색상
const COMMON_STAT_COLOR = '#12528bff';

// 기본 배너 아이템 설정
export const DEFAULT_BANNER_ITEMS = [
  {
    id: 'threat_score',
    type: 'gauge',
    enabled: true,
    order: 0,
    width: 180,
    config: {
      score: 0,
      title: '위협 점수'
    }
  },
  {
    id: 'anomaly_day',
    type: 'stat',
    enabled: true,
    order: 1,
    width: 130,
    config: {
      icon: 'PriorityHighOutlinedIcon',
      number: 0,
      title: '이상탐지(Day)',
      color: COMMON_STAT_COLOR
    }
  },
  {
    id: 'anomaly_week',
    type: 'stat',
    enabled: true,
    order: 2,
    width: 130,
    config: {
      icon: 'BarChartOutlinedIcon',
      number: 0,
      title: '이상탐지(Week)',
      color: COMMON_STAT_COLOR
    }
  },
  {
    id: 'new_ip',
    type: 'stat',
    enabled: true,
    order: 3,
    width: 130,
    config: {
      icon: 'WifiOutlinedIcon',
      number: 0,
      title: '새롭게 탐지된 IP',
      color: COMMON_STAT_COLOR
    }
  },
  {
    id: 'unconfirmed_terminal',
    type: 'stat',
    enabled: true,
    order: 5,
    width: 130,
    config: {
      icon: 'CheckCircleOutlineOutlinedIcon',
      number: 0,
      title: '미확인 알람',
      color: COMMON_STAT_COLOR
    }
  },
  {
    id: 'critical_alert',
    type: 'stat',
    enabled: true,
    order: 6,
    width: 130,
    config: {
      icon: 'NotificationsNoneOutlinedIcon',
      number: 0,
      title: '긴급 알람',
      color: COMMON_STAT_COLOR
    }
  },
  {
    id: 'cpu',
    type: 'usage',
    enabled: true,
    order: 8,
    width: 130,
    config: {
      title: 'CPU 사용량',
      value: 0,
      color: 'primary'
    }
  },
  {
    id: 'ram',
    type: 'usage',
    enabled: true,
    order: 9,
    width: 130,
    config: {
      title: 'RAM 사용량',
      value: 0,
      color: 'success'
    }
  },
  {
    id: 'gpu',
    type: 'usage',
    enabled: true,
    order: 10,
    width: 130,
    config: {
      title: 'GPU 사용량',
      value: 0,
      color: 'error'
    }
  }
];

export const BannerConfigProvider = ({ children }) => {
  const [bannerItems, setBannerItems] = useState(() => {
    const saved = localStorage.getItem('bannerConfig');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse banner config:', e);
        return DEFAULT_BANNER_ITEMS;
      }
    }
    return DEFAULT_BANNER_ITEMS;
  });

  // ⭐️ 백엔드에서 초기 데이터 로드
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/frontend/banner/stats`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // 백엔드 데이터로 상태 업데이트
        if (data.threat_score) {
          updateItemData('threat_score', { score: data.threat_score.score });
        }
        if (data.anomaly_day) {
          updateItemData('anomaly_day', { number: data.anomaly_day.number });
        }
        if (data.anomaly_week) {
          updateItemData('anomaly_week', { number: data.anomaly_week.number });
        }
        if (data.new_ip) {
          updateItemData('new_ip', { number: data.new_ip.number });
        }
        if (data.unconfirmed_terminal) {
          updateItemData('unconfirmed_terminal', { number: data.unconfirmed_terminal.number });
        }
        if (data.critical_alert) {
          updateItemData('critical_alert', { number: data.critical_alert.number });
        }
        if (data.cpu) {
          updateItemData('cpu', { value: data.cpu.value });
        }
        if (data.ram) {
          updateItemData('ram', { value: data.ram.value });
        }
        if (data.gpu) {
          updateItemData('gpu', { value: data.gpu.value });
        }
        
        console.log('✅ 배너 통계 데이터 로드 완료');
      } catch (error) {
        console.error('❌ 배너 통계 로드 실패:', error);
        // 실패 시 Mock 데이터 유지
      }
    };

    fetchInitialData();
  }, []);

  // ⭐️ SSE로 실시간 업데이트 구독
  useEffect(() => {
    let eventSource = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource(`${API_BASE_URL}/sse/stats`);
        
        eventSource.addEventListener('connect', (event) => {
          console.log('✅ SSE 연결 성공:', event.data);
        });

        eventSource.addEventListener('stats', (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📊 실시간 통계 업데이트:', data);
            
            // 실시간 데이터로 업데이트
            if (data.recentThreats !== undefined) {
              updateItemData('anomaly_day', { number: data.recentThreats });
            }
            if (data.totalThreats !== undefined) {
              updateItemData('anomaly_week', { number: data.totalThreats });
            }
            
            // 위협 점수 계산 (예시)
            const threatScore = Math.min(100, Math.floor(data.recentThreats * 2));
            updateItemData('threat_score', { score: threatScore });
            
          } catch (err) {
            console.error('SSE 데이터 파싱 실패:', err);
          }
        });

        eventSource.addEventListener('heartbeat', (event) => {
          console.log('💓 Heartbeat:', event.data);
        });

        eventSource.onerror = (error) => {
          console.error('❌ SSE 연결 오류:', error);
          eventSource.close();
          
          // 5초 후 재연결 시도
          setTimeout(() => {
            console.log('🔄 SSE 재연결 시도...');
            connectSSE();
          }, 5000);
        };
      } catch (error) {
        console.error('SSE 연결 실패:', error);
      }
    };

    // SSE 연결 시작
    connectSSE();

    // 컴포넌트 언마운트 시 SSE 연결 종료
    return () => {
      if (eventSource) {
        console.log('🔌 SSE 연결 종료');
        eventSource.close();
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('bannerConfig', JSON.stringify(bannerItems));
  }, [bannerItems]);

  const toggleItem = (id) => {
    setBannerItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const reorderItems = (startIndex, endIndex) => {
    const result = Array.from(bannerItems);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    
    const reordered = result.map((item, index) => ({
      ...item,
      order: index
    }));
    
    setBannerItems(reordered);
  };

  const updateItemConfig = (id, newConfig) => {
    setBannerItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, config: { ...item.config, ...newConfig } } : item
      )
    );
  };

  const updateItemWidth = (id, width) => {
    setBannerItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, width } : item
      )
    );
  };

  const getEnabledItems = () => {
    return bannerItems
      .filter(item => item.enabled)
      .sort((a, b) => a.order - b.order);
  };

  const resetConfig = () => {
    setBannerItems(DEFAULT_BANNER_ITEMS);
  };

  const updateItemData = (id, data) => {
    setBannerItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            config: {
              ...item.config,
              ...data
            }
          };
        }
        return item;
      })
    );
  };

  const value = {
    bannerItems,
    toggleItem,
    reorderItems,
    updateItemConfig,
    updateItemWidth,
    getEnabledItems,
    resetConfig,
    updateItemData,
  };

  return (
    <BannerConfigContext.Provider value={value}>
      {children}
    </BannerConfigContext.Provider>
  );
};