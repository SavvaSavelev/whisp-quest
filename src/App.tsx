import { useEffect } from 'react';
import { preloadAllTextures } from './lib/preloadAllAssets';
import { useAssetsReadyStore } from './store/useAssetsReadyStore';
import { SpiritAtelier } from './components/Atelier/SpiritAtelier';
import { SpiritDialogueModal } from './components/UI/SpiritDialogueModal';
import { DiaryPage } from './components/UI/DiaryPage';
import { GossipBar } from './components/UI/GossipBar';
import { SpiritArchiveBar } from './components/UI/SpiritArchiveBar';

function App() {
  const ready = useAssetsReadyStore((s) => s.ready);

  useEffect(() => {
    preloadAllTextures();
    useAssetsReadyStore.getState().setReady(true);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {ready && <SpiritAtelier />}
      {ready && <GossipBar />}
      <SpiritDialogueModal />
      <DiaryPage />
      <SpiritArchiveBar />
    </div>
  );
}

export default App;
