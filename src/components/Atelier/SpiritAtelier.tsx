import { BackgroundRoom } from './BackgroundRoom'
// src/components/Atelier/SpiritAtelier.tsx
import React, { useEffect, useMemo, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useSpiritStore } from '../../store/spiritStore'
import { useSpiritArchiveStore } from '../../store/useSpiritArchiveStore'
import { useSpiritGossipStore } from '../../store/useSpiritGossipStore'
import { TexturedSpiritSprite } from './SpiritOrb'
import { spiritGossip } from '../../lib/spiritGossip'
import { GossipBar } from '../UI/GossipBar'
import { SpiritArchiveBar } from '../UI/SpiritArchiveBar'

export const SpiritAtelier: React.FC = () => {
  const spirits       = useSpiritStore(s => s.spirits)
  const archive       = useSpiritArchiveStore(s => s.spirits)
  const setGossip     = useSpiritGossipStore(s => s.setGossip)
  const activeSpiritId = spirits[0]?.id

  // сброс диалога при смене духа
  useEffect(() => {
    setGossip(null)
  }, [activeSpiritId, setGossip])

  // сплетни каждые 30 сек
  useEffect(() => {
    const iv = setInterval(async () => {
      const all = [...spirits, ...archive]
      if (all.length < 2) return
      const [a, b] = all.sort(() => 0.5 - Math.random()).slice(0, 2)
      const gossip = await spiritGossip(a, b)
      if (gossip) {
        setGossip(gossip)
        setTimeout(() => setGossip(null), 60000)
      }
    }, 30000)
    return () => clearInterval(iv)
  }, [spirits, archive, setGossip])

  const rendered = useMemo(
    () =>
      spirits.map(sp => (
        <TexturedSpiritSprite
          key={sp.id}
          spirit={sp}
          position={[0, 2.5, 0]}
          size={2.8}
        />
      )),
    [spirits]
  )

  return (
    <div className="w-screen h-screen relative overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 22], fov: 45 }}
        // чистим в чёрный вместо белого
        gl={{ alpha: false, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          {/* Фон комнаты с текстурой */}
          <BackgroundRoom />
          {/* Духи */}
          {rendered}
        </Suspense>

        {/* Освещение */}
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
      </Canvas>

      {/* Нижняя панель диалога */}
      <GossipBar />
      {/* Боковая панель архива */}
      <SpiritArchiveBar />
    </div>
  )
}

export default SpiritAtelier;
