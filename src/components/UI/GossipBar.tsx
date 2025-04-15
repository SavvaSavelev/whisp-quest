import { useSpiritGossipStore } from "../../store/useSpiritGossipStore";
import { getMoodTexture } from "../../lib/getMoodTexture";

export const GossipBar = () => {
  const gossip = useSpiritGossipStore((s) => s.currentGossip);

  if (!gossip) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/80 text-white px-6 py-4 rounded-xl shadow-lg border border-white/10 backdrop-blur-md flex gap-4 z-40 max-w-[90vw]">
      {/* Первый дух (вопрос) */}
      <div className="flex gap-2 items-start">
        <img
          src={getMoodTexture(gossip.from.mood)}
          alt="from"
          className="w-10 h-10 rounded-full border border-white/20 shadow object-cover"
        />
        <div className="text-sm leading-snug">
          <div className="text-indigo-300 font-semibold">{gossip.from.essence}</div>
          <div className="text-white">{gossip.question}</div>
        </div>
      </div>

      {/* Второй дух (ответ) */}
      <div className="flex gap-2 items-start">
        <img
          src={getMoodTexture(gossip.to.mood)}
          alt="to"
          className="w-10 h-10 rounded-full border border-white/20 shadow object-cover"
        />
        <div className="text-sm leading-snug">
          <div className="text-indigo-300 font-semibold">{gossip.to.essence}</div>
          <div className="text-white">{gossip.answer}</div>
        </div>
      </div>
    </div>
  );
};
