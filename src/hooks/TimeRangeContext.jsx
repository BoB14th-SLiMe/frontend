import React, { createContext, useContext, useState } from 'react';

const TimeRangeContext = createContext();

export const TimeRangeProvider = ({ children }) => {
  const [trafficTimeRange, setTrafficTimeRange] = useState('24h');
  const [threatTimeRange, setThreatTimeRange] = useState('24h');

  return (
    <TimeRangeContext.Provider
      value={{
        trafficTimeRange,
        setTrafficTimeRange,
        threatTimeRange,
        setThreatTimeRange,
      }}
    >
      {children}
    </TimeRangeContext.Provider>
  );
};

export const useTimeRange = () => {
  const context = useContext(TimeRangeContext);
  if (!context) {
    throw new Error('useTimeRange must be used within TimeRangeProvider');
  }
  return context;
};
