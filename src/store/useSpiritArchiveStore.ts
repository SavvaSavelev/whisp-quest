import { create } from "zustand";
import { Spirit } from "../entities/types";

interface SpiritWithChat extends Spirit {
  history: string[];
}

interface ArchiveStore {
  spirits: SpiritWithChat[];
  addSpirit: (spirit: Spirit, history?: string[]) => void;
  getSpiritById: (id: string) => SpiritWithChat | undefined;
  clearArchive: () => void;
}

const LOCAL_KEY = "spirit-archive";

function loadFromStorage(): SpiritWithChat[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(spirits: SpiritWithChat[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(spirits));
}

export const useSpiritArchiveStore = create<ArchiveStore>((set, get) => ({
  spirits: loadFromStorage(),

  addSpirit: (spirit, history = []) => {
    const newSpirit: SpiritWithChat = { ...spirit, history };
    const updated = [newSpirit, ...get().spirits.filter((s) => s.id !== spirit.id)];
    saveToStorage(updated);
    set({ spirits: updated });
  },

  getSpiritById: (id) => get().spirits.find((s) => s.id === id),

  clearArchive: () => {
    localStorage.removeItem(LOCAL_KEY);
    set({ spirits: [] });
  },
}));
