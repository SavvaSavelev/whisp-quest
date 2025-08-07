// Универсальный клиент Whisp Quest API v2.2
import type {
  AnalyzeRequest,
  AnalyzeResponse,
  SpiritChatRequest,
  SpiritChatResponse,
  SpiritGossipRequest,
  SpiritGossipResponse,
} from "./types";

const BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/+$/, "") || "http://localhost:3001";
const API = `${BASE}/api/v1`;

function rid() {
  // короткий request-id
  if ("randomUUID" in crypto) return crypto.randomUUID();
  return `rid_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function apiFetch<T>(
  path: string,
  body?: unknown,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Request-Id": rid(),
      ...(init?.headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: init?.signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${path} ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export function analyzeText(payload: AnalyzeRequest, init?: RequestInit) {
  return apiFetch<AnalyzeResponse>(`${API}/analyze`, payload, init);
}

export function spiritChat(payload: SpiritChatRequest, init?: RequestInit) {
  return apiFetch<SpiritChatResponse>(`${API}/spirit-chat`, payload, init);
}

export function spiritGossip(payload: SpiritGossipRequest, init?: RequestInit) {
  return apiFetch<SpiritGossipResponse>(`${API}/spirit-gossip`, payload, init);
}

/**
 * Стрим-чат: POST → text/event-stream с чанками {data: {"delta": "..."}}
 * Возвращает Response для дальнейшего парсинга (используй useChatStream)
 */
export async function spiritChatStream(
  payload: SpiritChatRequest,
  init?: RequestInit
) {
  const res = await fetch(`${API}/spirit-chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Request-Id": rid(),
      ...(init?.headers || {}),
    },
    body: JSON.stringify(payload),
    signal: init?.signal,
  });
  if (!res.ok || !res.body) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Stream failed: ${res.status} ${txt || res.statusText}`);
  }
  return res;
}
