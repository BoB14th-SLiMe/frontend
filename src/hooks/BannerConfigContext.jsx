import React, { createContext, useContext, useState, useEffect } from 'react';

const BannerConfigContext = createContext();

export const useBannerConfig = () => {
  const context = useContext(BannerConfigContext);
  if (!context) {
    throw new Error('useBannerConfig must be used within BannerConfigProvider');
  }
  return context;
};

// 기본 배너 아이템 설정
export const DEFAULT_BANNER_ITEMS = [
  {
    id: 'threat_score',
    type: 'gauge',
    enabled: true,
    order: 0,
    width: 180,
    config: {
      score: 24,
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
      icon: 'SearchIcon',
      number: 5,
      title: '이상탐지 (건) Day',
      color: '#1E88E5'
    }
  },
  {
    id: 'anomaly_week',
    type: 'stat',
    enabled: true,
    order: 2,
    width: 130,
    config: {
      icon: 'CalendarTodayIcon',
      number: 7,
      title: '이상탐지 (건) Week',
      color: '#4CAF50'
    }
  },
  {
    id: 'new_ip',
    type: 'stat',
    enabled: true,
    order: 3,
    width: 130,
    config: {
      icon: 'PublicIcon',
      number: 0,
      title: '새롭게 탐지된 IP (개수)',
      color: '#FF9800'
    }
  },
  {
    id: 'unconfirmed_terminal',
    type: 'stat',
    enabled: true,
    order: 4,
    width: 130,
    config: {
      icon: 'LockOpenIcon',
      number: 1,
      title: '미확인 단말 (건)',
      color: '#E53935'
    }
  },
  {
    id: 'critical_alert',
    type: 'stat',
    enabled: true,
    order: 5,
    width: 130,
    config: {
      icon: 'AlarmOnIcon',
      number: 3,
      title: '긴급 알람 (건)',
      color: '#FF7043'
    }
  },
  {
    id: 'response_time',
    type: 'stat',
    enabled: false,
    order: 6,
    width: 130,
    config: {
      icon: 'AccessTimeIcon',
      number: 12,
      title: '평균 위협 대응 시간 (분)',
      color: '#9C27B0'
    }
  },
  {
    id: 'external_connection',
    type: 'stat',
    enabled: false,
    order: 7,
    width: 130,
    config: {
      icon: 'LinkIcon',
      number: 23,
      title: '외부 연결 시도 건수',
      color: '#FF5722'
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
      value: 25,
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
      value: 67,
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
      value: 33,
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
