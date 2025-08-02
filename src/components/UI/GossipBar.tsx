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
    <div className="fixed left-1/2 transform -translate-x-1/2 bottom-32 z-[60] max-w-[90%] md:max-w-[800px]">
      <div className="bg-black/50 backdrop-blur-md border border-white/20 rounded-lg p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 bg-black/30 rounded-lg p-3 border border-white/10">
            <img
              src={getMoodTexture(gossip.from.mood)}
              alt={gossip.from.essence}
              className="w-10 h-10 rounded-full border-2 border-purple-400/50"
            />
            <div className="flex-1">
              <div className="text-purple-300 font-bold text-sm mb-1">
                {gossip.from.essence}
              </div>
              <div className="text-white/90 text-sm leading-relaxed">
                {message}
              </div>
            </div>
            <img
              src={getMoodTexture(gossip.to.mood)}
              alt={gossip.to.essence}
              className="w-10 h-10 rounded-full border-2 border-blue-400/50"
            />
          </div>
          
          {/* Индикатор типа сообщения */}
          <div className="flex justify-center">
            <div className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full text-xs text-white/70 border border-white/20">
              💬 Духовная беседа
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
