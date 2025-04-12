import { useState } from "react";
import { generateSpirit } from "../lib/generateSpirit";
import { useSpiritStore } from "../store/spiritStore";

export const DiaryPage = () => {
  const [text, setText] = useState("");
  const addSpirit = useSpiritStore((state) => state.addSpirit);

  const handleSummon = async (e: React.FormEvent) => {
    e.preventDefault(); // ✅ ОТМЕНА submit по умолчанию

    if (!text.trim()) return;
    const spirit = await generateSpirit(text);
    addSpirit(spirit);
    setText("");
  };

  return (
    <form
      onSubmit={handleSummon}
      className="absolute bottom-8 right-8 z-20 w-80 pointer-events-auto"
    >
      <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg border border-white/30">
        <h2 className="text-lg font-medium text-white mb-2 text-center">
          ✍️ Enter your thought
        </h2>
        <textarea
          className="w-full h-24 p-3 rounded-lg border border-white/20 bg-white/10 text-white placeholder:text-gray-300 text-sm resize-none outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder="Describe your day..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          className="mt-3 w-full py-2 text-sm bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition-all"
        >
          Summon Spirit
        </button>
      </div>
    </form>
  );
};
