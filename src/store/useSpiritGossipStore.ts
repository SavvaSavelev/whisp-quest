import { create } from "zustand";
import { Spirit } from "../entities/types";

export interface SpiritGossip {
  from: Spirit;
  to: Spirit;
  text: string;
}

interface SpiritGossipStore {
  currentGossip: SpiritGossip | null;
  setGossip: (gossip: SpiritGossip | null) => void;
}

export const useSpiritGossipStore = create<SpiritGossipStore>((set) => ({
  currentGossip: null,
  setGossip: (gossip) => set({ currentGossip: gossip }),
}));
