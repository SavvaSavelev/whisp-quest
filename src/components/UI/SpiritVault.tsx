// src/components/UI/SpiritVault.tsx
import { format } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getMoodTexture } from "../../lib/getMoodTexture";
import { useSpiritArchiveStore } from "../../store/useSpiritArchiveStore";
import { useSpiritModalStore } from "../../store/useSpiritModalStore";
import { SpiritConstellation } from "./SpiritConstellation";

interface SpiritVaultProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSelectSpiritForChat?: (spiritId: string) => void;
}

export function SpiritVault({
  isOpen,
  onClose,
  onSelectSpiritForChat,
}: SpiritVaultProps) {
  const { spirits, clearArchive } = useSpiritArchiveStore();
  const { openModal } = useSpiritModalStore();

  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "rarity" | "mood">("recent");
  const [viewMode, setViewMode] = useState<
    "galaxy" | "grid" | "list" | "constellations"
  >("galaxy");
  const [selectedSpirit, setSelectedSpirit] = useState<string | null>(null);
  const [galaxySpeed, setGalaxySpeed] = useState(1);
  const [showConnections, setShowConnections] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteSpirits, setFavoriteSpirits] = useState<Set<string>>(
    new Set()
  );

  const getViewModeIcon = (mode: string): string => {
    switch (mode) {
      case "galaxy":
        return "🌌";
      case "constellations":
        return "⭐";
      case "grid":
        return "⊞";
      default:
        return "≡";
    }
  };

  const getViewModeLabel = (mode: string): string => {
    switch (mode) {
      case "galaxy":
        return "Галактика";
      case "constellations":
        return "Созвездия";
      case "grid":
        return "Сетка";
      default:
        return "Список";
    }
  };

  // Звуковые эффекты при взаимодействии
  const playInteractionSound = useCallback(
    (type: "select" | "hover" | "favorite" | "teleport") => {
      const audioContext = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      switch (type) {
        case "select":
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(
            880,
            audioContext.currentTime + 0.2
          );
          break;
        case "hover":
          oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(
            330,
            audioContext.currentTime + 0.1
          );
          break;
        case "favorite":
          oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(
            659,
            audioContext.currentTime + 0.15
          );
          break;
        case "teleport":
          oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(
            1760,
            audioContext.currentTime + 0.3
          );
          break;
      }

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    },
    []
  );

  // Анимация появления галактики
  useEffect(() => {
    if (isOpen && viewMode === "galaxy") {
      playInteractionSound("teleport");
    }
  }, [isOpen, viewMode, playInteractionSound]);

  // Фильтрация и сортировка духов
  const filteredSpirits = useMemo(() => {
    let filtered = [...spirits];

    // Поиск по тексту
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (spirit) =>
          spirit.essence.toLowerCase().includes(query) ||
          spirit.mood.toLowerCase().includes(query) ||
          spirit.rarity.toLowerCase().includes(query) ||
          spirit.originText?.toLowerCase().includes(query)
      );
    }

    // Фильтр
    if (filter === "favorites") {
      filtered = filtered.filter((spirit) => favoriteSpirits.has(spirit.id));
    } else if (filter !== "all") {
      filtered = filtered.filter(
        (spirit) => spirit.mood === filter || spirit.rarity === filter
      );
    }

    // Сортировка
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return (
            new Date(b.birthDate || 0).getTime() -
            new Date(a.birthDate || 0).getTime()
          );
        case "rarity": {
          const rarityOrder = {
            легендарный: 4,
            эпический: 3,
            редкий: 2,
            обычный: 1,
          };
          return (
            (rarityOrder[b.rarity as keyof typeof rarityOrder] || 1) -
            (rarityOrder[a.rarity as keyof typeof rarityOrder] || 1)
          );
        }
        case "mood":
          return a.mood.localeCompare(b.mood);
        default:
          return 0;
      }
    });

    return filtered;
  }, [spirits, filter, sortBy, searchQuery, favoriteSpirits]);

  // Статистика
  const stats = useMemo(() => {
    const total = spirits.length;
    const byRarity = spirits.reduce((acc, spirit) => {
      acc[spirit.rarity] = (acc[spirit.rarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byMood = spirits.reduce((acc, spirit) => {
      acc[spirit.mood] = (acc[spirit.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, byRarity, byMood };
  }, [spirits]);

  if (!isOpen) return null;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "легендарный":
        return "from-yellow-400 to-orange-500";
      case "эпический":
        return "from-purple-500 to-pink-500";
      case "редкий":
        return "from-blue-500 to-cyan-500";
      default:
        return "from-green-500 to-emerald-500";
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case "легендарный":
        return "shadow-[0_0_30px_#ffd700,0_0_60px_#ffd700]";
      case "эпический":
        return "shadow-[0_0_25px_#9333ea,0_0_50px_#9333ea]";
      case "редкий":
        return "shadow-[0_0_20px_#3b82f6,0_0_40px_#3b82f6]";
      default:
        return "shadow-[0_0_15px_#10b981,0_0_30px_#10b981]";
    }
  };

  return (
    <>
      <style>{`
        @keyframes vaultAppear {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes spiritFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(5deg); }
          50% { transform: translateY(-5px) rotate(0deg); }
          75% { transform: translateY(-15px) rotate(-5deg); }
        }
        
        @keyframes galaxyOrbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        .vault-appear {
          animation: vaultAppear 0.5s ease-out;
        }
        
        .spirit-float {
          animation: spiritFloat 4s ease-in-out infinite;
        }
        
        .galaxy-orbit {
          animation: galaxyOrbit 60s linear infinite;
        }
        
        .star-twinkle {
          animation: starTwinkle 2s ease-in-out infinite;
        }
        
        .cosmic-bg {
          background: 
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%),
            linear-gradient(135deg, #0c0c1e 0%, #1a1a2e 50%, #16213e 100%);
        }
        
        .spirit-card-hover {
          transition: all 0.3s ease;
        }
        
        .spirit-card-hover:hover {
          transform: translateY(-10px) scale(1.05);
        }
      `}</style>

      <div className="fixed inset-0 z-50 cosmic-bg">
        <div className="vault-appear h-full flex flex-col">
          {/* Космические звезды на фоне */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 50 }, (_, i) => (
              <div
                key={`star-${i}`}
                className="absolute w-1 h-1 bg-white rounded-full star-twinkle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>

          {/* Компактная шапка */}
          <div className="relative z-10 p-4 bg-black/50 backdrop-blur-md border-b border-white/20">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  🌌 Хранилище
                </h1>
                <div className="text-slate-300 text-sm">
                  {stats.total} духов • ❤️ {favoriteSpirits.size} избранных
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-white rounded-lg border border-red-400/30 hover:border-red-400/60 transition-all backdrop-blur-sm"
              >
                ✕ Закрыть
              </button>
            </div>
          </div>

          {/* Компактная панель управления */}
          <div className="relative z-10 p-3 bg-black/20 backdrop-blur-sm border-b border-white/10">
            <div className="flex flex-wrap gap-3 items-center justify-between text-sm">
              {/* Поиск */}
              <div className="flex gap-2 items-center">
                <span className="text-slate-300 text-sm">🔍</span>
                <input
                  type="text"
                  placeholder="Поиск духов..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-800/50 text-white px-3 py-1 rounded-lg border border-slate-600/50 text-sm backdrop-blur-sm placeholder-slate-400 min-w-[200px]"
                />
              </div>

              {/* Фильтры */}
              <div className="flex gap-2 items-center">
                <span className="text-slate-300 text-sm">Фильтр:</span>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-slate-800/50 text-white px-3 py-1 rounded-lg border border-slate-600/50 text-sm backdrop-blur-sm"
                >
                  <option value="all">Все духи</option>
                  <option value="легендарный">Легендарные</option>
                  <option value="эпический">Эпические</option>
                  <option value="редкий">Редкие</option>
                  <option value="обычный">Обычные</option>
                  <option value="радостный">Радостные</option>
                  <option value="печальный">Печальные</option>
                  <option value="злой">Злые</option>
                  <option value="спокойный">Спокойные</option>
                </select>

                {favoriteSpirits.size > 0 && (
                  <button
                    onClick={() =>
                      setFilter(filter === "favorites" ? "all" : "favorites")
                    }
                    className={`px-3 py-1 rounded-lg text-sm transition-all ml-2 ${
                      filter === "favorites"
                        ? "bg-red-500/30 text-red-300 border border-red-400/50"
                        : "bg-slate-800/30 text-slate-400 border border-slate-600/30 hover:bg-slate-700/50"
                    }`}
                  >
                    ❤️ {filter === "favorites" ? "Все" : "Избранные"}
                  </button>
                )}
              </div>

              {/* Сортировка */}
              <div className="flex gap-2 items-center">
                <span className="text-slate-300 text-sm">Сортировка:</span>
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "recent" | "rarity" | "mood")
                  }
                  className="bg-slate-800/50 text-white px-3 py-1 rounded-lg border border-slate-600/50 text-sm backdrop-blur-sm"
                >
                  <option value="recent">По дате</option>
                  <option value="rarity">По редкости</option>
                  <option value="mood">По настроению</option>
                </select>
              </div>

              {/* Режим отображения */}
              <div className="flex gap-2">
                {(["galaxy", "constellations", "grid", "list"] as const).map(
                  (mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`px-3 py-1 rounded-lg text-sm transition-all ${
                        viewMode === mode
                          ? "bg-blue-500/30 text-blue-300 border border-blue-400/50"
                          : "bg-slate-800/30 text-slate-400 border border-slate-600/30 hover:bg-slate-700/50"
                      }`}
                    >
                      {getViewModeIcon(mode)} {getViewModeLabel(mode)}
                    </button>
                  )
                )}
              </div>

              {/* Дополнительные контролы для галактики */}
              {viewMode === "galaxy" && (
                <div className="flex gap-2 items-center bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-600/30">
                  <span className="text-slate-300 text-sm">⚡</span>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={galaxySpeed}
                    onChange={(e) => setGalaxySpeed(Number(e.target.value))}
                    className="w-20 accent-blue-500"
                  />
                  <span className="text-xs text-slate-400">{galaxySpeed}x</span>

                  <button
                    onClick={() => setShowConnections(!showConnections)}
                    className={`px-2 py-1 rounded text-xs transition-all ${
                      showConnections
                        ? "bg-purple-500/30 text-purple-300 border border-purple-400/50"
                        : "bg-slate-800/30 text-slate-400 border border-slate-600/30"
                    }`}
                  >
                    {showConnections ? "🌐" : "🔗"}
                  </button>
                </div>
              )}

              {/* Очистить все */}
              {spirits.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // Случайный телепорт к духу
                      const randomSpirit =
                        filteredSpirits[
                          Math.floor(Math.random() * filteredSpirits.length)
                        ];
                      if (randomSpirit) {
                        setSelectedSpirit(randomSpirit.id);
                        playInteractionSound("teleport");
                        openModal(randomSpirit);
                      }
                    }}
                    className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 rounded-lg border border-purple-400/30 hover:border-purple-400/60 transition-all text-sm backdrop-blur-sm"
                  >
                    🌀 Случайный дух
                  </button>

                  <button
                    onClick={() => {
                      if (
                        confirm(
                          "Удалить всех духов? Это действие нельзя отменить!"
                        )
                      ) {
                        clearArchive();
                      }
                    }}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg border border-red-400/30 hover:border-red-400/60 transition-all text-sm backdrop-blur-sm"
                  >
                    🗑️ Очистить всё
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Содержимое */}
          <div
            className={`flex-1 relative z-10 p-6 overflow-y-auto ${
              viewMode === "galaxy" ? "flex items-center justify-center" : ""
            }`}
          >
            {filteredSpirits.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-6xl mb-4">👻</div>
                <h3 className="text-xl text-slate-300 mb-2">
                  Пусто как в космосе
                </h3>
                <p className="text-slate-400">
                  {spirits.length === 0
                    ? "Создайте своего первого духа!"
                    : "Ни один дух не соответствует фильтру"}
                </p>
              </div>
            ) : (
              <>
                {/* Режим галактики */}
                {viewMode === "galaxy" && (
                  <div className="relative flex items-center justify-center min-h-full">
                    {/* Центральная орбита - легендарные */}
                    <div className="relative w-96 h-96">
                      {/* Связи между духами */}
                      {showConnections && filteredSpirits.length > 1 && (
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                          {filteredSpirits.slice(0, 10).map((spirit, i) =>
                            filteredSpirits
                              .slice(i + 1, 10)
                              .map((otherSpirit) => {
                                if (
                                  spirit.mood === otherSpirit.mood ||
                                  spirit.rarity === otherSpirit.rarity
                                ) {
                                  return (
                                    <line
                                      key={`${spirit.id}-${otherSpirit.id}`}
                                      x1="50%"
                                      y1="50%"
                                      x2="50%"
                                      y2="50%"
                                      stroke="rgba(139, 92, 246, 0.3)"
                                      strokeWidth="1"
                                      strokeDasharray="2,2"
                                    />
                                  );
                                }
                                return null;
                              })
                          )}
                        </svg>
                      )}

                      <div
                        className="absolute inset-0 rounded-full border border-yellow-400/30 galaxy-orbit"
                        style={{ animationDuration: `${60 / galaxySpeed}s` }}
                      >
                        {filteredSpirits
                          .filter((spirit) => spirit.rarity === "легендарный")
                          .map((spirit, index, arr) => {
                            const angle = (index / arr.length) * 360;
                            const radius = 120;
                            const x =
                              Math.cos((angle * Math.PI) / 180) * radius;
                            const y =
                              Math.sin((angle * Math.PI) / 180) * radius;
                            const isFavorite = favoriteSpirits.has(spirit.id);
                            const isSelected = selectedSpirit === spirit.id;

                            return (
                              <div
                                key={spirit.id}
                                className={`absolute spirit-float spirit-card-hover ${
                                  isSelected ? "z-20" : "z-10"
                                }`}
                                style={{
                                  left: `calc(50% + ${x}px)`,
                                  top: `calc(50% + ${y}px)`,
                                  transform: `translate(-50%, -50%) scale(${
                                    isSelected ? 1.2 : 1
                                  })`,
                                  animationDelay: `${index * 0.5}s`,
                                }}
                                onMouseEnter={() =>
                                  playInteractionSound("hover")
                                }
                              >
                                <div
                                  className={`relative group ${
                                    isSelected ? "animate-pulse" : ""
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onSelectSpiritForChat?.(spirit.id);
                                      playInteractionSound("select");
                                    }}
                                    className="cursor-pointer bg-transparent border-none p-0"
                                    aria-label={`Open spirit: ${spirit.essence}`}
                                  >
                                    <img
                                      src={getMoodTexture(spirit.mood)}
                                      alt={spirit.essence}
                                      className={`w-16 h-16 rounded-full border-2 border-yellow-400 ${getRarityGlow(
                                        spirit.rarity
                                      )} ${
                                        isSelected
                                          ? "ring-4 ring-yellow-300/50"
                                          : ""
                                      }`}
                                    />
                                  </button>

                                  {/* Кнопка избранного */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const newFavorites = new Set(
                                        favoriteSpirits
                                      );
                                      if (isFavorite) {
                                        newFavorites.delete(spirit.id);
                                      } else {
                                        newFavorites.add(spirit.id);
                                      }
                                      setFavoriteSpirits(newFavorites);
                                      playInteractionSound("favorite");
                                    }}
                                    className={`absolute -top-1 -right-1 w-6 h-6 rounded-full ${
                                      isFavorite
                                        ? "bg-red-500 text-white"
                                        : "bg-black/50 text-gray-400"
                                    } hover:scale-110 transition-all opacity-0 group-hover:opacity-100`}
                                  >
                                    {isFavorite ? "❤️" : "🤍"}
                                  </button>

                                  {/* Кнопка чата */}
                                  {onSelectSpiritForChat && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectSpiritForChat(spirit.id);
                                        playInteractionSound("teleport");
                                        onClose();
                                      }}
                                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-500 text-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100 text-xs"
                                    >
                                      💬
                                    </button>
                                  )}

                                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                                    {spirit.essence} {isFavorite ? "❤️" : ""}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>

                      {/* Средняя орбита - эпические и редкие */}
                      <div className="absolute inset-[-100px] rounded-full border border-purple-400/20">
                        {filteredSpirits
                          .filter((spirit) =>
                            ["эпический", "редкий"].includes(spirit.rarity)
                          )
                          .map((spirit, index, arr) => {
                            const angle = (index / arr.length) * 360;
                            const radius = 180;
                            const x =
                              Math.cos((angle * Math.PI) / 180) * radius;
                            const y =
                              Math.sin((angle * Math.PI) / 180) * radius;

                            return (
                              <button
                                type="button"
                                key={spirit.id}
                                className="absolute spirit-float spirit-card-hover cursor-pointer bg-transparent border-none p-0"
                                style={{
                                  left: `calc(50% + ${x}px)`,
                                  top: `calc(50% + ${y}px)`,
                                  transform: "translate(-50%, -50%)",
                                  animationDelay: `${index * 0.3}s`,
                                }}
                                onClick={() => openModal(spirit)}
                                aria-label={`Open spirit: ${spirit.essence}`}
                              >
                                <div className="relative group">
                                  <img
                                    src={getMoodTexture(spirit.mood)}
                                    alt={spirit.essence}
                                    className={`w-12 h-12 rounded-full border-2 ${
                                      spirit.rarity === "эпический"
                                        ? "border-purple-400"
                                        : "border-blue-400"
                                    } ${getRarityGlow(spirit.rarity)}`}
                                  />
                                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                                    {spirit.essence}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                      </div>

                      {/* Внешняя орбита - обычные */}
                      <div className="absolute inset-[-200px] rounded-full border border-green-400/10">
                        {filteredSpirits
                          .filter((spirit) => spirit.rarity === "обычный")
                          .map((spirit, index, arr) => {
                            const angle = (index / arr.length) * 360;
                            const radius = 280;
                            const x =
                              Math.cos((angle * Math.PI) / 180) * radius;
                            const y =
                              Math.sin((angle * Math.PI) / 180) * radius;

                            return (
                              <button
                                type="button"
                                key={spirit.id}
                                className="absolute spirit-float spirit-card-hover cursor-pointer bg-transparent border-none p-0"
                                style={{
                                  left: `calc(50% + ${x}px)`,
                                  top: `calc(50% + ${y}px)`,
                                  transform: "translate(-50%, -50%)",
                                  animationDelay: `${index * 0.2}s`,
                                }}
                                onClick={() => openModal(spirit)}
                                aria-label={`Open spirit: ${spirit.essence}`}
                              >
                                <div className="relative group">
                                  <img
                                    src={getMoodTexture(spirit.mood)}
                                    alt={spirit.essence}
                                    className={`w-10 h-10 rounded-full border border-green-400 ${getRarityGlow(
                                      spirit.rarity
                                    )}`}
                                  />
                                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                                    {spirit.essence}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Режим созвездий */}
                {viewMode === "constellations" && (
                  <div className="space-y-8">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                        ⭐ Созвездия Духов ⭐
                      </h3>
                      <p className="text-slate-400">
                        Духи сгруппированы по настроениям в мистические
                        созвездия
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 justify-items-center">
                      {[
                        "радостный",
                        "печальный",
                        "злой",
                        "спокойный",
                        "вдохновленный",
                      ].map((mood) => (
                        <div key={mood} className="flex flex-col items-center">
                          <SpiritConstellation
                            spirits={filteredSpirits}
                            mood={mood}
                            size="medium"
                            onSpiritClick={(spirit) => {
                              setSelectedSpirit(spirit.id);
                              playInteractionSound("select");
                              openModal(spirit);
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Дополнительные настроения, если есть */}
                    {(() => {
                      const knownMoods = [
                        "радостный",
                        "печальный",
                        "злой",
                        "спокойный",
                        "вдохновленный",
                      ];
                      const unknownMoods = [
                        ...new Set(filteredSpirits.map((s) => s.mood)),
                      ].filter((mood) => !knownMoods.includes(mood));

                      if (unknownMoods.length > 0) {
                        return (
                          <div className="mt-12">
                            <h4 className="text-lg font-bold text-center text-slate-300 mb-6">
                              🌟 Особые созвездия 🌟
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                              {unknownMoods.map((mood) => (
                                <div
                                  key={mood}
                                  className="flex flex-col items-center"
                                >
                                  <SpiritConstellation
                                    spirits={filteredSpirits}
                                    mood={mood}
                                    size="small"
                                    onSpiritClick={(spirit) => {
                                      setSelectedSpirit(spirit.id);
                                      playInteractionSound("select");
                                      openModal(spirit);
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}

                {/* Режим сетки */}
                {viewMode === "grid" && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredSpirits.map((spirit) => (
                      <button
                        type="button"
                        key={spirit.id}
                        className="spirit-card-hover cursor-pointer bg-slate-800/30 backdrop-blur-sm rounded-2xl p-4 border border-slate-600/30 hover:border-slate-400/50 transition-all text-left w-full"
                        onClick={() => openModal(spirit)}
                        aria-label={`Open spirit: ${spirit.essence}`}
                      >
                        <div className="text-center">
                          <img
                            src={getMoodTexture(spirit.mood)}
                            alt={spirit.essence}
                            className={`w-20 h-20 mx-auto mb-3 rounded-full border-2 ${getRarityGlow(
                              spirit.rarity
                            )}`}
                          />

                          <h3 className="text-white font-bold text-sm mb-1 truncate">
                            {spirit.essence}
                          </h3>

                          <div
                            className={`inline-block px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getRarityColor(
                              spirit.rarity
                            )}`}
                          >
                            ⭐ {spirit.rarity}
                          </div>

                          <p className="text-slate-400 text-xs mt-2">
                            🎭 {spirit.mood}
                          </p>

                          {spirit.birthDate && (
                            <p className="text-slate-500 text-xs">
                              🕯️ {format(new Date(spirit.birthDate), "d.MM.yy")}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Режим списка */}
                {viewMode === "list" && (
                  <div className="space-y-4">
                    {filteredSpirits.map((spirit) => (
                      <button
                        type="button"
                        key={spirit.id}
                        className="spirit-card-hover cursor-pointer bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30 hover:border-slate-400/50 transition-all flex items-center gap-4 text-left w-full"
                        onClick={() => openModal(spirit)}
                        aria-label={`Open spirit: ${spirit.essence}`}
                      >
                        <img
                          src={getMoodTexture(spirit.mood)}
                          alt={spirit.essence}
                          className={`w-16 h-16 rounded-full border-2 ${getRarityGlow(
                            spirit.rarity
                          )}`}
                        />

                        <div className="flex-1">
                          <h3 className="text-white font-bold text-lg">
                            {spirit.essence}
                          </h3>
                          <div className="flex items-center gap-4 mt-1">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getRarityColor(
                                spirit.rarity
                              )}`}
                            >
                              ⭐ {spirit.rarity}
                            </span>
                            <span className="text-slate-400 text-sm">
                              🎭 {spirit.mood}
                            </span>
                            {spirit.birthDate && (
                              <span className="text-slate-500 text-sm">
                                🕯️{" "}
                                {format(
                                  new Date(spirit.birthDate),
                                  "d.MM.yy HH:mm"
                                )}
                              </span>
                            )}
                          </div>
                          {spirit.originText && (
                            <p className="text-slate-400 text-sm mt-2 italic">
                              «{spirit.originText.slice(0, 100)}...»
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
