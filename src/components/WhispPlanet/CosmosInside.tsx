import React, { useMemo } from "react";
import { CanvasTexture, BackSide } from "three";

function generateCosmicCanvas(width: number, height: number, starCount: number, nebulaCount: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  // Фон: радиальный градиент от глубокого синего к черному
  const centerX = width / 2;
  const centerY = height / 2;
  const bgGradient = ctx.createRadialGradient(centerX, centerY, width * 0.1, centerX, centerY, width * 0.9);
  bgGradient.addColorStop(0, "#0c0f1a");
  bgGradient.addColorStop(1, "#000000");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Туманности
  const nebulaPalette = [
    { center: "rgba(168,85,247,0.5)", edge: "rgba(168,85,247,0)" },
    { center: "rgba(244,114,182,0.5)", edge: "rgba(244,114,182,0)" },
    { center: "rgba(96,165,250,0.5)", edge: "rgba(96,165,250,0)" },
    { center: "rgba(139,92,246,0.5)", edge: "rgba(139,92,246,0)" },
    { center: "rgba(236,72,153,0.5)", edge: "rgba(236,72,153,0)" }
  ];

  for (let i = 0; i < nebulaCount; i++) {
    const nebulaX = Math.random() * width;
    const nebulaY = Math.random() * height;
    const radius = Math.random() * 200 + 100;
    const nebula = nebulaPalette[Math.floor(Math.random() * nebulaPalette.length)];

    const nebulaGradient = ctx.createRadialGradient(nebulaX, nebulaY, 0, nebulaX, nebulaY, radius);
    nebulaGradient.addColorStop(0, nebula.center);
    nebulaGradient.addColorStop(1, nebula.edge);

    ctx.fillStyle = nebulaGradient;
    ctx.beginPath();
    ctx.arc(nebulaX, nebulaY, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Звёзды (уменьшаем их количество для чистоты визуала)
  for (let i = 0; i < starCount; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const radius = Math.random() * 0.8;
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.shadowBlur = 2 + Math.random() * 3;
    ctx.shadowColor = "white";
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  
  return canvas;
}

export const CosmosInside = () => {
  const canvas = useMemo(() => generateCosmicCanvas(1024, 1024, 800, 4), []);
  const texture = useMemo(() => new CanvasTexture(canvas), [canvas]);

  return (
    <mesh>
      <sphereGeometry args={[7.05, 64, 64]} />
      <meshBasicMaterial
        map={texture}
        side={BackSide}
        depthWrite={false}
      />
    </mesh>
  );
};
