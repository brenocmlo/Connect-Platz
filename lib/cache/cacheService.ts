// lib/cache/cacheService.ts
// Camada de cache de alto desempenho (em memória com suporte a TTL)

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const memoryStore = new Map<string, CacheEntry<any>>();

export class CacheService {
  /**
   * Obtém um valor do cache ou executa o fetcher para computar e armazenar pelo TTL.
   */
  static async getOrSet<T>(
    key: string,
    ttlSeconds: number,
    fetcher: () => Promise<T>
  ): Promise<T> {
    const now = Date.now();
    const existing = memoryStore.get(key);

    if (existing && existing.expiresAt > now) {
      return existing.value as T;
    }

    const fresh = await fetcher();
    memoryStore.set(key, {
      value: fresh,
      expiresAt: now + ttlSeconds * 1000,
    });

    return fresh;
  }

  static invalidate(pattern: string): void {
    memoryStore.forEach((_, key) => {
      if (key.includes(pattern)) {
        memoryStore.delete(key);
      }
    });
  }

  static clear(): void {
    memoryStore.clear();
  }
}
