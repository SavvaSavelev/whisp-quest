// 📁 src/components/GalaxyCore.tsx

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export const GalaxyCore = () => {
  const ref = useRef<THREE.Points>(null!);

  const { positions, colors } = useMemo(() => {
    const count = 10000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const radius = Math.random() * 1.5;
      const angle = Math.random() * Math.PI * 2;
      const spiral = (i % 4) * 0.4;

      const x = Math.cos(angle + spiral) * radius + (Math.random() - 0.5) * 0.2;
      const y = (Math.random() - 0.5) * 1.5;
      const z = Math.sin(angle + spiral) * radius + (Math.random() - 0.5) * 0.2;

      positions.set([x, y, z], i * 3);

      const color = new THREE.Color();
      color.setHSL(0.6 + Math.random() * 0.4, 1, 0.65 + Math.random() * 0.2);
      colors.set([color.r, color.g, color.b], i * 3);
    }

    return { positions, colors };
  }, []);

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.0008;
      ref.current.rotation.x += 0.0003;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        transparent
        opacity={0.9}
      />
    </points>
  );
};
