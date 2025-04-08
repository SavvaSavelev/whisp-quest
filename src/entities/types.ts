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

export type SpiritRarity = "обычный" | "сияющий" | "проклятый";

export type Spirit = {
  id: string;
  name: string;
  mood: SpiritMood;
  color: string;
  essence: string;
  createdAt: number;
  x: number;
  y: number;
  rarity?: SpiritRarity;
};
