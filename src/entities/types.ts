export interface Spirit {
  id: string;
  name: string;
  mood: string;
  color: string;
  rarity: string;
  essence: string;
  dialogue?: string;
  originText?: string;
  position: [number, number, number];
  birthDate?: string;
}

export interface SpiritGossip {
  from: string;
  to: string;
  text: string;
}

// 🚀 TECH FEATURE SYSTEM - МЕГА УЛЬТРА КРУТЫЕ ФИЧИ ОТ ДУХОВ!
export interface TechFeature {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  difficulty: "Junior" | "Middle" | "Senior" | "Lead" | "CTO";
  category:
    | "Frontend"
    | "Backend"
    | "DevOps"
    | "AI/ML"
    | "Mobile"
    | "Architecture"
    | "Performance"
    | "Security";
  estimatedTime: string;
  codeExample?: string;
  benefits: string[];
  createdBy: string; // ID духа
  createdAt: string;
  upvotes: number;
  status: "Proposed" | "In Progress" | "Implemented" | "Rejected";
  priority: "Low" | "Medium" | "High" | "Critical";
}

export type SpiritMood =
  | "радостный"
  | "печальный"
  | "злой"
  | "вдохновлённый"
  | "спокойный"
  | "сонный"
  | "испуганный"
  | "игривый"
  | "меланхоличный";

export type SpiritRarity = "обычный" | "редкий" | "легендарный";
