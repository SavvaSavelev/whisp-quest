import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Spirit } from '../entities/types';

interface SpiritArchiveStore {
  spirits: Spirit[];
  addSpirit: (spirit: Spirit, dialogueLog?: string[]) => void;
  removeSpirit: (id: string) => void;
  clearArchive: () => void;
}

export const useSpiritArchiveStore = create<SpiritArchiveStore>()(
  persist(
    (set) => ({
      spirits: [],
      addSpirit: (spirit, dialogueLog = []) =>
        set((state) => ({
          spirits: [...state.spirits, { ...spirit, dialogueLog }],
        })),
      removeSpirit: (id) =>
        set((state) => ({
          spirits: state.spirits.filter((s) => s.id !== id),
        })),
      clearArchive: () => set({ spirits: [] }),
    }),
    {
      name: 'spirit-archive-storage',
    }
  )
);
