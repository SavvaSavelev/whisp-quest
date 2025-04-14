import { TextureLoader } from "three";

const textures = [
  "/textures/face-happy.png",
  "/textures/face-sad.png",
  "/textures/face-angry.png",
  "/textures/face-inspired.png",
  "/textures/face-acceptance.png",
  "/textures/face-.png"
];

export const preloadAllTextures = () => {
  const loader = new TextureLoader();
  textures.forEach((url) => loader.load(url));
};
