// src/components/UI/GossipBar.tsx
import { useSpiritGossipStore } from '../../store/useSpiritGossipStore';
import { getMoodTexture } from '../../lib/getMoodTexture';

export const GossipBar = () => {
  const gossip = useSpiritGossipStore((s) => s.currentGossip);
  if (!gossip) return null;

  return (
    <div
      className="
        fixed left-1/2 transform -translate-x-1/2
        bottom-32          /* опустили до ~8rem от низа */
        z-[60]
        bg-zinc-900/80
        backdrop-blur-lg
        rounded-xl
        px-6 py-4
        flex items-start gap-8
        shadow-lg
      "
    >
      {/* Первый дух (вопрос) */}
      <div className="flex items-start gap-3">
        <img
          src={getMoodTexture(gossip.from.mood)}
          alt={gossip.from.essence}
          className="w-10 h-10 rounded-full border border-white/30 shadow"
        />
        <div className="text-white text-sm">
          <span className="font-semibold">{gossip.from.essence}:</span>{' '}
          {gossip.question}
        </div>
      </div>

      {/* Второй дух (ответ) */}
      <div className="flex items-start gap-3">
        <img
          src={getMoodTexture(gossip.to.mood)}
          alt={gossip.to.essence}
          className="w-10 h-10 rounded-full border border-white/30 shadow"
        />
        <div className="text-white text-sm">
          <span className="font-semibold">{gossip.to.essence}:</span>{' '}
          {gossip.answer}
        </div>
      </div>
    </div>
  );
};
