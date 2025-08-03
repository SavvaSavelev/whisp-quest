// src/app.js
import express from 'express';
import config from './config/index.js';
import logger from './utils/logger.js';
import { 
  securityMiddleware, 
  corsMiddleware, 
  suspiciousActivityLogger,
  blockBadActors,
  createSpeedLimit
} from './middleware/security.js';
import { 
  sanitizeInput,
  validateContentType,
  validateRequestSize
} from './middleware/validation.js';
import {
  errorHandler,
  notFoundHandler,
  unhandledRejectionHandler,
  uncaughtExceptionHandler
} from './middleware/errorHandler.js';

// Импорт маршрутов
import analyzeRoutes from './routes/analyze.js';
import spiritRoutes from './routes/spirit.js';
import healthRoutes from './routes/health.js';

// Создание Express приложения
const app = express();

// Установка обработчиков глобальных ошибок
unhandledRejectionHandler();
uncaughtExceptionHandler();

// Middleware для логирования запросов
app.use((req, res, next) => {
  logger.logRequest(req, res);
  next();
});

// Базовая безопасность
app.use(securityMiddleware());
app.use(corsMiddleware());
app.use(blockBadActors());
app.use(suspiciousActivityLogger());

// Ограничение скорости для всех запросов
app.use(createSpeedLimit());

// Парсинг JSON с ограничениями
app.use(express.json({ 
  limit: config.server.bodyLimit,
  strict: true,
  type: 'application/json'
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: config.server.bodyLimit 
}));

// Валидация и санитизация
app.use(validateContentType(['application/json', 'application/x-www-form-urlencoded']));
app.use(validateRequestSize(config.server.bodyLimit));
app.use(sanitizeInput());

// Health checks (без rate limiting)
app.use('/health', healthRoutes);
app.use('/status', healthRoutes); // алиас для health

// API маршруты с rate limiting
app.use('/analyze', analyzeRoutes);
app.use('/spirit', spiritRoutes);

// Корневой endpoint
app.get('/', (req, res) => {
  logger.info('🏠 Запрос к корневому endpoint', { ip: req.ip });
  res.json({
    name: 'Whisp Quest Server',
    version: process.env.npm_package_version || '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      analyze: '/analyze',
      spirit: '/spirit/chat, /spirit/gossip',
      docs: '/docs (coming soon)'
    },
    timestamp: new Date().toISOString()
  });
});

// API информация
app.get('/api', (req, res) => {
  res.json({
    name: 'Whisp Quest API',
    version: 'v1',
    endpoints: [
      {
        path: '/analyze',
        method: 'POST',
        description: 'Анализ настроения текста',
        rateLimit: '50 requests per hour'
      },
      {
        path: '/spirit/chat',
        method: 'POST',
        description: 'Чат с духом',
        rateLimit: '20 requests per hour'
      },
      {
        path: '/spirit/gossip',
        method: 'POST',
        description: 'Генерация сплетен от духов',
        rateLimit: '20 requests per hour'
      },
      {
        path: '/spirit/personalities',
        method: 'GET',
        description: 'Список личностей духов',
        rateLimit: 'no limit'
      },
      {
        path: '/health',
        method: 'GET',
        description: 'Проверка здоровья сервиса',
        rateLimit: 'no limit'
      }
    ],
    timestamp: new Date().toISOString()
  });
});

// Обработка 404 ошибок
app.use(notFoundHandler);

// Главный обработчик ошибок (должен быть последним)
app.use(errorHandler);

export default app;
