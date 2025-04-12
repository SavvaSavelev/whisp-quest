import { useState, useEffect } from "react";
import { useSpiritModalStore } from "../../store/useSpiritModalStore";
import { moodToTexture } from "../../lib/generateSpirit";
import { useSpiritArchiveStore } from "../../store/useSpiritArchiveStore";

export const SpiritDialogueModal = () => {
  const { spirit, isOpen, closeModal } = useSpiritModalStore();
  const addSpirit = useSpiritArchiveStore((s) => s.addSpirit);

  const [userMessage, setUserMessage] = useState("");
  const [chatLog, setChatLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (spirit?.dialogue) {
      setChatLog([spirit.dialogue]);
    } else {
      setChatLog([]);
    }
  }, [spirit]);

  useEffect(() => {
    if (spirit && chatLog.length > 0) {
      addSpirit(spirit, chatLog);
    }
  }, [chatLog]);

  if (!isOpen || !spirit) return null;

  const askSpirit = async () => {
    if (!userMessage.trim()) return;
    setLoading(true);

    const response = await fetch("http://localhost:4000/spirit-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: userMessage,
        mood: spirit.mood,
        essence: spirit.essence,
        history: chatLog,
      }),
    });

    const data = await response.json();
    setChatLog((prev) => [...prev, userMessage, data.reply]);
    setUserMessage("");
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-zinc-900 text-white rounded-2xl shadow-lg p-6 w-[420px] relative border border-white/20 max-h-[90vh] overflow-y-auto">
        <img
          src={moodToTexture[spirit.mood]}
          alt="Spirit"
          className="w-24 h-24 mx-auto mb-4 rounded-full border border-white/30 shadow-md"
        />
        <h2 className="text-xl font-semibold text-center mb-1">{spirit.essence}</h2>
        <p className="text-sm text-center text-zinc-400 mb-4">
          Настроение: <span className="text-white font-medium">{spirit.mood}</span> • Редкость:{" "}
          <span className="text-white font-medium">{spirit.rarity}</span>
        </p>

        <div className="bg-zinc-800 p-3 rounded mb-4 space-y-2 text-sm max-h-60 overflow-y-auto">
          {chatLog.map((msg, idx) => (
            <div
              key={idx}
              className={idx % 2 === 0 ? "text-indigo-300 italic" : "text-white text-right"}
            >
              {msg}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            className="flex-1 px-3 py-1 rounded bg-zinc-700 text-white text-sm"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            placeholder="Спросить духа..."
            onKeyDown={(e) => e.key === "Enter" && askSpirit()}
          />
          <button
            onClick={askSpirit}
            disabled={loading}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded text-sm"
          >
            {loading ? "..." : "Отправить"}
          </button>
        </div>

        <button
          onClick={closeModal}
          className="absolute top-2 right-2 text-sm text-white hover:text-red-300"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
