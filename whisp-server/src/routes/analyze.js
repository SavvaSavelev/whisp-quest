// src/routes/analyze.js
import express from 'express';
import OpenAI from 'openai';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import cache from '../utils/cache.js';
import { validateAnalyzeRequest } from '../middleware/validation.js';
import { analyzeRateLimit } from '../middleware/security.js';
import { asyncErrorHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Инициализация OpenAI
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
  timeout: config.openai.timeout
});

/**
 * POST /analyze
 * Анализ настроения текста с использованием OpenAI
 */
router.post('/', 
  analyzeRateLimit,
  validateAnalyzeRequest,
  asyncErrorHandler(async (req, res) => {
    const { text, options = {} } = req.body;
    const { detailed = false } = options;
    
    logger.info('🔍 Запрос анализа настроения', {
      textLength: text.length,
      detailed,
      ip: req.ip
    });

    // Генерируем кэш ключ
    const cacheKey = `analyze:${Buffer.from(text + JSON.stringify(options)).toString('base64')}`;
    
    // Проверяем кэш
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      logger.info('⚡ Результат из кэша', { cacheKey: cacheKey.substring(0, 20) + '...' });
      return res.json({
        ...cachedResult,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    try {
      const prompt = detailed ? 
        `Проанализируй настроение следующего текста детально. Определи:
        1. Основное настроение (положительное/отрицательное/нейтральное)
        2. Интенсивность (1-10)
        3. Ключевые эмоции
        4. Тональность
        5. Краткое объяснение
        
        Текст: "${text}"
        
        Ответь в формате JSON:
        {
          "mood": "positive|negative|neutral",
          "intensity": число_от_1_до_10,
          "emotions": ["эмоция1", "эмоция2"],
          "tone": "описание_тональности",
          "explanation": "краткое_объяснение",
          "confidence": число_от_0_до_1
        }` :
        `Определи настроение текста: "${text}"
        
        Ответь строго в формате JSON:
        {
          "mood": "positive|negative|neutral",
          "intensity": число_от_1_до_10,
          "confidence": число_от_0_до_1
        }`;

      const completion = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: "system",
            content: "Ты эксперт по анализу настроения текста. Отвечай только валидным JSON без дополнительных комментариев."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: detailed ? 500 : 200,
        response_format: { type: "json_object" }
      });

      const rawResponse = completion.choices[0]?.message?.content;
      if (!rawResponse) {
        throw new Error('Пустой ответ от OpenAI');
      }

      let analysis;
      try {
        analysis = JSON.parse(rawResponse);
      } catch (parseError) {
        logger.error('❌ Ошибка парсинга JSON от OpenAI', {
          rawResponse,
          error: parseError.message
        });
        throw new Error('Некорректный ответ от AI сервиса');
      }

      // Валидация обязательных полей
      if (!analysis.mood || !analysis.intensity) {
        throw new Error('Неполный анализ от AI сервиса');
      }

      // Нормализация данных
      const result = {
        mood: analysis.mood,
        intensity: Math.max(1, Math.min(10, analysis.intensity)),
        confidence: Math.max(0, Math.min(1, analysis.confidence || 0.8)),
        ...(detailed && {
          emotions: analysis.emotions || [],
          tone: analysis.tone || 'нейтральная',
          explanation: analysis.explanation || 'Анализ выполнен'
        }),
        timestamp: new Date().toISOString(),
        cached: false
      };

      // Сохраняем в кэш
      cache.set(cacheKey, result, config.cache.ttl * 1000);

      logger.info('✅ Анализ настроения выполнен', {
        mood: result.mood,
        intensity: result.intensity,
        confidence: result.confidence,
        textLength: text.length
      });

      res.json(result);

    } catch (error) {
      logger.error('❌ Ошибка анализа настроения', {
        error: error.message,
        textLength: text.length,
        stack: error.stack
      });

      if (error.code === 'insufficient_quota') {
        return res.status(503).json({
          error: 'Превышена квота API',
          code: 'QUOTA_EXCEEDED',
          timestamp: new Date().toISOString()
        });
      }

      if (error.code === 'rate_limit_exceeded') {
        return res.status(429).json({
          error: 'Превышен лимит запросов к AI сервису',
          code: 'AI_RATE_LIMIT',
          retryAfter: 60,
          timestamp: new Date().toISOString()
        });
      }

      throw error; // Будет обработано errorHandler middleware
    }
  })
);

/**
 * GET /analyze/stats
 * Статистика анализов
 */
router.get('/stats', asyncErrorHandler(async (req, res) => {
  const stats = {
    cache: cache.getStats(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  };

  logger.info('📊 Запрос статистики анализов', { ip: req.ip });
  res.json(stats);
}));

export default router;
