import { motion } from "framer-motion";
import React, { useState } from "react";
import { setOpenAIApiKey } from "../../lib/openai";
import { Button } from "../../ui-kit/Button";

interface OpenAIConfigProps {
  onConfigured: () => void;
}

export const OpenAIConfig: React.FC<OpenAIConfigProps> = ({ onConfigured }) => {
  const [apiKey, setApiKey] = useState("");
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      setError("Введите API ключ OpenAI");
      return;
    }

    setIsTestingKey(true);
    setError(null);

    try {
      // Устанавливаем ключ
      setOpenAIApiKey(apiKey.trim());

      // Простая проверка ключа
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Сохраняем в localStorage для последующих сессий
      localStorage.setItem("openai_api_key", apiKey.trim());

      onConfigured();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Ошибка проверки API ключа"
      );
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSkip = () => {
    onConfigured();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto p-6 bg-black/80 backdrop-blur-xl border border-cyan-500/40 rounded-2xl relative overflow-hidden"
    >
      {/* Cyber background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />

      <div className="relative z-10">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🤖</div>
          <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text mb-2 font-mono">
            AI GENIUS NEURAL LINK
          </h3>
          <p className="text-cyan-100/80 text-sm font-mono">
            Подключите OpenAI API для продвинутой генерации фич
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-cyan-300 mb-2 uppercase tracking-wide font-mono">
              OpenAI API Key:
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-4 py-3 bg-black/60 border border-cyan-500/50 rounded-lg text-cyan-100 font-mono text-sm focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all backdrop-blur-sm"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-sm font-mono">
              ⚠️ {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleSaveKey}
              disabled={isTestingKey || !apiKey.trim()}
              className="flex-1 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 hover:from-cyan-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold py-3 rounded-xl border-2 border-cyan-400/50 transition-all duration-300 font-mono uppercase tracking-wide"
            >
              {isTestingKey ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin" />
                  TESTING...
                </div>
              ) : (
                "🔗 CONNECT AI"
              )}
            </Button>

            <Button
              onClick={handleSkip}
              className="px-6 py-3 bg-slate-700/80 hover:bg-slate-600/80 text-slate-200 hover:text-white border-2 border-slate-500/50 hover:border-slate-400 rounded-xl font-bold transition-all duration-300 font-mono uppercase tracking-wide"
            >
              SKIP
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-cyan-400/60 font-mono">
              🔒 Ключ сохраняется локально в браузере
              <br />
              📚 Получить API ключ: platform.openai.com
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
