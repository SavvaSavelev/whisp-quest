import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SpiritGenerationLoaderProps {
  isVisible: boolean;
  stage?: 'analyzing' | 'generating' | 'materializing' | 'completing';
  progress?: number;
}

const stages = {
  analyzing: {
    text: 'Анализирую ваши мысли...',
    color: 'from-blue-500 to-indigo-600',
    icon: '🧠'
  },
  generating: {
    text: 'Создаю духовную сущность...',
    color: 'from-purple-500 to-pink-600',
    icon: '✨'
  },
  materializing: {
    text: 'Материализую дух...',
    color: 'from-indigo-500 to-purple-700',
    icon: '🌟'
  },
  completing: {
    text: 'Завершаю создание...',
    color: 'from-green-500 to-teal-600',
    icon: '🎯'
  }
};

export const SpiritGenerationLoader: React.FC<SpiritGenerationLoaderProps> = ({
  isVisible,
  stage = 'analyzing',
  progress = 0
}) => {
  const currentStage = stages[stage];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gray-900/90 border border-gray-700 rounded-2xl p-8 max-w-md w-full mx-4 backdrop-blur-lg"
          >
            {/* Главная анимация */}
            <div className="flex flex-col items-center space-y-6">
              {/* Орб с пульсацией */}
              <div className="relative">
                <motion.div
                  className={`w-24 h-24 rounded-full bg-gradient-to-r ${currentStage.color} shadow-2xl`}
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Внутренний орб */}
                <motion.div
                  className="absolute inset-4 bg-white/20 rounded-full backdrop-blur-sm"
                  animate={{
                    scale: [0.8, 1.2, 0.8],
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Эмодзи в центре */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center text-2xl"
                  animate={{
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {currentStage.icon}
                </motion.div>

                {/* Кольцевые волны */}
                {[1, 2, 3].map((ring) => (
                  <motion.div
                    key={ring}
                    className={`absolute inset-0 rounded-full border-2 border-white/20`}
                    style={{
                      width: `${100 + ring * 20}%`,
                      height: `${100 + ring * 20}%`,
                      left: `${-ring * 10}%`,
                      top: `${-ring * 10}%`
                    } as React.CSSProperties}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0, 0.6, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: ring * 0.3
                    }}
                  />
                ))}
              </div>

              {/* Текст статуса */}
              <motion.div
                key={stage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-2"
              >
                <h3 className="text-xl font-semibold text-white">
                  {currentStage.text}
                </h3>
                
                {/* Прогресс-бар */}
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${currentStage.color} rounded-full`}
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                
                <p className="text-sm text-gray-400">
                  {Math.round(progress)}% завершено
                </p>
              </motion.div>

              {/* Анимированные частицы */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white/60 rounded-full"
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${20 + Math.random() * 60}%`
                    } as React.CSSProperties}
                    animate={{
                      y: [-20, -40, -20],
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
