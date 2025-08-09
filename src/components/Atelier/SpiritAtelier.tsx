import { UltraBackground } from "./UltraBackground";
// src/components/Atelier/SpiritAtelier.tsx
import { Canvas } from "@react-three/fiber";
import React, { Suspense, useEffect, useMemo } from "react";
import { spiritGossip } from "../../lib/spiritGossip";
import { useSpiritStore } from "../../store/spiritStore";
import { useSpiritArchiveStore } from "../../store/useSpiritArchiveStore";
import { useSpiritGossipStore } from "../../store/useSpiritGossipStore";
import { TexturedSpiritSprite } from "./SpiritOrb";
// Временно закомментировано
// import { GossipBar } from '../UI/GossipBar'
import { SpiritArchiveBar } from "../UI/SpiritArchiveBar";

export const SpiritAtelier: React.FC = () => {
  const spirits = useSpiritStore((s) => s.spirits);
  const archive = useSpiritArchiveStore((s) => s.spirits);
  const setGossip = useSpiritGossipStore((s) => s.setGossip);
  const activeSpiritId = spirits[0]?.id;

  // сброс диалога при смене духа
  useEffect(() => {
    setGossip(null);
  }, [activeSpiritId, setGossip]);

  // сплетни каждые 30 сек
  useEffect(() => {
    const iv = setInterval(async () => {
      const all = [...spirits, ...archive];
      if (all.length < 2) return;
      const [a, b] = all.sort(() => 0.5 - Math.random()).slice(0, 2);
      const gossip = await spiritGossip(a, b);
      if (gossip) {
        setGossip(gossip);
        setTimeout(() => setGossip(null), 60000);
      }
    }, 30000);
    return () => clearInterval(iv);
  }, [spirits, archive, setGossip]);

  const rendered = useMemo(
    () =>
      spirits.map((sp) => (
        <TexturedSpiritSprite
          key={sp.id}
          spirit={sp}
          position={[0, 2.5, 0]}
          size={2.8}
        />
      )),
    [spirits]
  );

  return (
    <div className="w-screen h-screen relative overflow-hidden">
      {/* УЛЬТРА КРУТОЙ фон */}
      <UltraBackground />

      <Canvas
        camera={{ position: [0, 0, 22], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        style={{
          background: "transparent",
          position: "relative",
          zIndex: 10,
        }}
      >
        <Suspense fallback={null}>
          {/* Духи без старого фона */}
          {rendered}
        </Suspense>

        {/* Мягкое освещение для духов */}
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#ffffff" />
        <pointLight position={[-10, -10, 5]} intensity={0.3} color="#8b5cf6" />
        <pointLight position={[0, 10, -5]} intensity={0.3} color="#3b82f6" />
      </Canvas>

      {/* Нижняя панель диалога - временно закомментировано
      <GossipBar />
      */}
      {/* Боковая панель архива */}
      <SpiritArchiveBar />
    </div>
  );
};

export default SpiritAtelier;
