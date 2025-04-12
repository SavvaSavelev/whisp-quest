import { useRef, useEffect, useState } from "react";
import { Mesh } from "three";
import { useFrame } from "@react-three/fiber";

type Props = {
  position: [number, number, number];
  rarity: "обычный" | "редкий" | "легендарный";
};

const rarityStyles = {
  обычный: {
    color: "#ffffff",
    scale: 2.0,
    duration: 500,
    glow: false,
    sparkles: false,
  },
  редкий: {
    color: "#00ffff",
    scale: 3.0,
    duration: 700,
    glow: true,
    sparkles: false,
  },
  легендарный: {
    color: "#ff00ff",
    scale: 4.0,
    duration: 900,
    glow: true,
    sparkles: true,
  },
};

export const SpawnFlash = ({ position, rarity }: Props) => {
  const ref = useRef<Mesh>(null);
  const [life, setLife] = useState(1);
  const { color, scale, duration, glow, sparkles } = rarityStyles[rarity];

  useFrame(() => {
    if (ref.current) {
      const decay = 0.05;
      setLife((prev) => Math.max(0, prev - decay));
      ref.current.material.opacity = life;
      ref.current.rotation.y += 0.1; // вихрь
      ref.current.scale.setScalar(1 + (1 - life) * scale);
    }
  });

  useEffect(() => {
    const timeout = setTimeout(() => setLife(0), duration);
    return () => clearTimeout(timeout);
  }, [duration]);

  if (life <= 0) return null;

  return (
    <mesh position={position} ref={ref}>
      <sphereGeometry args={[0.4, 16, 16]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={life}
        emissive={glow ? color : undefined}
      />
    </mesh>
  );
};
