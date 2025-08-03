import { Spirit } from "../entities/types";

export const spiritGossip = async (from: Spirit, to: Spirit) => {
  try {
    const res = await fetch("http://localhost:3001/spirit-gossip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to
      }),
    });

    const data = await res.json();

    return {
      from,
      to,
      question: data.question || "...",
      answer: data.answer || "...",
    };
  } catch (e) {
    console.error("❌ Ошибка spiritGossip.ts:", e);
    return null;
  }
};
