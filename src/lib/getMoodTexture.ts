// src/lib/getMoodTexture.ts

const FACE_DEFAULT = "/whisp-quest/textures/face-sad.png"; // 🔧 ставим существующую текстуру

export const moodToTexture: Record<string, string> = {
  радостный: "/whisp-quest/textures/face-happy.png",
  печальный: "/whisp-quest/textures/face-sad.png",
  злой: "/whisp-quest/textures/face-angry.png",
  вдохновлённый: "/whisp-quest/textures/face-inspired.png",
  спокойный: "/whisp-quest/textures/face-acceptance.png",
  сонный: "/whisp-quest/textures/face-acceptance.png",
  испуганный: "/whisp-quest/textures/face-sad.png",
  игривый: "/whisp-quest/textures/face-happy.png",
  меланхоличный: "/whisp-quest/textures/face-sad.png",
};

export function getMoodTexture(mood: string): string {
  return moodToTexture[mood] || FACE_DEFAULT;
}
