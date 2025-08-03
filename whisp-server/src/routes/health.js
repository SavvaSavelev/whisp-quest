// src/routes/health.js
import express from 'express';
import logger from '../utils/logger.js';
import cache from '../utils/cache.js';
import config from '../config/index.js';
import { asyncErrorHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * GET /health
 * Быстрая проверка здоровья сервиса
 */
router.get('/', asyncErrorHandler(async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  };

  res.json(health);
}));

/**
 * GET /health/detailed
 * Подробная проверка здоровья с метриками
 */
router.get('/detailed', asyncErrorHandler(async (req, res) => {
  const startTime = Date.now();
  
  // Проверяем различные компоненты системы
  const healthChecks = {
    server: checkServer(),
    memory: checkMemory(),
    cache: checkCache(),
    openai: await checkOpenAI(),
    environment: checkEnvironment()
  };

  const allHealthy = Object.values(healthChecks).every(check => check.status === 'ok');
  const responseTime = Date.now() - startTime;

  const detailedHealth = {
    status: allHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    responseTime: `${responseTime}ms`,
    version: process.env.npm_package_version || '1.0.0',
    environment: config.env,
    checks: healthChecks,
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      pid: process.pid,
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    }
  };

  const statusCode = allHealthy ? 200 : 503;
  
  logger.info('🏥 Детальная проверка здоровья', {
    status: detailedHealth.status,
    responseTime,
    checks: Object.fromEntries(
      Object.entries(healthChecks).map(([key, value]) => [key, value.status])
    )
  });

  res.status(statusCode).json(detailedHealth);
}));

/**
 * GET /health/readiness
 * Проверка готовности к работе (для Kubernetes readiness probe)
 */
router.get('/readiness', asyncErrorHandler(async (req, res) => {
  const readinessChecks = {
    openaiApiKey: !!config.openai.apiKey,
    cacheWorking: checkCacheWorking(),
    memoryOk: checkMemoryUsage() < 0.9 // меньше 90% использования
  };

  const isReady = Object.values(readinessChecks).every(Boolean);

  const readiness = {
    ready: isReady,
    timestamp: new Date().toISOString(),
    checks: readinessChecks
  };

  const statusCode = isReady ? 200 : 503;
  res.status(statusCode).json(readiness);
}));

/**
 * GET /health/liveness
 * Проверка живости сервиса (для Kubernetes liveness probe)
 */
router.get('/liveness', asyncErrorHandler(async (req, res) => {
  // Простая проверка - если мы можем ответить, значит живы
  const liveness = {
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  };

  res.json(liveness);
}));

/**
 * GET /health/metrics
 * Метрики производительности
 */
router.get('/metrics', asyncErrorHandler(async (req, res) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      ...process.memoryUsage(),
      usage_percent: checkMemoryUsage() * 100
    },
    cpu: process.cpuUsage(),
    cache: cache.getStats(),
    eventLoop: {
      lag: getEventLoopLag()
    },
    system: {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      pid: process.pid
    }
  };

  logger.debug('📊 Запрос метрик', { ip: req.ip });
  res.json(metrics);
}));

// Вспомогательные функции для проверок

function checkServer() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    details: {
      port: config.server.port,
      environment: config.env
    }
  };
}

function checkMemory() {
  const usage = process.memoryUsage();
  const usagePercent = checkMemoryUsage();
  
  return {
    status: usagePercent < 0.9 ? 'ok' : 'warning',
    timestamp: new Date().toISOString(),
    details: {
      ...usage,
      usage_percent: Math.round(usagePercent * 100),
      threshold: '90%'
    }
  };
}

function checkCache() {
  try {
    const stats = cache.getStats();
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      details: stats
    };
  } catch (error) {
    return {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}

async function checkOpenAI() {
  try {
    // Проверяем наличие API ключа
    if (!config.openai.apiKey) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'OpenAI API key not configured'
      };
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      details: {
        model: config.openai.model,
        timeout: config.openai.timeout
      }
    };
  } catch (error) {
    return {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}

function checkEnvironment() {
  const requiredEnvVars = ['OPENAI_API_KEY'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  return {
    status: missingVars.length === 0 ? 'ok' : 'error',
    timestamp: new Date().toISOString(),
    details: {
      environment: config.env,
      missing_variables: missingVars,
      node_version: process.version
    }
  };
}

function checkCacheWorking() {
  try {
    const testKey = 'health_check_test';
    const testValue = Date.now();
    
    cache.set(testKey, testValue, 1000);
    const retrieved = cache.get(testKey);
    cache.delete(testKey);
    
    return retrieved === testValue;
  } catch (error) {
    return false;
  }
}

function checkMemoryUsage() {
  const used = process.memoryUsage();
  const total = used.heapTotal;
  return used.heapUsed / total;
}

let eventLoopStart = Date.now();
function getEventLoopLag() {
  const lag = Date.now() - eventLoopStart;
  eventLoopStart = Date.now();
  return lag;
}

export default router;
