import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useSpiritStore } from "../store/spiritStore";
import { SpiritOrb } from "./SpiritOrb";
import { GalaxyCore } from "./GalaxyCore";
import { Suspense } from "react";

export const WhispPlanet = () => {
  const spirits = useSpiritStore((state) => state.spirits);

  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
      <Suspense fallback={null}>
        {/* 🌠 Внешний космос */}
        <Stars radius={100} depth={50} count={5000} factor={4} fade />

        {/* 💫 Объёмное ядро галактики */}
        <GalaxyCore />

        {/* 🌍 Стеклянная сфера-планета */}
        <mesh>
          <sphereGeometry args={[2.5, 64, 64]} />
          <meshPhysicalMaterial
            transmission={1}
            thickness={1.1}
            roughness={0.2}
            clearcoat={1}
            clearcoatRoughness={0.1}
            reflectivity={0.5}
            metalness={0.1}
            transparent
            opacity={0.35}
            color="#c7d2fe"
          />
        </mesh>

        {/* 👻 Духи внутри сферы */}
        {spirits.map((spirit, index) => (
          <SpiritOrb key={spirit.id} spirit={spirit} index={index} inside />
        ))}

        {/* 💡 Свет и управление */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <OrbitControls autoRotate autoRotateSpeed={0.6} enableZoom={false} />
      </Suspense>
    </Canvas>
  );
};
