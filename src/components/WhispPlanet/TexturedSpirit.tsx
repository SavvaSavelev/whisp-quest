import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Group } from "three";

type Props = {
  position: [number, number, number];
  color?: string;
  faceTexture?: string;
  size?: number;
};

export const TexturedSpirit = ({
  position,
  color = "#FFD54F",
  faceTexture = "/textures/face-happy.png",
  size = 2.3,
}: Props) => {
  const ref = useRef<Group>(null);
  const faceMap = useTexture(faceTexture);
  const { camera } = useThree();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      const floatY = Math.sin(t * 2) * 0.15;
      const driftX = Math.cos(t * 0.7) * 0.1;
      const driftZ = Math.sin(t * 0.7) * 0.1;

      ref.current.position.set(
        position[0] + driftX,
        position[1] + floatY,
        position[2] + driftZ
      );

      const face = ref.current.children[1];
      face.lookAt(camera.position);
    }
  });

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[size, 64, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.2}
          transparent
          opacity={0.85}
        />
      </mesh>
      <mesh position={[0, 0, size * 0.95]}>
        <planeGeometry args={[size * 1.2, size * 1.2]} />
        <meshBasicMaterial map={faceMap} transparent />
      </mesh>
    </group>
  );
};
