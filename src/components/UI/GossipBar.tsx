import { useSpiritGossipStore } from "../../store/useSpiritGossipStore";
import { moodToTexture } from "../../lib/getMoodTexture";

export const GossipBar = () => {
  const gossip = useSpiritGossipStore((s) => s.currentGossip);

  if (!gossip) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/70 text-white px-5 py-3 rounded-xl shadow-lg border border-white/20 backdrop-blur-md flex items-center gap-4 z-40 max-w-[90vw]">
      <img
        src={moodToTexture[gossip.from.mood]}
        alt="from"
        className="w-10 h-10 rounded-full border border-white/30 shadow"
      />
      <div className="text-sm leading-tight">
        <div className="text-indigo-300 font-medium">{gossip.from.essence}</div>
        <div className="text-white">{gossip.question}</div>
        <div className="text-indigo-300 font-medium mt-2">{gossip.to.essence}</div>
        <div className="text-white">{gossip.answer}</div>
      </div>
    </div>
  );
};
