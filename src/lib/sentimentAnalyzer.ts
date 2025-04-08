type EmotionResult = {
    label: string;
    score: number;
  };
  
  export async function analyzeSentiment(
    text: string
  ): Promise<{ label: string; all: string[] }> {
    try {
      const response = await fetch("http://localhost:4000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
  
      let result;
  
      try {
        result = await response.json();
      } catch (jsonError) {
        const raw = await response.text();
        console.error("❌ Невалидный JSON от сервера:", raw);
        return { label: "neutral", all: [] };
      }
  
      if (result.error) {
        console.error("❌ HF API вернул ошибку:", result.error);
        return { label: "neutral", all: [] };
      }
  
      if (Array.isArray(result) && Array.isArray(result[0])) {
        const items = result[0] as EmotionResult[];
        const sorted = items.sort((a, b) => b.score - a.score);
        const top = sorted[0];
        const all = sorted.map((i) => i.label.toLowerCase());
  
        console.log("✅ Эмоции от HF:", sorted);
        return {
          label: top.label.toLowerCase(),
          all,
        };
      }
  
      return { label: "neutral", all: [] };
    } catch (e) {
      console.error("❌ Ошибка при обращении к серверу:", e);
      return { label: "neutral", all: [] };
    }
  }
  