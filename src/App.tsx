// src/App.tsx
import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { DebugPanel } from "./components/Debug/DebugPanel";
import { AIMissionModal } from "./components/UI/AIMissionModal";
import { AnimatedFrame } from "./components/UI/AnimatedFrame";
import { AppLoader } from "./components/UI/AppLoader";
import { DiaryPage } from "./components/UI/DiaryPage";
// Временно закомментировано
// import { GossipBar } from "./components/UI/GossipBar";
import { FloatingTechArchitect } from "./components/UI/FloatingTechArchitect";
import { SpiritDialogueModal } from "./components/UI/SpiritDialogueModal";
import { SpiritVault } from "./components/UI/SpiritVault";
import { TechFeatureModal } from "./components/UI/TechFeatureModal";
import { useInitAssets } from "./hooks/useInitAssets";
import { useResetGossipOnStorage } from "./hooks/useResetGossipOnStorage";
import { AppProviders } from "./providers";
import { useAppStore } from "./store/appStore";
import { useUIStore } from "./store/uiStore";
const SpiritAtelier = lazy(() => import("./components/Atelier/SpiritAtelier"));

// 👇 стриминг чат как основная технология
import { useChatStream } from "./hooks/useChatStream";
import type { Mood } from "./lib/types";

// Функция для определения сообщения загрузки
function getLoadingMessage(progress: number): string {
  if (progress < 30) return "Инициализирую мир духов...";
  if (progress < 60) return "Загружаю текстуры...";
  if (progress < 90) return "Подготавливаю сцену...";
  return "Почти готово...";
}

function App() {
  const showStorage = useUIStore((state) => state.showStorage);
  const setShowStorage = useUIStore((state) => state.setShowStorage);
  const showTechFeatures = useUIStore((state) => state.showTechFeatures);
  const setShowTechFeatures = useUIStore((state) => state.setShowTechFeatures);
  const debugMode = useAppStore((state) => state.debugMode);
  const ready = useInitAssets();
  const [appProgress, setAppProgress] = useState(0);
  const [selectedSpiritForChat, setSelectedSpiritForChat] = useState<
    string | null
  >(null);

  // 👇 локальный кэш сведений о выбранном духе (для подсказок/персоны)
  const [activeSpiritMood, setActiveSpiritMood] = useState<Mood | undefined>(
    undefined
  );
  const [activeSpiritEssence, setActiveSpiritEssence] = useState<
    string | undefined
  >(undefined);
  const [activeSpiritOriginText, setActiveSpiritOriginText] = useState<
    string | undefined
  >(undefined);
  const [activeSpiritBirthDate, setActiveSpiritBirthDate] = useState<
    string | undefined
  >(undefined);

  // 👇 стрим-чат (AAA ощущение "дух печатает")
  const {
    text: streamingText,
    isStreaming,
    error: streamError,
    start: startStream,
    cancel: cancelStream,
    setText,
  } = useChatStream();

  useResetGossipOnStorage(showStorage);

  // Симуляция загрузки приложения
  useEffect(() => {
    if (!ready) {
      const interval = setInterval(() => {
        setAppProgress((prev) => {
          const next = prev + Math.random() * 15;
          return next >= 95 ? 95 : next;
        });
      }, 200);
      return () => clearInterval(interval);
    } else {
      setAppProgress(100);
    }
  }, [ready]);

  // 👇 хендлер выбора духа из Вольта: подтягиваем минимум данных, если нужно
  const handleSelectSpiritForChat = useCallback(async (spiritId: string) => {
    setSelectedSpiritForChat(spiritId);

    // Если у тебя есть стор / API, откуда можно взять мету духа — подтяни:
    // Здесь оставлено как пример — можно заменить на свой источник.
    // Дополнительно: можно хранить в store.byId[spiritId].
    try {
      // Пример: если spirit хранит originText, можно пере-анализ сделать 1 раз
      // чтобы нормализовать mood/essence по свежей схеме (кэш на бэке спасёт):
      // const analyzed = await analyzeText({ text: originText });
      // setActiveSpiritMood(analyzed.mood);
      // setActiveSpiritEssence(analyzed.essence);
      // setActiveSpiritOriginText(originText);
      // setActiveSpiritBirthDate(new Date().toISOString());

      // Пока заглушки (не мешают, но подсказывают модалке как строить персону)
      setActiveSpiritMood(undefined);
      setActiveSpiritEssence(undefined);
      setActiveSpiritOriginText(undefined);
      setActiveSpiritBirthDate(undefined);
    } catch {
      // no-op
    }
  }, []);

  // 👇 запуск стрима в удобном виде для модалки/кнопок
  const startSpiritChatStream = useCallback(
    async (payload: {
      text: string;
      mood?: Mood;
      essence?: string;
      history?: string[];
      originText?: string;
      birthDate?: string;
    }) => {
      // сбрасываем предыдущее, стартуем новое
      setText("");
      await startStream({
        text: payload.text,
        mood: payload.mood ?? activeSpiritMood,
        essence: payload.essence ?? activeSpiritEssence,
        history: payload.history ?? [],
        originText: payload.originText ?? activeSpiritOriginText,
        birthDate: payload.birthDate ?? activeSpiritBirthDate,
      });
    },
    [
      startStream,
      setText,
      activeSpiritMood,
      activeSpiritEssence,
      activeSpiritOriginText,
      activeSpiritBirthDate,
    ]
  );

  // Показываем AppLoader пока приложение не готово
  if (!ready) {
    return (
      <AppProviders config={{ debugMode: import.meta.env.DEV }}>
        <AppLoader
          isVisible={true}
          progress={appProgress}
          message={getLoadingMessage(appProgress)}
        />
      </AppProviders>
    );
  }

  return (
    <AppProviders
      config={{
        debugMode: import.meta.env.DEV,
        theme: "dark",
        enableAnalytics: import.meta.env.PROD,
      }}
    >
      <div className="relative w-screen h-screen overflow-visible">
        <SpiritVault
          isOpen={showStorage}
          onClose={() => setShowStorage(false)}
          onSelectSpiritForChat={handleSelectSpiritForChat}
        />

        <Suspense
          fallback={
            <div className="absolute inset-0 flex items-center justify-center text-indigo-400 text-xl">
              Загрузка сцены...
            </div>
          }
        >
          <SpiritAtelier />
        </Suspense>

        {/* Временно закомментировано - не нравится идея
        {!showStorage && <GossipBar />}
        */}

        {/* Индикатор выбранного духа для чата */}
        {selectedSpiritForChat && !showStorage && (
          <AnimatedFrame
            variant="primary"
            className="fixed top-6 right-6 z-30 p-3"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 ${
                  isStreaming ? "bg-amber-400" : "bg-green-400"
                } rounded-full animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.9)]`}
              ></div>
              <span className="text-white text-sm font-medium">
                {isStreaming ? "Дух отвечает…" : "Активный дух для беседы"}
              </span>
              <button
                onClick={() => setSelectedSpiritForChat(null)}
                className="ml-2 text-gray-400 hover:text-white transition-colors hover:scale-110"
                title="Снять выделение духа"
              >
                ✕
              </button>
            </div>
          </AnimatedFrame>
        )}

        {/* 👇 Модалка диалога теперь умеет стрим — передаём все контроллеры */}
        <SpiritDialogueModal
          showStorage={showStorage}
          selectedSpiritId={selectedSpiritForChat}
          // Новые пропы для стрима:
          onStreamStart={startSpiritChatStream}
          onStreamCancel={cancelStream}
          isStreaming={isStreaming}
          streamingText={streamingText}
          streamError={streamError || undefined}
          // Подсказки по персоне духа (опционально)
          persona={{
            mood: activeSpiritMood,
            essence: activeSpiritEssence,
            originText: activeSpiritOriginText,
            birthDate: activeSpiritBirthDate,
          }}
        />

        <DiaryPage showStorage={showStorage} />

        {/* Debug Panel - показываем только в режиме разработки или если включен debug mode */}
        {(import.meta.env.DEV || debugMode) && (
          <DebugPanel isVisible={true} position="bottom-right" />
        )}

        {/* Кнопки действий - рендерим в самом конце для максимального z-index */}
        {!showStorage && !showTechFeatures && (
          <div className="fixed top-6 left-6 z-[9999] pointer-events-auto flex gap-3">
            <GalaxyLauncher />
            <VaultTechLauncher />
            <AIMissionLauncher />
          </div>
        )}

        {/* TechFeature модалка */}
        <TechFeatureModal
          show={showTechFeatures}
          onClose={() => setShowTechFeatures(false)}
        />

        {/* Floating Tech Architect - показывается только когда открыто тех хранилище */}
        {showTechFeatures && <FloatingTechArchitect />}

        {/* Модалка AI‑миссии */}
        <AIMissionModal />
      </div>
    </AppProviders>
  );
}

export default App;

// 🌌 GALAXY LAUNCHER - КИБЕР ГАЛАКТИКА!
const GalaxyLauncher: React.FC = () => {
  const setShowStorage = useUIStore((s) => s.setShowStorage);
  return (
    <button
      className="group relative px-5 py-3 text-white font-bold text-sm rounded-xl hover:scale-105 transition-all duration-300 shadow-2xl border-2 backdrop-blur-md overflow-hidden"
      onClick={() => setShowStorage(true)}
      style={{
        position: "relative",
        zIndex: 10000,
        background:
          "linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #3730a3 50%, #1d4ed8 75%, #2563eb 100%)",
        borderImage: "linear-gradient(45deg, #60a5fa, #a78bfa, #f472b6) 1",
        boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)",
      }}
      title="Открыть Галактику Духов"
    >
      {/* Звёздное поле */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${1 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Анимированный неоновый градиент */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 animate-pulse transition-opacity duration-300" />

      <div className="relative z-10 flex items-center gap-2">
        <span
          className="text-xl animate-spin"
          style={{ animationDuration: "3s" }}
        >
          🌌
        </span>
        <span className="font-mono uppercase tracking-wider">
          Neural Galaxy
        </span>
        <span className="text-lg animate-bounce">✨</span>
      </div>
    </button>
  );
};

// Локальная кнопка‑ланчер для AI‑миссии (отдельно, чтобы не засорять компонент App)
const AIMissionLauncher: React.FC = () => {
  const setShowMission = useUIStore((s) => s.setShowMission);
  return (
    <button
      className="group relative px-5 py-3 text-white font-bold text-sm rounded-xl hover:scale-105 transition-all duration-300 shadow-2xl border-2 backdrop-blur-md overflow-hidden"
      onClick={() => setShowMission(true)}
      style={{
        position: "relative",
        zIndex: 10000,
        background:
          "linear-gradient(135deg, #065f46 0%, #047857 25%, #059669 50%, #10b981 75%, #34d399 100%)",
        borderImage: "linear-gradient(45deg, #6ee7b7, #34d399, #a7f3d0) 1",
        boxShadow: "0 0 30px rgba(52, 211, 153, 0.5)",
      }}
      title="Запустить AI‑миссию"
    >
      {/* Нейронная сеть фон */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full">
          {[...Array(8)].map((_, i) => (
            <circle
              key={i}
              cx={`${20 + (i % 3) * 30}%`}
              cy={`${30 + Math.floor(i / 3) * 30}%`}
              r="2"
              fill="currentColor"
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </svg>
      </div>

      {/* Анимированный блеск */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine" />

      <div className="relative z-10 flex items-center gap-2">
        <span className="text-lg animate-bounce">🚀</span>
        <span className="font-mono uppercase tracking-wider">AI Mission</span>
        <span className="text-lg animate-pulse">🤖</span>
      </div>
    </button>
  );
};

// 🚀 VAULT TECH LAUNCHER - МЕГА ЭПИЧНАЯ КНОПКА!
const VaultTechLauncher: React.FC = () => {
  const setShowTechFeatures = useUIStore((s) => s.setShowTechFeatures);
  return (
    <button
      className="group relative px-5 py-3 text-white font-bold text-sm rounded-xl hover:scale-105 transition-all duration-300 shadow-2xl border-2 backdrop-blur-md overflow-hidden"
      onClick={() => setShowTechFeatures(true)}
      style={{
        position: "relative",
        zIndex: 10000,
        background:
          "linear-gradient(135deg, #7c2d12 0%, #dc2626 25%, #ea580c 50%, #f59e0b 75%, #eab308 100%)",
        borderImage: "linear-gradient(45deg, #fbbf24, #f59e0b, #dc2626) 1",
        boxShadow: "0 0 30px rgba(245, 158, 11, 0.5)",
      }}
      title="Открыть VAULT TECH"
    >
      {/* Кибер-сетка фон */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
        `,
          backgroundSize: "8px 8px",
        }}
      />

      {/* Анимированный блеск */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine" />

      <div className="relative z-10 flex items-center gap-2">
        <span className="text-lg animate-bounce">⚡</span>
        <span className="font-mono uppercase tracking-wider">Vault Tech</span>
        <span className="text-lg animate-pulse">🧠</span>
      </div>
    </button>
  );
};
