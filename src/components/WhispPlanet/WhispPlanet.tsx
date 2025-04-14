import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import { CosmosInside } from "./CosmosInside";

import { useSpiritStore } from "../../store/spiritStore";
import { useSpiritArchiveStore } from "../../store/useSpiritArchiveStore";
import { TexturedSpiritSprite } from "./TexturedSpiritSprite";
import { SpawnFlash } from "./SpawnFlash";
import { useSpiritGossipStore } from "../../store/useSpiritGossipStore";
import { spiritGossip } from "../../lib/spiritGossip";

export const WhispPlanet = () => {
  const archiveSpirits = useSpiritArchiveStore((s) => s.spirits);
  const setSpirits = useSpiritStore((s) => s.setSpirits);
  const spirits = useSpiritStore((s) => s.spirits);
  const setGossip = useSpiritGossipStore((s) => s.setGossip);

  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const prevCountRef = useRef<number>(spirits.length);

  // 💾 Загружаем при старте
  useEffect(() => {
    if (spirits.length === 0 && archiveSpirits.length > 0) {
      setSpirits(archiveSpirits);
    }
  }, []);

  // 🎇 Новый дух — вспышка
  useEffect(() => {
    if (spirits.length > prevCountRef.current) {
      const newest = spirits[spirits.length - 1];
      setLastAddedId(newest.id);
      setTimeout(() => setLastAddedId(null), 1000);
    }
    prevCountRef.current = spirits.length;
  }, [spirits]);

  // 🗣️ Диалоги между духами
  useEffect(() => {
    const interval = setInterval(async () => {
      if (spirits.length < 2) return;

      const [a, b] = spirits.sort(() => 0.5 - Math.random()).slice(0, 2);
      const gossip = await spiritGossip(a, b);
      if (gossip) {
        setGossip(gossip);
        setTimeout(() => setGossip(null), 10000);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [spirits]);

  const flashSpirit = lastAddedId
    ? spirits.find((s) => s.id === lastAddedId)
    : null;

  return (
    <div className="w-screen h-screen bg-black">
      <Canvas camera={{ position: [0, 0, 22], fov: 45 }}>
        
        
        <CosmosInside />

        {spirits.map((spirit) => (
          <TexturedSpiritSprite
            key={spirit.id}
            spirit={spirit}
            position={spirit.position}
            size={1.4}
          />
        ))}

        {flashSpirit && (
          <SpawnFlash
            key={flashSpirit.id + "-flash"}
            position={flashSpirit.position}
            rarity={flashSpirit.rarity}
          />
        )}

        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <OrbitControls autoRotate autoRotateSpeed={0.4} enableZoom={false} />
      </Canvas>
    </div>
  );
};
