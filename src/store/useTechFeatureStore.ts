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
  resetGenerating: () => void;
}

export const useTechFeatureStore = create<TechFeatureStore>()(
  persist(
    (set, get) => ({
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
        console.log(
          "generateNewFeatures called, current isGenerating:",
          get().isGenerating
        );
        set({ isGenerating: true });

        try {
          console.log("Starting feature generation...");
          await new Promise((resolve) => setTimeout(resolve, 800));
          console.log("Calling generateAIGeniusFeature...");
          const newFeature = await generateAIGeniusFeature();
          console.log("Generated feature:", newFeature);

          set((state) => {
            console.log(
              "Adding feature to state, current features count:",
              state.features.length
            );
            return {
              features: [newFeature, ...state.features],
              isGenerating: false,
            };
          });
          console.log("Feature generation completed successfully");
        } catch (error) {
          console.error("Error generating features:", error);
          set({ isGenerating: false });
        }
      },

      clearFeatures: () => set({ features: [] }),

      resetGenerating: () => set({ isGenerating: false }),
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
