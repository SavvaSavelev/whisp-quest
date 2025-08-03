import React, { createContext, useContext } from 'react';

export interface AppConfig {
  apiBaseUrl: string;
  debug: boolean;
  version: string;
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
