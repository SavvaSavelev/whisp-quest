import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export const GalaxyCore = () => {
  const ref = useRef<THREE.Points>(null!);

  const particles = Array.from({ length: 3000 }, () => {
    const radius = Math.random() * 1.8;
    const angle = Math.random() * 2 * Math.PI;
    const y = (Math.random() - 0.5) * 1.5;

    return {
      position: [
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius,
      ],
      color: new THREE.Color(`hsl(${Math.random() * 360}, 100%, 80%)`)
    };
  });

  const positions = new Float32Array(particles.length * 3);
  const colors = new Float32Array(particles.length * 3);

  particles.forEach((p, i) => {
    positions.set(p.position, i * 3);
    colors.set([p.color.r, p.color.g, p.color.b], i * 3);
  });

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.001;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          array={colors}
          count={colors.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        vertexColors
        blending={THREE.AdditiveBlending}
        transparent
        opacity={0.8}
        depthWrite={false}
      />
    </points>
  );
};
