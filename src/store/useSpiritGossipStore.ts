import { create } from "zustand";
import { Spirit } from "../entities/types";

interface SpiritGossip {
  from: Spirit;
  to: Spirit;
  text: string;
}

interface SpiritGossipStore {
  gossip: SpiritGossip | null;
  setGossip: (gossip: SpiritGossip | null) => void;
}

export const useSpiritGossipStore = create<SpiritGossipStore>((set) => ({
  gossip: null,
  setGossip: (gossip) => set({ gossip }),
}));
