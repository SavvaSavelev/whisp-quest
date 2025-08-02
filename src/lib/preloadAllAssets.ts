import { TextureLoader } from "three";

const textures = [
  "/whisp-quest/textures/face-happy.png",
  "/whisp-quest/textures/face-sad.png",
  "/whisp-quest/textures/face-angry.png",
  "/whisp-quest/textures/face-inspired.png",
  "/whisp-quest/textures/face-acceptance.png",
];

export const preloadAllTextures = () => {
  const loader = new TextureLoader();
  textures.forEach((url) => loader.load(url));
};
