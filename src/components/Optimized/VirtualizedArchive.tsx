import React, { useMemo, useState, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Spirit } from '../../entities/types';
import { getMoodTexture } from '../../lib/getMoodTexture';
import { useSpiritStore } from '../../store/spiritStore';
import { useSpiritArchiveStore } from '../../store/useSpiritArchiveStore';

interface VirtualizedArchiveProps {
  onSpiritSelect?: () => void;
  itemHeight?: number;
  containerHeight?: number;
}

interface SpiritRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    spirits: Spirit[];
    onSpiritClick: (spirit: Spirit) => void;
  };
}

const SpiritRow: React.FC<SpiritRowProps> = React.memo(({ index, style, data }) => {
  const spirit = data.spirits[index];
  const [isHovered, setIsHovered] = useState(false);

  if (!spirit) return null;

  return (
    <div 
      style={style}
      className="px-4 py-2 border-b border-gray-700 hover:bg-gray-800 transition-colors cursor-pointer"
      onClick={() => data.onSpiritClick(spirit)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-3">
        <img
          src={getMoodTexture(spirit.mood)}
          alt={spirit.essence}
          className={`w-12 h-12 rounded-full border-2 transition-all ${
            isHovered ? 'border-indigo-400 scale-110' : 'border-gray-600'
          }`}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{spirit.essence}</h3>
          <p className="text-sm text-gray-400">
            {spirit.mood} • {spirit.rarity}
          </p>
          {spirit.birthDate && (
            <p className="text-xs text-gray-500">
              {new Date(spirit.birthDate).toLocaleDateString()}
            </p>
          )}
        </div>
        {isHovered && (
          <div className="flex-shrink-0">
            <span className="text-indigo-400 text-lg">→</span>
          </div>
        )}
      </div>
    </div>
  );
});

SpiritRow.displayName = 'SpiritRow';

export const VirtualizedArchive: React.FC<VirtualizedArchiveProps> = ({
  onSpiritSelect,
  itemHeight = 80,
  containerHeight = 400,
}) => {
  const archiveSpirits = useSpiritArchiveStore((s) => s.spirits);
  const { setSpirits } = useSpiritStore();
  const { removeSpirit, addSpirit: addToArchive } = useSpiritArchiveStore();

  // Фильтрация и сортировка духов
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'mood' | 'rarity'>('date');

  const filteredSpirits = useMemo(() => {
    let filtered = archiveSpirits;

    // Фильтрация
    if (filter) {
      filtered = filtered.filter(spirit =>
        spirit.essence.toLowerCase().includes(filter.toLowerCase()) ||
        spirit.mood.toLowerCase().includes(filter.toLowerCase())
      );
    }

    // Сортировка
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.essence.localeCompare(b.essence);
        case 'date':
          return new Date(b.birthDate || 0).getTime() - new Date(a.birthDate || 0).getTime();
        case 'mood':
          return a.mood.localeCompare(b.mood);
        case 'rarity': {
          const rarityOrder = { 'обычный': 1, 'редкий': 2, 'легендарный': 3 };
          return (rarityOrder[b.rarity as keyof typeof rarityOrder] || 0) - 
                 (rarityOrder[a.rarity as keyof typeof rarityOrder] || 0);
        }
        default:
          return 0;
      }
    });
  }, [archiveSpirits, filter, sortBy]);

  const handleSpiritClick = useCallback((spirit: Spirit) => {
    const activeStore = useSpiritStore.getState();
    const currentActive = activeStore.spirits[0];
    
    if (currentActive && currentActive.id !== spirit.id) {
      addToArchive(currentActive);
    }
    
    removeSpirit(spirit.id);
    setSpirits([spirit]);
    
    if (onSpiritSelect) {
      onSpiritSelect();
    }
  }, [removeSpirit, setSpirits, addToArchive, onSpiritSelect]);

  const itemData = useMemo(() => ({
    spirits: filteredSpirits,
    onSpiritClick: handleSpiritClick,
  }), [filteredSpirits, handleSpiritClick]);

  if (filteredSpirits.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        {filter ? 'Духи не найдены' : 'Архив пуст'}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Панель управления */}
      <div className="p-4 bg-gray-900 border-b border-gray-700">
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Поиск духов..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-indigo-400 focus:outline-none"
          />
          
          <div className="flex gap-2">
            <label className="text-sm text-gray-400">Сортировка:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'mood' | 'rarity')}
              className="bg-gray-800 text-white rounded px-2 py-1 text-sm border border-gray-600"
            >
              <option value="date">По дате</option>
              <option value="name">По имени</option>
              <option value="mood">По настроению</option>
              <option value="rarity">По редкости</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-400">
            Найдено: {filteredSpirits.length} из {archiveSpirits.length}
          </div>
        </div>
      </div>

      {/* Виртуализированный список */}
      <List
        height={containerHeight}
        width="100%"
        itemCount={filteredSpirits.length}
        itemSize={itemHeight}
        itemData={itemData}
        overscanCount={5}
      >
        {SpiritRow}
      </List>
    </div>
  );
};
