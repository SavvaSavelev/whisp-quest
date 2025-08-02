import { useUIStore } from './store/uiStore';
import { Suspense, lazy, useState, useEffect } from 'react';
const SpiritAtelier = lazy(() => import('./components/Atelier/SpiritAtelier'));
import { SpiritDialogueModal } from './components/UI/SpiritDialogueModal';
import { DiaryPage } from './components/UI/DiaryPage';
import { GossipBar } from './components/UI/GossipBar';
import { useInitAssets, useResetGossipOnStorage } from './usecases';
import { SpiritStorageModal } from "./components/UI/SpiritStorageModal";
import { AppLoader } from './components/UI/AppLoader';
import { DebugPanel } from './components/Debug/DebugPanel';
import { AppProviders } from './providers';
import { useAppStore } from './store/appStore';

function App() {
  const showStorage = useUIStore(state => state.showStorage);
  const setShowStorage = useUIStore(state => state.setShowStorage);
  const debugMode = useAppStore(state => state.debugMode);
  const ready = useInitAssets();
  const [appProgress, setAppProgress] = useState(0);
  
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
        
        {/* Debug Panel - показываем только в режиме разработки или если включен debug mode */}
        {(import.meta.env.DEV || debugMode) && (
          <DebugPanel isVisible={true} position="bottom-right" />
        )}
      </div>
    </AppProviders>
  );
}

export default App;
