import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export const SpawnFlash = ({
  position,
  rarity,
}: {
  position: [number, number, number];
  rarity: "обычный" | "редкий" | "легендарный";
}) => {
  const meshRef = useRef<THREE.Points>(null!);
  const startTime = useRef(performance.now());

  const color = {
    обычный: "#cccccc",
    редкий: "#77ddff",
    легендарный: "#ffcc00",
  }[rarity];

  const particles = 60;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particles * 3);
  const sizes = new Float32Array(particles);

  for (let i = 0; i < particles; i++) {
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = Math.random() * 0.8;

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    sizes[i] = Math.random() * 8 + 4;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    color,
    size: 0.15,
    transparent: true,
    opacity: 1,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  useFrame(() => {
    const elapsed = performance.now() - startTime.current;
    if (meshRef.current) {
      (meshRef.current.material as THREE.PointsMaterial).opacity = Math.max(0, 1 - elapsed / 1500);
    }
  });

  return (
    <points ref={meshRef} geometry={geometry} material={material} position={position} />
  );
};
