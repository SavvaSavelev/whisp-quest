// src/components/Atelier/SpiritArchiveBar.tsx
import { useState } from 'react';
import { getMoodTexture } from '../../lib/getMoodTexture'
import { Spirit } from '../../entities/types'
import { useSpiritStore } from '../../store/spiritStore'
import { useSpiritArchiveStore } from '../../store/useSpiritArchiveStore'
import { useSpiritGossipStore } from '../../store/useSpiritGossipStore'

/**
 * Панель хранилища: клик по духу вызывает его в центр, активный дух уходит в архив.
 * Если floating=true — духи плавают по модалке.
 */
interface SpiritArchiveBarProps {
  floating?: boolean;
  onSpiritSelect?: () => void;
}

export const SpiritArchiveBar = ({ floating = false, onSpiritSelect }: SpiritArchiveBarProps) => {
  const archiveSpirits = useSpiritArchiveStore((s) => s.spirits)
  const setGossip      = useSpiritGossipStore((s) => s.setGossip)
  const [themeIdx, setThemeIdx] = useState(0);
  const [draggedId, setDraggedId] = useState<string|null>(null);
  const [order, setOrder] = useState(archiveSpirits.map(s => s.id));
  const [hoveredId, setHoveredId] = useState<string|null>(null);

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

  const [positions] = useState(() =>
    archiveSpirits.map(() => ({
      top: 10 + Math.random() * 70,
      left: 10 + Math.random() * 70,
      duration: 6 + Math.random() * 6,
    }))
  );
  if (!archiveSpirits.length) return null;
  if (!floating) return null;
  // Темы фона (8)
  const themes = [
    {
      name: 'Тёмная',
      class: 'bg-black/40',
    },
    {
      name: 'Градиент',
      class: 'bg-gradient-to-br from-indigo-900/60 via-black/60 to-emerald-900/60',
    },
    {
      name: 'Звёзды',
      class: 'bg-gradient-to-tr from-black/70 to-indigo-900/70',
    },
  ];
  const spiritsOrdered = order.map(id => archiveSpirits.find(s => s.id === id)).filter(Boolean) as typeof archiveSpirits;

  return (
    <div className={`absolute inset-0 z-10 pointer-events-auto transition-all duration-500 ${themes[themeIdx].class}`}>
      {/* Темы в виде минималистичных иконок справа вверху */}
      <div className="absolute top-6 right-8 z-20 flex gap-4">
        <button
          aria-label="Тёмная тема"
          className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${themeIdx===0?'border-indigo-400 bg-zinc-900/80':'border-zinc-700 bg-zinc-800/60'} shadow transition`}
          onClick={()=>setThemeIdx(0)}
        >
          {/* Луна */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15.5 10.5C14.5 14.5 10.5 16.5 7 15.5C4.5 14.5 3 11.5 4 8.5C5 5.5 8.5 4 11.5 5C14.5 6 16 9.5 15.5 10.5Z" stroke="#a5b4fc" strokeWidth="2"/></svg>
        </button>
        <button
          aria-label="Градиент"
          className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${themeIdx===1?'border-indigo-400 bg-gradient-to-br from-indigo-900/80 via-black/80 to-emerald-900/80':'border-zinc-700 bg-zinc-800/60'} shadow transition`}
          onClick={()=>setThemeIdx(1)}
        >
          {/* Градиент */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><defs><linearGradient id="g1" x1="0" y1="0" x2="20" y2="20"><stop stopColor="#6366f1"/><stop offset="1" stopColor="#059669"/></linearGradient></defs><circle cx="10" cy="10" r="8" fill="url(#g1)" stroke="#a5b4fc" strokeWidth="2"/></svg>
        </button>
        <button
          aria-label="Звёзды"
          className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${themeIdx===2?'border-indigo-400 bg-gradient-to-tr from-black/80 to-indigo-900/80':'border-zinc-700 bg-zinc-800/60'} shadow transition`}
          onClick={()=>setThemeIdx(2)}
        >
          {/* Звезда */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><polygon points="10,3 12,8 17,8 13,11 15,16 10,13 5,16 7,11 3,8 8,8" stroke="#a5b4fc" strokeWidth="2" fill="#6366f1"/></svg>
        </button>
      </div>
      {spiritsOrdered.map((spirit, i) => {
        const pos = positions[i] || { top: 20, left: 20, duration: 8 };
        return (
          <div
            key={spirit.id}
            style={{
              position: 'absolute',
              top: `${pos.top}%`,
              left: `${pos.left}%`,
              animation: `floatSpirit ${pos.duration}s ease-in-out infinite alternate`,
              zIndex: 10 + i,
              filter: hoveredId===spirit.id ? 'drop-shadow(0 0 24px #a5b4fc) brightness(1.2)' : 'none',
              transition: 'filter 0.3s',
            }}
            className="flex flex-col items-center justify-center cursor-pointer group"
            draggable
            onDragStart={()=>setDraggedId(spirit.id)}
            onDragEnd={()=>setDraggedId(null)}
            onDragOver={e=>e.preventDefault()}
            onDrop={()=>{
              if (draggedId && draggedId!==spirit.id) {
                const idxFrom = order.indexOf(draggedId);
                const idxTo = order.indexOf(spirit.id);
                const newOrder = [...order];
                newOrder.splice(idxFrom,1);
                newOrder.splice(idxTo,0,draggedId);
                setOrder(newOrder);
              }
            }}
            onMouseEnter={()=>setHoveredId(spirit.id)}
            onMouseLeave={()=>setHoveredId(null)}
            onClick={() => {
              handleClick(spirit);
              if (onSpiritSelect) onSpiritSelect();
            }}
          >
            {/* Glow и партиклы */}
            <div className={`rounded-full border-2 shadow-lg mb-2 border-indigo-300 bg-zinc-800/70 animate-pulse relative`}>
              <img
                src={getMoodTexture(spirit.mood)}
                alt={spirit.essence}
                className="w-14 h-14 object-cover rounded-full"
              />
              {hoveredId===spirit.id && (
                <div className="absolute inset-0 pointer-events-none z-10">
                  {[...Array(12)].map((_,j)=>(
                    <div key={j} className="absolute rounded-full bg-indigo-400/40 blur-md animate-pulse"
                      style={{
                        width:`${6+Math.random()*8}px`,
                        height:`${6+Math.random()*8}px`,
                        top:`${10+Math.random()*80}%`,
                        left:`${10+Math.random()*80}%`,
                        opacity:0.3+Math.random()*0.5,
                        animationDelay:`${Math.random()*2}s`
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="text-white text-xs font-semibold text-center truncate w-full drop-shadow">
              {spirit.essence}
            </div>
          </div>
        );
      })}
      {/* CSS-анимация для левитации духов */}
      <style>{`
        @keyframes floatSpirit {
          0%   { transform: translateY(0px) scale(1); }
          50%  { transform: translateY(-24px) scale(1.08); }
          100% { transform: translateY(0px) scale(1); }
        }
      `}</style>
    </div>
  );
  }

// ...existing code...
