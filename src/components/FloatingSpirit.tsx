
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Sprite, TextureLoader } from "three";
import { useLoader } from "@react-three/fiber";

const FloatingSpirit = () => {
  const ref = useRef<Sprite>(null);
  const texture = useLoader(TextureLoader, "/whisp-quest/textures/face-happy.png");

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      const floatY = Math.sin(t * 2) * 0.1;
      const scale = 1 + Math.sin(t * 4) * 0.05;
      ref.current.position.y = floatY;
      ref.current.scale.set(scale, scale, 1);
    }
  });

  return (
    <sprite ref={ref} position={[0, 1.5, 0]} scale={[1.2, 1.2, 1]}>
      <spriteMaterial map={texture} transparent depthWrite={false} />
    </sprite>
  );
};

export default FloatingSpirit;
