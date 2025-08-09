import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ChatBubbleProps {
  message: string;
  isVisible: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isVisible }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: -20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.8, x: -20 }}
        className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 z-10"
      >
        <div className="relative max-w-xs p-4 bg-black/80 backdrop-blur-xl border border-cyan-500/50 rounded-2xl shadow-lg">
          {/* Cyber glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur animate-pulse" />

          <div className="relative z-10">
            <p className="text-cyan-100 text-sm font-mono leading-relaxed">
              {message}
            </p>

            {/* Tech signature */}
            <div className="mt-2 text-xs text-cyan-400 font-mono">
              - AI Tech Architect 🤖
            </div>
          </div>

          {/* Arrow pointer */}
          <div className="absolute left-0 top-1/2 transform -translate-x-2 -translate-y-1/2">
            <div className="w-3 h-3 bg-black/80 border-l border-b border-cyan-500/50 transform rotate-45"></div>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export const FloatingTechArchitect: React.FC = () => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showBubble, setShowBubble] = useState(false);

  const techMessages = [
    "🧠 Квантовые алгоритмы для улучшения UX...",
    "⚡ Предлагаю нейронную сеть для духов!",
    "🚀 WebGL шейдеры сделают анимации крутче!",
    "💡 Машинное обучение для персонализации...",
    "🔮 Blockchain для хранения воспоминаний духов?",
    "🎨 Процедурная генерация текстур настроений!",
    "🌊 Реалтайм коллаборация между духами...",
    "🧬 Генетические алгоритмы для эволюции фич!",
    "🌟 AR интерфейс для взаимодействия с духами!",
    "🔥 Микросервисная архитектура для масштаба!",
    "💎 Криптографическая защита данных духов...",
    "🎭 AI для генерации уникальных личностей!",
  ];

  useEffect(() => {
    const showMessage = () => {
      setShowBubble(true);
      setTimeout(() => {
        setShowBubble(false);
      }, 4000);
    };

    const cycleMessages = () => {
      setCurrentMessageIndex((prev) => (prev + 1) % techMessages.length);
    };

    // Показать первое сообщение через 2 секунды
    const initialTimer = setTimeout(showMessage, 2000);

    // Затем каждые 8 секунд показывать новое сообщение
    const messageInterval = setInterval(() => {
      cycleMessages();
      setTimeout(showMessage, 500);
    }, 8000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(messageInterval);
    };
  }, [techMessages.length]);

  return createPortal(
    <div className="fixed left-8 top-1/2 transform -translate-y-1/2 z-[150]">
      <motion.div
        className="relative"
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 1, type: "spring" }}
      >
        {/* Tech Architect Spirit */}
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 2, 0, -2, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative w-24 h-24 cursor-pointer group"
        >
          {/* Cyber aura */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-pink-500/30 rounded-full blur-xl animate-pulse" />

          {/* Neural particles around spirit */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full"
              animate={{
                x: [0, Math.cos((i * 60 * Math.PI) / 180) * 40],
                y: [0, Math.sin((i * 60 * Math.PI) / 180) * 40],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut",
              }}
              style={{
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}

          {/* Spirit image */}
          <div className="relative z-10 w-full h-full rounded-full overflow-hidden border-2 border-cyan-400/60 shadow-lg group-hover:border-cyan-300 transition-all">
            <img
              src="/whisp-quest/textures/AI_spirit.png"
              alt="Tech Architect"
              className="w-full h-full object-cover"
              style={{
                filter: "hue-rotate(180deg) saturate(1.2) brightness(1.1)",
              }}
            />

            {/* Holographic overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-transparent to-purple-500/20 mix-blend-overlay" />
          </div>

          {/* Tech status indicator */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black animate-pulse">
            <div className="w-full h-full bg-green-400 rounded-full animate-ping opacity-75" />
          </div>
        </motion.div>

        {/* Chat bubble */}
        <ChatBubble
          message={techMessages[currentMessageIndex]}
          isVisible={showBubble}
        />

        {/* Tech Architect label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg px-3 py-1"
        >
          <div className="text-cyan-300 text-xs font-mono font-bold text-center">
            🤖 TECH ARCHITECT
          </div>
        </motion.div>
      </motion.div>
    </div>,
    document.body
  );
};
