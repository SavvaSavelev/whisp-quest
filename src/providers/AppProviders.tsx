import React from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary/ErrorBoundary';
import { NotificationProvider } from '../components/UI/Notifications';

// Тип для конфигурации приложения
interface AppConfig {
  theme: 'dark' | 'light' | 'auto';
  debugMode: boolean;
  enableAnalytics: boolean;
  enableErrorReporting: boolean;
}

// Контекст конфигурации
const AppConfigContext = React.createContext<AppConfig>({
  theme: 'dark',
  debugMode: import.meta.env.DEV,
  enableAnalytics: import.meta.env.PROD,
  enableErrorReporting: import.meta.env.PROD,
});

// Провайдер конфигурации
export const AppConfigProvider: React.FC<{
  children: React.ReactNode;
  config?: Partial<AppConfig>;
}> = ({ children, config = {} }) => {
  const defaultConfig: AppConfig = {
    theme: 'dark',
    debugMode: import.meta.env.DEV,
    enableAnalytics: import.meta.env.PROD,
    enableErrorReporting: import.meta.env.PROD,
    ...config,
  };

  return (
    <AppConfigContext.Provider value={defaultConfig}>
      {children}
    </AppConfigContext.Provider>
  );
};

// Хук для использования конфигурации
export const useAppConfig = () => {
  const context = React.useContext(AppConfigContext);
  if (!context) {
    throw new Error('useAppConfig must be used within AppConfigProvider');
  }
  return context;
};

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

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const measurements = React.useRef<Map<string, number>>(new Map());

  const startMeasure = React.useCallback((name: string) => {
    measurements.current.set(name, performance.now());
  }, []);

  const endMeasure = React.useCallback((name: string) => {
    const start = measurements.current.get(name);
    if (start) {
      const duration = performance.now() - start;
      measurements.current.delete(name);
      if (import.meta.env.DEV) {
        console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
      }
      return duration;
    }
    return 0;
  }, []);

  const measureComponent = React.useCallback(<T extends Record<string, unknown>>(
    Component: React.ComponentType<T>
  ): React.ComponentType<T> => {
    const MeasuredComponent: React.ComponentType<T> = (props) => {
      const componentName = Component.displayName || Component.name || 'Unknown';
      
      React.useEffect(() => {
        startMeasure(`render-${componentName}`);
        return () => {
          endMeasure(`render-${componentName}`);
        };
      });

      return <Component {...props} />;
    };

    MeasuredComponent.displayName = `Measured(${Component.displayName || Component.name})`;
    return MeasuredComponent;
  }, [startMeasure, endMeasure]);

  const value = {
    startMeasure,
    endMeasure,
    measureComponent,
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
};

// Хук для измерения производительности
export const usePerformance = () => {
  const context = React.useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within PerformanceProvider');
  }
  return context;
};

// Главный провайдер приложения
interface AppProvidersProps {
  children: React.ReactNode;
  config?: Partial<AppConfig>;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children, config }) => {
  return (
    <ErrorBoundary>
      <AppConfigProvider config={config}>
        <PerformanceProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </PerformanceProvider>
      </AppConfigProvider>
    </ErrorBoundary>
  );
};

// HOC для обертывания компонентов с провайдерами
export const withProviders = <P extends Record<string, unknown>>(
  Component: React.ComponentType<P>,
  config?: Partial<AppConfig>
) => {
  const WrappedComponent: React.FC<P> = (props) => (
    <AppProviders config={config}>
      <Component {...props} />
    </AppProviders>
  );

  WrappedComponent.displayName = `withProviders(${Component.displayName || Component.name})`;
  return WrappedComponent;
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

export default AppProviders;
