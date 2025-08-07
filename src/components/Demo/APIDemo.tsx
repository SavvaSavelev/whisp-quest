import { useState } from "react";
import { useChatStream } from "../../hooks/useChatStream";
import { analyzeText, spiritChat } from "../../lib/api";
import type { AnalyzeResponse, Mood } from "../../lib/types";

export default function APIDemo() {
  const [input, setInput] = useState("");
  const [spirit, setSpirit] = useState<AnalyzeResponse | null>(null);
  const [mood, setMood] = useState<Mood>("меланхоличный");

  const {
    text: streamText,
    isStreaming,
    error,
    start,
    cancel,
  } = useChatStream();

  return (
    <div className="p-4 space-y-3 text-sm">
      <h1 className="text-xl font-semibold">Whisp Quest — Demo API v2.2</h1>

      <div className="space-y-2 p-3 rounded bg-zinc-900">
        <div className="flex gap-2">
          <input
            className="flex-1 bg-zinc-800 rounded p-2 outline-none text-white"
            placeholder="Напиши мысль, из которой родится дух…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            className="px-3 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors"
            onClick={async () => {
              try {
                const res = await analyzeText({ text: input });
                setSpirit(res);
                setMood(res.mood);
              } catch (err) {
                alert(`Ошибка создания духа: ${err}`);
              }
            }}
            disabled={!input.trim()}
          >
            Призвать
          </button>
        </div>

        {spirit && (
          <div className="rounded p-3 bg-black/40">
            <div className="font-medium">✨ {spirit.essence}</div>
            <div className="opacity-80">
              {spirit.mood} · {spirit.rarity} ·{" "}
              <span style={{ color: spirit.color }}>{spirit.color}</span>
            </div>
            <div className="mt-2 italic">— {spirit.dialogue}</div>

            <div className="mt-3 flex gap-2 flex-wrap">
              <button
                className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors"
                onClick={async () => {
                  try {
                    // обычный не-стримовый ответ
                    const r = await spiritChat({
                      text: "ну привет",
                      mood,
                      essence: spirit.essence,
                    });
                    alert(`Ответ духа: ${r.reply}`);
                  } catch (err) {
                    alert(`Ошибка чата: ${err}`);
                  }
                }}
              >
                Спросить (без стрима)
              </button>

              <button
                className="px-3 py-2 rounded bg-white text-black hover:bg-gray-200 transition-colors disabled:opacity-50"
                onClick={() =>
                  start({
                    text: "давай поговорим по душам",
                    mood,
                    essence: spirit.essence,
                  })
                }
                disabled={isStreaming}
              >
                {isStreaming ? "Дух отвечает…" : "Спросить (стрим)"}
              </button>

              {isStreaming && (
                <button
                  className="px-3 py-2 rounded bg-red-600 hover:bg-red-700 transition-colors"
                  onClick={cancel}
                >
                  Прервать
                </button>
              )}
            </div>

            {error && (
              <div className="text-red-400 mt-2">Ошибка стрима: {error}</div>
            )}
            {streamText && (
              <div className="mt-2 p-2 rounded bg-zinc-800 whitespace-pre-wrap text-green-300">
                {streamText}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="text-xs opacity-60">
        <div>
          🔗 API Base:{" "}
          {import.meta.env.VITE_API_BASE || "http://localhost:3001"}
        </div>
        <div>
          📡 Endpoints: /api/v1/analyze, /api/v1/spirit-chat,
          /api/v1/spirit-chat/stream
        </div>
      </div>
    </div>
  );
}
