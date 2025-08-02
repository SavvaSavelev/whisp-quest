import React from 'react';
import type { AppConfig } from '../hooks/useAppConfig';

// HOC для обертывания компонентов с провайдерами
export const withProviders = <P extends Record<string, unknown>>(
  Component: React.ComponentType<P>,
  config?: Partial<AppConfig>
) => {
  // Динамический импорт для избежания циклических зависимостей
  const AppProviders = React.lazy(() => import('../AppProviders'));
  
  const WrappedComponent: React.FC<P> = (props) => (
    <React.Suspense fallback={<div>Loading...</div>}>
      <AppProviders config={config}>
        <Component {...props} />
      </AppProviders>
    </React.Suspense>
  );

  WrappedComponent.displayName = `withProviders(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

export default withProviders;
