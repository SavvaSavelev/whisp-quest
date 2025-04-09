import React from "react";
import { MeshWobbleMaterial } from "@react-three/drei";

export const BurningCore = () => {
  return (
    <mesh>
      <sphereGeometry args={[2.5, 64, 64]} />
      <MeshWobbleMaterial
        color="#ff5b00"
        emissive="#ff8c00"
        emissiveIntensity={1.5}
        speed={2}
        factor={0.3}
        roughness={0}
        metalness={0.2}
      />
    </mesh>
  );
};
