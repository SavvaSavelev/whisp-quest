import React, { useMemo } from "react";
import * as THREE from "three";
import { CanvasTexture, BackSide } from "three";

function generateSpaceCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No 2D context");

  // Заливаем чёрным
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);

  // Рисуем звезды
  for (let i = 0; i < 600; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 1.5;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
  }

  return canvas;
}

export const SpaceOutside = () => {
  const canvas = useMemo(() => generateSpaceCanvas(2048, 2048), []);
  const texture = useMemo(() => new CanvasTexture(canvas), [canvas]);

  const sphereGeo = useMemo(() => {
    const g = new THREE.SphereGeometry(2000, 64, 64);
    // Инвертируем нормали, чтобы смотреть на текстуру изнутри
    g.scale(-1, 1, 1);
    return g;
  }, []);

  return (
    <mesh geometry={sphereGeo}>
      <meshBasicMaterial map={texture} side={BackSide} />
    </mesh>
  );
};
