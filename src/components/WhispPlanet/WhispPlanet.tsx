import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { SpaceOutside } from "./SpaceOutside";
import { CosmosInside } from "./CosmosInside";
import { GalaxyCore } from "./GalaxyCore";
import { useSpiritStore } from "../../store/spiritStore";
import { TexturedSpiritSprite } from "./TexturedSpiritSprite";
import { ConstellationHub } from "../world/ConstellationHub";
import { useConstellationStore } from "../../store/useConstellationStore";
import * as THREE from "three";

const targetPositions: Record<string, [number, number, number]> = {
  радостный: [28, 16, -30],
  печальный: [-32, 14, -22],
  злой: [-26, -28, -24],
  вдохновлённый: [18, 30, 24],
  спокойный: [-16, 0, 36],
  сонный: [30, -14, 20],
  игривый: [-24, -16, 24],
  испуганный: [0, -32, -34],
};

const CameraController = () => {
  const { camera } = useThree();
  const selected = useConstellationStore((s) => s.selected);
  const target = selected
    ? new THREE.Vector3(...targetPositions[selected])
    : new THREE.Vector3(0, 0, 100);

  useFrame(() => {
    camera.position.lerp(target.clone().add(new THREE.Vector3(0, 0, 12)), 0.05);
    camera.lookAt(target);
  });

  return null;
};

export const WhispPlanet = () => {
  const spirits = useSpiritStore((state) => state.spirits);
  const selected = useConstellationStore((s) => s.selected);

  return (
    <div className="w-screen h-screen bg-black">
      <Canvas camera={{ position: [0, 0, 100], fov: 45 }}>
        <CameraController />
        <SpaceOutside />
        <GalaxyCore />
        <CosmosInside />
        <ConstellationHub />

        {spirits.map((spirit) => {
          const isVisible = !selected || spirit.mood === selected;
          return isVisible ? (
            <TexturedSpiritSprite
              key={spirit.id}
              spirit={spirit}
              size={selected === spirit.mood ? 1.0 : 0.25}
            />
          ) : null;
        })}

        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <OrbitControls
          autoRotate
          autoRotateSpeed={0.4}
          enableZoom={false}
          rotateSpeed={0.4}
          dampingFactor={0.1}
        />
      </Canvas>
    </div>
  );
};
