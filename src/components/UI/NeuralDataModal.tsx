import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { createPortal } from "react-dom";
import { TechFeature } from "../../entities/types";

interface NeuralDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: TechFeature | null;
}

export const NeuralDataModal: React.FC<NeuralDataModalProps> = ({
  isOpen,
  onClose,
  feature,
}) => {
  if (!isOpen || !feature) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative max-w-6xl w-full max-h-[90vh] bg-gradient-to-br from-slate-900 via-purple-900 to-cyan-900 rounded-3xl border-2 border-cyan-400/60 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Neural Network Background */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />
            <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
              {[...Array(48)].map((_, i) => (
                <motion.div
                  key={i}
                  className="border-r border-b border-cyan-400/20"
                  animate={{
                    opacity: [0.1, 0.3, 0.1],
                    borderColor: [
                      "rgba(34, 211, 238, 0.2)",
                      "rgba(168, 85, 247, 0.2)",
                      "rgba(236, 72, 153, 0.2)",
                    ],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 w-12 h-12 bg-red-900/80 hover:bg-red-800 border-2 border-red-500/50 hover:border-red-400 rounded-xl flex items-center justify-center text-red-200 hover:text-white transition-all duration-300 font-bold text-xl"
          >
            ✕
          </button>

          <div className="relative z-10 flex h-full">
            {/* AI Spirit Side */}
            <div className="w-80 bg-black/60 backdrop-blur-xl border-r border-cyan-500/30 p-6 flex flex-col">
              {/* AI Spirit Avatar */}
              <div className="text-center mb-6">
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 2, 0, -2, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative w-24 h-24 mx-auto mb-4"
                >
                  {/* Cyber aura */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-pink-500/30 rounded-full blur-xl animate-pulse" />

                  {/* Spirit image */}
                  <div className="relative z-10 w-full h-full rounded-full overflow-hidden border-2 border-cyan-400/60 shadow-lg">
                    <img
                      src="/whisp-quest/textures/AI_spirit.png"
                      alt="AI Neural Analyst"
                      className="w-full h-full object-cover"
                      style={{
                        filter:
                          "hue-rotate(120deg) saturate(1.3) brightness(1.2)",
                      }}
                    />

                    {/* Holographic overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-green-500/20 via-transparent to-cyan-500/20 mix-blend-overlay" />
                  </div>
                </motion.div>

                <h3 className="text-cyan-300 text-lg font-mono font-bold">
                  🧠 NEURAL ANALYST
                </h3>
                <p className="text-cyan-400/80 text-sm font-mono">
                  AI Feature Specialist
                </p>
              </div>

              {/* AI Speech */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex-1 bg-black/80 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-4"
              >
                <div className="text-cyan-100 text-sm font-mono leading-relaxed">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mb-3"
                  >
                    💫 Анализирую нейронные данные фичи "{feature.title}"...
                  </motion.p>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="mb-3"
                  >
                    🔬 Эта фича имеет сложность{" "}
                    <span className="text-cyan-300 font-bold">
                      {feature.difficulty}
                    </span>{" "}
                    и относится к категории{" "}
                    <span className="text-purple-300 font-bold">
                      {feature.category}
                    </span>
                    .
                  </motion.p>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="mb-3"
                  >
                    ⚡ Технологический стек:{" "}
                    <span className="text-pink-300">
                      {feature.techStack.join(", ")}
                    </span>
                  </motion.p>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5 }}
                    className="mb-3 text-green-300"
                  >
                    📊 Рейтинг: {feature.upvotes} нейронных лайков от комьюнити!
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3 }}
                    className="text-xs text-cyan-400 mt-4 pt-3 border-t border-cyan-500/30"
                  >
                    🤖 Создано: {feature.createdBy}
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Feature Details Side */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-6">
                {/* Header */}
                <div className="text-center">
                  <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-mono mb-2"
                  >
                    {feature.title}
                  </motion.h2>
                  <div className="flex items-center justify-center gap-4 text-sm font-mono">
                    <span className="px-3 py-1 bg-cyan-900/50 border border-cyan-500/30 rounded-lg text-cyan-300">
                      📁 {feature.category}
                    </span>
                    <span className="px-3 py-1 bg-purple-900/50 border border-purple-500/30 rounded-lg text-purple-300">
                      ⚡ {feature.difficulty}
                    </span>
                    <span className="px-3 py-1 bg-pink-900/50 border border-pink-500/30 rounded-lg text-pink-300">
                      ⏱️ {feature.estimatedTime}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-black/60 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6"
                >
                  <h3 className="text-xl font-bold text-cyan-300 mb-3 font-mono">
                    📝 Описание
                  </h3>
                  <p className="text-cyan-100 leading-relaxed font-mono">
                    {feature.description}
                  </p>
                </motion.div>

                {/* Benefits */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-black/60 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6"
                >
                  <h3 className="text-xl font-bold text-green-300 mb-3 font-mono">
                    🎯 Преимущества
                  </h3>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className="flex items-center gap-2 text-green-100 font-mono"
                      >
                        <span className="text-green-400">✨</span>
                        {benefit}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>

                {/* Code Example */}
                {feature.codeExample && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-black/60 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6"
                  >
                    <h3 className="text-xl font-bold text-purple-300 mb-3 font-mono">
                      💻 Пример кода
                    </h3>
                    <pre className="bg-black/80 text-green-400 p-4 rounded-lg text-sm overflow-x-auto border border-purple-500/30 font-mono">
                      <code>{feature.codeExample}</code>
                    </pre>
                  </motion.div>
                )}

                {/* Tech Stack */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="bg-black/60 backdrop-blur-xl border border-pink-500/30 rounded-2xl p-6"
                >
                  <h3 className="text-xl font-bold text-pink-300 mb-3 font-mono">
                    🛠️ Технологии
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {feature.techStack.map((tech, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1 + index * 0.1 }}
                        className="px-3 py-1 bg-pink-900/50 border border-pink-500/30 rounded-lg text-pink-200 text-sm font-mono"
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};
