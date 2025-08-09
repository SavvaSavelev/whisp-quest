import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { Sprite } from "three";
import { Spirit } from "../../entities/types";
import { getMoodTexture } from "../../lib/getMoodTexture";
import { useSpiritModalStore } from "../../store/useSpiritModalStore";

interface Props {
  spirit: Spirit;
  position: [number, number, number];
  size?: number;
}

export const TexturedSpiritSprite = ({
  spirit,
  position,
  size = 1.4,
}: Props) => {
  const ref = useRef<Sprite>(null);
  const texture = useTexture(getMoodTexture(spirit.mood));
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      const floatY = Math.sin(t * 2) * 0.1;
      const scale = 1 + Math.sin(t * 4) * 0.05 + (hovered ? 0.1 : 0);
      ref.current.position.set(position[0], position[1] + floatY, position[2]);
      ref.current.scale.set(size * scale, size * scale, 1);
    }
  });

  return (
    <>
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

      {/* Убрал дублирующее окно - оно мешает */}
    </>
  );
};
