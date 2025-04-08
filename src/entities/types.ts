export interface Spirit {
    id: string;
    name: string;
    mood: SpiritMood;
    color: string;
    essence: string;
    createdAt: number;
  }
  
  export type SpiritMood =
    | "радостный"
    | "печальный"
    | "вдохновлённый"
    | "злой"
    | "сонный"
    | "испуганный"
    | "спокойный"
    | "игривый"
    | "меланхоличный";