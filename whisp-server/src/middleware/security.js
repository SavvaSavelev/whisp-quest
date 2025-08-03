// src/middleware/security.js
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import helmet from 'helmet';
import config from '../config/index.js';
import logger from '../utils/logger.js';

// Продвинутый Rate Limiting
export const createRateLimit = (options = {}) => {
  const defaultOptions = {
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: {
      error: 'Слишком много запросов, попробуйте позже',
      retryAfter: Math.ceil(config.rateLimit.windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('🚨 Rate limit превышен', {
        ip: req.ip,
        endpoint: req.path,
        userAgent: req.get('User-Agent')
      });
      res.status(429).json({
        error: 'Слишком много запросов',
        retryAfter: Math.ceil(config.rateLimit.windowMs / 1000)
      });
    },
    skip: (req) => {
      // Пропускаем health check endpoints
      return req.path === '/health' || req.path === '/status';
    },
    ...options
  };

  return rateLimit(defaultOptions);
};

// Speed limiting для замедления подозрительных клиентов
export const createSpeedLimit = () => {
  return slowDown({
    windowMs: 15 * 60 * 1000, // 15 минут
    delayAfter: 10, // замедлять после 10 запросов
    delayMs: () => 500, // фиксированная задержка 500ms
    maxDelayMs: 5000, // максимальная задержка 5 секунд
    skip: (req) => req.path === '/health' || req.path === '/status',
    validate: { delayMs: false } // отключаем предупреждение
  });
};

// Специализированные rate limits для разных endpoints
export const apiRateLimit = createRateLimit({
  max: 30, // 30 запросов в 15 минут для API
  windowMs: 15 * 60 * 1000
});

export const chatRateLimit = createRateLimit({
  max: 20, // 20 запросов в час для чата (более ресурсоемкие)
  windowMs: 60 * 60 * 1000
});

export const analyzeRateLimit = createRateLimit({
  max: 50, // 50 анализов в час
  windowMs: 60 * 60 * 1000
});

// Основная безопасность
export const securityMiddleware = () => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.openai.com"]
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  });
};

// CORS middleware с настройками
export const corsMiddleware = () => {
  return (req, res, next) => {
    const allowedOrigins = config.security.allowedOrigins;
    const origin = req.headers.origin;

    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    next();
  };
};

// Middleware для логирования подозрительной активности
export const suspiciousActivityLogger = () => {
  return (req, res, next) => {
    const suspicious = [
      req.path.includes('..'),
      req.path.includes('<script>'),
      req.path.includes('eval('),
      req.headers['user-agent']?.includes('bot') && !req.headers['user-agent']?.includes('googlebot'),
      req.query.toString().length > 1000,
      Object.keys(req.query).length > 20
    ].some(Boolean);

    if (suspicious) {
      logger.warn('🕵️ Подозрительная активность', {
        ip: req.ip,
        path: req.path,
        userAgent: req.get('User-Agent'),
        query: req.query,
        headers: req.headers
      });
    }

    next();
  };
};

// Middleware для блокировки известных bad actors
export const blockBadActors = () => {
  const blockedIPs = new Set();
  const blockedUserAgents = [
    /sqlmap/i,
    /nikto/i,
    /acunetix/i,
    /nessus/i,
    /masscan/i,
    /zap/i
  ];

  return (req, res, next) => {
    // Проверяем IP
    if (blockedIPs.has(req.ip)) {
      logger.error('🚫 Заблокированный IP', { ip: req.ip });
      return res.status(403).json({ error: 'Access denied' });
    }

    // Проверяем User-Agent
    const userAgent = req.get('User-Agent') || '';
    const isBlockedAgent = blockedUserAgents.some(pattern => pattern.test(userAgent));
    
    if (isBlockedAgent) {
      logger.error('🚫 Заблокированный User-Agent', { ip: req.ip, userAgent });
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  };
};

export default {
  createRateLimit,
  createSpeedLimit,
  apiRateLimit,
  chatRateLimit,
  analyzeRateLimit,
  securityMiddleware,
  corsMiddleware,
  suspiciousActivityLogger,
  blockBadActors
};
