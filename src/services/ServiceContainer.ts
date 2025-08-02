import type { Texture } from 'three';
import { SpiritService, AnalyticsService, CacheService, ErrorService, GossipService, TextureService, StorageService, APIClient, Logger, NotificationService } from './implementations';

// Контейнер сервисов для управления зависимостями
export interface IServiceContainer {
  // Core services
  spiritService: ISpiritService;
  analyticsService: IAnalyticsService;
  cacheService: ICacheService;
  errorService: IErrorService;
  
  // Feature services
  gossipService: IGossipService;
  textureService: ITextureService;
  storageService: IStorageService;
  
  // Infrastructure services
  apiClient: IAPIClient;
  logger: ILogger;
  notificationService: INotificationService;
}

// Базовые интерфейсы сервисов
export interface ISpiritService {
  generateSpirit(input: string): Promise<Spirit>;
  getSpirits(): Promise<Spirit[]>;
  deleteSpirit(id: string): Promise<void>;
}

export interface IAnalyticsService {
  trackEvent(event: string, properties?: Record<string, unknown>): void;
  trackPageView(page: string): void;
  trackUserInteraction(action: string, target: string): void;
}

export interface ICacheService {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T, ttl?: number): void;
  clear(key?: string): void;
  has(key: string): boolean;
}

export interface IErrorService {
  captureException(error: Error, context?: Record<string, unknown>): void;
  captureMessage(message: string, level?: 'info' | 'warning' | 'error'): void;
  addBreadcrumb(message: string, category?: string): void;
}

export interface IGossipService {
  generateGossip(spirits: Spirit[]): Promise<string>;
  analyzeRelationships(spirits: Spirit[]): Promise<SpiritRelationship[]>;
}

export interface ITextureService {
  preloadTextures(): Promise<void>;
  getTexture(name: string): Texture | null;
  getMoodTexture(mood: string): string;
}

export interface IStorageService {
  save<T>(key: string, data: T): Promise<void>;
  load<T>(key: string): Promise<T | null>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface IAPIClient {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, data: unknown): Promise<T>;
  put<T>(url: string, data: unknown): Promise<T>;
  delete(url: string): Promise<void>;
}

export interface ILogger {
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, error?: Error, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;
}

export interface INotificationService {
  success(message: string): void;
  error(message: string): void;
  warning(message: string): void;
  info(message: string): void;
}

// Типы
interface Spirit {
  id: string;
  mood: string;
  content: string;
  // ... другие поля
}

interface SpiritRelationship {
  spiritA: string;
  spiritB: string;
  relationship: string;
  strength: number;
}

// Реализация контейнера
class ServiceContainer implements IServiceContainer {
  private services = new Map<string, unknown>();
  private initialized = false;

  // Lazy loading для сервисов
  get spiritService(): ISpiritService {
    return this.getService('spiritService', () => new SpiritService(this));
  }

  get analyticsService(): IAnalyticsService {
    return this.getService('analyticsService', () => new AnalyticsService());
  }

  get cacheService(): ICacheService {
    return this.getService('cacheService', () => new CacheService());
  }

  get errorService(): IErrorService {
    return this.getService('errorService', () => new ErrorService());
  }

  get gossipService(): IGossipService {
    return this.getService('gossipService', () => new GossipService(this));
  }

  get textureService(): ITextureService {
    return this.getService('textureService', () => new TextureService());
  }

  get storageService(): IStorageService {
    return this.getService('storageService', () => new StorageService());
  }

  get apiClient(): IAPIClient {
    return this.getService('apiClient', () => new APIClient(this));
  }

  get logger(): ILogger {
    return this.getService('logger', () => new Logger());
  }

  get notificationService(): INotificationService {
    return this.getService('notificationService', () => new NotificationService());
  }

  private getService<T>(name: string, factory: () => T): T {
    if (!this.services.has(name)) {
      this.services.set(name, factory());
    }
    return this.services.get(name) as T;
  }

  // Регистрация кастомного сервиса
  register<T>(name: string, service: T): void {
    this.services.set(name, service);
  }

  // Инициализация всех сервисов
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Инициализируем критичные сервисы
      await this.textureService.preloadTextures();
      
      this.logger.info('ServiceContainer initialized successfully');
      this.initialized = true;
    } catch (error) {
      this.logger.error('Failed to initialize ServiceContainer', error as Error);
      throw error;
    }
  }

  // Очистка ресурсов
  dispose(): void {
    this.services.clear();
    this.initialized = false;
  }
}

// Глобальный экземпляр контейнера
export const serviceContainer = new ServiceContainer();

// React хук для использования сервисов
import { useEffect, useState } from 'react';

export const useServices = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    serviceContainer.initialize()
      .then(() => setIsReady(true))
      .catch((error) => {
        console.error('Failed to initialize services:', error);
      });
  }, []);

  return {
    services: serviceContainer,
    isReady
  };
};

// Утилиты для тестирования
export const createMockServiceContainer = (): IServiceContainer => {
  const mockContainer = {} as IServiceContainer;
  
  // Создаем моки для всех сервисов
  mockContainer.spiritService = {
    generateSpirit: jest.fn(),
    getSpirits: jest.fn(),
    deleteSpirit: jest.fn()
  } as ISpiritService;
  
  // ... остальные моки
  
  return mockContainer;
};

export default serviceContainer;
