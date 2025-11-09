import { useEffect, useRef, useState } from 'react';
import { createSSEConnection } from '../services/apiService';

/**
 * SSE를 통한 실시간 데이터 수신 훅
 */
export const useRealTimeData = (handlers) => {
  const eventSourceRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // SSE 연결
    eventSourceRef.current = createSSEConnection('subscribe', {
      onConnect: (data) => {
        console.log('✅ SSE 연결 성공:', data);
        setIsConnected(true);
        setError(null);
        handlers?.onConnect?.(data);
      },

      onThreat: (threat) => {
        console.log('🚨 새로운 위협:', threat);
        handlers?.onThreat?.(threat);
      },

      onStats: (stats) => {
        console.log('📊 통계 업데이트:', stats);
        handlers?.onStats?.(stats);
      },

      onHeartbeat: (data) => {
        console.log('💓 하트비트:', data);
        handlers?.onHeartbeat?.(data);
      },

      onError: (err) => {
        console.error('❌ SSE 오류:', err);
        setIsConnected(false);
        setError(err);
        handlers?.onError?.(err);
      },
    });

    // 클린업: 컴포넌트 언마운트 시 연결 종료
    return () => {
      if (eventSourceRef.current) {
        console.log('🔌 SSE 연결 종료');
        eventSourceRef.current.close();
      }
    };
  }, []);

  return { isConnected, error };
};

export default useRealTimeData;