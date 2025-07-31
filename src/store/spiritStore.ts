// src/store/spiritStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Spirit } from '../entities/types';

interface SpiritState {
  spirits: Spirit[];
  setSpirits: (spirits: Spirit[]) => void;
  addSpirit: (spirit: Spirit) => void;
  removeSpirit: (id: string) => void;
}

// Используем persist, чтобы хранить активного духа между перезагрузками
export const useSpiritStore = create<SpiritState>()(
  persist(
    (set) => ({
      spirits: [],
      setSpirits: (spirits) => set({ spirits }),
      addSpirit: (spirit) =>
        set((state) => ({ spirits: [...state.spirits, spirit] })),
      removeSpirit: (id) =>
        set((state) => ({ spirits: state.spirits.filter((s) => s.id !== id) })),
    }),
    {
      name: 'spirit-active-storage', // ключ в localStorage
      // По умолчанию используется window.localStorage
    }
  )
);
