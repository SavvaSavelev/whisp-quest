import { create } from "zustand";

interface UIState {
  showStorage: boolean;
  setShowStorage: (show: boolean) => void;
  showMission: boolean;
  setShowMission: (show: boolean) => void;
  showTechFeatures: boolean;
  setShowTechFeatures: (show: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  showStorage: false,
  setShowStorage: (show) => set({ showStorage: show }),
  showMission: false,
  setShowMission: (show) => set({ showMission: show }),
  showTechFeatures: false,
  setShowTechFeatures: (show) => set({ showTechFeatures: show }),
}));
