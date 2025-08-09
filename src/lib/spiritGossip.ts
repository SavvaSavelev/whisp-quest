import { Spirit } from "../entities/types";

const BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/+$/, "") || "http://localhost:3001";

export const spiritGossip = async (from: Spirit, to: Spirit) => {
  try {
    const res = await fetch(`${BASE}/api/v1/spirit-gossip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to,
      }),
    });

    const data = await res.json();

    return {
      from,
      to,
      question: data.question || "...",
      answer: data.answer || "...",
      turns: Array.isArray(data.turns) ? data.turns : undefined,
      messageId: data.messageId,
      timestamp: data.timestamp,
    };
  } catch (e) {
    console.error("❌ Ошибка spiritGossip.ts:", e);
    return null;
  }
};
