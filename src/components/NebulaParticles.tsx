import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export const NebulaParticles = () => {
  const pointsRef = useRef<THREE.Points>(null!);

  const count = 1000;
  const radius = 2;

  // Генерация точек в пространстве шара
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = Math.random() * radius;
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    positions.set([x, y, z], i * 3);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: new THREE.Color("#b8c0ff"),
    size: 0.04,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
    depthWrite: false,
  });

  // Анимация медленного вращения
  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0008;
      pointsRef.current.rotation.x += 0.0003;
    }
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
};
