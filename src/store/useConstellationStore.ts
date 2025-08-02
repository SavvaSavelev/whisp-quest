import { create } from "zustand";

type ConstellationStore = {
  selected: string | null;
  select: (name: string) => void;
  clear: () => void;
};

export const useConstellationStore = create<ConstellationStore>((set) => ({
  selected: null,
  select: (name) =>
    set((state) => ({
      selected: state.selected === name ? null : name,
    })),
  clear: () => set({ selected: null }),
}));
