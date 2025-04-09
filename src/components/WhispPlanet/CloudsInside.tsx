import React, { useMemo } from "react";
import { CanvasTexture, FrontSide } from "three";

function generateFluffySkyCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  
  // Вертикальный градиент: от насыщенного голубого к почти белому
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#73c2fb");
  gradient.addColorStop(1, "#cbeeff");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Функция для рисования пушистого облака
  function drawFluffyCloud(x: number, y: number, scale: number) {
    const lumps = 4 + Math.floor(Math.random() * 4); // от 4 до 7 «лепестков»
    for (let i = 0; i < lumps; i++) {
      const offsetX = (Math.random() - 0.5) * 60 * scale;
      const offsetY = (Math.random() - 0.5) * 30 * scale;
      const radiusX = 40 * scale * (0.6 + Math.random() * 0.7);
      const radiusY = 25 * scale * (0.6 + Math.random() * 0.7);
      const alpha = 0.4 + Math.random() * 0.3;
      ctx.beginPath();
      ctx.ellipse(x + offsetX, y + offsetY, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();
    }
  }

  // Увеличиваем количество облаков до 20 и уменьшаем их масштаб (например, от 0.3 до 0.6)
  const cloudCount = 20;
  for (let i = 0; i < cloudCount; i++) {
    const x = Math.random() * width;
    const y = Math.random() * (height * 0.66);
    const scale = 0.3 + Math.random() * 0.3; // масштаб облака теперь от 0.3 до 0.6
    drawFluffyCloud(x, y, scale);
  }

  return canvas;
}

export const CloudsInside = () => {
  const canvas = useMemo(() => generateFluffySkyCanvas(1024, 1024), []);
  const texture = useMemo(() => new CanvasTexture(canvas), [canvas]);

  return (
    <mesh>
      <sphereGeometry args={[10, 64, 64]} />
      <meshStandardMaterial map={texture} side={FrontSide} />
    </mesh>
  );
};
