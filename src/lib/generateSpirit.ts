import { Spirit, SpiritMood } from "../entities/types";
import { analyzeSentiment } from "./analyzeSentiment";
import { useSpiritArchiveStore } from "../store/useSpiritArchiveStore";
import { useSpiritStore } from "../store/spiritStore";

function randomPositionInSphere(radius = 2.2): [number, number, number] {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = radius * Math.cbrt(Math.random());
  return [
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi),
  ];
}

export async function generateSpirit(text: string): Promise<Spirit> {
  const { mood, color, rarity, essence, dialogue } = await analyzeSentiment(text);

  const spirit: Spirit = {
    id: crypto.randomUUID(),
    name: "Безымянный дух",
    mood: mood as SpiritMood,
    color,
    rarity,
    essence,
    dialogue,
    position: randomPositionInSphere(),
  };

  // 💾 Сохраняем в хранилища
  useSpiritStore.getState().addSpirit(spirit); // дух на планете
  useSpiritArchiveStore.getState().addSpirit(spirit, dialogue ? [dialogue] : []); // дух в архив

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
