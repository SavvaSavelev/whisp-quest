import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { TechFeature } from "../../entities/types";
import { useUIStore } from "../../store/uiStore";
import { useTechFeatureStore } from "../../store/useTechFeatureStore";
import { Button } from "../../ui-kit/Button";
import { Card } from "../../ui-kit/Card";
import { AISpiritChat } from "../UI/AISpiritChat";
import { NeuralDataModal } from "../UI/NeuralDataModal";
import { OpenAIConfig } from "../UI/OpenAIConfig";

interface TechFeatureCardProps {
  feature: TechFeature;
  onUpvote: (id: string) => void;
}

const TechFeatureCard: React.FC<TechFeatureCardProps> = ({
  feature,
  onUpvote,
}) => {
  const [showNeuralModal, setShowNeuralModal] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      Junior: "from-green-500 to-emerald-600",
      Middle: "from-blue-500 to-cyan-600",
      Senior: "from-purple-500 to-violet-600",
      Lead: "from-orange-500 to-amber-600",
      CTO: "from-red-500 to-pink-600",
    };
    return (
      colors[difficulty as keyof typeof colors] || "from-gray-500 to-slate-600"
    );
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      Frontend: "🎨",
      Backend: "⚙️",
      "AI/ML": "🤖",
      DevOps: "🔧",
      Mobile: "📱",
      "Full Stack": "🌟",
    };
    return icons[category as keyof typeof icons] || "💡";
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group relative"
    >
      {/* Cyber glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300" />

      <Card.Root className="relative bg-black/60 backdrop-blur-xl border border-cyan-500/40 hover:border-cyan-400/60 transition-all duration-300 rounded-2xl overflow-hidden">
        <div className="p-6">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, cyan 0%, transparent 50%),
                               radial-gradient(circle at 80% 20%, purple 0%, transparent 50%),
                               radial-gradient(circle at 40% 80%, pink 0%, transparent 50%)`,
              }}
            />
          </div>

          {/* Header */}
          <div className="relative z-10 flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">
                  {getCategoryIcon(feature.category)}
                </span>
                <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text">
                  {feature.title}
                </h3>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getDifficultyColor(
                    feature.difficulty
                  )} shadow-lg`}
                >
                  {feature.difficulty}
                </div>
              </div>
              <p className="text-cyan-100/80 text-sm mb-4 leading-relaxed font-mono">
                {feature.description}
              </p>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-2 mb-6">
            {feature.techStack.map((tech, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gradient-to-r from-cyan-900/50 to-purple-900/50 text-cyan-200 rounded-lg text-xs font-mono border border-cyan-500/30 backdrop-blur-sm"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6 text-sm">
              <span className="text-cyan-400 font-mono">
                ⏱️ {feature.estimatedTime}
              </span>
              <span className="text-purple-400 font-mono">
                📊 {feature.category}
              </span>
              <span className="text-pink-400 font-bold font-mono">
                🔥 {feature.priority}
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onUpvote(feature.id)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-xl hover:from-cyan-500 hover:to-purple-500 transition-all shadow-lg font-mono font-bold"
            >
              <span>👍</span>
              <span>{feature.upvotes}</span>
            </motion.button>
          </div>

          {/* Neural Data Button */}
          <div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log(
                  "Show Neural Data clicked for feature:",
                  feature.title
                );
                setShowNeuralModal(true);
              }}
              className="w-full px-4 py-2 text-cyan-400 hover:text-cyan-300 bg-black/40 border border-cyan-500/30 hover:border-cyan-400/50 rounded-xl font-mono font-bold uppercase tracking-wide transition-all cursor-pointer"
              style={{ zIndex: 10, position: "relative" }}
            >
              🧠 SHOW NEURAL DATA
            </button>
          </div>

          {/* Neural Data Modal */}
          <NeuralDataModal
            isOpen={showNeuralModal}
            onClose={() => setShowNeuralModal(false)}
            feature={feature}
          />
        </div>
      </Card.Root>
    </motion.div>
  );
};

export const TechFeatureVault: React.FC = () => {
  const {
    features,
    isGenerating,
    upvoteFeature,
    generateNewFeatures,
    clearFeatures,
    resetGenerating,
  } = useTechFeatureStore();

  const setShowTechFeatures = useUIStore((state) => state.setShowTechFeatures);

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [showAIChat, setShowAIChat] = useState(false);
  const [showOpenAIConfig, setShowOpenAIConfig] = useState(false);
  const [matrixLoaded, setMatrixLoaded] = useState(false);

  // Принудительно сбрасываем состояние загрузки при монтировании
  useEffect(() => {
    console.log("TechFeatureVault mounted, isGenerating:", isGenerating);
    resetGenerating();
    const timer = setTimeout(() => setMatrixLoaded(true), 1500);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Matrix loading effect
  const MatrixLoader = () => (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: matrixLoaded ? 0 : 1 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 bg-black z-50 flex items-center justify-center"
      style={{ pointerEvents: matrixLoaded ? "none" : "auto" }}
    >
      <div className="text-center">
        <div className="text-6xl mb-4 animate-pulse">⚡</div>
        <div className="text-cyan-400 font-mono text-xl mb-4 animate-bounce">
          INITIALIZING NEURAL MATRIX...
        </div>
        <div className="flex justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-8 bg-cyan-400 animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: "1s",
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );

  const categories = [
    "All",
    "Frontend",
    "Backend",
    "AI/ML",
    "DevOps",
    "Mobile",
    "Full Stack",
  ];
  const difficulties = ["All", "Junior", "Middle", "Senior", "Lead", "CTO"];

  const filteredFeatures = features.filter((feature) => {
    const categoryMatch =
      selectedCategory === "All" || feature.category === selectedCategory;
    const difficultyMatch =
      selectedDifficulty === "All" || feature.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  return (
    <div className="min-h-screen relative">
      {/* Matrix Loading Screen */}
      <MatrixLoader />

      {/* AI CYBER BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-cyan-900">
        {/* Animated grid */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.3) 1px, transparent 1px)
          `,
            backgroundSize: "50px 50px",
            animation: "grid-move 20s linear infinite",
          }}
        />

        {/* Floating particles */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}

        {/* Neural network lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          {[...Array(20)].map((_, i) => (
            <line
              key={i}
              x1={`${Math.random() * 100}%`}
              y1={`${Math.random() * 100}%`}
              x2={`${Math.random() * 100}%`}
              y2={`${Math.random() * 100}%`}
              stroke="rgba(0, 255, 255, 0.5)"
              strokeWidth="1"
              className="animate-pulse"
            />
          ))}
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6 h-full flex flex-col">
        {/* CYBER HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="relative flex flex-col items-center justify-center w-full mb-6">
            <div className="relative">
              <h1 className="text-6xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 tracking-wider font-mono text-center">
                ⚡ VAULT TECH ⚡
              </h1>
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-xl rounded-xl animate-pulse" />
            </div>
            {/* Кнопка закрытия */}
            <button
              onClick={() => setShowTechFeatures(false)}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-red-600/80 to-pink-600/80 hover:from-red-500/80 hover:to-pink-500/80 text-white rounded-xl border-2 border-red-400/50 hover:border-red-300/70 transition-all backdrop-blur-sm font-mono font-bold uppercase tracking-wide shadow-lg hover:shadow-red-400/25"
            >
              ✕ DISCONNECT
            </button>
          </div>

          <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text mb-4 font-mono">
            🧠 AI GENIUS NEURAL NETWORK 🧠
          </h2>

          {/* AI CHAT CONTROLS */}
          <div className="flex justify-center gap-4 mb-4">
            <Button
              onClick={() => setShowAIChat(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-500 hover:via-pink-500 hover:to-red-500 text-white font-bold rounded-xl border-2 border-purple-400/50 shadow-lg hover:shadow-purple-400/50 transition-all duration-300 uppercase tracking-wide font-mono"
            >
              💬 CHAT WITH AI SPIRIT
            </Button>

            <Button
              onClick={() => setShowOpenAIConfig(true)}
              className="px-6 py-3 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:via-orange-500 hover:to-red-500 text-white font-bold rounded-xl border-2 border-amber-400/50 shadow-lg hover:shadow-amber-400/50 transition-all duration-300 uppercase tracking-wide font-mono"
            >
              🔧 CONFIGURE AI
            </Button>
          </div>
        </motion.div>

        {/* CYBER CONTROLS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-black/60 backdrop-blur-xl border border-cyan-500/40 rounded-2xl relative overflow-hidden"
        >
          {/* Animated border */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 animate-pulse opacity-50" />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap gap-6">
              {/* Category Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-cyan-300 uppercase tracking-wide font-mono">
                  Neural Category:
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 bg-black/80 border border-cyan-500/50 rounded-lg text-cyan-100 font-mono text-sm focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all backdrop-blur-sm"
                >
                  {categories.map((cat) => (
                    <option
                      key={cat}
                      value={cat}
                      className="bg-slate-900 text-cyan-100"
                    >
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-purple-300 uppercase tracking-wide font-mono">
                  Neural Level:
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-4 py-2 bg-black/80 border border-purple-500/50 rounded-lg text-purple-100 font-mono text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all backdrop-blur-sm"
                >
                  {difficulties.map((diff) => (
                    <option
                      key={diff}
                      value={diff}
                      className="bg-slate-900 text-purple-100"
                    >
                      {diff}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => {
                  console.log(
                    "Generate button clicked, isGenerating:",
                    isGenerating
                  );
                  generateNewFeatures();
                }}
                disabled={isGenerating}
                className="relative px-8 py-3 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 hover:from-cyan-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold text-sm rounded-xl border-2 border-cyan-400/50 shadow-lg hover:shadow-cyan-400/50 transition-all duration-300 uppercase tracking-wide overflow-hidden group font-mono"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-pink-400/20 animate-pulse" />
                <div className="relative z-10 flex items-center gap-2">
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin" />
                      🧠 AI PROCESSING...
                    </>
                  ) : (
                    <>⚡ GENERATE FEATURES</>
                  )}
                </div>
              </Button>

              <Button
                onClick={clearFeatures}
                className="px-6 py-3 bg-red-900/80 hover:bg-red-800/80 text-red-200 hover:text-white border-2 border-red-500/50 hover:border-red-400 rounded-xl font-bold text-sm uppercase tracking-wide transition-all duration-300 font-mono"
              >
                🗑️ PURGE DATA
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-4 gap-4 mb-8"
        >
          {[
            {
              label: "Neural Features",
              value: features.length,
              icon: "💡",
              color: "cyan",
            },
            {
              label: "AI Votes",
              value: features.reduce((sum, f) => sum + f.upvotes, 0),
              icon: "👍",
              color: "purple",
            },
            {
              label: "Categories",
              value: new Set(features.map((f) => f.category)).size,
              icon: "📂",
              color: "pink",
            },
            {
              label: "CTO Level",
              value: features.filter((f) => f.difficulty === "CTO").length,
              icon: "👑",
              color: "amber",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center p-4 bg-black/60 backdrop-blur-xl border border-cyan-500/30 rounded-xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div
                  className={`text-2xl font-bold text-${stat.color}-400 font-mono`}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-cyan-200/80 font-mono uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Features Grid с прокруткой */}
        <div className="flex-1 overflow-y-auto pr-2 scrollbar-cyber">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
            <AnimatePresence>
              {filteredFeatures.map((feature) => (
                <TechFeatureCard
                  key={feature.id}
                  feature={feature}
                  onUpvote={upvoteFeature}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {filteredFeatures.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-cyan-300 mb-2 font-mono">
                NEURAL DATABASE EMPTY
              </h3>
              <p className="text-cyan-100/60 mb-6 font-mono">
                No features match current neural filters. Initiate AI generation
                protocol.
              </p>
              <Button
                onClick={generateNewFeatures}
                disabled={isGenerating}
                className="bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 hover:from-cyan-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold px-8 py-3 rounded-xl border-2 border-cyan-400/50 font-mono uppercase tracking-wide"
              >
                {isGenerating
                  ? "🧠 AI NEURAL PROCESSING..."
                  : "🚀 INITIALIZE AI GENERATION"}
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* AI CHAT MODAL */}
      <AISpiritChat isOpen={showAIChat} onClose={() => setShowAIChat(false)} />

      {/* OPENAI CONFIG MODAL */}
      {showOpenAIConfig && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowOpenAIConfig(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <OpenAIConfig onConfigured={() => setShowOpenAIConfig(false)} />
          </div>
        </motion.div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        /* Cyber Scrollbar */
        .scrollbar-cyber::-webkit-scrollbar {
          width: 8px;
        }
        
        .scrollbar-cyber::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
        }
        
        .scrollbar-cyber::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #00ffff 0%, #ff00ff 50%, #ffff00 100%);
          border-radius: 4px;
          border: 1px solid rgba(0, 255, 255, 0.3);
        }
        
        .scrollbar-cyber::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #00ffff 0%, #ff00ff 100%);
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};
