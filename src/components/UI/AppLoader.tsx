import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AppLoaderProps {
  isVisible: boolean;
  progress?: number;
  message?: string;
}

export const AppLoader: React.FC<AppLoaderProps> = ({
  isVisible,
  progress = 0,
  message = "Загружаю мир духов..."
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900"
        >
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="text-center space-y-8 max-w-md w-full">
              
              {/* Главный логотип/анимация */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative"
              >
                {/* Центральная сфера */}
                <motion.div
                  className="w-32 h-32 mx-auto relative"
                  animate={{
                    rotate: [0, 360]
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  {/* Внешнее кольцо */}
                  <motion.div
                    className="absolute inset-0 border-4 border-purple-400/30 rounded-full"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.3, 0.7, 0.3]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  
                  {/* Средняя сфера */}
                  <motion.div
                    className="absolute inset-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full shadow-2xl"
                    animate={{
                      scale: [0.9, 1, 0.9],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  
                  {/* Внутреннее свечение */}
                  <motion.div
                    className="absolute inset-8 bg-white/40 rounded-full backdrop-blur-sm"
                    animate={{
                      opacity: [0.4, 0.8, 0.4],
                      scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />

                  {/* Орбитальные элементы */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-white rounded-full"
                      style={{
                        left: '50%',
                        top: '50%',
                        transformOrigin: '0px 60px'
                      } as React.CSSProperties}
                      animate={{
                        rotate: [0, 360],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "linear"
                      }}
                      initial={{
                        rotate: i * 60
                      }}
                    />
                  ))}
                </motion.div>

                {/* Эффект свечения */}
                <motion.div
                  className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.2, 0.5, 0.2]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>

              {/* Заголовок */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="space-y-4"
              >
                <h1 className="text-4xl font-bold text-white">
                  Whisp Quest
                </h1>
                <p className="text-xl text-purple-200">
                  Мир духов ожидает вас
                </p>
              </motion.div>

              {/* Прогресс */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="space-y-4"
              >
                {/* Прогресс-бар */}
                <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                
                {/* Текст статуса */}
                <motion.p
                  className="text-purple-200 text-lg"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {message}
                </motion.p>
                
                <p className="text-sm text-gray-400">
                  {Math.round(progress)}%
                </p>
              </motion.div>

              {/* Дополнительные элементы */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 1 }}
                className="flex justify-center space-x-2"
              >
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-purple-400 rounded-full"
                    animate={{
                      scale: [0.8, 1.2, 0.8],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
