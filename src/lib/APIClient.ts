import { SpiritAnalysis } from './analyzeSentiment';

interface CacheItem<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Кеширующий API клиент для оптимизации запросов
 */
class APIClient {
  private static instance: APIClient;
  private cache = new Map<string, CacheItem>();
  private readonly baseURL = 'http://localhost:3001';
  
  static getInstance(): APIClient {
    if (!APIClient.instance) {
      APIClient.instance = new APIClient();
    }
    return APIClient.instance;
  }

  private getCacheKey(endpoint: string, params: unknown): string {
    return `${endpoint}_${JSON.stringify(params)}`;
  }

  private isValid(item: { timestamp: number; ttl: number }): boolean {
    return Date.now() - item.timestamp < item.ttl;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}, 
    cacheTTL: number = 0
  ): Promise<T> {
    const cacheKey = this.getCacheKey(endpoint, options.body);
    
    // Проверяем кеш если TTL > 0
    if (cacheTTL > 0) {
      const cached = this.cache.get(cacheKey);
      if (cached && this.isValid(cached)) {
        return cached.data as T;
      }
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Кешируем успешные ответы
      if (cacheTTL > 0) {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl: cacheTTL,
        });
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  async analyzeSentiment(text: string): Promise<SpiritAnalysis> {
    return this.request<SpiritAnalysis>(
      '/analyze',
      {
        method: 'POST',
        body: JSON.stringify({ text }),
      },
      300000 // 5 минут кеш для анализа
    );
  }

  async chatWithSpirit(params: {
    text: string;
    mood: string;
    essence: string;
    history: string[];
    originText?: string;
    birthDate?: string;
  }): Promise<{ reply: string }> {
    return this.request<{ reply: string }>(
      '/spirit-chat',
      {
        method: 'POST',
        body: JSON.stringify(params),
      },
      0 // Не кешируем чат
    );
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }

  // Очистка устаревших записей
  cleanupCache(): void {
    for (const [key, item] of this.cache.entries()) {
      if (!this.isValid(item)) {
        this.cache.delete(key);
      }
    }
  }
}

export const apiClient = APIClient.getInstance();

// Автоматическая очистка кеша каждые 10 минут
setInterval(() => {
  apiClient.cleanupCache();
}, 600000);
