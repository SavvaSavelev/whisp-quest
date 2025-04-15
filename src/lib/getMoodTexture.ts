// src/lib/getMoodTexture.ts

const FACE_DEFAULT = "/textures/face-sad.png"; // 🔧 ставим существующую текстуру

export const moodToTexture: Record<string, string> = {
  радостный: "/textures/face-happy.png",
  печальный: "/textures/face-sad.png",
  злой: "/textures/face-angry.png",
  вдохновлённый: "/textures/face-inspired.png",
  спокойный: "/textures/face-acceptance.png",
  сонный: "/textures/face-acceptance.png",
  испуганный: "/textures/face-sad.png",
  игривый: "/textures/face-happy.png",
  меланхоличный: "/textures/face-sad.png",
};

export function getMoodTexture(mood: string): string {
  return moodToTexture[mood] || FACE_DEFAULT;
}
