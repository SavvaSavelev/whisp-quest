// src/store/gossipStore.ts
import { create } from "zustand";
import { SpiritGossip } from "../entities/Gossip";

type GossipStore = {
  gossipLog: SpiritGossip[];
  addGossip: (g: SpiritGossip) => void;
  clearGossip: () => void;
};

export const useGossipStore = create<GossipStore>((set) => ({
  gossipLog: [],
  addGossip: (g) => set((state) => ({ gossipLog: [...state.gossipLog, g] })),
  clearGossip: () => set({ gossipLog: [] }),
}));
