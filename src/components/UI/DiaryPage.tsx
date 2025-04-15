import { useState } from "react";
import { generateSpirit } from "../../lib/generateSpirit";
import { useSpiritStore } from "../../store/spiritStore";

export const DiaryPage = () => {
  const [text, setText] = useState("");
  const addSpiritToScene = useSpiritStore((s) => s.addSpirit);

  const handleSummon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newSpirit = await generateSpirit(text);
    if (newSpirit) {
      addSpiritToScene(newSpirit);
      setText(""); // Очищаем поле
    }
  };

  return (
    <form
      onSubmit={handleSummon}
      className="absolute bottom-6 right-6 z-50 pointer-events-auto"
    >
      <div className="flex gap-2 items-center bg-zinc-900/80 backdrop-blur-lg rounded-xl px-4 py-3 shadow-lg">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="О чём ты думаешь?.."
          className="bg-zinc-800 text-white text-sm px-3 py-2 rounded w-64 placeholder-zinc-400 outline-none"
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded text-sm transition"
        >
          Призвать
        </button>
      </div>
    </form>
  );
};
