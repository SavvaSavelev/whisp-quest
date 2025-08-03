// src/middleware/errorHandler.js
import logger from '../utils/logger.js';
import config from '../config/index.js';

// Основной обработчик ошибок
export const errorHandler = (err, req, res, next) => {
  const isProduction = config.env === 'production';
  
  // Логируем ошибку
  logger.error('💥 Ошибка сервера', {
    error: err.message,
    stack: err.stack,
    endpoint: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.body,
    query: req.query
  });

  // Определяем тип ошибки и статус код
  let statusCode = 500;
  let message = 'Внутренняя ошибка сервера';
  let errorCode = 'INTERNAL_ERROR';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Ошибка валидации данных';
    errorCode = 'VALIDATION_ERROR';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Неавторизованный доступ';
    errorCode = 'UNAUTHORIZED';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Доступ запрещен';
    errorCode = 'FORBIDDEN';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Ресурс не найден';
    errorCode = 'NOT_FOUND';
  } else if (err.name === 'ConflictError') {
    statusCode = 409;
    message = 'Конфликт данных';
    errorCode = 'CONFLICT';
  } else if (err.name === 'TooManyRequestsError') {
    statusCode = 429;
    message = 'Слишком много запросов';
    errorCode = 'RATE_LIMIT_EXCEEDED';
  } else if (err.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = 'Сервис недоступен';
    errorCode = 'SERVICE_UNAVAILABLE';
  } else if (err.code === 'ETIMEDOUT') {
    statusCode = 504;
    message = 'Превышено время ожидания';
    errorCode = 'TIMEOUT';
  }

  // Если статус уже установлен, используем его
  if (err.statusCode || err.status) {
    statusCode = err.statusCode || err.status;
  }

  // Формируем ответ
  const errorResponse = {
    error: message,
    code: errorCode,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  };

  // В development режиме добавляем больше деталей
  if (!isProduction) {
    errorResponse.details = {
      message: err.message,
      stack: err.stack
    };
  }

  res.status(statusCode).json(errorResponse);
};

// Обработчик для 404 ошибок
export const notFoundHandler = (req, res, next) => {
  logger.warn('🔍 Endpoint не найден', {
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  res.status(404).json({
    error: 'Endpoint не найден',
    code: 'NOT_FOUND',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    suggestion: 'Проверьте правильность URL и HTTP метода'
  });
};

// Обработчик асинхронных ошибок
export const asyncErrorHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Middleware для обработки необработанных промисов
export const unhandledRejectionHandler = () => {
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('🚨 Необработанное отклонение промиса', {
      reason: reason?.message || reason,
      stack: reason?.stack,
      promise: promise
    });
    
    // В production можем захотеть выключить процесс
    if (config.env === 'production') {
      process.exit(1);
    }
  });
};

// Middleware для обработки необработанных исключений
export const uncaughtExceptionHandler = () => {
  process.on('uncaughtException', (error) => {
    logger.error('🚨 Необработанное исключение', {
      error: error.message,
      stack: error.stack
    });
    
    // Пытаемся корректно завершить работу
    process.exit(1);
  });
};

// Graceful shutdown
export const gracefulShutdown = (server) => {
  const shutdown = (signal) => {
    logger.info(`🛑 Получен сигнал ${signal}, корректно завершаем работу...`);
    
    server.close((err) => {
      if (err) {
        logger.error('❌ Ошибка при закрытии сервера', { error: err.message });
        process.exit(1);
      }
      
      logger.info('✅ Сервер корректно завершен');
      process.exit(0);
    });
    
    // Форсированное завершение через 10 секунд
    setTimeout(() => {
      logger.error('⚠️ Принудительное завершение процесса');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

// Кастомные классы ошибок
export class AppError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Ошибка валидации') {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Ресурс не найден') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Неавторизованный доступ') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Доступ запрещен') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Слишком много запросов') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'TooManyRequestsError';
  }
}

export default {
  errorHandler,
  notFoundHandler,
  asyncErrorHandler,
  unhandledRejectionHandler,
  uncaughtExceptionHandler,
  gracefulShutdown,
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  TooManyRequestsError
};
