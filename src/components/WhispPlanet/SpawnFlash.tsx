// src/components/WhispPlanet/SpawnFlash.tsx
import { useRef, useEffect, useState } from "react";
import { Mesh } from "three";
import { useFrame } from "@react-three/fiber";

type Props = {
  position: [number, number, number];
};

export const SpawnFlash = ({ position }: Props) => {
  const ref = useRef<Mesh>(null);
  const [life, setLife] = useState(1);

  useFrame(() => {
    if (ref.current) {
      const decay = 0.05;
      setLife((prev) => Math.max(0, prev - decay));
      ref.current.material.opacity = life;
      ref.current.scale.setScalar(1 + (1 - life) * 2);
    }
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLife(0);
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  if (life <= 0) return null;

  return (
    <mesh position={position} ref={ref}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshBasicMaterial color={"#ffffff"} transparent opacity={life} />
    </mesh>
  );
};
