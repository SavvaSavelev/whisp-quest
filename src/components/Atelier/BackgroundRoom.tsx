
import { Suspense } from "react";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import * as THREE from "three";

import atelierBg from '../../assets/bg/atelier-bg.png';

const AsyncTexture = () => {
  const loaded = useLoader(TextureLoader, atelierBg);
  // useLoader может вернуть массив, если путь некорректен
  const texture = Array.isArray(loaded) ? loaded[0] : loaded;
  if (texture && 'colorSpace' in texture) {
    texture.colorSpace = THREE.SRGBColorSpace;
  }
  return (
    <mesh position={[0, 0, -50]} scale={[2, 1.5, 1]}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
};

export const BackgroundRoom = () => (
  <Suspense fallback={<mesh position={[0,0,-50]} scale={[2,1.5,1]}><planeGeometry args={[100,100]} /><meshBasicMaterial color="#181826" /></mesh>}>
    <AsyncTexture />
  </Suspense>
);
