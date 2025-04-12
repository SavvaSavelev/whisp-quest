import { DiaryPage } from "./pages/DiaryPage";
import { WhispPlanet } from "./components/WhispPlanet/WhispPlanet";
import { SpiritDialogueModal } from "./components/UI/SpiritDialogueModal";
import { GhibliBackground } from "./components/UI/GhibliBackground";
import { ParallaxBackground } from "./components/UI/ParallaxBackground";

function App() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* 🍃 Волшебный Ghibli-фон */}
      <GhibliBackground />

      {/* 🌌 Визуальная сцена — планета, ядро, космос */}
      <ParallaxBackground /> {/* 🌌 Фон с параллаксом */}
      <WhispPlanet />

      {/* 🗣️ Диалоговое окно духа */}
      <SpiritDialogueModal />

      {/* 🧠 Интерфейс: поле ввода, кнопка, карточки духов */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <DiaryPage />
      </div>
    </div>
  );
}

export default App;
