// src/components/Atelier/SpiritAtelier.tsx
import React, { useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { useSpiritStore } from '../../store/spiritStore'
import { useSpiritGossipStore } from '../../store/useSpiritGossipStore'
import { useSpiritArchiveStore } from '../../store/useSpiritArchiveStore'
import { TexturedSpiritSprite } from './SpiritOrb'
import { spiritGossip } from '../../lib/spiritGossip'

import { AtmosphereEffects } from './AtmosphereEffects'
import { useVanta } from '../../hooks/useVanta'

export const SpiritAtelier: React.FC = () => {
  const spirits = useSpiritStore((s) => s.spirits)
  const archive = useSpiritArchiveStore((s) => s.spirits)
  const setGossip = useSpiritGossipStore((s) => s.setGossip)

  // Вешаем фон Vanta.net на обёртку
  const vantaRef = useVanta('NET', {
    backgroundColor: 0x000000,
    color: 0x00ffcc,
    points: 12.0,
    maxDistance: 20.0,
    spacing: 15.0,
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
  })

  useEffect(() => {
    const iv = setInterval(async () => {
      const all = [...spirits, ...archive]
      if (all.length < 2) return
      const [a, b] = all.sort(() => 0.5 - Math.random()).slice(0, 2)
      const gossip = await spiritGossip(a, b)
      if (gossip) {
        // SpiritGossip требует поле text
        setGossip({ ...gossip, text: gossip.question })
        setTimeout(() => setGossip(null), 60000)
      }
    }, 30000)
    return () => clearInterval(iv)
  }, [spirits, archive, setGossip])

  const rendered = useMemo(
    () =>
      spirits.map((sp) => (
        <TexturedSpiritSprite key={sp.id} spirit={sp} position={[0, 2.5, 0]} size={2.8} />
      )),
    [spirits]
  )

  return (
    <div ref={vantaRef} className="w-screen h-screen relative">
      <Canvas camera={{ position: [0, 0, 22], fov: 45 }}>
      
        <AtmosphereEffects />
        {rendered}
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
      </Canvas>
    </div>
  )
}
