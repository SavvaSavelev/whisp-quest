// src/components/UI/GossipBar.tsx
import { useEffect, useMemo, useState } from "react";
import { getMoodTexture } from "../../lib/getMoodTexture";
import { useSpiritGossipStore } from "../../store/useSpiritGossipStore";

export const GossipBar = () => {
  const gossip = useSpiritGossipStore((s) => s.currentGossip);
  const [index, setIndex] = useState(0);

  // Сначала все хуки, потом проверки
  const messageId = gossip?.messageId || "";

  useEffect(() => {
    setIndex(0);
  }, [messageId]);

  const turns = useMemo(() => {
    if (!gossip) return [] as { speaker: "from" | "to"; text: string }[];
    if (gossip.turns && gossip.turns.length > 1)
      return gossip.turns as { speaker: "from" | "to"; text: string }[];
    const q = gossip.question || gossip.text;
    const a = gossip.answer;
    return [
      q ? { speaker: "from" as const, text: q } : null,
      a ? { speaker: "to" as const, text: a } : null,
    ].filter(Boolean) as { speaker: "from" | "to"; text: string }[];
  }, [gossip]);

  useEffect(() => {
    if (turns.length < 2) return;
    const iv = setInterval(() => setIndex((i) => (i + 1) % turns.length), 3500);
    return () => clearInterval(iv);
  }, [turns.length]);

  // Ранние возвраты после хуков
  if (!gossip) return null;
  if (gossip.from.id === gossip.to.id) return null;
  if (turns.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[50]">
      {/* 🌌 Космическая беседа с парящими мыслями */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-[90vw] max-w-[1100px]">
        {/* Заголовок беседы */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl">
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
            <span className="text-white/80 text-sm font-medium tracking-wider">
              💫 Межпространственный диалог
            </span>
            <div
              className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"
              style={{ animationDelay: "0.5s" }}
            ></div>
          </div>
        </div>

        {/* Парящие реплики */}
        <div className="relative h-32 overflow-hidden">
          {turns.map((turn, i) => {
            const isActive = i === index;
            const isFrom = turn.speaker === "from";
            const xPos = isFrom ? "15%" : "85%";
            const translateX = isFrom ? "0%" : "-100%";

            return (
              <div
                key={i}
                className={`absolute transition-all duration-700 ${
                  isActive
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-20 scale-95 translate-y-4"
                }`}
                style={{
                  left: xPos,
                  transform: `translateX(${translateX})`,
                  top: isActive ? "20%" : "30%",
                }}
              >
                <div
                  className={`floating-thought ${
                    isFrom ? "from-spirit" : "to-spirit"
                  }`}
                >
                  <div className="thought-content">{turn.text}</div>

                  {/* Связь с духом */}
                  <div className="spirit-connection">
                    <img
                      src={getMoodTexture(
                        isFrom ? gossip.from.mood : gossip.to.mood
                      )}
                      alt={isFrom ? gossip.from.essence : gossip.to.essence}
                      className="w-10 h-10 rounded-full border-2 border-white/30 shadow-lg"
                    />
                    <div className="spirit-name">
                      {isFrom ? gossip.from.essence : gossip.to.essence}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Индикатор прогресса */}
        <div className="flex justify-center mt-8">
          <div className="flex gap-3">
            {turns.map((_, i) => (
              <div
                key={i}
                className={`transition-all duration-300 ${
                  i === index
                    ? "w-8 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"
                    : "w-2 h-2 bg-white/20 rounded-full"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
