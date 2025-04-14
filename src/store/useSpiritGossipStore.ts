import { create } from "zustand";

interface SpiritGossip {
  from: string;
  to: string;
  text: string;
}

interface GossipStore {
  currentGossip: SpiritGossip | null;
  setGossip: (g: SpiritGossip | null) => void;
}

export const useSpiritGossipStore = create<GossipStore>((set) => ({
  currentGossip: null,
  setGossip: (g) => set({ currentGossip: g })
}));
