import { DiaryPage } from "./pages/DiaryPage";
import { WhispPlanet } from "./components/WhispPlanet/WhispPlanet";

function App() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* 🌌 Визуальная сцена — планета, ядро, космос */}
      <WhispPlanet />

      {/* 🧠 Интерфейс: поле ввода, кнопка, карточки духов */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <DiaryPage />
      </div>
    </div>
  );
}

export default App;
