import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Sprite } from "three";

type SpiritMood =
  | "радостный"
  | "печальный"
  | "злой"
  | "вдохновлённый"
  | "спокойный"
  | "игривый"
  | "испуганный"
  | "сонный"
  | "меланхоличный";

type Props = {
  mood: SpiritMood;
  position: [number, number, number];
  size?: number;
};

export const TexturedSpiritSprite = ({
  mood,
  position,
  size = 0.5,
}: Props) => {
  const ref = useRef<Sprite>(null);

  const moodToTexture: Record<SpiritMood, string> = {
    радостный: "/textures/face-happy.png",
    печальный: "/textures/face-sad.png",
    злой: "/textures/face-angry.png",
    вдохновлённый: "/textures/face-inspired.png",
    спокойный: "/textures/face-acceptance.png",
    игривый: "/textures/face-happy.png",
    испуганный: "/textures/face-sad.png",
    сонный: "/textures/face-acceptance.png",
    меланхоличный: "/textures/face-sad.png",
  };

  const texture = useTexture(moodToTexture[mood]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      const floatY = Math.sin(t * 2) * 0.08;
      const scale = 1 + Math.sin(t * 4) * 0.05;
      ref.current.position.y = position[1] + floatY;
      ref.current.scale.set(size * scale, size * scale, 1);
    }
  });

  return (
    <sprite
      ref={ref}
      position={position}
      scale={[size, size, 1]}
    >
      <spriteMaterial map={texture} transparent />
    </sprite>
  );
};
