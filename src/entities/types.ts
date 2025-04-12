export type Spirit = {
    id: string;
    name: string;
    mood: SpiritMood;
    essence: string;
    rarity: SpiritRarity;
    position: [number, number, number];
    color: string; // ✅ добавлено
    dialogue?: string;
  };
  
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
  