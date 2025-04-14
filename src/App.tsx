import { useEffect } from "react";
import { preloadAllTextures } from "./lib/preloadAllAssets";
import { useAssetsReadyStore } from "./store/useAssetsReadyStore";

import { DiaryPage } from "./pages/DiaryPage";
import { WhispPlanet } from "./components/WhispPlanet/WhispPlanet";
import { SpiritDialogueModal } from "./components/UI/SpiritDialogueModal";
import { GhibliBackground } from "./components/UI/GhibliBackground";
import { ParallaxBackground } from "./components/UI/ParallaxBackground";
import { GossipBar } from "./components/UI/GossipBar";

function App() {
  const ready = useAssetsReadyStore((s) => s.ready);

  useEffect(() => {
    preloadAllTextures();
    useAssetsReadyStore.getState().setReady(true);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* 🍃 Волшебный фон */}
      <GhibliBackground />
      <ParallaxBackground />

      {/* 🌌 Планета и духи */}
      {ready && <WhispPlanet />}

      {/* 💬 Диалоги между духами */}
      {ready && <GossipBar />}

      {/* 🗣️ Диалог с выбранным духом */}
      <SpiritDialogueModal />

      {/* 📜 Интерфейс дневника */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <DiaryPage />
      </div>
    </div>
  );
}

export default App;
