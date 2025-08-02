import { create } from 'zustand';

interface UIState {
  showStorage: boolean;
  setShowStorage: (show: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  showStorage: false,
  setShowStorage: (show) => set({ showStorage: show }),
}));
