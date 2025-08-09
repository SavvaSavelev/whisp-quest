// src/components/UI/SpiritDialogueModal.tsx
import React, { useEffect, useRef, useState } from "react";
import { getMoodTexture } from "../../lib/getMoodTexture";
import { soundManager } from "../../lib/soundEffects";
import { chatWithSpirit } from "../../lib/spiritChat";
import type { Mood } from "../../lib/types";
import { useSpiritStore } from "../../store/spiritStore";
import { useSpiritArchiveStore } from "../../store/useSpiritArchiveStore";
import { useSpiritModalStore } from "../../store/useSpiritModalStore";

export interface SpiritDialogueModalProps {
  showStorage?: boolean;
  selectedSpiritId?: string | null;

  // 👇 новые для стрима
  onStreamStart?: (payload: {
    text: string;
    mood?: import("../../lib/types").Mood;
    essence?: string;
    history?: string[];
    originText?: string;
    birthDate?: string;
  }) => Promise<void> | void;
  onStreamCancel?: () => void;
  isStreaming?: boolean;
  streamingText?: string;
  streamError?: string;

  // опциональная персона духа (подсказка для prompt-строителя внутри модалки)
  persona?: {
    mood?: import("../../lib/types").Mood;
    essence?: string;
    originText?: string;
    birthDate?: string;
  };
}

// Функция для определения стиля редкости
function getRarityStyle(rarity: string): string {
  if (rarity === "легендарный") {
    return "bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-[0_0_20px_#ffd700]";
  }
  if (rarity === "эпический") {
    return "bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_20px_#9333ea]";
  }
  if (rarity === "редкий") {
    return "bg-gradient-to-r from-blue-500 to-cyan-500 shadow-[0_0_20px_#3b82f6]";
  }
  return "bg-gradient-to-r from-green-500 to-emerald-500 shadow-[0_0_20px_#10b981]";
}

export const SpiritDialogueModal: React.FC<SpiritDialogueModalProps> = ({
  showStorage,
  selectedSpiritId,
  onStreamStart,
  onStreamCancel,
  isStreaming = false,
  streamingText = "",
  streamError,
  persona,
}) => {
  const { spirit, isOpen, closeModal } = useSpiritModalStore();
  const { removeSpirit: removeFromArchive, spirits: archivedSpirits } =
    useSpiritArchiveStore();
  const { removeSpirit: removeFromScene } = useSpiritStore();

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Определяем текущего духа - либо из модалки, либо выбранного для чата
  const currentSpirit = selectedSpiritId
    ? archivedSpirits.find((s) => s.id === selectedSpiritId) || spirit
    : spirit;

  // ключ для localStorage по текущему spirit.id
  const storageKey = currentSpirit ? `chatLog-${currentSpirit.id}` : "";

  // состояние ввода и история чата, инициализируем из localStorage
  const [userMessage, setUserMessage] = useState("");
  const [chatLog, setChatLog] = useState<
    Array<{
      type: "spirit" | "user";
      message: string;
      timestamp: number;
    }>
  >(() => {
    if (!currentSpirit) return [];
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        /* fallthrough */
      }
    }
    return currentSpirit.dialogue
      ? [
          {
            type: "spirit",
            message: currentSpirit.dialogue,
            timestamp: Date.now(),
          },
        ]
      : [];
  });

  const [loading, setLoading] = useState(false);
  const [typingAnimation, setTypingAnimation] = useState(false);

  // Автопрокрутка чата
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatLog, typingAnimation]);

  // Фокус на input при открытии + звук
  useEffect(() => {
    if (isOpen && inputRef.current) {
      soundManager.playSound("modal-open");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // при смене currentSpirit — сбрасываем чат из localStorage/инициализируем заново
  useEffect(() => {
    if (!currentSpirit) return;
    const saved = localStorage.getItem(`chatLog-${currentSpirit.id}`);
    if (saved) {
      try {
        setChatLog(JSON.parse(saved));
      } catch {
        setChatLog(
          currentSpirit.dialogue
            ? [
                {
                  type: "spirit",
                  message: currentSpirit.dialogue,
                  timestamp: Date.now(),
                },
              ]
            : []
        );
      }
    } else {
      setChatLog(
        currentSpirit.dialogue
          ? [
              {
                type: "spirit",
                message: currentSpirit.dialogue,
                timestamp: Date.now(),
              },
            ]
          : []
      );
    }
  }, [currentSpirit, currentSpirit?.id]);

  // синхронизируем чат в localStorage
  useEffect(() => {
    if (!currentSpirit) return;
    localStorage.setItem(storageKey, JSON.stringify(chatLog));
  }, [chatLog, storageKey, currentSpirit]);

  // 👇 Обработка завершения стрима - добавляем сообщение в чат
  useEffect(() => {
    if (!isStreaming && streamingText && !loading) {
      // Стрим завершился, сохраняем сообщение духа
      setChatLog((prev) => [
        ...prev,
        {
          type: "spirit",
          message: streamingText,
          timestamp: Date.now(),
        },
      ]);
      // Звук ответа духа
      soundManager.playSound("spirit-message");
    }
  }, [isStreaming, streamingText, loading]);

  if ((!isOpen && !selectedSpiritId) || !currentSpirit || showStorage)
    return null;

  const askSpirit = async () => {
    if (!userMessage.trim() || loading || isStreaming) return;

    const userMsg = userMessage.trim();
    setUserMessage("");
    setLoading(true);
    setTypingAnimation(true);

    // Звук отправки сообщения
    soundManager.playSound("user-message");

    // Добавляем сообщение пользователя
    const newUserMessage = {
      type: "user" as const,
      message: userMsg,
      timestamp: Date.now(),
    };
    setChatLog((prev) => [...prev, newUserMessage]);

    // Звук печатания духа
    soundManager.playTypingSound(300);

    try {
      // 👇 СТРИМИНГ как основная технология
      if (onStreamStart) {
        const history = chatLog.map((entry) => entry.message);
        await onStreamStart({
          text: userMsg,
          mood: (persona?.mood || currentSpirit.mood) as Mood,
          essence: persona?.essence || currentSpirit.essence,
          originText: persona?.originText || currentSpirit.originText,
          birthDate: persona?.birthDate || currentSpirit.birthDate,
          history,
        });
        setLoading(false);
        setTypingAnimation(false);
      } else {
        // Fallback к обычному чату если стрим недоступен
        const history = chatLog.map((entry) => entry.message);
        const reply = await chatWithSpirit({
          text: userMsg,
          spirit: {
            mood: currentSpirit.mood,
            essence: currentSpirit.essence,
            originText: currentSpirit.originText,
            birthDate: currentSpirit.birthDate,
          },
          history,
        });

        // Имитируем печатание духа
        setTimeout(() => {
          setTypingAnimation(false);
          setChatLog((prev) => [
            ...prev,
            {
              type: "spirit",
              message: reply,
              timestamp: Date.now(),
            },
          ]);
          setLoading(false);
          // Звук ответа духа
          soundManager.playSound("spirit-message");
        }, 1000 + Math.random() * 2000); // 1-3 секунды
      }
    } catch (error) {
      console.error("Ошибка общения с духом:", error);
      setTypingAnimation(false);
      setChatLog((prev) => [
        ...prev,
        {
          type: "spirit",
          message: "Дух молчит... Возможно, он обдумывает ответ.",
          timestamp: Date.now(),
        },
      ]);
      setLoading(false);
    }
  };

  const handleDeleteSpirit = () => {
    if (
      confirm(`Вы уверены, что хотите удалить духа "${currentSpirit.essence}"?`)
    ) {
      removeFromArchive(currentSpirit.id);
      removeFromScene(currentSpirit.id);
      localStorage.removeItem(storageKey);
      closeModal();
    }
  };

  const handleClose = () => {
    soundManager.playSound("modal-close");
    // Отменяем стрим если он активен
    if (isStreaming && onStreamCancel) {
      onStreamCancel();
    }
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto">
      <div className="w-full max-w-lg bg-slate-800/90 backdrop-blur-xl border-2 border-indigo-400/30 rounded-3xl shadow-2xl pointer-events-auto overflow-hidden">
        {/* Заголовок с аватаром духа */}
        <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-6 text-center relative">
          {/* Закрыть */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors w-8 h-8 rounded-full bg-slate-700/50 hover:bg-red-500/50 flex items-center justify-center text-xl"
          >
            ×
          </button>

          <img
            src={getMoodTexture(currentSpirit.mood)}
            alt="Spirit Avatar"
            className="w-20 h-20 mx-auto mb-3 rounded-full border-2 border-indigo-400/50 shadow-[0_0_20px_rgba(99,102,241,0.5)]"
          />

          <h2 className="text-xl font-bold text-white mb-1">
            {currentSpirit.essence}
          </h2>

          <div className="text-sm text-slate-300 flex justify-center gap-3">
            <span className="bg-slate-700/50 px-2 py-1 rounded-full">
              🎭 {currentSpirit.mood}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs ${getRarityStyle(
                currentSpirit.rarity
              )}`}
            >
              ⭐ {currentSpirit.rarity}
            </span>
          </div>

          {currentSpirit.originText && (
            <p className="text-xs text-slate-400 mt-2 italic">
              «{currentSpirit.originText.slice(0, 80)}...»
            </p>
          )}
        </div>

        {/* Чат */}
        <div className="p-4">
          <div className="bg-slate-900/50 rounded-xl p-3 h-64 overflow-y-auto space-y-2 mb-4">
            {chatLog.map((entry, idx) => (
              <div
                key={`${entry.timestamp}-${idx}`}
                className={`flex ${
                  entry.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                    entry.type === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-700 text-slate-100"
                  }`}
                >
                  {entry.message}
                </div>
              </div>
            ))}

            {/* Анимация печатания */}
            {(typingAnimation || isStreaming) && (
              <div className="flex justify-start">
                <div className="bg-slate-700 text-slate-100 px-3 py-2 rounded-lg text-sm">
                  {isStreaming && streamingText ? (
                    <span className="whitespace-pre-wrap">{streamingText}</span>
                  ) : (
                    <span>Дух печатает...</span>
                  )}
                </div>
              </div>
            )}

            {streamError && (
              <div className="flex justify-start">
                <div className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm">
                  ⚠️ {streamError}
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Поле ввода */}
          <div className="flex gap-2">
            <input
              ref={inputRef}
              className="flex-1 px-3 py-2 rounded-lg bg-slate-700/50 text-white text-sm border border-slate-600 focus:border-indigo-400 focus:outline-none transition-colors"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder={`Спросите ${
                currentSpirit?.essence?.toLowerCase() || "духа"
              }...`}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && askSpirit()}
              disabled={loading}
              maxLength={200}
            />
            <button
              onClick={askSpirit}
              disabled={loading || !userMessage.trim() || isStreaming}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 rounded-lg text-sm text-white transition-colors disabled:cursor-not-allowed"
            >
              {loading || isStreaming ? "⏳" : "📤"}
            </button>

            {isStreaming && onStreamCancel && (
              <button
                onClick={onStreamCancel}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm text-white transition-colors"
              >
                ⏹️
              </button>
            )}
          </div>

          {/* Нижние кнопки */}
          <div className="flex justify-between mt-3 text-xs">
            <button
              onClick={handleDeleteSpirit}
              className="px-3 py-1 bg-slate-700/50 hover:bg-red-600/50 rounded text-slate-300 hover:text-white transition-colors"
            >
              🗑️ Удалить
            </button>
            <span className="text-slate-400">{userMessage.length}/200</span>
          </div>
        </div>
      </div>
    </div>
  );
};
