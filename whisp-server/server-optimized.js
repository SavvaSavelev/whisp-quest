// Whisp Quest Server v2.0 - Оптимизированная версия
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

// Получаем текущую директорию для ES модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загружаем переменные окружения из текущей папки
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Проверяем что ключ загружен перед созданием OpenAI клиента
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY не загружен! Проверьте .env файл.');
  process.exit(1);
}

// Инициализация OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000
});

console.log('🚀 Запуск Whisp Quest Server v2.0...');
console.log('🔑 OpenAI API Key:', process.env.OPENAI_API_KEY ? `✅ Загружен (${process.env.OPENAI_API_KEY.length} символов)` : '❌ Не найден');

// Middleware безопасности
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // 100 запросов на IP
  message: { error: 'Слишком много запросов, попробуйте позже' },
  standardHeaders: true,
  legacyHeaders: false
});

const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 час
  max: 20, // 20 запросов на час для чата
  message: { error: 'Превышен лимит запросов к чату' }
});

app.use(apiLimiter);
app.use(express.json({ limit: '10mb' }));

// Простой кэш в памяти
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 минут

function setCache(key, value) {
  cache.set(key, { value, timestamp: Date.now() });
}

function getCache(key) {
  const item = cache.get(key);
  if (!item) return null;
  
  if (Date.now() - item.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  
  return item.value;
}

// === МАРШРУТЫ ===

// Корневой endpoint
app.get('/', (req, res) => {
  res.json({
    name: '✨ Whisp Quest Server v2.0',
    status: 'running',
    features: ['🔒 Security', '⚡ Rate Limiting', '💾 Caching', '🔍 Monitoring'],
    endpoints: {
      analyze: 'POST /analyze',
      chat: 'POST /spirit-chat', 
      gossip: 'POST /spirit-gossip',
      health: 'GET /health'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cache_size: cache.size,
    openai_configured: !!process.env.OPENAI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// Детальный health check
app.get('/health/detailed', (req, res) => {
  res.json({
    server: {
      status: 'ok',
      uptime: Math.floor(process.uptime()),
      port: PORT,
      node_version: process.version
    },
    memory: {
      ...process.memoryUsage(),
      usage_percent: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)
    },
    cache: {
      size: cache.size,
      ttl: CACHE_TTL / 1000 + 's'
    },
    openai: {
      configured: !!process.env.OPENAI_API_KEY,
      key_length: process.env.OPENAI_API_KEY?.length || 0
    },
    timestamp: new Date().toISOString()
  });
});

// Анализ текста для создания духа
app.post('/analyze', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.length < 1 || text.length > 5000) {
      return res.status(400).json({ 
        error: 'Текст должен быть от 1 до 5000 символов' 
      });
    }

    console.log(`🔍 Анализ текста (${text.length} символов)`);

    // Проверяем кэш
    const cacheKey = `spirit:${Buffer.from(text).toString('base64').substring(0, 50)}`;
    const cached = getCache(cacheKey);
    if (cached) {
      console.log('⚡ Дух из кэша');
      return res.json({ ...cached, cached: true });
    }

    const systemPrompt = `Ты — древний духоанализатор. На основе человеческого текста определи параметры для создания духа:

{
  "mood": "...",         // радостный, печальный, злой, вдохновлённый, спокойный, сонный, испуганный, игривый, меланхоличный
  "color": "...",        // hex цвет ауры духа (например #ff0000, #00ff00)
  "rarity": "...",       // обычный, редкий, легендарный
  "essence": "...",      // поэтичное имя духа, типа "песнь ветра", "огонь рассвета", "тень печали"
  "dialogue": "..."      // первая колкая реплика духа при рождении (с сарказмом и чёрным юмором)
}

Ответ строго в формате JSON без дополнительных комментариев.`;

    const userPrompt = `Вот слова человека: "${text}"`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.9,
      max_tokens: 300,
      response_format: { type: "json_object" }
    });

    const rawResponse = completion.choices[0]?.message?.content;
    if (!rawResponse) {
      throw new Error('Пустой ответ от OpenAI');
    }

    const spiritData = JSON.parse(rawResponse);
    
    const result = {
      mood: spiritData.mood || 'печальный',
      color: spiritData.color || '#808080',
      rarity: spiritData.rarity || 'обычный',
      essence: spiritData.essence || 'неопознанная сущность',
      dialogue: spiritData.dialogue || 'Ну и зачем ты меня вызвал?',
      timestamp: new Date().toISOString(),
      cached: false
    };

    // Сохраняем в кэш
    setCache(cacheKey, result);
    
    console.log(`✅ Анализ завершен: ${result.mood} дух "${result.essence}"`);
    res.json(result);

  } catch (error) {
    console.error('❌ Ошибка анализа:', error.message);
    
    if (error.code === 'insufficient_quota') {
      return res.status(503).json({
        error: 'Превышена квота OpenAI API',
        code: 'QUOTA_EXCEEDED'
      });
    }

    // Возвращаем дефолтного духа при ошибке
    res.json({
      mood: 'печальный',
      color: '#808080', 
      rarity: 'обычный',
      essence: 'дух ошибки',
      dialogue: 'Что-то пошло не так при моем рождении...',
      error: true
    });
  }
});

// Чат с духом
app.post('/spirit-chat', chatLimiter, async (req, res) => {
  try {
    const { text, mood = '', essence = '', history = [], originText = '', birthDate = '' } = req.body;
    
    if (!text || text.length < 1 || text.length > 1000) {
      return res.status(400).json({ 
        error: 'Сообщение должно быть от 1 до 1000 символов' 
      });
    }

    console.log(`💬 Чат с духом: "${text.substring(0, 50)}..."`);

    // Строим личность духа на основе данных
    let spiritPersonality = 'Ты дерзкий дух с чёрным юмором и сарказмом.';
    if (mood && essence) {
      spiritPersonality = `Ты дух по имени "${essence}", с настроением "${mood}".`;
      if (originText) {
        spiritPersonality += ` Ты появился из слов: "${originText.substring(0, 100)}".`;
      }
      if (birthDate) {
        spiritPersonality += ` Ты появился ${birthDate}.`;
      }
    }

    const systemPrompt = `${spiritPersonality}

Теперь твоя задача — общаться с этим жалким хозяином мыслей: сарказм, чёрный юмор и лёгкий мат.
Говори от первого лица, будь колким и дерзким. 

Правила поведения:
- Используй сарказм и иронию
- Можешь материться, но не переборщи
- Подкалывай собеседника
- Говори живо и эмоционально
- Отвечай на русском языке
- Ответ должен быть максимум 4 строки
- Веди себя как настоящий живой персонаж, а не формальный помощник`;

    // Добавляем историю разговора если есть
    const messages = [{ role: "system", content: systemPrompt }];
    
    // Добавляем последние сообщения из истории (максимум 6)
    if (history.length > 0) {
      const recentHistory = history.slice(-6);
      recentHistory.forEach((msg, index) => {
        // В истории первое сообщение от духа (assistant), затем пользователь
        const role = index % 2 === 0 ? "assistant" : "user";
        messages.push({ role, content: msg });
      });
    }
    
    // Добавляем текущее сообщение
    messages.push({ role: "user", content: text });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.85,
      max_tokens: 200
    });

    const spiritResponse = completion.choices[0]?.message?.content;
    if (!spiritResponse) {
      throw new Error('Дух молчит');
    }

    const result = {
      reply: spiritResponse.trim(),
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    
    console.log(`✅ Дух ответил: "${result.reply.substring(0, 50)}..."`);
    res.json(result);

  } catch (error) {
    console.error('❌ Ошибка чата с духом:', error.message);
    res.status(500).json({
      error: 'Дух временно недоступен',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Сплетни от духов
app.post('/spirit-gossip', chatLimiter, async (req, res) => {
  try {
    const { from, to, spirits } = req.body;
    
    // Поддерживаем как старый формат (from/to), так и новый (spirits array)
    const spiritFrom = from || (spirits && spirits[0]);
    const spiritTo = to || (spirits && spirits[1]);
    
    if (!spiritFrom || !spiritTo) {
      return res.status(400).json({ 
        error: 'Необходимо передать два духа для создания сплетни' 
      });
    }

    console.log(`🗣️ Сплетня между "${spiritFrom.essence}" и "${spiritTo.essence}"`);

    const prompt = `Создай диалог-сплетню между двумя духами.

Дух 1: "${spiritFrom.essence}" (настроение: ${spiritFrom.mood})
${spiritFrom.originText ? `Родился из текста: "${spiritFrom.originText}"` : ''}

Дух 2: "${spiritTo.essence}" (настроение: ${spiritTo.mood})  
${spiritTo.originText ? `Родился из текста: "${spiritTo.originText}"` : ''}

Создай короткий диалог где первый дух задает вопрос/делает замечание, а второй отвечает.
Стиль: саркастичный, с черным юмором, можно с легким матом.
Тема: их хозяин, мир духов, что-то смешное или колкое.

Формат ответа - строго JSON:
{
  "question": "что говорит первый дух",
  "answer": "что отвечает второй дух"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: "system",
          content: "Ты создаешь диалоги между духами-сплетниками. Они саркастичные, колкие и любят подкалывать друг друга и своего хозяина."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.9,
      max_tokens: 300
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('Духи молчат');
    }

    try {
      // Пытаемся парсить JSON ответ
      const gossipData = JSON.parse(responseText.trim());
      
      const result = {
        question: gossipData.question || 'Что скажешь об этом хозяине?',
        answer: gossipData.answer || 'Да уж, жалкое зрелище...',
        from: spiritFrom,
        to: spiritTo,
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ Сплетня создана: "${result.question}" -> "${result.answer}"`);
      res.json(result);
      
    } catch (parseError) {
      // Если не удалось парсить JSON, возвращаем дефолтную сплетню
      console.log('⚠️ Не удалось парсить JSON, возвращаем дефолт');
      res.json({
        question: 'Что думаешь о нашем хозяине?',
        answer: 'Думаю, ему нужно больше фантазии...',
        from: spiritFrom,
        to: spiritTo,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('❌ Ошибка создания сплетни:', error.message);
    res.status(500).json({
      error: 'Духи-сплетники временно недоступны',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint не найден',
    path: req.originalUrl,
    method: req.method,
    suggestion: 'Проверьте правильность URL'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('💥 Ошибка сервера:', error.message);
  res.status(500).json({
    error: 'Внутренняя ошибка сервера',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Запуск сервера
app.listen(PORT, 'localhost', () => {
  console.log(`✅ Whisp Quest Server v2.0 запущен!`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📋 Endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   POST http://localhost:${PORT}/analyze`);
  console.log(`   POST http://localhost:${PORT}/spirit-chat`);
  console.log(`   POST http://localhost:${PORT}/spirit-gossip`);
  console.log(`🔒 Безопасность: Rate limiting, Helmet, CORS`);
  console.log(`⚡ Производительность: In-memory кэширование`);
  console.log(`📊 Мониторинг: /health, /health/detailed`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Получен SIGTERM, завершаем работу...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Получен SIGINT, завершаем работу...');
  process.exit(0);
});
