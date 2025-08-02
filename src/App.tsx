import { useUIStore } from './store/uiStore';
import { Suspense, lazy } from 'react';
const SpiritAtelier = lazy(() => import('./components/Atelier/SpiritAtelier'));
import { SpiritDialogueModal } from './components/UI/SpiritDialogueModal';
import { DiaryPage } from './components/UI/DiaryPage';
import { GossipBar } from './components/UI/GossipBar';
import { useInitAssets, useResetGossipOnStorage } from './usecases';
import { SpiritStorageModal } from "./components/UI/SpiritStorageModal";

function App() {
  const showStorage = useUIStore(state => state.showStorage);
  const setShowStorage = useUIStore(state => state.setShowStorage);
  const ready = useInitAssets();
  useResetGossipOnStorage(showStorage);
  if (!ready) return null;

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <SpiritStorageModal show={showStorage} onClose={() => setShowStorage(false)} />
      <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-indigo-400 text-xl">Загрузка сцены...</div>}>
        <SpiritAtelier />
      </Suspense>
      {!showStorage && <GossipBar />}
      <SpiritDialogueModal showStorage={showStorage} />
      <DiaryPage showStorage={showStorage} />
      <button
        className="fixed bottom-6 right-6 z-30 px-6 py-3 rounded-full bg-indigo-500 text-white shadow-lg hover:bg-indigo-600 transition-all text-lg font-bold"
        onClick={() => setShowStorage(true)}
      >
        ХРАНИЛИЩЕ
      </button>
    </div>
  );
}

export default App;
