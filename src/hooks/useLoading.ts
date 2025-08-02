import { useState, useCallback } from 'react';

export type LoadingStage = 'analyzing' | 'generating' | 'materializing' | 'completing';

interface LoadingState {
  isLoading: boolean;
  stage: LoadingStage;
  progress: number;
  message: string;
}

interface UseLoadingReturn {
  loadingState: LoadingState;
  startLoading: (initialMessage?: string) => void;
  updateLoading: (stage: LoadingStage, progress: number, message?: string) => void;
  stopLoading: () => void;
  simulateSpiritGeneration: () => Promise<void>;
}

const stageMessages = {
  analyzing: 'Анализирую ваши мысли...',
  generating: 'Создаю духовную сущность...',
  materializing: 'Материализую дух...',
  completing: 'Завершаю создание...'
};

export const useLoading = (): UseLoadingReturn => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    stage: 'analyzing',
    progress: 0,
    message: ''
  });

  const startLoading = useCallback((initialMessage?: string) => {
    setLoadingState({
      isLoading: true,
      stage: 'analyzing',
      progress: 0,
      message: initialMessage || stageMessages.analyzing
    });
  }, []);

  const updateLoading = useCallback((stage: LoadingStage, progress: number, message?: string) => {
    setLoadingState(prev => ({
      ...prev,
      stage,
      progress: Math.min(100, Math.max(0, progress)),
      message: message || stageMessages[stage]
    }));
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: false,
      progress: 100
    }));
  }, []);

  const simulateSpiritGeneration = useCallback(async (): Promise<void> => {
    startLoading();

    // Этап 1: Анализ
    updateLoading('analyzing', 10);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    updateLoading('analyzing', 25);
    await new Promise(resolve => setTimeout(resolve, 600));

    // Этап 2: Генерация
    updateLoading('generating', 35);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    updateLoading('generating', 55);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Этап 3: Материализация
    updateLoading('materializing', 70);
    await new Promise(resolve => setTimeout(resolve, 700));
    
    updateLoading('materializing', 85);
    await new Promise(resolve => setTimeout(resolve, 600));

    // Этап 4: Завершение
    updateLoading('completing', 95);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    updateLoading('completing', 100);
    await new Promise(resolve => setTimeout(resolve, 300));

    stopLoading();
  }, [startLoading, updateLoading, stopLoading]);

  return {
    loadingState,
    startLoading,
    updateLoading,
    stopLoading,
    simulateSpiritGeneration
  };
};
