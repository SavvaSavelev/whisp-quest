import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TechFeature } from "../entities/types";
import {
  AI_GENIUS_FEATURES,
  generateAIGeniusFeature,
} from "../lib/aiGeniusSpirit";

interface TechFeatureStore {
  features: TechFeature[];
  isGenerating: boolean;
  addFeature: (feature: TechFeature) => void;
  removeFeature: (id: string) => void;
  updateFeature: (id: string, updates: Partial<TechFeature>) => void;
  upvoteFeature: (id: string) => void;
  generateNewFeatures: () => Promise<void>;
  clearFeatures: () => void;
}

export const useTechFeatureStore = create<TechFeatureStore>()(
  persist(
    (set) => ({
      features: [],
      isGenerating: false,

      addFeature: (feature) =>
        set((state) => ({
          features: [feature, ...state.features],
        })),

      removeFeature: (id) =>
        set((state) => ({
          features: state.features.filter((f) => f.id !== id),
        })),

      updateFeature: (id, updates) =>
        set((state) => ({
          features: state.features.map((f) =>
            f.id === id ? { ...f, ...updates } : f
          ),
        })),

      upvoteFeature: (id) =>
        set((state) => ({
          features: state.features.map((f) =>
            f.id === id ? { ...f, upvotes: f.upvotes + 1 } : f
          ),
        })),

      generateNewFeatures: async () => {
        set({ isGenerating: true });

        try {
          // AI GENIUS генерирует новые фичи!
          await new Promise((resolve) => setTimeout(resolve, 1500));

          const newFeature = await generateAIGeniusFeature();

          set((state) => ({
            features: [newFeature, ...state.features],
            isGenerating: false,
          }));
        } catch (error) {
          console.error("Error generating features:", error);
          set({ isGenerating: false });
        }
      },

      clearFeatures: () => set({ features: [] }),
    }),
    {
      name: "tech-features-storage",
      onRehydrateStorage: () => (state) => {
        // Инициализируем с AI GENIUS фичами при первом запуске
        if (state && state.features.length === 0) {
          const initialFeatures = AI_GENIUS_FEATURES.map((feature) => ({
            ...feature,
            id: crypto.randomUUID(),
            createdBy: "AI GENIUS TECH ARCHITECT",
            createdAt: new Date().toISOString(),
          }));
          state.features = initialFeatures;
        }
      },
    }
  )
);
