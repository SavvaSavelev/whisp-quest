import { useState } from "react";
import { generateSpirit } from "../lib/generateSpirit";
import { useSpiritStore } from "../store/spiritStore";
import { SpiritCard } from "../components/SpiritCard";

export const DiaryPage = () => {
  const [text, setText] = useState("");
  const spirits = useSpiritStore((state) => state.spirits);
  const addSpirit = useSpiritStore((state) => state.addSpirit);

  const handleSummon = async () => {
    if (!text.trim()) return;
    const spirit = await generateSpirit(text);
    addSpirit(spirit);
    setText("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#9ba4d1] via-[#bfcde0] to-[#f5f7fa] px-4 relative overflow-hidden">

      {/* 👻 Лавовые духи на фоне */}
      <div className="absolute inset-0 z-0 pointer-events-none animate-float-slow bg-[url('/bg-particles.svg')] bg-cover opacity-60 mix-blend-soft-light" />

      {/* 🧚 Волшебные мошки */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="w-[6px] h-[6px] bg-purple-300 rounded-full absolute animate-magic-float opacity-60 blur-[1px]"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${6 + Math.random() * 6}s`,
              transform: `scale(${0.6 + Math.random() * 1.2})`,
            }}
          />
        ))}
      </div>

      {/* 🌟 Карточка ввода */}
      <div className="z-10 w-full max-w-xl p-6 bg-white/30 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/40">
        <h1 className="text-3xl font-semibold text-gray-700 mb-6 text-center tracking-wide drop-shadow-sm">
          ✨ Запиши Мысль ✨
        </h1>

        <textarea
          className="w-full h-44 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-300 outline-none resize-none bg-white/40 backdrop-blur-sm text-gray-800 placeholder:text-gray-500"
          placeholder="Опиши свой день, идею, эмоцию..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button
          onClick={handleSummon}
          className="mt-5 w-full py-3 bg-indigo-400 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg transition-all duration-300"
        >
          Призвать Духа 🌿
        </button>
      </div>

      {/* 👻 Список духов */}
      <div className="z-10 mt-10 grid gap-4 grid-cols-1 sm:grid-cols-2 max-w-4xl w-full">
        {spirits.map((spirit, index) => (
          <SpiritCard
            key={spirit.id}
            spirit={spirit}
            isNew={index === spirits.length - 1}
          />
        ))}
      </div>
    </div>
  );
};
