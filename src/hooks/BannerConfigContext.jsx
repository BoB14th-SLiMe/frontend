import React, { createContext, useContext, useState, useEffect } from 'react';
import { createSSEConnection } from '../service/apiService';

const BannerConfigContext = createContext();

export const useBannerConfig = () => {
  const context = useContext(BannerConfigContext);
  if (!context) {
    throw new Error('useBannerConfig must be used within BannerConfigProvider');
  }
  return context;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const COMMON_STAT_COLOR = '#12528bff';

export const DEFAULT_BANNER_ITEMS = [
  {
    id: 'threat_score',
    type: 'gauge',
    enabled: true,
    order: 0,
    width: 180,
    config: { score: 0, title: '위협 점수' }
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
    config: { title: 'CPU 사용량', value: 0, color: 'primary' }
  },
  {
    id: 'ram',
    type: 'usage',
    enabled: true,
    order: 9,
    width: 130,
    config: { title: 'RAM 사용량', value: 0, color: 'success' }
  },
  {
    id: 'gpu',
    type: 'usage',
    enabled: true,
    order: 10,
    width: 130,
    config: { title: 'GPU 사용량', value: 0, color: 'error' }
  }
];

export const BannerConfigProvider = ({ children }) => {
  const [bannerItems, setBannerItems] = useState(() => {
    const saved = localStorage.getItem('bannerConfig');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // 배열인지 확인
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        } else {
          console.warn('Invalid banner config format, using default');
          localStorage.removeItem('bannerConfig');
          return DEFAULT_BANNER_ITEMS;
        }
      } catch (e) {
        console.error('Failed to parse banner config:', e);
        localStorage.removeItem('bannerConfig');
        return DEFAULT_BANNER_ITEMS;
      }
    }
    return DEFAULT_BANNER_ITEMS;
  });

  const [sseConnected, setSseConnected] = useState(false);

  // 초기 데이터 로드 및 주기적 갱신
  useEffect(() => {
    const fetchBannerData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/frontend/banner/stats`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // 데이터 업데이트
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

        console.log('✅ 배너 통계 데이터 로드 완료', { threat_score: data.threat_score?.score });
      } catch (error) {
        console.error('❌ 배너 통계 로드 실패:', error);
      }
    };

    // 즉시 실행
    fetchBannerData();

    // 5초마다 갱신 (SSE와 별도로 주기적 갱신)
    const interval = setInterval(fetchBannerData, 5000);

    return () => clearInterval(interval);
  }, []);

  // SSE 구독 (개선됨)
  useEffect(() => {
    console.log('🔗 배너 SSE 연결 시작...');
    
    const sseConnection = createSSEConnection('subscribe', {
      onConnect: (data) => {
        console.log('✅ 배너 SSE 연결 성공:', data);
        setSseConnected(true);
      },
      
      onStats: (data) => {
        console.log('📊 배너 통계 업데이트:', data);

        // 실시간 데이터 업데이트
        if (data.recentThreats !== undefined) {
          updateItemData('anomaly_day', { number: data.recentThreats });
        }
        if (data.totalThreats !== undefined) {
          updateItemData('anomaly_week', { number: data.totalThreats });
        }
        if (data.unconfirmedAlerts !== undefined) {
          updateItemData('unconfirmed_terminal', { number: data.unconfirmedAlerts });
        }
        if (data.criticalAlerts !== undefined) {
          updateItemData('critical_alert', { number: data.criticalAlerts });
        }

        // 위협 점수는 SSE에서 직접 받거나 API에서 받은 값 유지 (SSE에서 재계산하지 않음)
        if (data.threatScore !== undefined) {
          updateItemData('threat_score', { score: data.threatScore });
        }
      },
      
      onError: (error) => {
        console.error('❌ 배너 SSE 오류:', error);
        setSseConnected(false);
      },
    });

    return () => {
      console.log('🔌 배너 SSE 연결 종료');
      sseConnection?.close();
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
    // 배열인지 확인
    if (!Array.isArray(bannerItems)) {
      console.error('bannerItems is not an array:', bannerItems);
      return [];
    }
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
    sseConnected,
  };

  return (
    <BannerConfigContext.Provider value={value}>
      {children}
    </BannerConfigContext.Provider>
  );
};