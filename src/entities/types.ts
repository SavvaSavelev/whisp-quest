export type SpiritEmotion =
  | "happy"
  | "sleepy"
  | "surprised"
  | "joy"
  | "sad"
  | "angry"
  | "inspired"
  | "acceptance";

export type Spirit = {
  id: string;
  position: [number, number, number] | { x: number; y: number; z: number };
  color: string;
  emotion?: SpiritEmotion;
  message?: string;
  createdAt?: string;
};
