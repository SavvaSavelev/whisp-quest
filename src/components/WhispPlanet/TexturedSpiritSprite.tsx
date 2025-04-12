import { useRef, useState } from "react";
import { Sprite } from "three";
import { useFrame, useLoader } from "@react-three/fiber";
import { Spirit } from "../../entities/types";
import { moodToTexture } from "../../lib/generateSpirit";
import { TextureLoader } from "three";
import { useSpiritModalStore } from "../../store/useSpiritModalStore";

type Props = {
  spirit: Spirit;
  position: [number, number, number];
  size?: number;
};

export const TexturedSpiritSprite = ({ spirit, position, size = 1.4 }: Props) => {
  const ref = useRef<Sprite>(null);
  const [hovered, setHovered] = useState(false);

  // ✅ Безопасная загрузка текстуры с fallback
  const fallback = "/textures/face-acceptance.png";
  const texturePath = moodToTexture[spirit.mood] || fallback;
  const texture = useLoader(TextureLoader, texturePath);

  // 🎞️ Анимация: подпрыгивание + масштаб
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const floatY = Math.sin(t * 2) * 0.1;
    const scale = 1 + Math.sin(t * 4) * 0.05 + (hovered ? 0.1 : 0);
    if (ref.current) {
      ref.current.position.y = position[1] + floatY;
      ref.current.scale.set(size * scale, size * scale, 1);
    }
  });

  return (
    <sprite
      ref={ref}
      position={position}
      scale={[size, size, 1]}
      onClick={(e) => {
        e.stopPropagation();
        useSpiritModalStore.getState().openModal(spirit);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
    >
      <spriteMaterial map={texture} transparent depthWrite={false} />
    </sprite>
  );
};
