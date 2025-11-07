import React, { createContext, useContext, useState, useEffect } from 'react';

const BannerConfigContext = createContext();

export const useBannerConfig = () => {
  const context = useContext(BannerConfigContext);
  if (!context) {
    throw new Error('useBannerConfig must be used within BannerConfigProvider');
  }
  return context;
};

// ⭐️ 1. 통계(stat) 아이템을 위한 공통 색상 변수
// 이 값만 수정하면 모든 stat 아이템의 색상이 변경됩니다.
const COMMON_STAT_COLOR = '#12528bff'; // MUI 기본 파란색 (원하는 색상으로 변경 가능)


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
      icon: 'PriorityHighOutlinedIcon', // ⭐️ 아이콘 이름도 이미지에 맞게 수정
      number: 5,
      title: '이상탐지(Day)',
      color: COMMON_STAT_COLOR // ⭐️ 공통 색상 적용
    }
  },
  {
    id: 'anomaly_week',
    type: 'stat',
    enabled: true,
    order: 2,
    width: 130,
    config: {
      icon: 'BarChartOutlinedIcon', // ⭐️ 아이콘 이름도 이미지에 맞게 수정
      number: 7,
      title: '이상탐지(Week)',
      color: COMMON_STAT_COLOR // ⭐️ 공통 색상 적용
    }
  },
  {
    id: 'new_ip',
    type: 'stat',
    enabled: true,
    order: 3,
    width: 130,
    config: {
      icon: 'WifiOutlinedIcon', // ⭐️ 아이콘 이름도 이미지에 맞게 수정
      number: 0,
      title: '새롭게 탐지된 IP',
      color: COMMON_STAT_COLOR // ⭐️ 공통 색상 적용
    }
  },
    {
    id: 'response_time', // ⭐️ 이미지 순서에 맞게 조정 (평균 지연 시간)
    type: 'stat',
    enabled: true,
    order: 4,
    width: 130,
    config: {
      icon: 'NotificationsNoneOutlinedIcon', // ⭐️ 아이콘 이름도 이미지에 맞게 수정
      number: 3,
      title: 'MTTR(ms)', // ⭐️ 텍스트 수정
      color: COMMON_STAT_COLOR // ⭐️ 공통 색상 적용
    }
  },
  {
    id: 'unconfirmed_terminal',
    type: 'stat',
    enabled: true,
    order: 5,
    width: 130,
    config: {
      icon: 'CheckCircleOutlineOutlinedIcon', // ⭐️ 아이콘 이름도 이미지에 맞게 수정
      number: 1,
      title: '미확인 알람', // ⭐️ 텍스트 수정
      color: COMMON_STAT_COLOR // ⭐️ 공통 색상 적용
    }
  },
  {
    id: 'critical_alert',
    type: 'stat',
    enabled: true,
    order: 6,
    width: 130,
    config: {
      icon: 'NotificationsNoneOutlinedIcon', // ⭐️ 아이콘 이름도 이미지에 맞게 수정
      number: 3,
      title: '긴급 알람',
      color: COMMON_STAT_COLOR // ⭐️ 공통 색상 적용
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
      color: 'primary' // ⭐️ 'usage' 타입은 그대로 둠
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
      color: 'success' // ⭐️ 'usage' 타입은 그대로 둠
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
      color: 'error' // ⭐️ 'usage' 타입은 그대로 둠
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