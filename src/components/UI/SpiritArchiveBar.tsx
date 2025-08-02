// src/components/Atelier/SpiritArchiveBar.tsx
import { useState } from 'react';
import { getMoodTexture } from '../../lib/getMoodTexture'
import { Spirit } from '../../entities/types'
import { useSpiritStore } from '../../store/spiritStore'
import { useSpiritArchiveStore } from '../../store/useSpiritArchiveStore'
import { useSpiritGossipStore } from '../../store/useSpiritGossipStore'

/**
 * Панель хранилища: клик по духу вызывает его в центр, активный дух уходит в архив.
 */
export const SpiritArchiveBar = () => {
  const archiveSpirits = useSpiritArchiveStore((s) => s.spirits)
  const setGossip      = useSpiritGossipStore((s) => s.setGossip)
  const [hoveredId, setHoveredId] = useState<string|null>(null)

  const handleClick = (spirit: Spirit) => {
    const activeStore  = useSpiritStore.getState()
    const archiveStore = useSpiritArchiveStore.getState()
    const currentActive = activeStore.spirits[0]
    if (currentActive && currentActive.id !== spirit.id) {
      archiveStore.addSpirit(currentActive)
    }
    archiveStore.removeSpirit(spirit.id)
    activeStore.setSpirits([spirit])
    setGossip(null)
  }

  if (!archiveSpirits.length) return null

  return (
    <div className="fixed right-0 top-0 h-full w-full max-w-xs sm:max-w-sm md:max-w-md z-50 flex flex-col items-center justify-center p-3 overflow-y-auto"
      style={{
        background: "radial-gradient(ellipse at 80% 20%, rgba(80,0,120,0.7) 0%, rgba(40,40,60,0.95) 80%)",
        boxShadow: "0 0 32px 0 rgba(80,0,120,0.25)",
        backdropFilter: "blur(12px)"
      }}>
      {/* Звёздные частицы */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(18)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-indigo-300/30 blur-lg animate-pulse"
            style={{
              width: `${8 + Math.random() * 16}px`,
              height: `${8 + Math.random() * 16}px`,
              top: `${Math.random() * 90}%`,
              left: `${Math.random() * 90}%`,
              opacity: 0.3 + Math.random() * 0.5,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      <div className="relative z-10 grid grid-cols-2 gap-5 w-full pt-6">
        {archiveSpirits.map((spirit) => {
          const isActive = useSpiritStore.getState().spirits[0]?.id === spirit.id;
          return (
            <div
              key={spirit.id}
              onClick={() => handleClick(spirit)}
              onMouseEnter={() => setHoveredId(spirit.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`relative flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group`}
            >
              <div className={`rounded-full border-2 shadow-lg mb-2 ${isActive ? 'border-indigo-400 animate-pulse' : 'border-white/20'} bg-zinc-800/70`}>
                <img
                  src={getMoodTexture(spirit.mood)}
                  alt={spirit.essence}
                  className={`w-14 h-14 object-cover rounded-full`}
                />
              </div>
              <div className="text-white text-xs font-semibold text-center truncate w-full">
                {spirit.essence}
              </div>
              {/* Всплывающая карточка при наведении */}
              {hoveredId === spirit.id && (
                <div className="absolute left-1/2 -translate-x-1/2 top-16 w-40 bg-zinc-900/95 rounded-xl shadow-xl p-3 z-20 border border-indigo-400 animate-fade-in-out">
                  <div className="text-white text-sm font-bold mb-1 text-center">{spirit.essence}</div>
                  <div className="text-xs text-indigo-300 italic mb-1 text-center">{spirit.mood} • {spirit.rarity}</div>
                  {spirit.originText && <div className="text-xs text-zinc-400 italic text-center mb-1">«{spirit.originText}»</div>}
                  <div className="flex justify-center gap-2 mt-2">
                    <button className="px-2 py-1 rounded bg-indigo-600 text-white text-xs hover:bg-indigo-500 transition" onClick={() => handleClick(spirit)}>Вызвать</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  )
}
