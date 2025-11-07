import React, { createContext, useContext, useState, useEffect } from 'react';

const NetworkDeviceConfigContext = createContext();

export const useNetworkDeviceConfig = () => {
  const context = useContext(NetworkDeviceConfigContext);
  if (!context) {
    throw new Error('useNetworkDeviceConfig must be used within NetworkDeviceConfigProvider');
  }
  return context;
};

export const DEFAULT_DEVICE_CONFIG = {
  control: { name: 'SCADA', ip: '192.168.0.2', icon: 'ComputerIcon', color: '#42a5f5' },
  switch: { name: 'SWITCH', traffic: '34.9 MB/s', connections: 11, icon: 'CompareArrowsIcon', color: '#42a5f5' },
  devices: [
    { id: 'plc101', name: 'PLC-101', ip: '192.168.0.101', color: '#ef5350' },
    { id: 'plc102', name: 'PLC-102', ip: '192.168.0.102', color: '#ef5350' },
    { id: 'plc103', name: 'PLC-103', ip: '192.168.0.103', color: '#42a5f5' },
    { id: 'plc104', name: 'PLC-104', ip: '192.168.0.104', color: '#42a5f5' },
    { id: 'plc105', name: 'PLC-105', ip: '192.168.0.105', color: '#42a5f5' },
    { id: 'plc106', name: 'PLC-106', ip: '192.168.0.106', color: '#42a5f5' },
  ],
  discoveredDevices: [
    { id: 'plc107', name: 'PLC-107', ip: '192.168.0.107', color: '#66bb6a' },
    { id: 'plc108', name: 'PLC-108', ip: '192.168.0.108', color: '#ff9800' },
    { id: 'plc109', name: 'PLC-109', ip: '192.168.0.109', color: '#ab47bc' },
  ]
};

export const NetworkDeviceConfigProvider = ({ children }) => {
  const [deviceConfig, setDeviceConfig] = useState(() => {
    const saved = localStorage.getItem('networkDeviceConfig');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse network device config:', e);
        return DEFAULT_DEVICE_CONFIG;
      }
    }
    return DEFAULT_DEVICE_CONFIG;
  });

  useEffect(() => {
    localStorage.setItem('networkDeviceConfig', JSON.stringify(deviceConfig));
  }, [deviceConfig]);

  const updateDeviceConfig = (newConfig) => {
    setDeviceConfig(newConfig);
  };

  const addDevice = (device) => {
    setDeviceConfig(prev => ({
      ...prev,
      devices: [...prev.devices, device],
      discoveredDevices: (prev.discoveredDevices || []).filter(d => d.id !== device.id)
    }));
  };

  const deleteDevice = (id) => {
    const deviceToRemove = deviceConfig.devices.find(d => d.id === id);
    setDeviceConfig(prev => ({
      ...prev,
      devices: prev.devices.filter(d => d.id !== id),
      discoveredDevices: deviceToRemove ? [...(prev.discoveredDevices || []), deviceToRemove] : prev.discoveredDevices
    }));
  };

  const addFromDiscovered = (device) => {
    setDeviceConfig(prev => ({
      ...prev,
      devices: [...prev.devices, device],
      discoveredDevices: (prev.discoveredDevices || []).filter(d => d.id !== device.id)
    }));
  };

  const updateDeviceColor = (id, color) => {
    setDeviceConfig(prev => ({
      ...prev,
      devices: prev.devices.map(d => 
        d.id === id ? { ...d, color } : d
      )
    }));
  };

  const reorderDevices = (devices) => {
    setDeviceConfig(prev => ({
      ...prev,
      devices
    }));
  };

  const resetConfig = () => {
    setDeviceConfig(DEFAULT_DEVICE_CONFIG);
  };

  const value = {
    deviceConfig,
    updateDeviceConfig,
    addDevice,
    deleteDevice,
    updateDeviceColor,
    reorderDevices,
    resetConfig,
    addFromDiscovered,
  };

  return (
    <NetworkDeviceConfigContext.Provider value={value}>
      {children}
    </NetworkDeviceConfigContext.Provider>
  );
};
