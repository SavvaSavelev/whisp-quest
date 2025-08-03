// src/middleware/validation.js
import { body, query, validationResult } from 'express-validator';
import logger from '../utils/logger.js';

// Middleware для обработки ошибок валидации
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));

    logger.warn('❌ Ошибка валидации', {
      endpoint: req.path,
      errors: formattedErrors,
      ip: req.ip
    });

    return res.status(400).json({
      error: 'Ошибка валидации данных',
      details: formattedErrors
    });
  }

  next();
};

// Валидация для endpoint /analyze
export const validateAnalyzeRequest = [
  body('text')
    .isString()
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Текст должен быть от 1 до 5000 символов'),
  
  body('options')
    .optional()
    .isObject()
    .withMessage('Опции должны быть объектом'),
    
  body('options.detailed')
    .optional()
    .isBoolean()
    .withMessage('detailed должен быть boolean'),

  handleValidationErrors
];

// Валидация для endpoint /spirit-chat
export const validateSpiritChatRequest = [
  body('message')
    .isString()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Сообщение должно быть от 1 до 1000 символов'),
    
  body('spiritPersonality')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Личность духа не должна превышать 500 символов'),
    
  body('context')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Контекст не должен превышать 2000 символов'),

  handleValidationErrors
];

// Валидация для endpoint /spirit-gossip
export const validateSpiritGossipRequest = [
  body('topic')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Тема должна быть от 1 до 200 символов'),
    
  body('mood')
    .optional()
    .isIn(['happy', 'sad', 'angry', 'excited', 'mysterious', 'playful', 'wise'])
    .withMessage('Неверное настроение'),
    
  body('length')
    .optional()
    .isIn(['short', 'medium', 'long'])
    .withMessage('Длина должна быть: short, medium или long'),

  handleValidationErrors
];

// Валидация query параметров для пагинации
export const validatePaginationQuery = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Страница должна быть от 1 до 1000'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Лимит должен быть от 1 до 100'),

  handleValidationErrors
];

// Валидация общих параметров
export const validateCommonParams = [
  query('format')
    .optional()
    .isIn(['json', 'xml'])
    .withMessage('Формат должен быть json или xml'),
    
  query('version')
    .optional()
    .isIn(['v1', 'v2'])
    .withMessage('Версия должна быть v1 или v2'),

  handleValidationErrors
];

// Санитизация входных данных
export const sanitizeInput = () => {
  return (req, res, next) => {
    const sanitizeString = (str) => {
      if (typeof str !== 'string') return str;
      
      return str
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // удаляем script теги
        .replace(/javascript:/gi, '') // удаляем javascript: протокол
        .replace(/on\w+\s*=/gi, '') // удаляем event handlers
        .trim();
    };

    const sanitizeObject = (obj) => {
      if (typeof obj !== 'object' || obj === null) return obj;
      
      const sanitized = Array.isArray(obj) ? [] : {};
      
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
          sanitized[key] = sanitizeString(value);
        } else if (typeof value === 'object') {
          sanitized[key] = sanitizeObject(value);
        } else {
          sanitized[key] = value;
        }
      }
      
      return sanitized;
    };

    if (req.body) {
      req.body = sanitizeObject(req.body);
    }
    
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }

    next();
  };
};

// Middleware для проверки Content-Type
export const validateContentType = (allowedTypes = ['application/json']) => {
  return (req, res, next) => {
    if (req.method === 'GET' || req.method === 'DELETE') {
      return next();
    }

    const contentType = req.get('Content-Type');
    if (!contentType || !allowedTypes.some(type => contentType.includes(type))) {
      logger.warn('❌ Неверный Content-Type', {
        contentType,
        allowedTypes,
        endpoint: req.path
      });
      
      return res.status(415).json({
        error: 'Неподдерживаемый Content-Type',
        allowed: allowedTypes
      });
    }

    next();
  };
};

// Проверка размера тела запроса
export const validateRequestSize = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = req.get('Content-Length');
    
    if (contentLength) {
      const sizeInMB = parseInt(contentLength) / (1024 * 1024);
      const maxSizeNum = parseInt(maxSize.replace('mb', ''));
      
      if (sizeInMB > maxSizeNum) {
        logger.warn('❌ Превышен размер запроса', {
          contentLength,
          maxSize,
          endpoint: req.path
        });
        
        return res.status(413).json({
          error: 'Размер запроса превышен',
          maxSize: maxSize
        });
      }
    }

    next();
  };
};

export default {
  validateAnalyzeRequest,
  validateSpiritChatRequest,
  validateSpiritGossipRequest,
  validatePaginationQuery,
  validateCommonParams,
  sanitizeInput,
  validateContentType,
  validateRequestSize,
  handleValidationErrors
};
