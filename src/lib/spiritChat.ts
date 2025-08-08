import { apiClient } from "./APIClient";

/**
 * Общение с духом через OpenAI
 */
export async function chatWithSpirit(params: {
  text: string;
  spirit: {
    mood: string;
    essence: string;
    originText?: string;
    birthDate?: string;
  };
  history?: string[];
}): Promise<string> {
  try {
    const response = await apiClient.chatWithSpirit({
      text: params.text,
      mood: params.spirit.mood,
      essence: params.spirit.essence,
      history: params.history || [],
      originText: params.spirit.originText,
      birthDate: params.spirit.birthDate,
    });

    return response.reply;
  } catch (error) {
    console.error("❌ Ошибка общения с духом:", error);
    return "Дух молчит...";
  }
}

/**
 * Генерация сплетен между духами через OpenAI
 */
export async function generateSpiritGossip(params: {
  from: {
    mood: string;
    essence: string;
    originText?: string;
  };
  to: {
    mood: string;
    essence: string;
    originText?: string;
  };
}): Promise<{ question: string; answer: string }> {
  const BASE =
    import.meta.env.VITE_API_BASE?.replace(/\/+$/, "") ||
    "http://localhost:3001";

  try {
    const response = await fetch(`${BASE}/api/v1/spirit-gossip`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Ошибка генерации сплетен:", error);
    return {
      question: "Что скажешь об этом хозяине мыслей?",
      answer: "Да уж, жалкое зрелище...",
    };
  }
}
