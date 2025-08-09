import { create } from "zustand";
import { Spirit } from "../entities/types";

export interface SpiritGossip {
  from: Spirit;
  to: Spirit;
  text?: string;
  question?: string;
  answer?: string;
  // Новый тред из нескольких реплик
  turns?: Array<{
    speaker?: "from" | "to";
    text: string;
  }>;
  messageId?: string;
  timestamp?: string;
}

interface SpiritGossipStore {
  currentGossip: SpiritGossip | null;
  setGossip: (gossip: SpiritGossip | null) => void;
}

export const useSpiritGossipStore = create<SpiritGossipStore>((set) => ({
  currentGossip: null,
  setGossip: (gossip) => set({ currentGossip: gossip }),
}));
