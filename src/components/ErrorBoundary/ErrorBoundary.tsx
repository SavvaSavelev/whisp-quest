import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useAppStore } from '../../store/appStore';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Error caught by boundary:', error, errorInfo);
    
    this.setState({ error, errorInfo });
    
    // Отправляем ошибку в store
    useAppStore.getState().setError(error.message);
    
    // Вызываем пользовательский обработчик
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    useAppStore.getState().setError(null);
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-gray-800 rounded-lg p-6 shadow-xl">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">💫</div>
              <h1 className="text-2xl font-bold mb-2">Упс! Что-то пошло не так</h1>
              <p className="text-gray-400">
                Произошла ошибка в приложении духов
              </p>
            </div>

            {this.state.error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded p-4 mb-4">
                <h3 className="font-semibold mb-2">Детали ошибки:</h3>
                <p className="text-sm text-red-300 font-mono">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded transition-colors"
              >
                🔄 Попробовать снова
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors"
              >
                🔃 Перезагрузить страницу
              </button>
              
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
              >
                🗑️ Очистить данные и перезагрузить
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-gray-400">
              <p>Если проблема повторяется, попробуйте:</p>
              <ul className="mt-2 space-y-1">
                <li>• Обновить браузер</li>
                <li>• Очистить кеш</li>
                <li>• Проверить соединение с интернетом</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC для автоматического оборачивания компонентов
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  fallback?: ReactNode
) {
  return function WithErrorBoundaryComponent(props: T) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Хук для обработки асинхронных ошибок
export function useErrorHandler() {
  const setError = useAppStore((state) => state.setError);

  return React.useCallback((error: Error | string) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    console.error('🚨 Async error:', error);
    setError(errorMessage);
  }, [setError]);
}
