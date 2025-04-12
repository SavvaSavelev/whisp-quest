import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { SpaceOutside } from "./SpaceOutside";
import { CosmosInside } from "./CosmosInside";
import { GalaxyCore } from "./GalaxyCore";
import { useSpiritStore } from "../../store/spiritStore";
import { useSpiritArchiveStore } from "../../store/useSpiritArchiveStore";
import { TexturedSpiritSprite } from "./TexturedSpiritSprite";
import { SpawnFlash } from "./SpawnFlash";

export const WhispPlanet = () => {
  const archiveSpirits = useSpiritArchiveStore((s) => s.spirits);
  const setSpirits = useSpiritStore((s) => s.setSpirits);
  const spirits = useSpiritStore((s) => s.spirits);

  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const prevCountRef = useRef<number>(spirits.length);

  // 💾 Подгружаем из архива при старте
  useEffect(() => {
    if (spirits.length === 0) {
      setSpirits(archiveSpirits);
    }
  }, []);

  // 🎇 Следим за добавлением нового духа
  useEffect(() => {
    if (spirits.length > prevCountRef.current) {
      const newest = spirits[spirits.length - 1];
      setLastAddedId(newest.id);

      setTimeout(() => setLastAddedId(null), 600); // сброс вспышки
    }
    prevCountRef.current = spirits.length;
  }, [spirits]);

  return (
    <div className="w-screen h-screen bg-black">
      <Canvas camera={{ position: [0, 0, 22], fov: 45 }}>
        {/* Космическая сцена */}
        <SpaceOutside />
        <GalaxyCore />
        <CosmosInside />

        {/* Духи + Вспышка если новый */}
        {spirits.map((spirit) => (
          <group key={spirit.id}>
            <TexturedSpiritSprite
              spirit={spirit}
              position={spirit.position}
              size={1.4}
            />
            {lastAddedId === spirit.id && (
              <SpawnFlash position={spirit.position} />
            )}
          </group>
        ))}

        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <OrbitControls autoRotate autoRotateSpeed={0.4} enableZoom={false} />
      </Canvas>
    </div>
  );
};
