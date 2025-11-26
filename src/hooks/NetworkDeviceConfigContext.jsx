import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { assetApi, trafficApi, threatApi } from '../service/apiService';

const NetworkDeviceConfigContext = createContext();

export const useNetworkDeviceConfig = () => {
  const context = useContext(NetworkDeviceConfigContext);
  if (!context) {
    throw new Error('useNetworkDeviceConfig must be used within NetworkDeviceConfigProvider');
  }
  return context;
};

// 위협 레벨에 따른 색상 결정
const getColorByThreatLevel = (threatLevel) => {
  if (!threatLevel) return '#42a5f5'; // 파랑 (정상)

  const level = threatLevel.toLowerCase();
  if (level === 'warning') {
    return '#ef5350'; // 빨강 (긴급)
  } else if (level === 'attention') {
    return '#ff9800'; // 주황 (경고)
  }
  return '#42a5f5'; // 파랑 (정상)
};

// PPS 값을 읽기 쉽게 포맷팅
const formatPPS = (pps) => {
  if (!pps || pps === 0) return '0 pps';

  if (pps >= 1000000) {
    return `${(pps / 1000000).toFixed(2)}M pps`;
  } else if (pps >= 1000) {
    return `${(pps / 1000).toFixed(2)}K pps`;
  } else {
    return `${pps.toFixed(2)} pps`;
  }
};

export const NetworkDeviceConfigProvider = ({ children }) => {
  const [hmiDevices, setHmiDevices] = useState([]);
  const [plcDevices, setPlcDevices] = useState([]);
  const [networkStats, setNetworkStats] = useState({ pps: 0, connections: 0 });
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // 이전 데이터를 저장하여 변경 여부 확인
  const prevDataRef = useRef({
    hmiDevices: [],
    plcDevices: [],
    networkStats: { pps: 0, connections: 0 }
  });

  // API에서 데이터 가져오기 - useCallback으로 메모이제이션
  const fetchDeviceData = useCallback(async () => {
    try {
      console.log('🔄 NetworkDeviceConfig: 데이터 가져오기 시작', { isInitialLoad });

      // 초기 로딩일 때만 loading을 true로 설정
      if (isInitialLoad) {
        setLoading(true);
      }

      // 신규 위협 데이터 조회 (IP별 최고 위협 레벨)
      const threatResponse = await threatApi.getThreats({ page: 0, size: 100 });
      const threats = Array.isArray(threatResponse.data) ? threatResponse.data : [];

      // IP별 최고 위협 레벨 맵 생성
      const threatLevelByIp = {};
      threats.forEach(threat => {
        if (threat.status?.toLowerCase() === 'new') {
          const srcIp = threat.src_ip || threat.sourceIp;
          const dstIp = threat.dst_ip || threat.destinationIp;
          const level = threat.threat_level || threat.threatLevel;

          [srcIp, dstIp].forEach(ip => {
            if (ip && level) {
              // warning이 attention보다 우선순위 높음
              if (!threatLevelByIp[ip] || level === 'warning') {
                threatLevelByIp[ip] = level;
              }
            }
          });
        }
      });

      console.log('🚨 IP별 위협 레벨:', threatLevelByIp);

      // HMI 장비 조회
      const hmiResponse = await assetApi.getAssetsByType('hmi');
      const hmiData = hmiResponse.data
        .filter(asset => asset.isVisible)
        .map(asset => ({
          id: asset.assetId,
          name: asset.name,
          ip: asset.ipAddress,
          status: asset.status,
          color: getColorByThreatLevel(threatLevelByIp[asset.ipAddress]),
          icon: 'ComputerIcon'
        }));
      console.log('✅ HMI 장비 조회 완료:', hmiData.length, '개');

      // HMI 데이터가 변경되었을 때만 업데이트 (초기 로드 시에는 무조건 업데이트)
      if (isInitialLoad || JSON.stringify(hmiData) !== JSON.stringify(prevDataRef.current.hmiDevices)) {
        setHmiDevices(hmiData);
        prevDataRef.current.hmiDevices = hmiData;
      }

      // PLC 장비 조회
      const plcResponse = await assetApi.getAssetsByType('plc');
      const plcData = plcResponse.data
        .filter(asset => asset.isVisible)
        .map(asset => ({
          id: asset.assetId,
          name: asset.name,
          ip: asset.ipAddress,
          status: asset.status,
          color: getColorByThreatLevel(threatLevelByIp[asset.ipAddress]),
          icon: 'DataObjectIcon'
        }));
      console.log('✅ PLC 장비 조회 완료:', plcData.length, '개');

      // PLC 데이터가 변경되었을 때만 업데이트 (초기 로드 시에는 무조건 업데이트)
      if (isInitialLoad || JSON.stringify(plcData) !== JSON.stringify(prevDataRef.current.plcDevices)) {
        setPlcDevices(plcData);
        prevDataRef.current.plcDevices = plcData;
      }

      // 네트워크 통계 조회
      const statsResponse = await trafficApi.getNetworkStats();
      const stats = {
        pps: statsResponse.data.packetsPerSecond || statsResponse.data.pps || 0,
        connections: statsResponse.data.connections || 0
      };
      console.log('✅ 네트워크 통계 조회 완료:', stats);

      // 네트워크 통계가 변경되었을 때만 업데이트 (초기 로드 시에는 무조건 업데이트)
      if (isInitialLoad ||
          stats.pps !== prevDataRef.current.networkStats.pps ||
          stats.connections !== prevDataRef.current.networkStats.connections) {
        setNetworkStats(stats);
        prevDataRef.current.networkStats = stats;
      }

    } catch (error) {
      console.error('❌ 네트워크 장치 데이터 로드 실패:', error);
      // 에러 발생 시에도 빈 데이터로 설정
      setHmiDevices([]);
      setPlcDevices([]);
      setNetworkStats({ pps: 0, connections: 0 });
    } finally {
      // 초기 로딩 완료 후에는 loading을 false로 유지
      if (isInitialLoad) {
        console.log('✅ 초기 로딩 완료');
        setLoading(false);
        setIsInitialLoad(false);
      }
    }
  }, [isInitialLoad]);

  // 초기 로드 및 주기적 갱신
  useEffect(() => {
    fetchDeviceData();

    // 1초마다 갱신 (네트워크 통계는 실시간으로 업데이트)
    const interval = setInterval(fetchDeviceData, 1000);

    return () => clearInterval(interval);
  }, [fetchDeviceData]);

  // 스위치 정보 (SCADA 서버 정보) - useMemo로 메모이제이션
  const switchInfo = useMemo(() => ({
    name: 'SWITCH',
    traffic: formatPPS(networkStats.pps),
    connections: networkStats.connections,
    icon: 'CompareArrowsIcon',
    color: '#42a5f5'
  }), [networkStats.pps, networkStats.connections]);

  // HMI (제어 시스템 - SCADA) - useMemo로 메모이제이션
  const control = useMemo(() =>
    hmiDevices.length > 0 ? hmiDevices[0] : {
      name: 'SCADA',
      ip: '데이터 없음',
      icon: 'ComputerIcon',
      color: '#9e9e9e'
    }
  , [hmiDevices]);

  // Context value - useMemo로 메모이제이션
  const value = useMemo(() => ({
    hmiDevices,
    plcDevices,
    control,
    switchInfo,
    networkStats,
    loading,
    refreshData: fetchDeviceData,
  }), [hmiDevices, plcDevices, control, switchInfo, networkStats, loading, fetchDeviceData]);

  return (
    <NetworkDeviceConfigContext.Provider value={value}>
      {children}
    </NetworkDeviceConfigContext.Provider>
  );
};
