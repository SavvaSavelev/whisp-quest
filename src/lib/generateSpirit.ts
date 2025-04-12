import { Spirit, SpiritMood } from "../entities/types";
import { analyzeSentiment } from "./analyzeSentiment";
import { useSpiritArchiveStore } from "../store/useSpiritArchiveStore";
import { randomPositionInSphere } from "./randomPositionInSphere";

export async function generateSpirit(text: string): Promise<Spirit> {
  const { mood, color, rarity, essence, dialogue } = await analyzeSentiment(text);

  const densityMap = {
    обычный: 0.7,
    редкий: 1,
    легендарный: 2.5,
  };

  const safeMood = (mood: string): SpiritMood =>
    moodToTexture[mood as SpiritMood] ? (mood as SpiritMood) : "спокойный";

  const spirit: Spirit = {
    id: crypto.randomUUID(),
    name: "Безымянный дух",
    mood: safeMood(mood),
    color,
    rarity,
    essence,
    dialogue,
    position: randomPositionInSphere(2.4, densityMap[rarity] ?? 1),
    originText: text,
    birthDate: new Date().toISOString(),
  };

  useSpiritArchiveStore.getState().addSpirit(spirit, dialogue ? [dialogue] : []);

  return spirit;
}

export const moodToTexture: Record<SpiritMood, string> = {
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
