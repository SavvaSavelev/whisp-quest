import { useMemo } from "react";
import { Points, PointMaterial } from "@react-three/drei";

export const AtmosphereEffects = () => {
  const particles = useMemo(() => {
    const positions = new Float32Array(300 * 3);
    for (let i = 0; i < 300 * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 10;
    }
    return positions;
  }, []);

  return (
    <Points positions={particles} frustumCulled={false}>
      <PointMaterial color="#ffffff" size={0.03} sizeAttenuation depthWrite={false} />
    </Points>
  );
};
