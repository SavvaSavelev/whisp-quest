import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import * as THREE from "three";
import atelierBg from "../../assets/bg/atelier-bg.png";

export const BackgroundRoom = () => {
  const texture = useLoader(TextureLoader, atelierBg);
  texture.colorSpace = THREE.SRGBColorSpace;

  return (
    <mesh position={[0, 0, -50]} scale={[2, 1.5, 1]}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
};
