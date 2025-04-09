// 📁 src/components/GlowCore.tsx
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export const GlowCore = () => {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.0005;
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1.8, 64, 64]} />
      <meshStandardMaterial
        emissive="#a0c4ff"
        emissiveIntensity={2}
        transparent
        opacity={0.4}
        depthWrite={false}
      />
    </mesh>
  );
};
