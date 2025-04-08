import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export const MilkyWayCore = () => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0008;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 💡 Центр галактики */}
      <mesh>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshBasicMaterial
          color={"#ffffff"}
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 🌫️ Облачные плоскости вокруг центра */}
      {[...Array(4)].map((_, i) => (
        <mesh rotation={[0, Math.PI * i * 0.25, 0]} key={i}>
          <planeGeometry args={[2.2 + i * 0.3, 2.2 + i * 0.3]} />
          <meshBasicMaterial
            color={"#b8c0ff"}
            transparent
            opacity={0.1}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* ✨ Светящиеся сферы тумана */}
      {[...Array(3)].map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[1.0 + i * 0.15, 32, 32]} />
          <meshBasicMaterial
            color={"#a78bfa"}
            transparent
            opacity={0.1 + i * 0.05}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
};
