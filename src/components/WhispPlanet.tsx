// 📁 src/components/WhispPlanet.tsx

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useSpiritStore } from "../store/spiritStore";
import { SpiritOrb } from "./SpiritOrb";
import { GalaxyCore } from "./GalaxyCore";
import { GlowCore } from "./GlowCore";
import { Suspense } from "react";

export const WhispPlanet = () => {
  const spirits = useSpiritStore((state) => state.spirits);

  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
      <Suspense fallback={null}>
        {/* 🌠 Внешний космос */}
        <Stars radius={100} depth={50} count={6000} factor={5} fade />

        {/* 🌍 Стеклянная планета с галактикой и ядром */}
        <mesh>
          <sphereGeometry args={[2.5, 64, 64]} />
          <meshPhysicalMaterial
            transmission={1}
            thickness={1.3}
            roughness={0.15}
            clearcoat={1}
            clearcoatRoughness={0.05}
            reflectivity={0.4}
            metalness={0.05}
            transparent
            opacity={0.3}
            color="#e0e7ff"
          />
          {/* 💫 Космос внутри */}
          <GalaxyCore />
          {/* 🌟 Светящееся пульсирующее ядро */}
          <GlowCore />
        </mesh>

        {/* 👻 Духи */}
        {spirits.map((spirit, index) => (
          <SpiritOrb key={spirit.id} spirit={spirit} index={index} inside />
        ))}

        {/* ☀️ Свет и управление */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.4} />
        <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom={false} />
      </Suspense>
    </Canvas>
  );
};
