import React from 'react';

// Провайдер производительности
const PerformanceContext = React.createContext<{
  startMeasure: (name: string) => void;
  endMeasure: (name: string) => number;
  measureComponent: <T extends Record<string, unknown>>(
    Component: React.ComponentType<T>
  ) => React.ComponentType<T>;
}>({
  startMeasure: () => {},
  endMeasure: () => 0,
  measureComponent: (Component) => Component,
});

// Хук для измерения производительности
export const usePerformance = () => {
  const context = React.useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within PerformanceProvider');
  }
  return context;
};

// Хук для измерения времени выполнения функций
export const useMeasure = () => {
  const { startMeasure, endMeasure } = usePerformance();

  return React.useCallback(
    async <T,>(name: string, fn: () => Promise<T> | T): Promise<T> => {
      startMeasure(name);
      try {
        const result = await fn();
        return result;
      } finally {
        endMeasure(name);
      }
    },
    [startMeasure, endMeasure]
  );
};

// Хук для отслеживания ререндеров компонента
export const useRenderTracker = (componentName: string) => {
  const renderCount = React.useRef(0);
  const { startMeasure, endMeasure } = usePerformance();

  React.useEffect(() => {
    renderCount.current += 1;
    const measureName = `${componentName}-render-${renderCount.current}`;
    startMeasure(measureName);
    
    return () => {
      endMeasure(measureName);
    };
  });

  React.useEffect(() => {
    if (import.meta.env.DEV && renderCount.current > 10) {
      console.warn(`[Render Tracker] ${componentName} has rendered ${renderCount.current} times`);
    }
  });

  return renderCount.current;
};

export default PerformanceContext;
