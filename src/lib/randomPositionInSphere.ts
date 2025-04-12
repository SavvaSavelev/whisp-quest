// src/lib/randomPositionInSphere.ts
export function randomPositionInSphere(
    radius = 2.4,
    density = 1
  ): [number, number, number] {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const r = radius * Math.pow(Math.random(), 1 / density);
  
    return [
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi),
    ];
  }
  