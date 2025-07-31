import { useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { useSpiritStore } from '../../store/spiritStore';
import { useSpiritGossipStore } from '../../store/useSpiritGossipStore';
import { useSpiritArchiveStore } from '../../store/useSpiritArchiveStore';
import { TexturedSpiritSprite } from './SpiritOrb';
import { spiritGossip } from '../../lib/spiritGossip';
import { BackgroundRoom } from './BackgroundRoom';
import { AtmosphereEffects } from './AtmosphereEffects';

/**
 * Мастерская духов: отображает один активный дух по центру.
 * Сплетни генерируются между любыми двумя духами (архив + активный).
 */
export const SpiritAtelier = () => {
  const spirits = useSpiritStore((s) => s.spirits);
  const archiveSpirits = useSpiritArchiveStore((s) => s.spirits);
  const setGossip = useSpiritGossipStore((s) => s.setGossip);

  // Интервал сплетен: выбираем 2 случайных духа из активного + архива
  useEffect(() => {
    const interval = setInterval(async () => {
      const all = [...spirits, ...archiveSpirits];
      if (all.length < 2) return;
      const shuffled = all.sort(() => 0.5 - Math.random()).slice(0, 2);
      const gossip = await spiritGossip(shuffled[0], shuffled[1]);
      if (gossip) {
        setGossip(gossip);
        setTimeout(() => setGossip(null), 60000);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [spirits, archiveSpirits, setGossip]);

  // отображаем активных духов (на практике — одного) по центру и крупно
  const renderedSpirits = useMemo(
    () =>
      spirits.map((spirit) => {
        const position: [number, number, number] = [0, 2.5, 0];
        const size = 2.8;
        return (
          <TexturedSpiritSprite
            key={spirit.id}
            spirit={spirit}
            position={position}
            size={size}
          />
        );
      }),
    [spirits]
  );

  return (
    <div className="w-screen h-screen">
      <Canvas camera={{ position: [0, 0, 22], fov: 45 }}>
        <BackgroundRoom />
        <AtmosphereEffects />
        {renderedSpirits}
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
      </Canvas>
    </div>
  );
};
