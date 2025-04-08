import { useState } from "react";
import { generateSpirit } from "../lib/generateSpirit";
import { useSpiritStore } from "../store/spiritStore";
import { WhispPlanet } from "../components/WhispPlanet";

export const DiaryPage = () => {
  const [text, setText] = useState("");
  // const spirits = useSpiritStore((state) => state.spirits);
  const addSpirit = useSpiritStore((state) => state.addSpirit);

  const handleSummon = async () => {
    if (!text.trim()) return;
    const spirit = await generateSpirit(text);
    addSpirit(spirit);
    setText("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* 🌍 3D-планета духов */}
      <div className="absolute inset-0 z-0">
        <WhispPlanet />
      </div>

      {/* 🌟 Минималистичное окно ввода */}
      <div className="z-10 fixed bottom-8 right-8 w-80 p-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg border border-white/30">
        <h2 className="text-lg font-medium text-gray-100 mb-2 text-center">
          ✍️ Впиши мысль
        </h2>

        <textarea
          className="w-full h-28 p-3 rounded-lg border border-white/20 bg-white/10 text-white placeholder:text-gray-300 text-sm resize-none outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder="Сегодня я чувствую..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button
          onClick={handleSummon}
          className="mt-3 w-full py-2 text-sm bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition-all"
        >
          Призвать Духа
        </button>
      </div>
    </div>
  );
};
