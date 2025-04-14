import { DiaryPage } from "./pages/DiaryPage";
import { WhispPlanet } from "./components/WhispPlanet/WhispPlanet";
import { SpiritDialogueModal } from "./components/UI/SpiritDialogueModal";
import { GhibliBackground } from "./components/UI/GhibliBackground";
import { ParallaxBackground } from "./components/UI/ParallaxBackground";
import { GossipOverlay } from "./components/UI/GossipOverlay";

function App() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* 🍃 Фон */}
      <GhibliBackground />
      <ParallaxBackground />

      {/* 🌌 Планета и духи */}
      <WhispPlanet />

      {/* 💬 Философские диалоги духов */}
      <GossipOverlay />

      {/* 🗣️ Диалог */}
      <SpiritDialogueModal />

      {/* 📜 Интерфейс дневника */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <DiaryPage />
      </div>
    </div>
  );
}

export default App;
