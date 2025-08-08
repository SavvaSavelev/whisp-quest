// Типы строго под сервер v2.2 (и твои Zod-схемы)

export type Mood =
  | "радостный"
  | "печальный"
  | "злой"
  | "вдохновлённый"
  | "спокойный"
  | "сонный"
  | "испуганный"
  | "игривый"
  | "меланхоличный"
  | "inspired"
  | "happy"
  | "sad"
  | "angry"
  | "acceptance";

export type Rarity = "обычный" | "редкий" | "легендарный";

// --- Analyze
export interface AnalyzeRequest {
  text: string;
}
export interface AnalyzeResponse {
  mood: Mood;
  color: `#${string}`; // #RRGGBB
  rarity: Rarity;
  essence: string;
  dialogue: string;
  timestamp: string; // ISO
  cached: boolean;
}

// --- Chat
export interface SpiritChatRequest {
  text: string;
  mood?: Mood;
  essence?: string;
  history?: string[];
  originText?: string;
  birthDate?: string;
}

export interface SpiritChatResponse {
  reply: string;
  messageId: string;
  timestamp: string; // ISO
}

// --- Gossip
export interface SpiritMeta {
  essence: string;
  mood: Mood;
  originText?: string;
}

export interface SpiritGossipRequest {
  from?: SpiritMeta;
  to?: SpiritMeta;
  spirits?: [SpiritMeta, SpiritMeta];
}

export interface SpiritGossipResponse {
  question: string;
  answer: string;
  messageId: string;
  timestamp: string;
}

// --- AI Mission
export interface AIMissionRequest {
  topic: string;
  context?: string;
  constraints?: string[];
  desiredMoods?: Mood[];
  spiritHints?: Array<{
    essence?: string;
    mood?: Mood;
    originText?: string;
  }>;
  teamSize?: number; // 2..5
  history?: string[];
}

export interface AIMissionResponse {
  missionId: string;
  selectedSpirits: Array<{
    essence: string;
    mood: Mood;
    role: string;
    rationale: string;
  }>;
  plan: string[];
  steps: Array<{ speaker: string; content: string }>;
  finalAnswer: string;
  timestamp: string;
}
