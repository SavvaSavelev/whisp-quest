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
    <div className="w-screen h-screen relative overflow-hidden bg-slate-900">
      {/* AI CYBER BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-cyan-900">
        {/* Animated cyber grid */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.3) 1px, transparent 1px)
          `,
            backgroundSize: "60px 60px",
            animation: "grid-move 25s linear infinite",
          }}
        />

        {/* Neural network particles */}
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-ping cyber-glow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}

        {/* Data streams */}
        <div className="absolute inset-0 data-particles opacity-10" />

        {/* Holographic overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-cyan-500/5 to-purple-500/5 animate-pulse" />
      </div>

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
          {/* AI Spirits с кибер-эффектами */}
          {rendered}
        </Suspense>

        {/* Кибер-освещение для духов */}
        <ambientLight intensity={0.9} color="#e0f2fe" />
        <pointLight position={[10, 10, 10]} intensity={0.6} color="#00ffff" />
        <pointLight position={[-10, -10, 5]} intensity={0.4} color="#ff00ff" />
        <pointLight position={[0, 10, -5]} intensity={0.4} color="#ffff00" />
        <pointLight position={[5, -5, 8]} intensity={0.3} color="#00ff00" />
      </Canvas>

      {/* Нижняя панель диалога - временно закомментировано
      <GossipBar />
      */}
      {/* Боковая панель архива с кибер-стилем */}
      <SpiritArchiveBar />
    </div>
  );
};

export default SpiritAtelier;
