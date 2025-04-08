import { create } from "zustand";
import { Spirit } from "../entities/types";

interface SpiritStore {
  spirits: Spirit[];
  addSpirit: (spirit: Spirit) => void;
  clearSpirits: () => void;
}

export const useSpiritStore = create<SpiritStore>((set) => ({
  spirits: [],
  addSpirit: (spirit) =>
    set((state) => ({
      spirits: [...state.spirits, spirit],
    })),
  clearSpirits: () => set({ spirits: [] }),
}));
