import React, { useMemo, useState } from "react";
import { useAIMission } from "../../hooks/useAIMission";
import type { Mood } from "../../lib/types";
import { useUIStore } from "../../store/uiStore";

const moods: Mood[] = [
  "вдохновлённый",
  "радостный",
  "спокойный",
  "меланхоличный",
  "игривый",
  "сонный",
  "испуганный",
  "злой",
  "печальный",
];

export const AIMissionModal: React.FC = () => {
  const show = useUIStore((s) => s.showMission);
  const setShow = useUIStore((s) => s.setShowMission);
  const { runMission, loading, error, result } = useAIMission();

  const [topic, setTopic] = useState("");
  const [context, setContext] = useState("");
  const [constraints, setConstraints] = useState<string>("");
  const [desiredMoods, setDesiredMoods] = useState<Mood[]>([
    "вдохновлённый",
    "спокойный",
  ]);
  const [teamSize, setTeamSize] = useState(3);

  const parsedConstraints = useMemo(
    () =>
      constraints
        .split(/\n|;/)
        .map((s) => s.trim())
        .filter(Boolean),
    [constraints]
  );

  if (!show) return null;

  const start = async () => {
    if (!topic.trim()) return;
    await runMission({
      topic: topic.trim(),
      context: context.trim() || undefined,
      constraints: parsedConstraints.length ? parsedConstraints : undefined,
      desiredMoods: desiredMoods.length ? desiredMoods : undefined,
      spiritHints: undefined,
      teamSize: Number(teamSize),
      history: undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[10002] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShow(false);
        }
      }}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-cyan-400/15 to-blue-600/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-400/10 to-teal-600/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 border border-slate-600/30 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden transform animate-scaleIn flex flex-col">
        {/* Glowing border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl blur-sm"></div>
        <div className="absolute inset-[1px] bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 rounded-3xl"></div>

        <div className="relative z-10">
          {/* Ultra-modern header */}
          <div className="relative px-8 py-6 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-cyan-600/20 border-b border-slate-600/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">🧭</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full animate-ping"></div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-cyan-200 to-indigo-200 bg-clip-text text-transparent">
                    AI‑Миссия
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Коллективный разум духов
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShow(false)}
                className="group relative w-10 h-10 bg-gradient-to-br from-red-500/20 to-red-600/20 hover:from-red-500/40 hover:to-red-600/40 border border-red-500/30 rounded-xl transition-all duration-300 hover:scale-110 hover:rotate-90"
                title="Закрыть"
              >
                <span className="text-red-300 group-hover:text-white transition-colors text-lg">
                  ✕
                </span>
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-600/0 group-hover:from-red-500/20 group-hover:to-red-600/20 rounded-xl transition-all duration-300"></div>
              </button>
            </div>
          </div>

          {/* Ultra-futuristic form */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Topic input */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-cyan-300 mb-2 tracking-wider uppercase">
                  🎯 Тема миссии
                </label>
                <div className="relative group">
                  <input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Найди смысл этих записей..."
                    className="w-full bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400/50 transition-all duration-300 group-hover:border-slate-500/70"
                  />
                </div>
              </div>

              {/* Team size */}
              <div>
                <label className="block text-sm font-semibold text-emerald-300 mb-2 tracking-wider uppercase">
                  👥 Размер команды
                </label>
                <input
                  type="number"
                  min={2}
                  max={5}
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  className="w-full bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400/50 transition-all duration-300"
                />
              </div>

              {/* Context */}
              <div>
                <label className="block text-sm font-semibold text-purple-300 mb-2 tracking-wider uppercase">
                  📋 Контекст
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={3}
                  placeholder="Факты, материалы, заметки..."
                  className="w-full bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 resize-none"
                />
              </div>
            </div>

            {/* Constraints */}
            <div>
              <label className="block text-sm font-semibold text-orange-300 mb-2 tracking-wider uppercase">
                ⚠️ Ограничения
              </label>
              <textarea
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                rows={2}
                placeholder="до 10 шагов; не использовать внешние ссылки"
                className="w-full bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-400/50 transition-all duration-300 resize-none"
              />
            </div>

            {/* Mood selection */}
            <div>
              <label className="block text-sm font-semibold text-indigo-300 mb-3 tracking-wider uppercase">
                🎭 Настроения духов
              </label>
              <div className="flex flex-wrap gap-2">
                {moods.map((m) => {
                  const active = desiredMoods.includes(m);
                  return (
                    <button
                      key={m}
                      onClick={() =>
                        setDesiredMoods((prev) =>
                          prev.includes(m)
                            ? prev.filter((x) => x !== m)
                            : [...prev, m]
                        )
                      }
                      className={`px-3 py-1 rounded-full border text-sm transition-all duration-300 hover:scale-105 ${
                        active
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-400/50 text-white shadow-lg"
                          : "bg-gradient-to-r from-slate-800/70 to-slate-700/70 border-slate-600/50 text-slate-300 hover:border-slate-400/70"
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-600/30">
              <div className="flex items-center gap-3">
                {error && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-900/50 to-red-800/50 border border-red-500/30 rounded-xl">
                    <span className="text-red-400 text-sm">⚠️</span>
                    <span className="text-red-300 text-sm">{error}</span>
                  </div>
                )}
              </div>
              <button
                onClick={start}
                disabled={!topic.trim() || loading}
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold rounded-xl border border-white/20 disabled:border-slate-500/20 transition-all duration-300 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Запуск...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>🚀</span>
                    Запустить миссию
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Ultra-modern results section */}
          {result && (
            <div className="border-t border-slate-600/30 bg-gradient-to-br from-slate-800/30 to-slate-900/30 overflow-y-auto max-h-96 custom-scrollbar">
              <div className="p-6 space-y-6">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                    🎯 Результаты миссии
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Team */}
                  <div className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border border-emerald-500/20 rounded-xl p-4">
                    <h4 className="text-lg font-bold text-emerald-300 mb-3 flex items-center gap-2">
                      <span>👥</span> Команда духов
                    </h4>
                    <div className="space-y-2">
                      {result.selectedSpirits.map((s, idx) => (
                        <div
                          key={`${s.essence}-${idx}`}
                          className="p-3 bg-slate-800/50 border border-slate-600/30 rounded-lg"
                        >
                          <div className="text-sm">
                            <div className="font-bold text-white">
                              {s.essence}
                            </div>
                            <div className="text-cyan-300 text-xs">
                              {s.mood} • {s.role}
                            </div>
                            <div className="text-slate-400 text-xs mt-1">
                              {s.rationale}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Plan */}
                  <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-xl p-4">
                    <h4 className="text-lg font-bold text-indigo-300 mb-3 flex items-center gap-2">
                      <span>📋</span> План действий
                    </h4>
                    <ol className="space-y-2">
                      {result.plan.map((p, i) => (
                        <li key={`plan-${i}`} className="flex gap-2 text-sm">
                          <span className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-xs text-white flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="text-slate-200">{p}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Discussion steps */}
                <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/20 rounded-xl p-4">
                  <h4 className="text-lg font-bold text-cyan-300 mb-3 flex items-center gap-2">
                    <span>💬</span> Ход обсуждения
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                    {result.steps.map((st, i) => (
                      <div key={`step-${i}`} className="text-sm">
                        <span className="font-semibold text-cyan-300">
                          {st.speaker}:
                        </span>{" "}
                        <span className="text-slate-300">{st.content}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Final answer */}
                <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/30 rounded-xl p-4">
                  <h4 className="text-lg font-bold text-amber-300 mb-3 flex items-center gap-2">
                    <span>✨</span> Финальный результат
                  </h4>
                  <div className="bg-slate-800/60 border border-amber-500/20 rounded-lg p-4">
                    <p className="text-slate-100 text-sm leading-relaxed whitespace-pre-wrap">
                      {result.finalAnswer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
