import { getMoodTexture } from '../../lib/getMoodTexture';
import { Spirit } from '../../entities/types';
import { useSpiritStore } from '../../store/spiritStore';
import { useSpiritArchiveStore } from '../../store/useSpiritArchiveStore';

/**
 * Панель хранилища: клик по духу вызывает его в центр, активный дух уходит в архив.
 * Добавлены стили наведения: контур и плавное увеличение.
 */
export const SpiritArchiveBar = () => {
  const archiveSpirits = useSpiritArchiveStore((s) => s.spirits);

  const handleClick = (spirit: Spirit) => {
    const activeStore = useSpiritStore.getState();
    const archiveStore = useSpiritArchiveStore.getState();

    const currentActive = activeStore.spirits[0];

    // Переносим текущего в архив, если он есть и отличается от выбранного
    if (currentActive && currentActive.id !== spirit.id) {
      archiveStore.addSpirit(currentActive);
    }

    // Удаляем выбранного духа из архива
    archiveStore.removeSpirit(spirit.id);

    // Делаем выбранного духа активным
    activeStore.setSpirits([spirit]);
  };

  if (!archiveSpirits.length) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-60 bg-black/70 backdrop-blur-md flex flex-col p-2 space-y-2 overflow-y-auto">
      {archiveSpirits.map((spirit) => (
        <div
          key={spirit.id}
          onClick={() => handleClick(spirit)}
          className="
            flex items-center bg-zinc-800/70 rounded-lg p-2 cursor-pointer
            hover:bg-zinc-700 transition-colors
            hover:ring-2 hover:ring-indigo-500
            transform hover:scale-105 transition-transform duration-200
          "
        >
          <img
            src={getMoodTexture(spirit.mood)}
            alt={spirit.essence}
            className="w-8 h-8 mr-2 rounded-full border border-white/30 shadow"
          />
          <div className="text-white text-xs truncate">{spirit.essence}</div>
        </div>
      ))}
    </div>
  );
};
