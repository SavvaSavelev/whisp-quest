import { createContext, useContext } from 'react';

export interface AppConfig {
  apiBaseUrl: string;
  debug: boolean;
  version: string;
  theme: string;
  debugMode: boolean;
  enableAnalytics: boolean;
  enableErrorReporting: boolean;
}

const AppConfigContext = createContext<AppConfig | null>(null);

export const useAppConfig = () => {
  const context = useContext(AppConfigContext);
  if (!context) {
    throw new Error('useAppConfig must be used within AppConfigProvider');
  }
  return context;
};

export default AppConfigContext;