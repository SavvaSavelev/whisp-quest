import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TechFeature } from "../entities/types";
import {
  AI_GENIUS_FEATURES,
  generateAIGeniusFeature,
} from "../lib/aiGeniusSpirit";
import { getOpenAIClient } from "../lib/openai";

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
          console.log("Starting OpenAI feature generation...");

          // Пробуем использовать OpenAI API
          try {
            const client = getOpenAIClient();
            const projectContext = `
              WHISP QUEST - уникальное React + TypeScript приложение с духами (spirits):
              - Система духов с эмоциональными состояниями и личностями
              - Gossip система для общения между духами  
              - Framer Motion анимации и плавные переходы
              - Zustand для state management
              - Кибер-эстетика интерфейса с AI стилистикой
              - Three.js для 3D эффектов
              - Tailwind CSS для стилизации
              - Система сохранения духов в архив
              - Модальные окна и интерактивный UI
              - Система лайков и оценок для фич
            `;

            console.log("Calling OpenAI API...");
            const response = await client.generateTechFeatureIdeas(
              projectContext,
              "Frontend",
              "Middle",
              1
            );

            console.log("OpenAI response:", response);

            // Парсим ответ AI (теперь ожидаем один объект)
            let aiFeature: Partial<TechFeature>;
            try {
              // Попробуем простой парсинг сначала
              const parsed = JSON.parse(response);
              aiFeature = parsed;
              console.log("Successfully parsed OpenAI response:", aiFeature);
            } catch (parseError) {
              console.warn("Failed to parse OpenAI response:", parseError);
              console.warn("Original response:", response);

              // Извлекаем данные вручную с помощью регулярных выражений
              try {
                const titleMatch = response.match(/"title":\s*"([^"]+)"/);
                const descMatch = response.match(
                  /"description":\s*"([^"]*?)"/s
                );
                const categoryMatch = response.match(/"category":\s*"([^"]+)"/);
                const techStackMatch = response.match(
                  /"techStack":\s*\[([^\]]+)\]/
                );
                const benefitsMatch = response.match(
                  /"benefits":\s*\[([^\]]+)\]/
                );
                const codeExampleMatch = response.match(
                  /"codeExample":\s*"(.*?)",?\s*"createdBy"/s
                );
                const estimatedTimeMatch = response.match(
                  /"estimatedTime":\s*"([^"]+)"/
                );
                const priorityMatch = response.match(/"priority":\s*"([^"]+)"/);

                if (titleMatch && descMatch && categoryMatch) {
                  // Парсим techStack
                  let techStack = ["React", "TypeScript"];
                  if (techStackMatch) {
                    try {
                      techStack = JSON.parse(`[${techStackMatch[1]}]`);
                    } catch {
                      // Fallback
                    }
                  }

                  // Парсим benefits
                  let benefits = ["AI generated feature"];
                  if (benefitsMatch) {
                    try {
                      benefits = JSON.parse(`[${benefitsMatch[1]}]`);
                    } catch {
                      // Fallback
                    }
                  }

                  // Обрабатываем codeExample
                  let codeExample =
                    "// AI generated code example for WHISP QUEST\n// Feature implementation here";
                  if (codeExampleMatch) {
                    codeExample = codeExampleMatch[1]
                      .replace(/\\n/g, "\n")
                      .replace(/\\t/g, "  ")
                      .replace(/\\"/g, '"')
                      .trim();
                  }

                  aiFeature = {
                    title: titleMatch[1],
                    description: descMatch[1],
                    category: categoryMatch[1] as
                      | "Frontend"
                      | "Backend"
                      | "AI/ML"
                      | "DevOps",
                    techStack: techStack,
                    benefits: benefits,
                    codeExample: codeExample,
                    estimatedTime: estimatedTimeMatch
                      ? estimatedTimeMatch[1]
                      : "2-3 недели",
                    priority: (priorityMatch ? priorityMatch[1] : "High") as
                      | "Low"
                      | "Medium"
                      | "High",
                  };
                  console.log("Manually parsed feature:", aiFeature);
                } else {
                  throw new Error(
                    "Could not extract required fields from response"
                  );
                }
              } catch (manualParseError) {
                console.error("Manual parsing also failed:", manualParseError);
                throw parseError;
              }
            }

            // Конвертируем в TechFeature
            const newFeature: TechFeature = {
              id: crypto.randomUUID(),
              title: aiFeature.title || `🤖 AI Generated Feature`,
              description:
                aiFeature.description || "AI generated feature for Whisp Quest",
              category:
                (aiFeature.category as
                  | "Frontend"
                  | "Backend"
                  | "AI/ML"
                  | "DevOps") || "Frontend",
              difficulty:
                (aiFeature.difficulty as
                  | "Junior"
                  | "Middle"
                  | "Senior"
                  | "Lead"
                  | "CTO") || "Middle",
              techStack: aiFeature.techStack || ["React", "TypeScript"],
              estimatedTime: aiFeature.estimatedTime || "1-2 недели",
              priority:
                (aiFeature.priority as
                  | "Low"
                  | "Medium"
                  | "High"
                  | "Critical") || "Medium",
              benefits: aiFeature.benefits || ["AI enhanced functionality"],
              codeExample:
                aiFeature.codeExample || "// AI generated code example",
              createdBy: aiFeature.createdBy || "AI Neural Network 🧠",
              createdAt: new Date().toISOString(),
              upvotes: aiFeature.upvotes || Math.floor(Math.random() * 10) + 1,
              status: "Proposed" as const,
            };

            set((state) => {
              console.log("Adding OpenAI feature to state");
              return {
                features: [newFeature, ...state.features],
                isGenerating: false,
              };
            });

            console.log("OpenAI feature generation completed successfully");
          } catch (openaiError) {
            console.warn(
              "OpenAI generation failed, using local fallback:",
              openaiError
            );

            // Fallback к локальному генератору
            await new Promise((resolve) => setTimeout(resolve, 500));
            const newFeature = await generateAIGeniusFeature();
            console.log("Generated fallback feature:", newFeature);

            set((state) => {
              return {
                features: [newFeature, ...state.features],
                isGenerating: false,
              };
            });

            console.log("Fallback feature generation completed");
          }
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
