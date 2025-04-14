import { useSpiritGossipStore } from "../../store/useSpiritGossipStore";

export const GossipOverlay = () => {
  const gossip = useSpiritGossipStore((s) => s.currentGossip);

  if (!gossip) return null;

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 px-6 py-3 bg-black/70 text-white rounded-xl shadow-lg max-w-md text-center text-sm z-50">
      <p>
        <strong>{gossip.from}</strong> ➜ <strong>{gossip.to}</strong>
      </p>
      <p className="italic mt-1 text-indigo-300">{gossip.text}</p>
    </div>
  );
};
