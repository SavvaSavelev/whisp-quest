import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { getOpenAIClient } from "../../lib/openai";
import { Button } from "../../ui-kit/Button";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AISpiritChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AISpiritChat: React.FC<AISpiritChatProps> = ({
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "🤖 Привет! Я AI Genius Spirit из WHISP QUEST! Готов помочь с техническими вопросами и генерацией крутых фич для проекта. О чём поговорим?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const client = getOpenAIClient();
      const conversationHistory = messages.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));

      const response = await client.chatWithAISpirit(
        userMessage.content,
        conversationHistory
      );

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);

      // Fallback ответы
      const fallbackResponses = [
        "🤖 Хм, у меня временные проблемы с нейросетью! Но я знаю, что для WHISP QUEST можно добавить крутые анимации духов с помощью Framer Motion!",
        "⚡ Кибер-соединение прервано! Зато могу предложить интегрировать систему эмоций для духов через Zustand store!",
        "🧠 Нейросеть перегружена! Но помню, что gossip система может использовать WebSocket для реалтайм обмена сообщениями между духами!",
        "💻 API недоступен, но идея такая: добавить процедурную генерацию настроений духов на основе времени суток и активности пользователя!",
      ];

      const fallbackMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          fallbackResponses[
            Math.floor(Math.random() * fallbackResponses.length)
          ],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-900 border-2 border-cyan-500/50 rounded-2xl w-full max-w-2xl h-[600px] flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cyber background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5" />

        {/* Header */}
        <div className="relative z-10 p-4 border-b border-cyan-500/30 bg-black/60 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🤖</div>
              <div>
                <h3 className="text-lg font-bold text-transparent bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text font-mono">
                  AI GENIUS SPIRIT
                </h3>
                <p className="text-xs text-cyan-400 font-mono">
                  Neural Chat Interface
                </p>
              </div>
            </div>
            <Button
              onClick={onClose}
              className="text-cyan-400 hover:text-cyan-300 bg-black/40 border border-cyan-500/30 rounded-lg p-2"
            >
              ✕
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl font-mono text-sm ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-cyan-600 to-purple-600 text-white"
                      : "bg-black/60 border border-cyan-500/30 text-cyan-100"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div
                    className={`text-xs mt-2 opacity-60 ${
                      message.role === "user"
                        ? "text-cyan-100"
                        : "text-cyan-400"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString("ru-RU", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-black/60 border border-cyan-500/30 text-cyan-100 p-3 rounded-2xl">
                <div className="flex items-center gap-2 font-mono text-sm">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                  AI думает...
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="relative z-10 p-4 border-t border-cyan-500/30 bg-black/60 backdrop-blur-sm">
          <div className="flex gap-3">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Спроси у AI Genius Spirit о техфичах для Whisp Quest..."
              className="flex-1 p-3 bg-black/60 border border-cyan-500/50 rounded-xl text-cyan-100 font-mono text-sm resize-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all backdrop-blur-sm"
              rows={2}
              disabled={isTyping}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 hover:from-cyan-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold rounded-xl border-2 border-cyan-400/50 transition-all font-mono uppercase tracking-wide"
            >
              {isTyping ? (
                <div className="w-4 h-4 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin" />
              ) : (
                "🚀"
              )}
            </Button>
          </div>
          <div className="mt-2 text-xs text-cyan-400/60 font-mono text-center">
            ⚡ Нажмите Enter для отправки • Shift+Enter для новой строки
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
