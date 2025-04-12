import { useState } from "react";
import { useSpiritModalStore } from "../../store/useSpiritModalStore";
import { useSpiritArchiveStore } from "../../store/useSpiritArchiveStore";
import { useSpiritStore } from "../../store/spiritStore";
import { moodToTexture } from "../../lib/generateSpirit";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export const SpiritDialogueModal = () => {
  const { spirit, isOpen, closeModal } = useSpiritModalStore();
  const { removeSpirit, clearArchive } = useSpiritArchiveStore();
  const { removeSpirit: removeFromScene, setSpirits } = useSpiritStore();

  const [userMessage, setUserMessage] = useState("");
  const [chatLog, setChatLog] = useState<string[]>(spirit?.dialogue ? [spirit.dialogue] : []);
  const [loading, setLoading] = useState(false);

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
    setChatLog([...chatLog, userMessage, data.reply]);
    setUserMessage("");
    setLoading(false);
  };

  const handleDeleteSpirit = () => {
    removeSpirit(spirit.id);
    removeFromScene(spirit.id);
    closeModal();
  };

  const handleClearAll = () => {
    clearArchive();
    setSpirits([]);
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-zinc-900 text-white rounded-2xl shadow-lg p-6 w-[500px] relative border border-white/20 max-h-[90vh] overflow-y-auto">
        <img
          src={moodToTexture[spirit.mood]}
          alt="Spirit"
          className="w-24 h-24 mx-auto mb-4 rounded-full border border-white/30 shadow-md"
        />
        <h2 className="text-xl font-semibold text-center mb-1">{spirit.essence}</h2>
        <p className="text-sm text-center text-zinc-400 mb-1">
          Настроение: <span className="text-white font-medium">{spirit.mood}</span> • Редкость:{" "}
          <span className="text-white font-medium">{spirit.rarity}</span>
        </p>

        {spirit.birthDate && (
          <p className="text-xs text-zinc-400 text-center mb-1">
            🕯️ Возник {format(new Date(spirit.birthDate), "d MMMM yyyy, HH:mm", { locale: ru })}
          </p>
        )}

        {spirit.originText && (
          <p className="text-xs text-zinc-300 italic text-center mb-4">
            «{spirit.originText}»
          </p>
        )}

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

        <div className="flex gap-2 mb-3">
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

        {/* 🧹 Кнопки удаления */}
        <div className="flex justify-between gap-2 text-sm text-zinc-300 mt-4">
          <button
            onClick={handleDeleteSpirit}
            className="px-3 py-1 rounded bg-zinc-700 hover:bg-red-500 transition-colors"
          >
            🗑️ Удалить духа
          </button>

          <button
            onClick={handleClearAll}
            className="px-3 py-1 rounded bg-zinc-700 hover:bg-red-700 transition-colors"
          >
            ☠️ Удалить всех духов
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
