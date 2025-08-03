// src/utils/cache.js
import config from '../config/index.js';
import logger from './logger.js';

class InMemoryCache {
  constructor() {
    this.cache = new Map();
    this.ttlMap = new Map();
    this.maxKeys = config.cache.maxKeys;
    this.defaultTtl = config.cache.ttl * 1000; // конвертируем в миллисекунды
    
    // Очистка expired ключей каждые 5 минут
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
    
    logger.info('✅ Кэш инициализирован', { maxKeys: this.maxKeys, defaultTtl: this.defaultTtl });
  }

  set(key, value, ttl = this.defaultTtl) {
    // Если кэш переполнен, удаляем самые старые ключи
    if (this.cache.size >= this.maxKeys) {
      this.evictOldest();
    }

    const expiryTime = Date.now() + ttl;
    this.cache.set(key, value);
    this.ttlMap.set(key, expiryTime);
    
    logger.debug('📦 Кэш SET', { key, ttl: `${ttl}ms` });
  }

  get(key) {
    const expiryTime = this.ttlMap.get(key);
    
    if (!expiryTime || Date.now() > expiryTime) {
      this.delete(key);
      logger.debug('⏰ Кэш EXPIRED', { key });
      return null;
    }

    const value = this.cache.get(key);
    logger.debug('🎯 Кэш HIT', { key });
    return value;
  }

  delete(key) {
    this.cache.delete(key);
    this.ttlMap.delete(key);
    logger.debug('🗑️ Кэш DELETE', { key });
  }

  has(key) {
    const expiryTime = this.ttlMap.get(key);
    if (!expiryTime || Date.now() > expiryTime) {
      this.delete(key);
      return false;
    }
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
    this.ttlMap.clear();
    logger.info('🧹 Кэш очищен');
  }

  cleanup() {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, expiryTime] of this.ttlMap.entries()) {
      if (now > expiryTime) {
        this.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.debug('🧹 Автоочистка кэша', { cleanedCount, remaining: this.cache.size });
    }
  }

  evictOldest() {
    // Удаляем 10% самых старых ключей при переполнении
    const toEvict = Math.max(1, Math.floor(this.maxKeys * 0.1));
    const sortedByExpiry = Array.from(this.ttlMap.entries())
      .sort((a, b) => a[1] - b[1])
      .slice(0, toEvict);

    for (const [key] of sortedByExpiry) {
      this.delete(key);
    }

    logger.warn('⚠️ Кэш переполнен, удалены старые ключи', { evicted: toEvict });
  }

  getStats() {
    return {
      size: this.cache.size,
      maxKeys: this.maxKeys,
      utilizationPercent: Math.round((this.cache.size / this.maxKeys) * 100)
    };
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
    logger.info('💥 Кэш уничтожен');
  }
}

// Экспортируем singleton instance
export const cache = new InMemoryCache();
export default cache;
