// src/components/UI/GossipBar.tsx
import { useSpiritGossipStore } from '../../store/useSpiritGossipStore'
import { getMoodTexture } from '../../lib/getMoodTexture'

export const GossipBar = () => {
  const gossip = useSpiritGossipStore((s) => s.currentGossip);
  if (!gossip) return null;
  if (gossip.from.id === gossip.to.id) return null;

  // Показываем только answer, если есть, иначе question
  const message = gossip.answer || gossip.question || gossip.text;
  if (!message) return null;

  return (
    <div
      className="
        fixed left-1/2 transform -translate-x-1/2
        bottom-32
        z-[60]
        bg-zinc-900/80 backdrop-blur-lg rounded-xl
        px-6 py-4
        flex flex-col
        gap-4
        shadow-lg
        max-w-[90%] md:max-w-[800px]
      "
    >
      <div className="flex items-start gap-3 bg-zinc-800/70 rounded-lg p-3">
        <img
          src={getMoodTexture(gossip.from.mood)}
          alt={gossip.from.essence}
          className="w-10 h-10 rounded-full border border-white/30 shadow"
        />
        <div className="text-white text-sm leading-relaxed">
          <span className="font-semibold">{gossip.from.essence} → {gossip.to.essence}:</span>{' '}
          {message}
        </div>
      </div>
    </div>
  );
}
