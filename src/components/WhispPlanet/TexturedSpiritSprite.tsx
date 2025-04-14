import { useRef, useState } from "react";
import { Sprite } from "three";
import { useTexture, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Spirit } from "../../entities/types";
import { moodToTexture } from "../../lib/generateSpirit";
import { useSpiritModalStore } from "../../store/useSpiritModalStore";
import { useSpiritGossipStore } from "../../store/useSpiritGossipStore";

interface Props {
  spirit: Spirit;
  position: [number, number, number];
  size?: number;
}

export const TexturedSpiritSprite = ({ spirit, position, size = 1.4 }: Props) => {
  const ref = useRef<Sprite>(null);
  const texture = useTexture(moodToTexture[spirit.mood]);
  const [hovered, setHovered] = useState(false);

  const gossip = useSpiritGossipStore((s) => s.currentGossip);
  const isSpeaking = gossip?.from === spirit.essence;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      const floatY = Math.sin(t * 2) * 0.1;
      const scale = 1 + Math.sin(t * 4) * 0.05 + (hovered ? 0.1 : 0);
      ref.current.position.y = position[1] + floatY;
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

      {isSpeaking && gossip?.text && (
        <Html position={[position[0], position[1] + 1.4, position[2]]}>
          <div className="bg-white/10 backdrop-blur-md border border-white/30 text-white text-sm px-4 py-2 rounded-lg shadow-lg max-w-xs text-center animate-fade-in-out">
            <span className="italic text-indigo-300">{gossip.text}</span>
          </div>
        </Html>
      )}
    </>
  );
};
