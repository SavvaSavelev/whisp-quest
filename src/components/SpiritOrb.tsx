import { Spirit } from "../entities/types";

type Props = {
  spirit: Spirit;
  index: number;
  inside?: boolean;
};

export const SpiritOrb = ({ spirit, index, inside = false }: Props) => {
  const radius = inside ? 2.2 : 3.5;

  // случайное распределение внутри шара
  const randAngle1 = (index * 137.5) % 360;
  const randAngle2 = (index * 73.7) % 360;

  const phi = (randAngle1 * Math.PI) / 180;
  const theta = (randAngle2 * Math.PI) / 180;

  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return (
    <mesh position={[x, y, z]}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial
        color={spirit.color}
        emissive={spirit.color}
        emissiveIntensity={1.5}
        toneMapped={false}
      />
    </mesh>
  );
};
