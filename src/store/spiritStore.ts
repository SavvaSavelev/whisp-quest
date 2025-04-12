import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Spirit } from "../entities/types";

type SpiritStore = {
  spirits: Spirit[];
  addSpirit: (spirit: Spirit) => void;
  clearSpirits: () => void;
};

export const useSpiritStore = create<SpiritStore>()(
  persist(
    (set) => ({
      spirits: [],
      addSpirit: (spirit) =>
        set((state) => ({ spirits: [...state.spirits, spirit] })),
      clearSpirits: () => set({ spirits: [] }),
    }),
    {
      name: "whisp-spirits", // ключ в localStorage
    }
  )
);
