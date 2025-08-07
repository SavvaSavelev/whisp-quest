// src/App.tsx
import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { DebugPanel } from "./components/Debug/DebugPanel";
import { AnimatedFrame } from "./components/UI/AnimatedFrame";
import { AppLoader } from "./components/UI/AppLoader";
import { DiaryPage } from "./components/UI/DiaryPage";
import { GossipBar } from "./components/UI/GossipBar";
import { SpiritDialogueModal } from "./components/UI/SpiritDialogueModal";
import { SpiritVault } from "./components/UI/SpiritVault";
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

        {!showStorage && <GossipBar />}

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

        {/* Кнопка галактики - рендерим в самом конце для максимального z-index */}
        {!showStorage && (
          <div className="fixed top-6 left-6 z-[9999] pointer-events-auto flex gap-2">
            <button
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium text-sm rounded-lg hover:scale-105 transition-all duration-200 shadow-2xl border-2 border-white/30 backdrop-blur-sm"
              onClick={() => setShowStorage(true)}
              style={{ position: "relative", zIndex: 10000 }}
            >
              🌌 Галактика
            </button>
          </div>
        )}
      </div>
    </AppProviders>
  );
}

export default App;
