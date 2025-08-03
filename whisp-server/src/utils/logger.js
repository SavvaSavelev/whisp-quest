// src/utils/logger.js
import { createWriteStream } from 'fs';
import { join } from 'path';
import config from '../config/index.js';

class Logger {
  constructor() {
    this.logLevels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3
    };
    
    this.currentLevel = config.nodeEnv === 'production' ? 1 : 3;
    
    // Файловые потоки для продакшна
    if (config.nodeEnv === 'production') {
      this.errorStream = createWriteStream(join(process.cwd(), 'logs/error.log'), { flags: 'a' });
      this.infoStream = createWriteStream(join(process.cwd(), 'logs/info.log'), { flags: 'a' });
    }
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
    return `[${timestamp}] [${level}] ${message} ${metaStr}`.trim();
  }

  log(level, message, meta = {}) {
    if (this.logLevels[level] > this.currentLevel) return;

    const formattedMessage = this.formatMessage(level, message, meta);
    
    // Консольный вывод с цветами
    const colors = {
      ERROR: '\x1b[31m', // красный
      WARN: '\x1b[33m',  // желтый
      INFO: '\x1b[36m',  // голубой
      DEBUG: '\x1b[90m'  // серый
    };
    
    console.log(`${colors[level]}${formattedMessage}\x1b[0m`);
    
    // Запись в файлы для продакшна
    if (config.nodeEnv === 'production') {
      if (level === 'ERROR') {
        this.errorStream.write(formattedMessage + '\n');
      } else {
        this.infoStream.write(formattedMessage + '\n');
      }
    }
  }

  error(message, meta = {}) {
    this.log('ERROR', message, meta);
  }

  warn(message, meta = {}) {
    this.log('WARN', message, meta);
  }

  info(message, meta = {}) {
    this.log('INFO', message, meta);
  }

  debug(message, meta = {}) {
    this.log('DEBUG', message, meta);
  }

  // Логирование HTTP запросов
  httpLog(req, res, responseTime) {
    const { method, url, ip } = req;
    const { statusCode } = res;
    const userAgent = req.get('User-Agent') || '';
    
    const meta = {
      method,
      url,
      ip,
      statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: userAgent.substring(0, 100) // ограничиваем длину
    };

    if (statusCode >= 400) {
      this.error(`HTTP ${statusCode} ${method} ${url}`, meta);
    } else {
      this.info(`HTTP ${statusCode} ${method} ${url}`, meta);
    }
  }
}

export const logger = new Logger();
export default logger;
