import { TextureLoader, Texture } from 'three';

/**
 * Централизованный менеджер текстур с кешированием и предзагрузкой
 */
class TextureManager {
  private static instance: TextureManager;
  private cache = new Map<string, Texture>();
  private loader = new TextureLoader();
  private loadingPromises = new Map<string, Promise<Texture>>();

  static getInstance(): TextureManager {
    if (!TextureManager.instance) {
      TextureManager.instance = new TextureManager();
    }
    return TextureManager.instance;
  }

  async loadTexture(url: string): Promise<Texture> {
    // Возвращаем из кеша если есть
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    // Возвращаем промис загрузки если уже загружается
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!;
    }

    // Создаем новый промис загрузки
    const loadPromise = new Promise<Texture>((resolve, reject) => {
      this.loader.load(
        url,
        (texture) => {
          this.cache.set(url, texture);
          this.loadingPromises.delete(url);
          resolve(texture);
        },
        undefined,
        (error) => {
          this.loadingPromises.delete(url);
          reject(error);
        }
      );
    });

    this.loadingPromises.set(url, loadPromise);
    return loadPromise;
  }

  preloadTextures(urls: string[]): Promise<Texture[]> {
    return Promise.all(urls.map(url => this.loadTexture(url)));
  }

  getTexture(url: string): Texture | null {
    return this.cache.get(url) || null;
  }

  clearCache(): void {
    this.cache.clear();
    this.loadingPromises.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

export const textureManager = TextureManager.getInstance();
