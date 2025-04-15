import { create } from "zustand";
import { Spirit } from "../entities/types";

interface SpiritModalStore {
  spirit: Spirit | null;
  isOpen: boolean;
  openModal: (spirit: Spirit) => void;
  closeModal: () => void;
}

export const useSpiritModalStore = create<SpiritModalStore>((set) => ({
  spirit: null,
  isOpen: false,
  openModal: (spirit) => set({ spirit, isOpen: true }),
  closeModal: () => set({ spirit: null, isOpen: false }),
}));
