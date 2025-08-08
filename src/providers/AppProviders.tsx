import React from "react";
import { ErrorBoundary } from "../components/ErrorBoundary/ErrorBoundary";
import { NotificationProvider } from "../components/UI/Notifications";
import AppConfigContext, { type AppConfig } from "./hooks/useAppConfig";
import PerformanceContext from "./hooks/usePerformance";

// Провайдер конфигурации
export const AppConfigProvider: React.FC<{
  children: React.ReactNode;
  config?: Partial<AppConfig>;
}> = ({ children, config = {} }) => {
  const defaultConfig: AppConfig = {
    apiBaseUrl:
      import.meta.env.VITE_API_BASE?.replace(/\/+$/, "") ||
      "http://localhost:3001",
    debug: import.meta.env.DEV,
    version: "1.0.0",
    theme: "dark",
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

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
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

  const measureComponent = React.useCallback(
    <T extends Record<string, unknown>>(
      Component: React.ComponentType<T>
    ): React.ComponentType<T> => {
      const MeasuredComponent: React.ComponentType<T> = (props) => {
        const componentName =
          Component.displayName || Component.name || "Unknown";

        React.useEffect(() => {
          startMeasure(`render-${componentName}`);
          return () => {
            endMeasure(`render-${componentName}`);
          };
        });

        return <Component {...props} />;
      };

      MeasuredComponent.displayName = `Measured(${
        Component.displayName || Component.name
      })`;
      return MeasuredComponent;
    },
    [startMeasure, endMeasure]
  );

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

// Главный провайдер приложения
interface AppProvidersProps {
  children: React.ReactNode;
  config?: Partial<AppConfig>;
}

export const AppProviders: React.FC<AppProvidersProps> = ({
  children,
  config,
}) => {
  return (
    <ErrorBoundary>
      <AppConfigProvider config={config}>
        <PerformanceProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </PerformanceProvider>
      </AppConfigProvider>
    </ErrorBoundary>
  );
};

export default AppProviders;
