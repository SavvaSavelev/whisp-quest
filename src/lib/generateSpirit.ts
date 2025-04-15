import { Spirit } from "../entities/types";
import { useSpiritArchiveStore } from "../store/useSpiritArchiveStore";
import { randomPositionInRoom } from "./randomPositionInRoom";

export const generateSpirit = async (text: string): Promise<Spirit> => {
  const response = await fetch("http://localhost:4000/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  const spiritData = await response.json();

  const spirit: Spirit = {
    id: crypto.randomUUID(),
    name: spiritData.essence || "Безымянный дух",
    mood: spiritData.mood,
    color: spiritData.color || "#ffffff",
    rarity: spiritData.rarity || "обычный",
    essence: spiritData.essence || "Непознанная сущность",
    dialogue: spiritData.dialogue || "Я был рождён из тишины...",
    originText: text,
    position: randomPositionInRoom(),
    birthDate: new Date().toISOString(),
  };

  useSpiritArchiveStore.getState().addSpirit(spirit, [spirit.dialogue]);

  return spirit;
};
