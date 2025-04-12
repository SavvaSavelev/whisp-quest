export type SpiritAnalysis = {
  mood: string;
  color: string;
  rarity: string;
  essence: string;
};

export async function analyzeSentiment(text: string): Promise<SpiritAnalysis> {
  try {
    const response = await fetch("http://localhost:4000/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      console.warn("⚠️ OpenAI сервер вернул ошибку:", await response.text());
      return {
        mood: "спокойный",
        color: "#cccccc",
        rarity: "обычный",
        essence: "безмятежная тишина",
      };
    }

    const data = await response.json();

    return {
      mood: data.mood || "спокойный",
      color: data.color || "#cccccc",
      rarity: data.rarity || "обычный",
      essence: data.essence || "неопределённая энергия",
    };
  } catch (error) {
    console.error("❌ Ошибка при анализе через OpenAI:", error);
    return {
      mood: "спокойный",
      color: "#cccccc",
      rarity: "обычный",
      essence: "тишина пустоты",
    };
  }
}
