import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";

import { useSpiritStore } from "../../store/spiritStore";
import { useSpiritArchiveStore } from "../../store/useSpiritArchiveStore";
import { useSpiritGossipStore } from "../../store/useSpiritGossipStore";

import { TexturedSpiritSprite } from "./SpiritOrb";
import { SpawnFlash } from "../WhispPlanet/SpawnFlash";
import { spiritGossip } from "../../lib/spiritGossip";
import { BackgroundRoom } from "./BackgroundRoom";
import { AtmosphereEffects } from "./AtmosphereEffects";

export const SpiritAtelier = () => {
  const archiveSpirits = useSpiritArchiveStore((s) => s.spirits);
  const setSpirits = useSpiritStore((s) => s.setSpirits);
  const spirits = useSpiritStore((s) => s.spirits);
  const setGossip = useSpiritGossipStore((s) => s.setGossip);

  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const prevCountRef = useRef<number>(spirits.length);

  useEffect(() => {
    if (spirits.length === 0 && archiveSpirits.length > 0) {
      setSpirits(archiveSpirits);
    }
  }, [archiveSpirits, setSpirits, spirits.length]);

  useEffect(() => {
    if (spirits.length > prevCountRef.current) {
      const newest = spirits[spirits.length - 1];
      setLastAddedId(newest.id);
      setTimeout(() => setLastAddedId(null), 1500);
    }
    prevCountRef.current = spirits.length;
  }, [spirits]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (spirits.length < 2) return;
      const [a, b] = spirits.sort(() => 0.5 - Math.random()).slice(0, 2);
      const gossip = await spiritGossip(a, b);
      if (gossip) {
        useSpiritGossipStore.getState().setGossip(gossip);
        setTimeout(() => useSpiritGossipStore.getState().setGossip(null), 12000);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [spirits]);

  const flashSpirit = lastAddedId
    ? spirits.find((s) => s.id === lastAddedId)
    : null;

  const renderedSpirits = useMemo(
    () =>
      spirits.map((spirit) => (
        <TexturedSpiritSprite
          key={spirit.id}
          spirit={spirit}
          position={spirit.position}
          size={1.4}
        />
      )),
    [spirits]
  );

  return (
    <div className="w-screen h-screen">
      <Canvas camera={{ position: [0, 0, 22], fov: 45 }}>
        <BackgroundRoom />
        <AtmosphereEffects />
        {renderedSpirits}
        {flashSpirit && (
          <SpawnFlash
            key={flashSpirit.id + "-flash"}
            position={flashSpirit.position}
            rarity={flashSpirit.rarity as "обычный" | "редкий" | "легендарный"}
          />
        )}
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
      </Canvas>
    </div>
  );
};
