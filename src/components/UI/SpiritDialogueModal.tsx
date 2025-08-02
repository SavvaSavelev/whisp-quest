// src/components/UI/SpiritDialogueModal.tsx
import React, { useState, useEffect, useRef } from "react";
import { useSpiritModalStore } from "../../store/useSpiritModalStore";
import { useSpiritArchiveStore } from "../../store/useSpiritArchiveStore";
import { useSpiritStore } from "../../store/spiritStore";
import { getMoodTexture } from "../../lib/getMoodTexture";
import { format } from "date-fns";
import { chatWithSpirit } from "../../lib/spiritChat";
import { soundManager } from "../../lib/soundEffects";

export const SpiritDialogueModal: React.FC<{ showStorage?: boolean; selectedSpiritId?: string | null }> = ({ showStorage, selectedSpiritId }) => {
  const { spirit, isOpen, closeModal } = useSpiritModalStore();
  const { removeSpirit: removeFromArchive, clearArchive, spirits: archivedSpirits } = useSpiritArchiveStore();
  const { removeSpirit: removeFromScene, setSpirits } = useSpiritStore();
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Определяем текущего духа - либо из модалки, либо выбранного для чата
  const currentSpirit = selectedSpiritId 
    ? archivedSpirits.find(s => s.id === selectedSpiritId) || spirit
    : spirit;

  // ключ для localStorage по текущему spirit.id
  const storageKey = currentSpirit ? `chatLog-${currentSpirit.id}` : "";

  // состояние ввода и история чата, инициализируем из localStorage
  const [userMessage, setUserMessage] = useState("");
  const [chatLog, setChatLog] = useState<Array<{
    type: 'spirit' | 'user';
    message: string;
    timestamp: number;
  }>>(() => {
    if (!currentSpirit) return [];
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try { return JSON.parse(saved); }
      catch { /* fallthrough */ }
    }
    return currentSpirit.dialogue ? [{
      type: 'spirit',
      message: currentSpirit.dialogue,
      timestamp: Date.now()
    }] : [];
  });
  
  const [loading, setLoading] = useState(false);
  const [typingAnimation, setTypingAnimation] = useState(false);

  // Автопрокрутка чата
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatLog, typingAnimation]);

  // Фокус на input при открытии + звук
  useEffect(() => {
    if (isOpen && inputRef.current) {
      soundManager.playSound('modal-open');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // при смене currentSpirit — сбрасываем чат из localStorage/инициализируем заново
  useEffect(() => {
    if (!currentSpirit) return;
    const saved = localStorage.getItem(`chatLog-${currentSpirit.id}`);
    if (saved) {
      try { setChatLog(JSON.parse(saved)); }
      catch { 
        setChatLog(currentSpirit.dialogue ? [{
          type: 'spirit',
          message: currentSpirit.dialogue,
          timestamp: Date.now()
        }] : []);
      }
    } else {
      setChatLog(currentSpirit.dialogue ? [{
        type: 'spirit',
        message: currentSpirit.dialogue,
        timestamp: Date.now()
      }] : []);
    }
  }, [currentSpirit, currentSpirit?.id]);

  // синхронизируем чат в localStorage
  useEffect(() => {
    if (!currentSpirit) return;
    localStorage.setItem(storageKey, JSON.stringify(chatLog));
  }, [chatLog, storageKey, currentSpirit]);

  if ((!isOpen && !selectedSpiritId) || !currentSpirit || showStorage) return null;

  const askSpirit = async () => {
    if (!userMessage.trim() || loading) return;
    
    const userMsg = userMessage.trim();
    setUserMessage("");
    setLoading(true);
    setTypingAnimation(true);

    // Звук отправки сообщения
    soundManager.playSound('user-message');

    // Добавляем сообщение пользователя
    const newUserMessage = {
      type: 'user' as const,
      message: userMsg,
      timestamp: Date.now()
    };
    setChatLog(prev => [...prev, newUserMessage]);

    // Звук печатания духа
    soundManager.playTypingSound(300);

    try {
      // Используем новую функцию chatWithSpirit
      const history = chatLog.map(entry => entry.message);
      const reply = await chatWithSpirit({
        text: userMsg,
        spirit: {
          mood: currentSpirit.mood,
          essence: currentSpirit.essence,
          originText: currentSpirit.originText,
          birthDate: currentSpirit.birthDate
        },
        history
      });

      // Имитируем печатание духа
      setTimeout(() => {
        setTypingAnimation(false);
        setChatLog(prev => [...prev, {
          type: 'spirit',
          message: reply,
          timestamp: Date.now()
        }]);
        setLoading(false);
        // Звук ответа духа
        soundManager.playSound('spirit-message');
      }, 1000 + Math.random() * 2000); // 1-3 секунды
      
    } catch (error) {
      console.error('Ошибка общения с духом:', error);
      setTypingAnimation(false);
      setChatLog(prev => [...prev, {
        type: 'spirit',
        message: 'Дух молчит... Возможно, он обдумывает ответ.',
        timestamp: Date.now()
      }]);
      setLoading(false);
    }
  };

  const handleDeleteSpirit = () => {
    if (confirm(`Вы уверены, что хотите удалить духа "${currentSpirit.essence}"?`)) {
      removeFromArchive(currentSpirit.id);
      removeFromScene(currentSpirit.id);
      localStorage.removeItem(storageKey);
      closeModal();
    }
  };

  const handleClearAll = () => {
    if (confirm('Вы уверены, что хотите удалить ВСЕХ духов? Это действие нельзя отменить!')) {
      clearArchive();
      setSpirits([]);
      // очистим все сохранённые чаты
      Object.keys(localStorage)
        .filter((key) => key.startsWith("chatLog-"))
        .forEach((key) => localStorage.removeItem(key));
      closeModal();
    }
  };

  const handleClose = () => {
    soundManager.playSound('modal-close');
    closeModal();
  };

  // Определяем цвет ауры на основе редкости
  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'легендарный': return 'shadow-[0_0_30px_#ffd700,0_0_60px_#ffd700,0_0_90px_#ffd700]';
      case 'эпический': return 'shadow-[0_0_25px_#9333ea,0_0_50px_#9333ea]';
      case 'редкий': return 'shadow-[0_0_20px_#3b82f6,0_0_40px_#3b82f6]';
      default: return 'shadow-[0_0_15px_#10b981,0_0_30px_#10b981]';
    }
  };

  return (
    <>
      <style>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes spiritGlow {
          0%, 100% { filter: brightness(1) hue-rotate(0deg); }
          50% { filter: brightness(1.2) hue-rotate(10deg); }
        }
        
        @keyframes typing {
          0%, 20% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
        
        @keyframes backgroundShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .spirit-avatar {
          animation: spiritGlow 4s ease-in-out infinite;
        }
        
        .typing-dots {
          animation: typing 1.4s infinite;
        }
        
        .typing-dots:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .typing-dots:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        .chat-bubble {
          animation: slideUp 0.3s ease-out;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .modal-appear {
          animation: modalSlideIn 0.3s ease-out;
        }
        
        .shimmer-bg {
          background: linear-gradient(
            90deg,
            rgba(51, 65, 85, 0.8) 0%,
            rgba(71, 85, 105, 0.9) 50%,
            rgba(51, 65, 85, 0.8) 100%
          );
          background-size: 200% 100%;
          animation: backgroundShimmer 3s ease-in-out infinite;
        }
        
        .particle-trail {
          position: absolute;
          width: 4px;
          height: 4px;
          background: radial-gradient(circle, rgba(147, 197, 253, 0.8) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          animation: particleFloat 2s ease-out forwards;
        }
        
        @keyframes particleFloat {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-20px) scale(0);
          }
        }
      `}</style>
      
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto">
        <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 rounded-2xl shadow-2xl pointer-events-auto">
          <div className="modal-appear text-white p-8 relative pointer-events-auto">
          
          {/* Декоративные частицы */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `particleFloat ${2 + Math.random() * 3}s ease-out infinite`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>
          
          {/* Закрыть */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10 w-10 h-10 rounded-full bg-slate-700/50 hover:bg-red-500/50 flex items-center justify-center border border-slate-600/50 hover:border-red-400/50"
          >
            ✕
          </button>

          {/* Заголовок с аватаром духа */}
          <div className="text-center mb-6">
            <div className="relative inline-block">
              <img
                src={getMoodTexture(currentSpirit.mood)}
                alt="Spirit Avatar"
                className={`spirit-avatar w-32 h-32 mx-auto mb-4 rounded-full border-4 border-white/30 ${getRarityGlow(currentSpirit.rarity)}`}
                style={{ filter: `hue-rotate(${currentSpirit.color ? '0deg' : '180deg'})` }}
              />
              {/* Индикатор редкости */}
              <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold border border-white/20 ${
                currentSpirit.rarity === 'легендарный' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-[0_0_20px_#ffd700]' :
                currentSpirit.rarity === 'эпический' ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_20px_#9333ea]' :
                currentSpirit.rarity === 'редкий' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-[0_0_20px_#3b82f6]' :
                'bg-gradient-to-r from-green-500 to-emerald-500 shadow-[0_0_20px_#10b981]'
              }`}>
                ⭐ {currentSpirit.rarity.toUpperCase()}
              </div>
            </div>
            
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              {currentSpirit.essence}
            </h2>
            
            <div className="flex justify-center items-center gap-4 text-sm text-slate-300 mb-2">
              <span className="flex items-center gap-1 bg-slate-800/50 px-3 py-1 rounded-full">
                🎭 <span className="text-white font-medium">{currentSpirit.mood}</span>
              </span>
              {currentSpirit.birthDate && (
                <span className="flex items-center gap-1 bg-slate-800/50 px-3 py-1 rounded-full">
                  🕯️ {format(new Date(currentSpirit.birthDate), "d.MM.yy HH:mm")}
                </span>
              )}
            </div>
            
            {currentSpirit.originText && (
              <p className="text-sm text-slate-400 italic bg-slate-800/50 rounded-lg p-3 mx-4 border border-slate-600/30">
                💭 «{currentSpirit.originText}»
              </p>
            )}
          </div>

          {/* Чат */}
          <div className="bg-slate-800/30 rounded-2xl p-4 mb-6 h-80 overflow-y-auto space-y-3 border border-slate-600/30 backdrop-blur-sm">
            {chatLog.map((entry, idx) => (
              <div
                key={`${entry.timestamp}-${idx}`}
                className={`chat-bubble flex ${entry.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl border ${
                    entry.type === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white ml-4 border-blue-500/30 shadow-lg'
                      : 'bg-gradient-to-r from-slate-700 to-slate-600 text-slate-100 mr-4 border-slate-500/30 shadow-lg'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{entry.message}</p>
                  <p className="text-xs opacity-70 mt-1 flex items-center gap-1">
                    {entry.type === 'user' ? '👤' : '👻'} {format(new Date(entry.timestamp), 'HH:mm')}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Анимация печатания */}
            {typingAnimation && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-slate-700 to-slate-600 text-slate-100 px-4 py-3 rounded-2xl mr-4 border border-slate-500/30">
                  <div className="flex items-center gap-1">
                    <span className="text-sm">👻 Дух печатает</span>
                    <div className="flex gap-1 ml-2">
                      <div className="typing-dots w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      <div className="typing-dots w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                      <div className="typing-dots w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Поле ввода */}
          <div className="flex gap-3 mb-4">
            <input
              ref={inputRef}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-700/50 text-white text-sm border border-slate-600/50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all backdrop-blur-sm"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder={`Спросите ${currentSpirit?.essence?.toLowerCase() || 'духа'}...`}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && askSpirit()}
              disabled={loading}
              maxLength={500}
            />
            <button
              onClick={askSpirit}
              disabled={loading || !userMessage.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 rounded-xl text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed flex items-center gap-2 border border-blue-500/30 hover:border-purple-400/50 disabled:border-slate-600/30"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Отправка...
                </>
              ) : (
                <>
                  📨 Отправить
                </>
              )}
            </button>
          </div>

          {/* Счетчик символов */}
          <div className="text-xs text-slate-400 text-right mb-4">
            {userMessage.length}/500 символов
          </div>

          {/* Нижние кнопки */}
          <div className="flex justify-between gap-3 text-sm">
            <button
              onClick={handleDeleteSpirit}
              className="px-4 py-2 rounded-xl bg-slate-700/50 hover:bg-red-600/50 transition-all duration-200 flex items-center gap-2 text-slate-300 hover:text-white border border-slate-600/30 hover:border-red-400/50"
            >
              🗑️ Удалить духа
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={handleClearAll}
                className="px-4 py-2 rounded-xl bg-slate-700/50 hover:bg-red-700/50 transition-all duration-200 flex items-center gap-2 text-slate-300 hover:text-white border border-slate-600/30 hover:border-red-400/50"
              >
                ☠️ Удалить всех
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </>
  );
};
