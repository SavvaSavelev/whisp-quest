import { create } from "zustand";
import { Spirit } from "../entities/types";

interface SpiritState {
  spirits: Spirit[];
  setSpirits: (spirits: Spirit[]) => void;
  addSpirit: (spirit: Spirit) => void;
  removeSpirit: (id: string) => void;
}

export const useSpiritStore = create<SpiritState>((set) => ({
  spirits: [],
  setSpirits: (spirits) => set({ spirits }),
  addSpirit: (spirit) =>
    set((state) => ({
      spirits: [...state.spirits, spirit],
    })),
  removeSpirit: (id) =>
    set((state) => ({
      spirits: state.spirits.filter((s) => s.id !== id),
    })),
}));
