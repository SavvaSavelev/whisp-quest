import { Spirit } from "../entities/types";

export const spiritGossip = async (from: Spirit, to: Spirit) => {
  try {
    const res = await fetch("http://localhost:4000/spirit-gossip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromEssence: from.essence,
        toEssence: to.essence,
        fromMood: from.mood,
        toMood: to.mood,
      }),
    });

    const data = await res.json();

    return {
      from,
      to,
      question: data.question || "Ты кто вообще, блядь?",
      answer: data.answer || "А ты сам кто такой, чёрт пушистый?",
    };
    
  } catch (error) {
    console.error("❌ Ошибка при запросе spirit-gossip:", error);
    return null;
  }
};
