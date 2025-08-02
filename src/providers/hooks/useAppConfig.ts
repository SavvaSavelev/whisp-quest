import React from 'react';

// Тип для конфигурации приложения
export interface AppConfig {
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

// Хук для использования конфигурации
export const useAppConfig = () => {
  const context = React.useContext(AppConfigContext);
  if (!context) {
    throw new Error('useAppConfig must be used within AppConfigProvider');
  }
  return context;
};

export default AppConfigContext;
