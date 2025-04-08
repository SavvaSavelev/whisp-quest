import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export const GlowCore = () => {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.scale.setScalar(1 + Math.sin(t * 2) * 0.05);
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={0.6}
      />
    </mesh>
  );
};
