import React, { useEffect, useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TextureLoader } from "three";
import { Spirit } from "../../entities/types";
import { useSpiritModalStore } from "../../store/useSpiritModalStore";
import { useSpiritGossipStore } from "../../store/useSpiritGossipStore";
import { moodToTexture } from "../../lib/getMoodTexture";

interface Props {
  spirit: Spirit;
  position: [number, number, number];
  size?: number;
}

export const TexturedSpiritSprite: React.FC<Props> = ({ spirit, position, size = 1.5 }) => {
  const ref = useRef<THREE.Sprite>(null);
  const texture = new TextureLoader().load(moodToTexture[spirit.mood]);
  const { setSpirit } = useSpiritModalStore();
  const gossip = useSpiritGossipStore((s) => s.currentGossip);

  // Мемоизируем исходную позицию, чтобы её объект не пересоздавался при каждом рендере
  const defaultPosition = useMemo(() => new THREE.Vector3(...position), [position]);
  const [target, setTarget] = useState(defaultPosition);

  useEffect(() => {
    // Если нет активного диалога, вернуть духа на исходную позицию
    if (!gossip) {
      setTarget(defaultPosition);
      return;
    }

    // Если дух участвует в диалоге, направляем его к нижней части экрана (разные x-координаты для from и to)
    if (gossip.from.id === spirit.id) {
      setTarget(new THREE.Vector3(-4, -5.5, 0));
    } else if (gossip.to.id === spirit.id) {
      setTarget(new THREE.Vector3(4, -5.5, 0));
    } else {
      setTarget(defaultPosition);
    }
  }, [gossip, spirit.id, defaultPosition]);

  // Обновляем позицию спрайта при каждом кадре, используя линейную интерполяцию
  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.lerp(target, 0.08);
  });

  return (
    <sprite
      ref={ref}
      scale={[size, size, 1]}
      onClick={(e) => {
        e.stopPropagation();
        setSpirit(spirit);
      }}
    >
      <spriteMaterial attach="material" map={texture} transparent />
    </sprite>
  );
};
