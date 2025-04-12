// src/lib/preloadAllSpiritTextures.ts
import { TextureLoader } from "three";
import { moodToTexture } from "./generateSpirit";

export function preloadAllSpiritTextures(): void {
  const loader = new TextureLoader();

  Object.values(moodToTexture).forEach((src) => {
    loader.load(src, () => {
      console.log(`✅ Прелоад: ${src}`);
    });
  });
}
