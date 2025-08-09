import React, { useMemo, useState } from "react";
import { useAIMission } from "../../hooks/useAIMission";
import { getMoodTexture } from "../../lib/getMoodTexture";
import { useSpiritStore } from "../../store/spiritStore";
import { useUIStore } from "../../store/uiStore";
import { useSpiritArchiveStore } from "../../store/useSpiritArchiveStore";

interface Spirit {
  id: string;
  essence: string;
  mood: string;
  role?: string;
  rationale?: string;
}

interface Step {
  speaker: string;
  content: string;
}

interface MissionResult {
  selectedSpirits: Spirit[];
  plan: string[];
  steps: Step[];
  finalAnswer: string;
}

// Компонент облака результатов - 10000+ АААА фича
const ResultsCloud: React.FC<{
  result: MissionResult;
  onClose: () => void;
}> = ({ result, onClose }) => {
  return (
    <div className="fixed inset-0 z-[10003] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-4 animate-fadeIn">
      {/* Магические частицы */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-br from-cyan-400/40 to-purple-400/40 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Облако результатов */}
      <div className="relative max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Эффект свечения облака */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-indigo-500/20 rounded-[3rem] blur-2xl animate-pulse"></div>

        <div className="relative bg-gradient-to-br from-slate-800/95 via-slate-900/95 to-slate-800/95 rounded-[3rem] border-2 border-white/20 shadow-2xl backdrop-blur-2xl overflow-hidden">
          {/* Заголовок облака */}
          <div className="relative px-8 py-6 bg-gradient-to-r from-cyan-600/30 via-purple-600/30 to-indigo-600/30 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
                    <span className="text-3xl">☁️</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-xs">✨</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                    Облако Мудрости
                  </h2>
                  <p className="text-white/70 text-lg">
                    Результаты коллективного разума
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="group relative w-12 h-12 bg-gradient-to-br from-red-500/30 to-red-600/30 hover:from-red-500/50 hover:to-red-600/50 border border-red-400/40 rounded-2xl transition-all duration-300 hover:scale-110 hover:rotate-180"
              >
                <span className="text-red-300 group-hover:text-white transition-colors text-xl">
                  ✕
                </span>
              </button>
            </div>
          </div>

          {/* Контент облака */}
          <div className="p-8 space-y-8 overflow-y-auto max-h-[calc(90vh-8rem)] custom-scrollbar">
            {/* Команда духов - красивые карточки */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-center bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent flex items-center justify-center gap-3">
                <span className="text-3xl">👥</span>
                Команда Мудрецов
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.selectedSpirits.map((spirit, idx) => (
                  <div
                    key={`${spirit.essence}-${idx}`}
                    className="group relative bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-emerald-400/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 hover:border-emerald-300/50 hover:shadow-lg hover:shadow-emerald-400/20"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative space-y-3">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-2xl">
                        🧙‍♂️
                      </div>
                      <div className="text-center">
                        <h4 className="font-bold text-lg text-white">
                          {spirit.essence}
                        </h4>
                        <div className="text-emerald-300 text-sm">
                          {spirit.mood} • {spirit.role}
                        </div>
                        <p className="text-slate-300 text-xs mt-2 italic">
                          "{spirit.rationale}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* План действий - элегантный список */}
            <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-400/30 rounded-3xl p-6">
              <h3 className="text-2xl font-bold text-center bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-6 flex items-center justify-center gap-3">
                <span className="text-3xl">📋</span>
                Мастер-План
              </h3>
              <div className="space-y-4">
                {result.plan.map((step, i) => (
                  <div
                    key={`plan-${i}`}
                    className="group flex gap-4 items-start"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      {i + 1}
                    </div>
                    <div className="flex-1 bg-slate-800/40 border border-slate-600/30 rounded-xl p-4 group-hover:border-indigo-400/50 transition-colors duration-300">
                      <p className="text-white/90 leading-relaxed">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Финальный результат - главное облако */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-red-500/20 rounded-3xl blur-xl animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-amber-900/40 to-orange-900/40 border-2 border-amber-400/40 rounded-3xl p-8">
                <h3 className="text-3xl font-bold text-center bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-300 bg-clip-text text-transparent mb-6 flex items-center justify-center gap-3">
                  <span className="text-4xl">✨</span>
                  Откровение
                </h3>
                <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-amber-400/20 rounded-2xl p-6">
                  <p className="text-white/95 text-lg leading-relaxed whitespace-pre-wrap text-center">
                    {result.finalAnswer}
                  </p>
                </div>
              </div>
            </div>

            {/* Дискуссия духов - интерактивная лента */}
            <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-400/30 rounded-3xl p-6">
              <h3 className="text-2xl font-bold text-center bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-6 flex items-center justify-center gap-3">
                <span className="text-3xl">💬</span>
                Хроники Совещания
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                {result.steps.map((step, i) => (
                  <div
                    key={`step-${i}`}
                    className="group flex gap-3 items-start"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      💭
                    </div>
                    <div className="flex-1 bg-slate-800/40 border border-slate-600/30 rounded-xl p-3 group-hover:border-cyan-400/50 transition-colors duration-300">
                      <div className="font-semibold text-cyan-300 mb-1">
                        {step.speaker}:
                      </div>
                      <p className="text-white/80 text-sm">{step.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AIMissionModal: React.FC = () => {
  const show = useUIStore((s) => s.showMission);
  const setShow = useUIStore((s) => s.setShowMission);
  const { runMission, loading, error, result } = useAIMission();

  // Получаем духов пользователя
  const spirits = useSpiritStore((s) => s.spirits);
  const archiveSpirits = useSpiritArchiveStore((s) => s.spirits);
  const allSpirits = [...spirits, ...archiveSpirits];

  const [topic, setTopic] = useState("");
  const [constraints, setConstraints] = useState("");
  const [showResultsCloud, setShowResultsCloud] = useState(false);

  const parsedConstraints = useMemo(
    () =>
      constraints
        .split(/\n|;/)
        .map((s) => s.trim())
        .filter(Boolean),
    [constraints]
  );

  React.useEffect(() => {
    if (result && !showResultsCloud) {
      setShowResultsCloud(true);
    }
  }, [result, showResultsCloud]);

  if (!show) return null;

  // Преобразуем ответ для облака результатов
  const missionResult: MissionResult | null = result
    ? {
        selectedSpirits: result.selectedSpirits.map((spirit, index) => ({
          id: `${spirit.essence}-${index}`,
          essence: spirit.essence,
          mood: spirit.mood,
          role: spirit.role,
          rationale: spirit.rationale,
        })),
        plan: result.plan,
        steps: result.steps,
        finalAnswer: result.finalAnswer,
      }
    : null;

  // Показываем облако результатов если есть результат
  if (showResultsCloud && missionResult) {
    return (
      <ResultsCloud
        result={missionResult}
        onClose={() => {
          setShowResultsCloud(false);
          setShow(false);
          setTopic("");
          setConstraints("");
        }}
      />
    );
  }

  const start = async () => {
    if (!topic.trim()) return;

    try {
      await runMission({
        topic,
        constraints: parsedConstraints,
      });
      setShowResultsCloud(true);
    } catch (err) {
      console.error("Mission failed:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-[10002] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4">
      {/* Магический космический фон */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Главное окно миссии */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Эффект свечения */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-indigo-500/10 rounded-3xl blur-xl"></div>

        <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border-2 border-cyan-500/30 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden">
          {/* Заголовок */}
          <div className="relative px-6 py-4 bg-gradient-to-r from-cyan-600/20 via-purple-600/20 to-indigo-600/20 border-b border-cyan-400/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                    AI Миссия
                  </h2>
                  <p className="text-cyan-200/70 text-sm">
                    Коллективный разум в действии
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShow(false)}
                className="w-10 h-10 bg-gradient-to-br from-red-500/30 to-red-600/30 hover:from-red-500/50 hover:to-red-600/50 border border-red-400/40 rounded-xl transition-all duration-300 hover:scale-110"
              >
                <span className="text-red-300">✕</span>
              </button>
            </div>
          </div>

          {/* Контент */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-6rem)] custom-scrollbar">
            {/* Поле для темы */}
            <div className="space-y-3">
              <label className="text-lg font-semibold text-cyan-300 flex items-center gap-2">
                <span className="text-xl">🎯</span>
                Тема миссии
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Опишите задачу для коллективного решения..."
                className="w-full h-24 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-cyan-400/30 rounded-2xl px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 resize-none"
              />
            </div>

            {/* Поле для ограничений */}
            <div className="space-y-3">
              <label className="text-lg font-semibold text-purple-300 flex items-center gap-2">
                <span className="text-xl">⚙️</span>
                Ограничения и требования
              </label>
              <textarea
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                placeholder="Укажите особые требования, ограничения или контекст (по одному на строку)..."
                className="w-full h-20 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-purple-400/30 rounded-2xl px-4 py-3 text-white placeholder-slate-400 focus:border-purple-300 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 resize-none"
              />
            </div>

            {/* Доступные духи */}
            <div className="space-y-3">
              <label className="text-lg font-semibold text-emerald-300 flex items-center gap-2">
                <span className="text-xl">👥</span>
                Доступные духи ({allSpirits.length})
              </label>
              <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto custom-scrollbar bg-gradient-to-br from-slate-800/30 to-slate-900/30 border border-emerald-400/20 rounded-2xl p-4">
                {allSpirits.slice(0, 12).map((spirit, i) => (
                  <div
                    key={`${spirit.essence}-${i}`}
                    className="flex items-center gap-2 bg-slate-700/50 border border-emerald-400/30 rounded-xl px-3 py-1"
                  >
                    <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={getMoodTexture(spirit.mood)}
                        alt={spirit.essence}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-emerald-200 text-sm truncate">
                      {spirit.essence}
                    </span>
                  </div>
                ))}
                {allSpirits.length > 12 && (
                  <div className="text-emerald-400/70 text-sm px-2 py-1">
                    +{allSpirits.length - 12} ещё...
                  </div>
                )}
              </div>
            </div>

            {/* Визуализация процесса */}
            {loading && (
              <div className="relative bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-400/30 rounded-3xl p-6">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-full flex items-center justify-center border-2 border-indigo-400/40">
                      <div className="relative w-16 h-16">
                        <span className="text-3xl">{topic ? "🎯" : "🧠"}</span>
                      </div>
                    </div>

                    {/* Духи в движении вокруг центра - ИСПРАВЛЕНЫ РАЗМЕРЫ */}
                    <div
                      className="absolute inset-0 animate-spin"
                      style={{ animationDuration: "8s" }}
                    >
                      {allSpirits.slice(0, 6).map((spirit, i) => {
                        const totalSpirits = Math.min(allSpirits.length, 6);
                        const angle = (i / totalSpirits) * 2 * Math.PI;
                        const radius = 60;
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;

                        return (
                          <div
                            key={`${spirit.essence}-${i}`}
                            className="absolute w-16 h-16 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
                            style={{
                              left: `calc(50% + ${x}px)`,
                              top: `calc(50% + ${y}px)`,
                              animationDelay: `${i * 0.2}s`,
                            }}
                          >
                            <div className="w-full h-full bg-gradient-to-br from-emerald-400/80 to-teal-500/80 rounded-xl border-2 border-emerald-300/50 shadow-lg overflow-hidden">
                              <img
                                src={getMoodTexture(spirit.mood)}
                                alt={spirit.essence}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                      Мозговой штурм активен
                    </h3>
                    <p className="text-indigo-200/80">
                      Духи анализируют задачу и формируют стратегию...
                    </p>
                    <div className="flex justify-center">
                      <div className="flex space-x-1">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.1}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Ошибка */}
            {error && (
              <div className="bg-gradient-to-br from-red-900/40 to-red-800/40 border border-red-400/30 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚠️</span>
                  <span className="text-red-300 text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Кнопка запуска */}
            <button
              onClick={start}
              disabled={!topic.trim() || loading}
              className="w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-indigo-600 hover:from-cyan-400 hover:via-purple-400 hover:to-indigo-500 disabled:from-slate-600 disabled:via-slate-700 disabled:to-slate-600 border border-cyan-400/30 hover:border-cyan-300/50 disabled:border-slate-500/30 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-400/20 disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              <span className="text-lg flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Анализируем...
                  </>
                ) : (
                  <>
                    <span className="text-xl">🚀</span>
                    Начать миссию
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
