// src/components/UI/GossipBar.tsx
import { useSpiritGossipStore } from '../../store/useSpiritGossipStore'
import { getMoodTexture } from '../../lib/getMoodTexture'

export const GossipBar = () => {
  const gossip = useSpiritGossipStore((s) => s.currentGossip)
  if (!gossip) return null

  // Собираем две «SMS» в массив, чтобы потом map
  const messages = [
    { spirit: gossip.from, text: gossip.text },
    { spirit: gossip.to,   text: gossip.text },
  ]

  return (
    <div
      className="
        fixed left-1/2 transform -translate-x-1/2
        bottom-32
        z-[60]
        bg-zinc-900/80 backdrop-blur-lg rounded-xl
        px-6 py-4
        flex flex-col        /* ВАЖНО: теперь колоночный flex */
        gap-4                /* расстояние между сообщениями */
        shadow-lg
        max-w-[90%] md:max-w-[800px]  /* ограничим максимальную ширину */
      "
    >
      {messages.map(({ spirit, text }, i) => (
        <div
          key={i}
          className="
            flex items-start gap-3
            bg-zinc-800/70 rounded-lg p-3
          "
        >
          <img
            src={getMoodTexture(spirit.mood)}
            alt={spirit.essence}
            className="w-10 h-10 rounded-full border border-white/30 shadow"
          />
          <div className="text-white text-sm leading-relaxed">
            <span className="font-semibold">{spirit.essence}:</span>{' '}
            {text}
          </div>
        </div>
      ))}
    </div>
  )
}
