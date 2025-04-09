import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { Spirit } from "../../entities/types";

type Props = {
  spirit: Spirit;
  index: number;
  inside?: boolean;
};

export const SpiritOrb = ({ spirit, index, inside = false }: Props) => {
  const ref = useRef<Group>(null);

  const radius = inside ? 2.2 : 3.5;

  // Распределение по сфере на основе index
  const randAngle1 = (index * 137.5) % 360;
  const randAngle2 = (index * 73.7) % 360;

  const phi = (randAngle1 * Math.PI) / 180;
  const theta = (randAngle2 * Math.PI) / 180;

  const baseX = radius * Math.sin(phi) * Math.cos(theta);
  const baseY = radius * Math.cos(phi);
  const baseZ = radius * Math.sin(phi) * Math.sin(theta);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      const floatY = Math.sin(t * 2 + index) * 0.15;
      const driftX = Math.cos(t * 0.7 + index) * 0.1;
      const driftZ = Math.sin(t * 0.7 + index) * 0.1;
      const rotateY = Math.sin(t * 0.4 + index) * 0.5;

      ref.current.position.set(baseX + driftX, baseY + floatY, baseZ + driftZ);
      ref.current.rotation.y = rotateY;
    }
  });

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial
          color={spirit.color}
          emissive={spirit.color}
          emissiveIntensity={1.5}
          toneMapped={false}
          transparent
          opacity={0.75}
        />
      </mesh>
    </group>
  );
};
