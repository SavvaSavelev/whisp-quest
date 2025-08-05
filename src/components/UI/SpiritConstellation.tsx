// src/components/UI/SpiritConstellation.tsx
import { useMemo } from 'react';
import { Spirit } from '../../entities/types';
import { getMoodTexture } from '../../lib/getMoodTexture';

interface SpiritConstellationProps {
  readonly spirits: Spirit[];
  readonly mood: string;
  readonly size?: 'small' | 'medium' | 'large';
  readonly onSpiritClick?: (spirit: Spirit) => void;
}

export function SpiritConstellation({ spirits, mood, size = 'medium', onSpiritClick }: SpiritConstellationProps) {
  const spiritsInMood = useMemo(() => {
    return spirits.filter(spirit => spirit.mood === mood);
  }, [spirits, mood]);

  const constellationPattern = useMemo(() => {
    // Создаем паттерн созвездия на основе количества духов
    const count = spiritsInMood.length;
    if (count === 0) return [];
    
    const patterns = {
      1: [{ x: 50, y: 50 }],
      2: [{ x: 30, y: 50 }, { x: 70, y: 50 }],
      3: [{ x: 50, y: 30 }, { x: 30, y: 70 }, { x: 70, y: 70 }],
      4: [{ x: 30, y: 30 }, { x: 70, y: 30 }, { x: 30, y: 70 }, { x: 70, y: 70 }],
      5: [{ x: 50, y: 20 }, { x: 20, y: 40 }, { x: 80, y: 40 }, { x: 35, y: 80 }, { x: 65, y: 80 }],
    };
    
    if (count <= 5) {
      return patterns[count as keyof typeof patterns] || patterns[5];
    }
    
    // Для большего количества создаем круговой паттерн
    const positions = [];
    const radius = 35;
    const angleStep = (2 * Math.PI) / count;
    
    for (let i = 0; i < count; i++) {
      const angle = i * angleStep;
      const x = 50 + Math.cos(angle) * radius;
      const y = 50 + Math.sin(angle) * radius;
      positions.push({ x, y });
    }
    
    return positions;
  }, [spiritsInMood.length]);

  const getSpiritSuffix = (count: number): string => {
    if (count === 1) return '';
    if (count < 5) return 'а';
    return 'ов';
  };

  const sizeClasses = {
    small: 'w-40 h-40',
    medium: 'w-60 h-60',
    large: 'w-80 h-80'
  };

  const spiritSize = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'радостный': return '😊';
      case 'печальный': return '😢';
      case 'злой': return '😠';
      case 'спокойный': return '😌';
      case 'вдохновленный': return '✨';
      default: return '🌟';
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'радостный': return 'from-yellow-400 to-orange-400';
      case 'печальный': return 'from-blue-400 to-indigo-400';
      case 'злой': return 'from-red-400 to-pink-400';
      case 'спокойный': return 'from-green-400 to-emerald-400';
      case 'вдохновленный': return 'from-purple-400 to-violet-400';
      default: return 'from-gray-400 to-slate-400';
    }
  };

  if (spiritsInMood.length === 0) {
    return (
      <div className={`${sizeClasses[size]} relative flex items-center justify-center border-2 border-dashed border-gray-600 rounded-full opacity-50`}>
        <div className="text-center">
          <div className="text-2xl mb-1">{getMoodEmoji(mood)}</div>
          <div className="text-xs text-gray-500">Пусто</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} relative group`}>
      {/* Фон созвездия */}
      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${getMoodColor(mood)} opacity-10 group-hover:opacity-20 transition-opacity`} />
      
      {/* Соединительные линии между духами */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {constellationPattern.map((pos, index) => {
          const nextIndex = (index + 1) % constellationPattern.length;
          const nextPos = constellationPattern[nextIndex];
          
          return (
            <line
              key={`line-${pos.x}-${pos.y}-${nextPos.x}-${nextPos.y}`}
              x1={`${pos.x}%`}
              y1={`${pos.y}%`}
              x2={`${nextPos.x}%`}
              y2={`${nextPos.y}%`}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="1"
              strokeDasharray="2,2"
              className="group-hover:stroke-white/40 transition-all"
            />
          );
        })}
      </svg>
      
      {/* Духи в созвездии */}
      {spiritsInMood.map((spirit, index) => {
        const position = constellationPattern[index] || { x: 50, y: 50 };
        
        return (
          <button
            type="button"
            key={spirit.id}
            className="absolute cursor-pointer transition-all hover:scale-110 hover:z-10 bg-transparent border-none p-0"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: 'translate(-50%, -50%)',
              animationDelay: `${index * 0.2}s`
            }}
            onClick={() => onSpiritClick?.(spirit)}
            aria-label={`Spirit: ${spirit.essence || 'Untitled'}`}
          >
            <div className="relative group/spirit">
              <img
                src={getMoodTexture(spirit.mood)}
                alt={spirit.essence}
                className={`${spiritSize[size]} rounded-full border border-white/30 hover:border-white/60 transition-all shadow-lg`}
              />
              
              {/* Эффект свечения для редких духов */}
              {spirit.rarity === 'легендарный' && (
                <div className="absolute inset-0 rounded-full bg-yellow-400/20 animate-pulse" />
              )}
              {spirit.rarity === 'эпический' && (
                <div className="absolute inset-0 rounded-full bg-purple-400/20 animate-pulse" />
              )}
              
              {/* Тултип с информацией */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover/spirit:opacity-100 transition-opacity bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none z-20">
                {spirit.essence}
              </div>
            </div>
          </button>
        );
      })}
      
      {/* Название созвездия */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-lg">{getMoodEmoji(mood)}</div>
        <div className="text-xs text-gray-400 capitalize">{mood}</div>
        <div className="text-xs text-gray-500">
          {spiritsInMood.length} дух{getSpiritSuffix(spiritsInMood.length)}
        </div>
      </div>
    </div>
  );
}
