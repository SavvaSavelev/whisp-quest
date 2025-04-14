import { Spirit } from "../entities/types";

export async function spiritGossip(from: Spirit, to: Spirit) {
  try {
    const res = await fetch("http://localhost:4000/spirit-gossip", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: from.essence,
        to: to.essence,
        text: "Они обсуждают своё существование.",
      }),
    });

    const data = await res.json();
    return {
      from,
      to,
      text: data.reply,
    };
  } catch (e) {
    console.error("❌ Ошибка spirit-gossip:", e);
    return null;
  }
}
