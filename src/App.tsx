import { useEffect } from 'react';
import { preloadAllTextures } from './lib/preloadAllAssets';
import { useAssetsReadyStore } from './store/useAssetsReadyStore';
import { useState } from "react";
import { SpiritAtelier } from './components/Atelier/SpiritAtelier';
import { SpiritDialogueModal } from './components/UI/SpiritDialogueModal';
import { DiaryPage } from './components/UI/DiaryPage';
import { GossipBar } from './components/UI/GossipBar';
import { SpiritArchiveBar } from './components/UI/SpiritArchiveBar';
import { useSpiritGossipStore } from './store/useSpiritGossipStore';

function App() {
  const [showStorage, setShowStorage] = useState(false);
  const setGossip = useSpiritGossipStore((s) => s.setGossip);
  useEffect(() => {
    if (showStorage) {
      setGossip(null);
    }
  }, [showStorage, setGossip]);

  const ready = useAssetsReadyStore((s) => s.ready);
  useEffect(() => {
    preloadAllTextures();
    useAssetsReadyStore.getState().setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Кнопка ХРАНИЛИЩЕ */}
      <button
        className="fixed bottom-6 right-6 z-30 px-6 py-3 rounded-full bg-indigo-500 text-white shadow-lg hover:bg-indigo-600 transition-all text-lg font-bold"
        onClick={() => setShowStorage(true)}
      >
        ХРАНИЛИЩЕ
      </button>
      {/* Модальное окно хранилища духов (старая версия) */}
      {showStorage && (
        <div
          className="fixed inset-0 z-40 w-screen h-screen"
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowStorage(false);
          }}
        >
          {/* Блюр и затемнение задника */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[24px] z-0 pointer-events-none" />
          {/* Иконки тем справа вверху (старые) */}
          {/* Кнопка выход ниже иконок тем */}
          <button
            className="absolute bottom-8 right-8 px-7 py-3 rounded-full bg-indigo-600 text-white text-lg font-bold shadow-lg hover:bg-indigo-700 transition z-50"
            onClick={() => setShowStorage(false)}
            aria-label="Выйти из хранилища"
          >
            Выйти
          </button>
          <h2 className="absolute top-8 left-1/2 -translate-x-1/2 text-2xl font-bold text-indigo-300 drop-shadow z-50">Хранилище духов</h2>
          {/* Плавающие духи на всём экране */}
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
