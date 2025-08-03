// src/server.js
import app from './app.js';
import config from './config/index.js';
import logger from './utils/logger.js';
import cache from './utils/cache.js';
import { gracefulShutdown } from './middleware/errorHandler.js';

const startServer = async () => {
  try {
    // Инициализация
    logger.info('🚀 Запуск Whisp Quest Server...', {
      environment: config.env,
      port: config.server.port,
      nodeVersion: process.version
    });

    // Проверяем критически важные настройки
    if (!config.openai.apiKey) {
      logger.error('❌ OPENAI_API_KEY не установлен');
      process.exit(1);
    }

    // Логируем конфигурацию (без секретов)
    logger.info('⚙️ Конфигурация сервера', {
      port: config.server.port,
      environment: config.env,
      rateLimit: config.rateLimit,
      cache: {
        ttl: config.cache.ttl,
        maxKeys: config.cache.maxKeys
      },
      security: {
        allowedOrigins: config.security.allowedOrigins
      }
    });

    // Запускаем сервер
    const server = app.listen(config.server.port, config.server.host, () => {
      logger.info('✅ Сервер запущен успешно', {
        host: config.server.host,
        port: config.server.port,
        url: `http://${config.server.host}:${config.server.port}`,
        pid: process.pid,
        uptime: process.uptime()
      });

      // Логируем доступные endpoints
      logger.info('📋 Доступные endpoints:', {
        endpoints: [
          `GET  http://${config.server.host}:${config.server.port}/`,
          `GET  http://${config.server.host}:${config.server.port}/health`,
          `POST http://${config.server.host}:${config.server.port}/analyze`,
          `POST http://${config.server.host}:${config.server.port}/spirit/chat`,
          `POST http://${config.server.host}:${config.server.port}/spirit/gossip`,
          `GET  http://${config.server.host}:${config.server.port}/spirit/personalities`
        ]
      });
    });

    // Настройка graceful shutdown
    gracefulShutdown(server);

    // Обработка ошибок сервера
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`❌ Порт ${config.server.port} уже используется`);
        process.exit(1);
      } else if (error.code === 'EACCES') {
        logger.error(`❌ Нет прав на использование порта ${config.server.port}`);
        process.exit(1);
      } else {
        logger.error('❌ Ошибка сервера', {
          error: error.message,
          code: error.code,
          stack: error.stack
        });
        process.exit(1);
      }
    });

    // Логирование статистики каждые 5 минут в production
    if (config.env === 'production') {
      setInterval(() => {
        const memUsage = process.memoryUsage();
        const cacheStats = cache.getStats();
        
        logger.info('📊 Статистика сервера', {
          uptime: Math.floor(process.uptime()),
          memory: {
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
            external: Math.round(memUsage.external / 1024 / 1024) + ' MB'
          },
          cache: cacheStats,
          pid: process.pid
        });
      }, 5 * 60 * 1000); // каждые 5 минут
    }

    return server;

  } catch (error) {
    logger.error('💥 Критическая ошибка при запуске сервера', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};

// Запускаем сервер только если этот файл запущен напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export default startServer;
