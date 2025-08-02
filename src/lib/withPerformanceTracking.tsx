import React, { useEffect, useRef } from 'react';

// HOC для мониторинга производительности компонентов
export function withPerformanceTracking<T extends object>(
  Component: React.ComponentType<T>,
  componentName: string
) {
  return React.memo((props: T) => {
    const renderStartRef = useRef<number>(0);
    
    useEffect(() => {
      renderStartRef.current = performance.now();
      
      return () => {
        if (renderStartRef.current) {
          const renderTime = performance.now() - renderStartRef.current;
          if (renderTime > 16) { // > 16ms = возможные проблемы с 60fps
            console.warn(`🐌 Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`);
          }
        }
      };
    });
    
    return <Component {...props} />;
  });
}
