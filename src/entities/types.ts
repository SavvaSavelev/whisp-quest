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
  