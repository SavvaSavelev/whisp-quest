import { useEffect, useState } from "react";
import { useSpiritModalStore } from "../../store/useSpiritModalStore";
import { useSpiritArchiveStore } from "../../store/useSpiritArchiveStore";
import { useSpiritStore } from "../../store/spiritStore";
import { moodToTexture } from "../../lib/generateSpirit";
import { format } from "date-fns";

export const SpiritDialogueModal = () => {
  const { spirit, isOpen, closeModal } = useSpiritModalStore();
  const { removeSpirit, clearArchive } = useSpiritArchiveStore.getState();
  const removeFromScene = useSpiritStore((s) => s.removeSpirit);

  const [chatLog, setChatLog] = useState<string[]>([]);
  const [userMessage, setUserMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 💡 Сброс чата при открытии нового духа
  useEffect(() => {
    if (spirit) {
      setChatLog(spirit.dialogue ? [spirit.dialogue] : []);
      setUserMessage("");
    }
  }, [spirit]);

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
        originText: spirit.originText || "",
        birthDate: spirit.birthDate || "",
      }),
    });

    const data = await response.json();
    setChatLog([...chatLog, userMessage, data.reply]);
    setUserMessage("");
    setLoading(false);
  };

  const handleDeleteOne = () => {
    removeSpirit(spirit.id);
    removeFromScene(spirit.id);
    closeModal();
  };

  const handleClearAll = () => {
    clearArchive();
    useSpiritStore.getState().setSpirits([]);
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-zinc-900 text-white rounded-2xl shadow-lg p-6 w-[560px] relative border border-white/20 max-h-[90vh] overflow-y-auto">
        <img
          src={moodToTexture[spirit.mood]}
          alt="Spirit"
          className="w-24 h-24 mx-auto mb-4 rounded-full border border-white/30 shadow-md"
        />
        <h2 className="text-xl font-semibold text-center mb-1">{spirit.essence}</h2>
        <p className="text-sm text-center text-zinc-400 mb-2">
          Настроение: <span className="text-white font-medium">{spirit.mood}</span> • Редкость:{" "}
          <span className="text-white font-medium">{spirit.rarity}</span>
        </p>

        <p className="text-xs text-center text-zinc-500 italic mb-4">
          Появился{" "}
          {spirit.birthDate
            ? format(new Date(spirit.birthDate), "dd MMMM yyyy, HH:mm")
            : "в неуказанное время"}
          <br />
          «{spirit.originText || "без исходного текста"}»
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
            className="flex-1 px-4 py-2 rounded bg-zinc-700 text-white text-sm"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            placeholder="Спросить духа..."
            onKeyDown={(e) => e.key === "Enter" && askSpirit()}
          />
          <button
            onClick={askSpirit}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-sm"
          >
            {loading ? "..." : "Отправить"}
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-2 text-sm text-center">
          <button
            onClick={handleDeleteOne}
            className="text-red-400 hover:text-red-300"
          >
            🗑 Удалить этого духа
          </button>
          <button
            onClick={handleClearAll}
            className="text-red-500 hover:text-red-400"
          >
            🔥 Удалить всех духов
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
