import { useMemo } from "react";
import * as THREE from "three";
import { useConstellationStore } from "../../store/useConstellationStore";

const spiritTypes = [
  "радостный", "печальный", "злой", "вдохновлённый",
  "спокойный", "сонный", "игривый", "испуганный"
];

// Равномерный, но более близкий разброс
const constellationPositions: Record<string, [number, number, number]> = {};
spiritTypes.forEach((type, i) => {
  const angle = (i / spiritTypes.length) * Math.PI * 2;
  constellationPositions[type] = [
    Math.cos(angle) * 20 + (Math.random() - 0.5) * 6,
    Math.sin(angle) * 15 + (Math.random() - 0.5) * 6,
    (Math.random() - 0.5) * 30,
  ];
});

export const ConstellationHub = () => {
  const selectConstellation = useConstellationStore((s) => s.select);
  const selected = useConstellationStore((s) => s.selected);

  const glassMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    transmission: 1,
    thickness: 1.2,
    roughness: 0.1,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0,
    reflectivity: 1,
    transparent: true,
    opacity: 0.5,
    ior: 1.25,
    color: new THREE.Color("white"),
    emissive: new THREE.Color("#ffffff").multiplyScalar(0.2),
  }), []);

  return (
    <>
      {spiritTypes.map((type) => {
        const pos = constellationPositions[type];
        const isActive = selected === type;

        return (
          <mesh
            key={type}
            position={pos}
            onClick={() => selectConstellation(type)}
          >
            <sphereGeometry args={[isActive ? 1.8 : 1.0, 64, 64]} />
            <primitive object={glassMaterial} attach="material" />
          </mesh>
        );
      })}
    </>
  );
};
