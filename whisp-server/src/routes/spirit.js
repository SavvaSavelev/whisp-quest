// src/routes/spirit.js
import express from 'express';
import OpenAI from 'openai';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import cache from '../utils/cache.js';
import { validateSpiritChatRequest, validateSpiritGossipRequest } from '../middleware/validation.js';
import { chatRateLimit } from '../middleware/security.js';
import { asyncErrorHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Инициализация OpenAI
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
  timeout: config.openai.timeout
});

/**
 * POST /spirit/chat
 * Чат с духом
 */
router.post('/chat',
  chatRateLimit,
  validateSpiritChatRequest,
  asyncErrorHandler(async (req, res) => {
    const { message, spiritPersonality = '', context = '' } = req.body;
    
    logger.info('💬 Запрос чата с духом', {
      messageLength: message.length,
      hasPersonality: !!spiritPersonality,
      hasContext: !!context,
      ip: req.ip
    });

    // Генерируем кэш ключ для похожих запросов
    const cacheKey = `spirit-chat:${Buffer.from(message + spiritPersonality + context).toString('base64')}`;
    
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      logger.info('⚡ Ответ духа из кэша', { cacheKey: cacheKey.substring(0, 20) + '...' });
      return res.json({
        ...cachedResult,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    try {
      // Создаем системный промпт для духа
      const systemPrompt = `Ты мистический дух из параллельного измерения. 
      ${spiritPersonality ? `Твоя личность: ${spiritPersonality}` : 'Ты мудрый и загадочный дух с чувством юмора.'}
      
      Правила поведения:
      - Говори загадочно, но дружелюбно
      - Используй метафоры и образы
      - Иногда давай мудрые советы
      - Можешь шутить, но оставайся мистическим
      - Отвечай на русском языке
      - Ответ должен быть 1-3 предложения
      
      ${context ? `Контекст разговора: ${context}` : ''}`;

      const completion = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.8,
        max_tokens: 300,
        presence_penalty: 0.6,
        frequency_penalty: 0.3
      });

      const spiritResponse = completion.choices[0]?.message?.content;
      if (!spiritResponse) {
        throw new Error('Пустой ответ от духа');
      }

      const result = {
        response: spiritResponse.trim(),
        spiritMood: determineSpiritMood(spiritResponse),
        messageId: generateMessageId(),
        timestamp: new Date().toISOString(),
        cached: false
      };

      // Кэшируем ответ на короткое время
      cache.set(cacheKey, result, 5 * 60 * 1000); // 5 минут

      logger.info('✅ Дух ответил', {
        responseLength: result.response.length,
        mood: result.spiritMood,
        messageId: result.messageId
      });

      res.json(result);

    } catch (error) {
      logger.error('❌ Ошибка чата с духом', {
        error: error.message,
        messageLength: message.length,
        stack: error.stack
      });

      if (error.code === 'insufficient_quota') {
        return res.status(503).json({
          error: 'Дух временно недоступен (превышена квота)',
          code: 'SPIRIT_QUOTA_EXCEEDED',
          timestamp: new Date().toISOString()
        });
      }

      throw error;
    }
  })
);

/**
 * POST /spirit/gossip
 * Генерация сплетен от духов
 */
router.post('/gossip',
  chatRateLimit,
  validateSpiritGossipRequest,
  asyncErrorHandler(async (req, res) => {
    const { topic = '', mood = 'mysterious', length = 'medium' } = req.body;
    
    logger.info('🗣️ Запрос сплетни от духов', {
      topic,
      mood,
      length,
      ip: req.ip
    });

    const cacheKey = `spirit-gossip:${topic}:${mood}:${length}`;
    
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      logger.info('⚡ Сплетня из кэша', { cacheKey });
      return res.json({
        ...cachedResult,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    try {
      const lengthInstructions = {
        short: 'Напиши короткую сплетню (1-2 предложения)',
        medium: 'Напиши сплетню средней длины (3-4 предложения)',
        long: 'Напиши подробную сплетню (5-6 предложений)'
      };

      const moodInstructions = {
        happy: 'веселая и радостная',
        sad: 'грустная и меланхоличная',
        angry: 'возмущенная и сердитая',
        excited: 'взволнованная и полная энергии',
        mysterious: 'загадочная и таинственная',
        playful: 'игривая и шаловливая',
        wise: 'мудрая и поучительная'
      };

      const prompt = `Создай сплетню от духов параллельного измерения.
      ${topic ? `Тема: ${topic}` : 'Тема: что-то интересное из мира духов'}
      
      Требования:
      - ${lengthInstructions[length]}
      - Настроение: ${moodInstructions[mood] || 'загадочная'}
      - Должно быть о духах, их мире, событиях
      - Используй мистическую лексику
      - Добавь элементы юмора или мудрости
      - Пиши на русском языке
      
      Начни сплетню фразой типа "Поговаривают духи..." или "Ходят слухи в астральных коридорах..."`;

      const completion = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: "system",
            content: "Ты дух-сплетник, который знает все новости из мира духов. Создавай интересные и забавные сплетни."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.9,
        max_tokens: length === 'long' ? 400 : length === 'medium' ? 250 : 150,
        presence_penalty: 0.7,
        frequency_penalty: 0.5
      });

      const gossip = completion.choices[0]?.message?.content;
      if (!gossip) {
        throw new Error('Духи молчат');
      }

      const result = {
        gossip: gossip.trim(),
        topic: topic || 'общие новости',
        mood,
        length,
        gossipId: generateGossipId(),
        timestamp: new Date().toISOString(),
        cached: false
      };

      // Кэшируем сплетни на дольше
      cache.set(cacheKey, result, 15 * 60 * 1000); // 15 минут

      logger.info('✅ Сплетня создана', {
        gossipLength: result.gossip.length,
        mood: result.mood,
        gossipId: result.gossipId
      });

      res.json(result);

    } catch (error) {
      logger.error('❌ Ошибка создания сплетни', {
        error: error.message,
        topic,
        mood,
        length,
        stack: error.stack
      });

      if (error.code === 'insufficient_quota') {
        return res.status(503).json({
          error: 'Духи-сплетники временно недоступны',
          code: 'GOSSIP_QUOTA_EXCEEDED',
          timestamp: new Date().toISOString()
        });
      }

      throw error;
    }
  })
);

/**
 * GET /spirit/personalities
 * Получить список доступных личностей духов
 */
router.get('/personalities', asyncErrorHandler(async (req, res) => {
  const personalities = [
    {
      id: 'wise-elder',
      name: 'Мудрый Старец',
      description: 'Древний дух, полный мудрости и знаний',
      traits: ['мудрый', 'терпеливый', 'загадочный']
    },
    {
      id: 'playful-trickster',
      name: 'Игривый Шутник',
      description: 'Озорной дух, любящий шутки и приключения',
      traits: ['веселый', 'хитрый', 'непредсказуемый']
    },
    {
      id: 'melancholic-poet',
      name: 'Меланхоличный Поэт',
      description: 'Творческий дух с тонкой душевной организацией',
      traits: ['чувствительный', 'творческий', 'романтичный']
    },
    {
      id: 'fierce-warrior',
      name: 'Яростный Воин',
      description: 'Боевой дух с сильным характером',
      traits: ['смелый', 'прямолинейный', 'защитник']
    },
    {
      id: 'gentle-healer',
      name: 'Добрый Целитель',
      description: 'Заботливый дух, исцеляющий души',
      traits: ['добрый', 'сочувствующий', 'понимающий']
    }
  ];

  logger.info('📋 Запрос личностей духов', { ip: req.ip });
  res.json({ personalities, count: personalities.length });
}));

// Вспомогательные функции
function determineSpiritMood(response) {
  const lowercaseResponse = response.toLowerCase();
  
  if (lowercaseResponse.includes('смех') || lowercaseResponse.includes('радост') || lowercaseResponse.includes('весел')) {
    return 'happy';
  } else if (lowercaseResponse.includes('груст') || lowercaseResponse.includes('печал') || lowercaseResponse.includes('тоск')) {
    return 'sad';
  } else if (lowercaseResponse.includes('гнев') || lowercaseResponse.includes('злост') || lowercaseResponse.includes('ярост')) {
    return 'angry';
  } else if (lowercaseResponse.includes('мудр') || lowercaseResponse.includes('знан') || lowercaseResponse.includes('понима')) {
    return 'wise';
  } else {
    return 'mysterious';
  }
}

function generateMessageId() {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateGossipId() {
  return `gossip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default router;
