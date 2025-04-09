// 📁 src/components/WhispPlanet/WhispPlanet.tsx

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { SpaceOutside } from "./SpaceOutside";
import { CosmosInside } from "./CosmosInside";
import { GalaxyCore } from "./GalaxyCore";
import { useSpiritStore } from "../../store/spiritStore";
import { SpiritOrb } from "./SpiritOrb";

export const WhispPlanet = () => {
  const spirits = useSpiritStore((state) => state.spirits);

  return (
    <div className="w-screen h-screen bg-black">
      <Canvas camera={{ position: [0, 0, 22], fov: 45 }}>
        {/* 🌌 Внешний космос */}
        <SpaceOutside />

        {/* 💫 Галактика и туманность внутри */}
        <GalaxyCore /> {/* Увеличена */}
        <CosmosInside />

        {/* 👻 Духи */}
        {spirits.map((spirit, index) => (
          <SpiritOrb key={spirit.id} spirit={spirit} index={index} />
        ))}

        {/* 💡 Свет и камера */}
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom={false} />
      </Canvas>
    </div>
  );
};
