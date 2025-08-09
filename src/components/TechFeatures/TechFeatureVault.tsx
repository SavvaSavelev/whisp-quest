import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { TechFeature } from "../../entities/types";
import { useTechFeatureStore } from "../../store/useTechFeatureStore";
import { Button } from "../../ui-kit/Button";
import { Card } from "../../ui-kit/Card";

interface TechFeatureCardProps {
  feature: TechFeature;
  onUpvote: (id: string) => void;
}

const TechFeatureCard: React.FC<TechFeatureCardProps> = ({
  feature,
  onUpvote,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      Junior: "bg-green-500",
      Middle: "bg-blue-500",
      Senior: "bg-purple-500",
      Lead: "bg-orange-500",
      CTO: "bg-red-500",
    };
    return colors[difficulty as keyof typeof colors] || "bg-gray-500";
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
      className="group"
    >
      <Card.Root
        className="border-2 border-purple-300/30 hover:border-purple-400/60 transition-all duration-300 bg-gradient-to-br from-purple-50/90 to-blue-50/90 backdrop-blur-sm"
        variant="spiritual"
        withGlow
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">
                  {getCategoryIcon(feature.category)}
                </span>
                <h3 className="text-xl font-bold text-purple-900">
                  {feature.title}
                </h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${getDifficultyColor(
                    feature.difficulty
                  )}`}
                >
                  {feature.difficulty}
                </span>
              </div>
              <p className="text-gray-700 text-sm mb-3">
                {feature.description}
              </p>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-2 mb-4">
            {feature.techStack.map((tech, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>⏱️ {feature.estimatedTime}</span>
              <span>📊 {feature.category}</span>
              <span className="text-purple-600 font-semibold">
                🔥 {feature.priority}
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onUpvote(feature.id)}
              className="flex items-center gap-2 px-3 py-1 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
            >
              <span>👍</span>
              <span className="font-semibold">{feature.upvotes}</span>
            </motion.button>
          </div>

          {/* Expandable Section */}
          <div>
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full justify-center text-purple-600 hover:text-purple-800 bg-transparent border-none"
            >
              {isExpanded ? "🔼 Скрыть детали" : "🔽 Показать детали"}
            </Button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-4"
                >
                  {/* Benefits */}
                  <div>
                    <h4 className="font-semibold text-purple-800 mb-2">
                      🚀 Преимущества:
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      {feature.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Code Example */}
                  {feature.codeExample && (
                    <div>
                      <h4 className="font-semibold text-purple-800 mb-2">
                        💻 Пример кода:
                      </h4>
                      <pre className="bg-gray-900 text-green-400 p-3 rounded-md text-xs overflow-x-auto">
                        <code>{feature.codeExample}</code>
                      </pre>
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-purple-200">
                    <span>👨‍💻 {feature.createdBy}</span>
                    <span>
                      📅{" "}
                      {new Date(feature.createdAt).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
  } = useTechFeatureStore();

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");

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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Epic Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            🚀 МЕГА УЛЬТРА ХРАНИЛИЩЕ 🚀
          </h1>
          <h2 className="text-3xl font-bold text-purple-800 mb-2">
            ✨ КРУТЫХ ФИЧ ОТ TECH ДУХОВ ✨
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Собрание эпических идей от самых крутых Senior Developer Spirits!
            Каждая фича - это шедевр инженерной мысли! 🧠⚡
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-8 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-purple-200"
        >
          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-purple-800 mb-1">
                Категория:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-purple-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-purple-800 mb-1">
                Сложность:
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 border border-purple-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500"
              >
                {difficulties.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={generateNewFeatures}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold px-6 py-2"
            >
              {isGenerating ? "🧠 AI Думает..." : "✨ Генерировать Новые Фичи"}
            </Button>

            <Button
              onClick={clearFeatures}
              className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent border-2"
            >
              🗑️ Очистить
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: "Всего фич", value: features.length, icon: "💡" },
            {
              label: "Голосов",
              value: features.reduce((sum, f) => sum + f.upvotes, 0),
              icon: "👍",
            },
            {
              label: "Категорий",
              value: new Set(features.map((f) => f.category)).size,
              icon: "📂",
            },
            {
              label: "CTO уровень",
              value: features.filter((f) => f.difficulty === "CTO").length,
              icon: "👑",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-purple-200"
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-purple-800">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            <div className="text-6xl mb-4">🤔</div>
            <h3 className="text-xl font-semibold text-purple-800 mb-2">
              Нет фич для отображения
            </h3>
            <p className="text-gray-600 mb-6">
              Попробуйте изменить фильтры или сгенерировать новые фичи от AI
              духов!
            </p>
            <Button
              onClick={generateNewFeatures}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold px-8 py-3"
            >
              {isGenerating
                ? "🧠 AI Работает..."
                : "🚀 Генерировать Первые Фичи"}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
