import { useUIStore } from './store/uiStore';
import { Suspense, lazy, useState, useEffect } from 'react';
const SpiritAtelier = lazy(() => import('./components/Atelier/SpiritAtelier'));
import { SpiritDialogueModal } from './components/UI/SpiritDialogueModal';
import { DiaryPage } from './components/UI/DiaryPage';
import { GossipBar } from './components/UI/GossipBar';
import { useInitAssets } from './hooks/useInitAssets';
import { useResetGossipOnStorage } from './hooks/useResetGossipOnStorage';
import { SpiritVault } from "./components/UI/SpiritVault";
import { AppLoader } from './components/UI/AppLoader';
import { DebugPanel } from './components/Debug/DebugPanel';
import { AppProviders } from './providers';
import { useAppStore } from './store/appStore';
import { AnimatedFrame } from './components/UI/AnimatedFrame';

function App() {
  const showStorage = useUIStore(state => state.showStorage);
  const setShowStorage = useUIStore(state => state.setShowStorage);
  const debugMode = useAppStore(state => state.debugMode);
  const ready = useInitAssets();
  const [appProgress, setAppProgress] = useState(0);
  const [selectedSpiritForChat, setSelectedSpiritForChat] = useState<string | null>(null);
  
  useResetGossipOnStorage(showStorage);

  // Симуляция загрузки приложения
  useEffect(() => {
    if (!ready) {
      const interval = setInterval(() => {
        setAppProgress(prev => {
          const next = prev + Math.random() * 15;
          return next >= 95 ? 95 : next;
        });
      }, 200);

      return () => clearInterval(interval);
    } else {
      setAppProgress(100);
    }
  }, [ready]);

  // Показываем AppLoader пока приложение не готово
  if (!ready) {
    return (
      <AppProviders config={{ debugMode: import.meta.env.DEV }}>
        <AppLoader 
          isVisible={true}
          progress={appProgress}
          message={
            appProgress < 30 ? "Инициализирую мир духов..." :
            appProgress < 60 ? "Загружаю текстуры..." :
            appProgress < 90 ? "Подготавливаю сцену..." :
            "Почти готово..."
          }
        />
      </AppProviders>
    );
  }

  return (
    <AppProviders config={{ 
      debugMode: import.meta.env.DEV,
      theme: 'dark',
      enableAnalytics: import.meta.env.PROD 
    }}>
      <div className="relative w-screen h-screen overflow-visible">
        <SpiritVault 
          isOpen={showStorage} 
          onClose={() => setShowStorage(false)} 
          onSelectSpiritForChat={(spiritId) => {
            setSelectedSpiritForChat(spiritId);
            // Можно добавить дополнительную логику, например открыть специальный чат на главном экране
          }}
        />
        <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-indigo-400 text-xl">Загрузка сцены...</div>}>
          <SpiritAtelier />
        </Suspense>
        {!showStorage && <GossipBar />}
        
        {/* Индикатор выбранного духа для чата */}
        {selectedSpiritForChat && !showStorage && (
          <AnimatedFrame variant="primary" className="fixed top-6 right-6 z-30 p-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_#4ade80]"></div>
              <span className="text-white text-sm font-medium">Активный дух для беседы</span>
              <button
                onClick={() => setSelectedSpiritForChat(null)}
                className="ml-2 text-gray-400 hover:text-white transition-colors hover:scale-110"
              >
                ✕
              </button>
            </div>
          </AnimatedFrame>
        )}
        
        <SpiritDialogueModal showStorage={showStorage} selectedSpiritId={selectedSpiritForChat} />
        <DiaryPage showStorage={showStorage} />
        
        {/* Debug Panel - показываем только в режиме разработки или если включен debug mode */}
        {(import.meta.env.DEV || debugMode) && (
          <DebugPanel isVisible={true} position="bottom-right" />
        )}
        
        {/* Кнопка галактики - рендерим в самом конце для максимального z-index */}
        {!showStorage && (
          <div className="fixed top-6 left-6 z-[9999] pointer-events-auto">
            <button
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium text-sm rounded-lg hover:scale-105 transition-all duration-200 shadow-2xl border-2 border-white/30 backdrop-blur-sm"
              onClick={() => setShowStorage(true)}
              style={{ 
                position: 'relative',
                zIndex: 10000
              }}
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
