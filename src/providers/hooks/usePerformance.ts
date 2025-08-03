import React, { createContext, useContext, useCallback, useRef } from 'react';

export interface PerformanceMetrics {
  startMeasure: (name: string) => void;
  endMeasure: (name: string) => number;
  measureComponent: <T extends Record<string, unknown>>(Component: React.ComponentType<T>) => React.ComponentType<T>;
}

const PerformanceContext = createContext<PerformanceMetrics | null>(null);

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within PerformanceProvider');
  }
  return context;
};

export const useMeasure = () => {
  const startTime = useRef<number>(0);
  
  const start = useCallback(() => {
    startTime.current = performance.now();
  }, []);
  
  const end = useCallback(() => {
    return performance.now() - startTime.current;
  }, []);
  
  return { start, end };
};

export const useRenderTracker = () => {
  const renderCount = useRef(0);
  
  const track = useCallback(() => {
    renderCount.current += 1;
    return renderCount.current;
  }, []);
  
  return track;
};

export default PerformanceContext;