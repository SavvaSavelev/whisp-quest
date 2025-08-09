import { Spirit } from "../entities/types";
import { apiClient } from "./APIClient";
import { randomPositionInRoom } from "./randomPositionInRoom";

/**
 * Анализирует текст через whisp-server с OpenAI и создаёт объект духа.
 * Заметьте: теперь эта функция НЕ помещает духа в архив.
 */
export const generateSpirit = async (text: string): Promise<Spirit | null> => {
  try {
    if (!text.trim()) {
      throw new Error("Текст не может быть пустым");
    }

    // Используем API клиент для анализа через ваш whisp-server
    const analysis = await apiClient.analyzeSentiment(text);

    // Генерируем имя духа на основе настроения - ИИ TECH GURU SPIRITS!
    const spiritNames = {
      радостный: [
        "🤖 Neural Happiness Engine",
        "⚡ Joy Algorithm Specialist",
        "🌟 Positive Code Generator",
        "🚀 Enthusiasm.js Developer",
        "💫 Optimized Bliss Creator",
      ],
      печальный: [
        "🧠 Deep Learning Melancholy",
        "💔 Emotional Debug Analyst",
        "🌧️ Sad.py Processing Unit",
        "😔 Deprecation Handler Spirit",
        "🥀 Legacy System Mourner",
      ],
      злой: [
        "🔥 Rage-Driven Optimizer",
        "💀 Error Destruction Engine",
        "⚡ Performance Fury Beast",
        "🗲 Angry Architecture Enforcer",
        "🌪️ Chaos Engineering Demon",
      ],
      спокойный: [
        "🧘 Zen Code Meditation AI",
        "☯️ Balanced Algorithm Master",
        "🌊 Peaceful Processing Unit",
        "🍃 Calm.ts Execution Engine",
        "🕯️ Mindful Memory Manager",
      ],
      вдохновлённый: [
        "💡 Creative AI Visionary",
        "🚀 Innovation Neural Network",
        "✨ Inspiration Generator 3000",
        "🎨 Artistic Code Composer",
        "🌈 Dream-Driven Developer",
      ],
      сонный: [
        "😴 Lazy Loading Sleeper",
        "🛌 Background Process Dreamer",
        "💤 Sleep Mode Optimizer",
        "🌙 Night Shift Coder",
        "⏰ Scheduled Task Snoozer",
      ],
      испуганный: [
        "😨 Security Paranoia AI",
        "🛡️ Fear-Based Protection",
        "🚨 Anxiety Alert System",
        "⚠️ Worried Exception Handler",
        "🔒 Panic-Driven Encryption",
      ],
      игривый: [
        "🎮 Playful UI Animator",
        "🎭 Fun Function Creator",
        "🎪 Circus.js Performance",
        "🎨 Interactive Art Generator",
        "🎵 Melody Code Composer",
      ],
      меланхоличный: [
        "🎭 Poetic Code Philosopher",
        "📚 Nostalgic Documentation",
        "🍂 Autumn Algorithm Keeper",
        "🌅 Sunset Data Processor",
        "📝 Melancholic Memory Writer",
      ],
    };

    const moodNames =
      spiritNames[analysis.mood as keyof typeof spiritNames] ||
      spiritNames.спокойный;
    const randomName = moodNames[Math.floor(Math.random() * moodNames.length)];

    const spirit: Spirit = {
      id: crypto.randomUUID(),
      name: `${randomName}`,
      mood: analysis.mood,
      color: analysis.color || "#ffffff",
      rarity: analysis.rarity || "обычный",
      essence:
        analysis.essence || "⚡ Neural Tech Spirit готов к кибер-кодингу",
      dialogue:
        analysis.dialogue ||
        "🤖 Привет! Я AI-Enhanced Developer Spirit. Готов обсудить квантовую архитектуру и нейро-фичи!",
      originText: text,
      position: randomPositionInRoom(),
      birthDate: new Date().toISOString(),
    };

    return spirit;
  } catch (error) {
    console.error("❌ Ошибка генерации духа:", error);
    return null;
  }
};
