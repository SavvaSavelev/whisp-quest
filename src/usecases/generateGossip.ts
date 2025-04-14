// src/usecases/generateGossip.ts
import { Spirit } from "../entities/types";
import { SpiritGossip } from "../entities/Gossip";

export async function generateGossip(from: Spirit, to: Spirit): Promise<SpiritGossip> {
  const response = await fetch("http://localhost:4000/spirit-gossip", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ spirits: [from, to] }),
  });

  const result = await response.json();
  return {
    from: result.from,
    to: result.to,
    text: result.text,
    timestamp: new Date().toISOString(),
  };
}
