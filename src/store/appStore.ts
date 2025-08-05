import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Типы для состояния приложения
interface PerformanceSlice {
  fps: number;
  renderTime: number;
  spiritCount: number;
  setFPS: (fps: number) => void;
  setRenderTime: (time: number) => void;
  setSpiritCount: (count: number) => void;
}

interface UISlice {
  showStorage: boolean;
  showPerformancePanel: boolean;
  theme: 'dark' | 'light' | 'auto';
  setShowStorage: (show: boolean) => void;
  setShowPerformancePanel: (show: boolean) => void;
  setTheme: (theme: 'dark' | 'light' | 'auto') => void;
}

interface AppSlice {
  isLoading: boolean;
  error: string | null;
  debugMode: boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleDebugMode: () => void;
}

type AppStore = PerformanceSlice & UISlice & AppSlice;

export const useAppStore = create<AppStore>()(
  devtools(
    (set) => ({
      // Performance state
      fps: 60,
      renderTime: 0,
      spiritCount: 0,
      setFPS: (fps) => set({ fps }),
      setRenderTime: (renderTime) => set({ renderTime }),
      setSpiritCount: (spiritCount) => set({ spiritCount }),

      // UI state
      showStorage: false,
      showPerformancePanel: false,
      theme: 'dark' as const,
      setShowStorage: (showStorage) => set({ showStorage }),
      setShowPerformancePanel: (showPerformancePanel) => set({ showPerformancePanel }),
      setTheme: (theme) => set({ theme }),

      // App state
      isLoading: false,
      error: null,
      debugMode: import.meta.env.DEV, // Use Vite environment variable
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      toggleDebugMode: () => set((state) => ({ debugMode: !state.debugMode })),
    }),
    {
      name: 'whisp-quest-app-store',
    }
  )
);

// Селекторы для оптимизации рендеринга
export const usePerformanceData = () => useAppStore(
  (state) => ({
    fps: state.fps,
    renderTime: state.renderTime,
    spiritCount: state.spiritCount,
  })
);

export const useUIState = () => useAppStore(
  (state) => ({
    showStorage: state.showStorage,
    showPerformancePanel: state.showPerformancePanel,
    theme: state.theme,
  })
);

export const useAppState = () => useAppStore(
  (state) => ({
    isLoading: state.isLoading,
    error: state.error,
    debugMode: state.debugMode,
  })
);
