import { randomPositionInSphere } from "./randomPositionInSphere";
import { Spirit, SpiritMood } from "../entities/types";
import { useSpiritArchiveStore } from "../store/useSpiritArchiveStore";

const FACE_DEFAULT = "/textures/face-.png";

export const moodToTexture: Record<string, string> = {
  радостный: "/textures/face-happy.png",
  печальный: "/textures/face-sad.png",
  злой: "/textures/face-angry.png",
  вдохновлённый: "/textures/face-inspired.png",
  спокойный: "/textures/face-acceptance.png",
  сонный: "/textures/face-acceptance.png",
  испуганный: "/textures/face-sad.png",
  игривый: "/textures/face-happy.png",
  меланхоличный: "/textures/face-sad.png",
};

/**
 * Возвращает путь к текстуре по настроению
 */
export function getMoodTexture(mood: string): string {
  return moodToTexture[mood] || FACE_DEFAULT;
}

/**
 * Генерирует нового духа из текста пользователя
 */
export const generateSpirit = async (text: string): Promise<Spirit> => {
  const response = await fetch("http://localhost:4000/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  const spiritData = await response.json();

  const spirit: Spirit = {
    id: crypto.randomUUID(), // ✅ уникальный
    name: spiritData.essence || "Безымянный дух",
    mood: spiritData.mood as SpiritMood,
    color: spiritData.color || "#ffffff",
    rarity: spiritData.rarity || "обычный",
    essence: spiritData.essence || "Непознанная сущность",
    dialogue: spiritData.dialogue || "Я был рождён из тишины...",
    originText: text,
    position: randomPositionInSphere(2.5), // 🌌 равномерный респавн
    birthDate: new Date().toISOString(),
  };

  // 💾 Сохраняем в архив
  useSpiritArchiveStore
    .getState()
    .addSpirit(spirit, spirit.dialogue ? [spirit.dialogue] : []);

  return spirit;
};
