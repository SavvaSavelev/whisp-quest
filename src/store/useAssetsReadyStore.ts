import { create } from "zustand";

interface AssetStore {
  ready: boolean;
  setReady: (value: boolean) => void;
}

export const useAssetsReadyStore = create<AssetStore>((set) => ({
  ready: false,
  setReady: (value) => set({ ready: value }),
}));
