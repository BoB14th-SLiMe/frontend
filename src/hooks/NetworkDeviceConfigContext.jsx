import React, { createContext, useContext, useState, useEffect } from 'react';
import { assetApi, trafficApi } from '../service/apiService';

const NetworkDeviceConfigContext = createContext();

export const useNetworkDeviceConfig = () => {
  const context = useContext(NetworkDeviceConfigContext);
  if (!context) {
    throw new Error('useNetworkDeviceConfig must be used within NetworkDeviceConfigProvider');
  }
  return context;
};

// 상태에 따른 색상 결정
const getColorByStatus = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'online':
      return '#66bb6a'; // 초록
    case 'warning':
      return '#ff9800'; // 주황
    case 'error':
    case 'critical':
      return '#ef5350'; // 빨강
    default:
      return '#42a5f5'; // 파랑
  }
};

export const NetworkDeviceConfigProvider = ({ children }) => {
  const [hmiDevices, setHmiDevices] = useState([]);
  const [plcDevices, setPlcDevices] = useState([]);
  const [networkStats, setNetworkStats] = useState({ pps: 0, connections: 0 });
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // API에서 데이터 가져오기
  const fetchDeviceData = async () => {
    try {
      // 초기 로딩일 때만 loading을 true로 설정
      if (isInitialLoad) {
        setLoading(true);
      }

      // HMI 장비 조회
      const hmiResponse = await assetApi.getAssetsByType('hmi');
      const hmiData = hmiResponse.data
        .filter(asset => asset.isVisible)
        .map(asset => ({
          id: asset.assetId,
          name: asset.name,
          ip: asset.ipAddress,
          status: asset.status,
          color: getColorByStatus(asset.status),
          icon: 'ComputerIcon'
        }));
      setHmiDevices(hmiData);

      // PLC 장비 조회
      const plcResponse = await assetApi.getAssetsByType('plc');
      const plcData = plcResponse.data
        .filter(asset => asset.isVisible)
        .map(asset => ({
          id: asset.assetId,
          name: asset.name,
          ip: asset.ipAddress,
          status: asset.status,
          color: getColorByStatus(asset.status),
          icon: 'DataObjectIcon'
        }));
      setPlcDevices(plcData);

      // 네트워크 통계 조회
      const statsResponse = await trafficApi.getNetworkStats();
      setNetworkStats({
        pps: statsResponse.data.pps || 0,
        connections: statsResponse.data.connections || 0
      });

    } catch (error) {
      console.error('네트워크 장치 데이터 로드 실패:', error);
    } finally {
      // 초기 로딩 완료 후에는 loading을 false로 유지
      if (isInitialLoad) {
        setLoading(false);
        setIsInitialLoad(false);
      }
    }
  };

  // 초기 로드 및 주기적 갱신
  useEffect(() => {
    fetchDeviceData();

    // 30초마다 갱신
    const interval = setInterval(fetchDeviceData, 30000);

    return () => clearInterval(interval);
  }, []);

  // 스위치 정보 (SCADA 서버 정보)
  const switchInfo = {
    name: 'SWITCH',
    traffic: `${networkStats.pps.toFixed(2)} pps`,
    connections: networkStats.connections,
    icon: 'CompareArrowsIcon',
    color: '#42a5f5'
  };

  // HMI (제어 시스템 - SCADA)
  const control = hmiDevices.length > 0 ? hmiDevices[0] : {
    name: 'SCADA',
    ip: '데이터 없음',
    icon: 'ComputerIcon',
    color: '#9e9e9e'
  };

  const value = {
    hmiDevices,
    plcDevices,
    control,
    switchInfo,
    networkStats,
    loading,
    refreshData: fetchDeviceData,
  };

  return (
    <NetworkDeviceConfigContext.Provider value={value}>
      {children}
    </NetworkDeviceConfigContext.Provider>
  );
};
