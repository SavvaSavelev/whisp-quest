import { useState } from 'react';
import { generateSpirit } from '../../lib/generateSpirit';
import { useSpiritStore } from '../../store/spiritStore';
import { useSpiritArchiveStore } from '../../store/useSpiritArchiveStore';
import { LoadingButton } from './LoadingButton';
import { SpiritGenerationLoader } from './SpiritGenerationLoader';
import { useLoading } from '../../hooks/useLoading';

/**
 * Создаёт нового духа. Предыдущий активный дух переносится в архив,
 * а новый *не* сохраняется в архиве до замены.
 */
export const DiaryPage = ({ showStorage }: { showStorage?: boolean }) => {
  const [text, setText] = useState('');
  const setSpirits = useSpiritStore((s) => s.setSpirits);
  const addSpiritToArchive = useSpiritArchiveStore((s) => s.addSpirit);
  const { loadingState, simulateSpiritGeneration } = useLoading();
  
  if (showStorage) return null;

  const handleSummonClick = async () => {
    if (!text.trim() || loadingState.isLoading) return;

    // Запускаем анимацию загрузки
    const loadingPromise = simulateSpiritGeneration();
    
    // Одновременно генерируем духа
    const spiritPromise = generateSpirit(text);
    
    // Ждем завершения обеих операций
    const [, newSpirit] = await Promise.all([loadingPromise, spiritPromise]);

    if (newSpirit) {
      // переносим текущего духа в архив (если он есть)
      const current = useSpiritStore.getState().spirits[0];
      if (current) {
        addSpiritToArchive(current);
      }
      // делаем нового духа активным (не добавляем его в архив!)
      setSpirits([newSpirit]);
      setText('');
    }
  };

  const handleSummon = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSummonClick();
  };

  return (
    <>
      {/* Модальное окно загрузки */}
      <SpiritGenerationLoader 
        isVisible={loadingState.isLoading}
        stage={loadingState.stage}
        progress={loadingState.progress}
      />
      
      <form
        onSubmit={handleSummon}
        // центрируем форму по горизонтали у нижнего края
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
      >
        <div className="flex gap-2 items-center bg-zinc-900/80 backdrop-blur-lg rounded-xl px-4 py-3 shadow-lg">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="О чём ты думаешь?.."
            className="bg-zinc-800 text-white text-sm px-3 py-2 rounded w-64 placeholder-zinc-400 outline-none"
            disabled={loadingState.isLoading}
          />
          <LoadingButton
            onClick={handleSummonClick}
            isLoading={loadingState.isLoading}
            loadingText="Призываю..."
            variant="spiritual"
            size="sm"
            disabled={!text.trim()}
          >
            Призвать
          </LoadingButton>
        </div>
      </form>
    </>
  );
};
