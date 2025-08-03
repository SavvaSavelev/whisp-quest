// src/config/index.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Получаем путь к директории текущего файла
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загружаем .env из корня проекта (на уровень выше)
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  
  // Server
  server: {
    port: parseInt(process.env.PORT) || 3001,
    host: process.env.HOST || 'localhost',
    bodyLimit: process.env.BODY_LIMIT || '10mb',
  },
  
  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 300,
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.85,
    timeout: parseInt(process.env.OPENAI_TIMEOUT) || 30000,
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 минут
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // 100 запросов
  },
  
  // Server
  server: {
    port: parseInt(process.env.PORT) || 3001,
    host: process.env.HOST || 'localhost',
    bodyLimit: process.env.BODY_LIMIT || '10mb',
  },
  
  // Caching
  cache: {
    ttl: parseInt(process.env.CACHE_TTL) || 3600, // 1 час
    maxKeys: parseInt(process.env.CACHE_MAX_KEYS) || 1000,
  },
  
  // Security
  security: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
    trustProxy: process.env.TRUST_PROXY === 'true',
  },
  
  // Monitoring
  monitoring: {
    enableMetrics: process.env.ENABLE_METRICS !== 'false',
    enableHealthCheck: process.env.ENABLE_HEALTH_CHECK !== 'false',
  }
};

// Валидация обязательных переменных
const requiredEnvVars = ['OPENAI_API_KEY'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`❌ Отсутствует обязательная переменная окружения: ${envVar}`);
  }
}

export default config;
