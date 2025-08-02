import { useState } from "react";
import { SpiritAtelier } from './components/Atelier/SpiritAtelier';
import { SpiritDialogueModal } from './components/UI/SpiritDialogueModal';
import { DiaryPage } from './components/UI/DiaryPage';
import { GossipBar } from './components/UI/GossipBar';
import { SpiritArchiveBar } from './components/UI/SpiritArchiveBar';
import { useInitAssets, useResetGossipOnStorage } from './usecases';

function App() {
  const [showStorage, setShowStorage] = useState(false);
  const ready = useInitAssets();
  useResetGossipOnStorage(showStorage);
  if (!ready) return null;

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Новый объёмный фон: SVG + blur + градиенты */}
      <div className="absolute inset-0 -z-10">
        <svg width="100%" height="100%" viewBox="0 0 1920 1080" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <ellipse cx="960" cy="540" rx="700" ry="320" fill="url(#bg1)" opacity="0.35" />
          <ellipse cx="400" cy="200" rx="220" ry="120" fill="url(#bg2)" opacity="0.22" />
          <ellipse cx="1500" cy="900" rx="260" ry="140" fill="url(#bg3)" opacity="0.18" />
          <defs>
            <radialGradient id="bg1" cx="0" cy="0" r="1" gradientTransform="translate(960 540) scale(700 320)" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366f1" />
              <stop offset="1" stopColor="#181826" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="bg2" cx="0" cy="0" r="1" gradientTransform="translate(400 200) scale(220 120)" gradientUnits="userSpaceOnUse">
              <stop stopColor="#22d3ee" />
              <stop offset="1" stopColor="#181826" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="bg3" cx="0" cy="0" r="1" gradientTransform="translate(1500 900) scale(260 140)" gradientUnits="userSpaceOnUse">
              <stop stopColor="#818cf8" />
              <stop offset="1" stopColor="#181826" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 pointer-events-none backdrop-blur-2xl" />
      </div>
      <button
        className="fixed bottom-6 right-6 z-30 px-6 py-3 rounded-full bg-indigo-500 text-white shadow-lg hover:bg-indigo-600 transition-all text-lg font-bold"
        onClick={() => setShowStorage(true)}
      >
        ХРАНИЛИЩЕ
      </button>
      {showStorage && (
        <div
          className="fixed inset-0 z-40 w-screen h-screen"
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowStorage(false);
          }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[24px] z-0 pointer-events-none" />
          <button
            className="absolute bottom-8 right-8 px-7 py-3 rounded-full bg-indigo-600 text-white text-lg font-bold shadow-lg hover:bg-indigo-700 transition z-50"
            onClick={() => setShowStorage(false)}
            aria-label="Выйти из хранилища"
          >
            Выйти
          </button>
          <h2 className="absolute top-8 left-1/2 -translate-x-1/2 text-2xl font-bold text-indigo-300 drop-shadow z-50">Хранилище духов</h2>
          <SpiritArchiveBar floating={true} onSpiritSelect={() => setShowStorage(false)} />
        </div>
      )}
      <SpiritAtelier />
      {!showStorage && <GossipBar />}
      <SpiritDialogueModal showStorage={showStorage} />
      <DiaryPage showStorage={showStorage} />
    </div>
  );
}

export default App;
