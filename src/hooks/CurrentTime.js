// src/hooks/useCurrentTime.js

import { useState, useEffect } from 'react';

/**
 * 현재 시간을 1초마다 업데이트하는 커스텀 훅
 * @returns {Date} 현재 시간 (Date 객체)
 */
const useCurrentTime = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000); // 1초마다 시간 업데이트

    return () => clearInterval(timer); // 컴포넌트 언마운트 시 타이머 정리
  }, []);

  return time;
};

export default useCurrentTime;