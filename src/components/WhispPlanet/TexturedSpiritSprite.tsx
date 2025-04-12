import { useRef, useState } from "react";
import { Sprite } from "three";
import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Spirit } from "../../entities/types";
import { moodToTexture } from "../../lib/generateSpirit";
import { useSpiritModalStore } from "../../store/useSpiritModalStore";

type Props = {
  spirit: Spirit;
  size?: number;
};

export const TexturedSpiritSprite = ({ spirit, size = 1.0 }: Props) => {
  const ref = useRef<Sprite>(null);
  const texture = useTexture(moodToTexture[spirit.mood]);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      const floatY = Math.sin(t * 2) * 0.1;
      const scale = 1 + Math.sin(t * 4) * 0.05 + (hovered ? 0.1 : 0);
      ref.current.position.y = spirit.position[1] + floatY;
      ref.current.scale.set(size * scale, size * scale, 1);
    }
  });

  return (
    <sprite
      ref={ref}
      position={spirit.position}
      scale={[size, size, 1]}
      onClick={(e) => {
        e.stopPropagation();
        useSpiritModalStore.getState().openModal(spirit); // ✅ передаём весь дух
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
