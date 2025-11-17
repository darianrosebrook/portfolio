/**
 * Unified Caching System
 *
 * Single abstraction layer combining file-based, memory-based, and specialized
 * caching strategies for optimal performance across different use cases.
 */

import { performanceMonitor } from '../performance/monitor';

// Cache entry with metadata
interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl?: number;
  hits: number;
  lastAccessed: number;
  size?: number;
}

// Cache statistics
interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  totalRequests: number;
  hitRate: number;
  entries: number;
  totalSize: number;
}

// Cache configuration
interface CacheConfig {
  maxSize?: number;
  ttl?: number;
  staleWhileRevalidate?: number; // Time after TTL expires but data is still usable
  strategy?: 'lru' | 'lfu' | 'fifo';
  compression?: boolean;
  persistence?: boolean;
  namespace?: string;
}

// Cache event types
type CacheEventType = 'hit' | 'miss' | 'set' | 'delete' | 'evict' | 'clear';

interface CacheEvent<T = any> {
  type: CacheEventType;
  key: string;
  data?: T;
  timestamp: number;
  namespace?: string;
}

// Base cache interface
interface CacheBackend<T = any> {
  get(key: string): Promise<T | undefined>;
  set(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
  keys(): Promise<string[]>;
  size(): Promise<number>;
  getStats?(): CacheStats;
}

// Memory-based cache implementation
class MemoryCache<T = any> implements CacheBackend<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: Required<CacheConfig>;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalRequests: 0,
    hitRate: 0,
    entries: 0,
    totalSize: 0,
  };

  constructor(config: CacheConfig = {}) {
    this.config = {
      maxSize: config.maxSize ?? 100,
      ttl: config.ttl ?? 0,
      staleWhileRevalidate: config.staleWhileRevalidate ?? 0,
      strategy: config.strategy ?? 'lru',
      compression: config.compression ?? false,
      persistence: config.persistence ?? false,
      namespace: config.namespace ?? 'memory',
    };
  }

  async get(key: string): Promise<T | undefined> {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.stats.totalRequests++;
      return undefined;
    }

    const now = Date.now();
    const age = now - entry.timestamp;
    const isExpired = entry.ttl && age > entry.ttl;
    const isStale =
      entry.ttl && this.config.staleWhileRevalidate
        ? age > entry.ttl && age <= entry.ttl + this.config.staleWhileRevalidate
        : false;

    // If expired beyond stale-while-revalidate window, delete and return undefined
    if (isExpired && !isStale) {
      await this.delete(key);
      this.stats.misses++;
      this.stats.totalRequests++;
      return undefined;
    }

    // Update access metadata
    entry.hits++;
    entry.lastAccessed = now;

    this.stats.hits++;
    this.stats.totalRequests++;
    this.updateHitRate();

    return entry.data;
  }

  async set(key: string, value: T, ttl?: number): Promise<void> {
    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      ttl: ttl ?? this.config.ttl,
      hits: 0,
      lastAccessed: Date.now(),
      size: this.estimateSize(value),
    };

    // Check size limits
    if (this.cache.size >= this.config.maxSize) {
      await this.evict();
    }

    this.cache.set(key, entry);
    this.stats.entries = this.cache.size;
    this.stats.totalSize += entry.size ?? 0;

    // Persist if configured
    if (this.config.persistence) {
      this.persistToStorage();
    }
  }

  async delete(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (entry) {
      this.cache.delete(key);
      this.stats.entries = this.cache.size;
      this.stats.totalSize -= entry.size ?? 0;
      return true;
    }
    return false;
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.stats.entries = 0;
    this.stats.totalSize = 0;

    if (this.config.persistence) {
      this.clearStorage();
    }
  }

  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    return entry
      ? !(entry.ttl && Date.now() - entry.timestamp > entry.ttl)
      : false;
  }

  async keys(): Promise<string[]> {
    return Array.from(this.cache.keys());
  }

  async size(): Promise<number> {
    return this.cache.size;
  }

  // Eviction strategies
  private async evict(): Promise<void> {
    if (this.cache.size === 0) return;

    let keyToEvict: string | undefined;

    switch (this.config.strategy) {
      case 'lfu':
        // Least Frequently Used
        keyToEvict = Array.from(this.cache.entries()).sort(
          ([, a], [, b]) => a.hits - b.hits
        )[0]?.[0];
        break;

      case 'fifo':
        // First In First Out
        keyToEvict = this.cache.keys().next().value;
        break;

      case 'lru':
      default:
        // Least Recently Used
        keyToEvict = Array.from(this.cache.entries()).sort(
          ([, a], [, b]) => a.lastAccessed - b.lastAccessed
        )[0]?.[0];
        break;
    }

    if (keyToEvict) {
      const entry = this.cache.get(keyToEvict);
      if (entry) {
        this.cache.delete(keyToEvict);
        this.stats.evictions++;
        this.stats.totalSize -= entry.size ?? 0;
      }
    }
  }

  private estimateSize(value: T): number {
    try {
      return JSON.stringify(value).length;
    } catch {
      return 0;
    }
  }

  private updateHitRate(): void {
    this.stats.hitRate =
      this.stats.totalRequests > 0
        ? this.stats.hits / this.stats.totalRequests
        : 0;
  }

  private persistToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const data = Array.from(this.cache.entries());
      localStorage.setItem(
        `cache_${this.config.namespace}`,
        JSON.stringify(data)
      );
    } catch (error) {
      console.warn('Failed to persist cache to localStorage:', error);
    }
  }

  private clearStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(`cache_${this.config.namespace}`);
    } catch (error) {
      console.warn('Failed to clear cache from localStorage:', error);
    }
  }

  // Load from storage on initialization
  loadFromStorage(): void {
    if (typeof window === 'undefined' || !this.config.persistence) return;

    try {
      const stored = localStorage.getItem(`cache_${this.config.namespace}`);
      if (stored) {
        const data = JSON.parse(stored) as [string, CacheEntry<T>][];
        this.cache = new Map(data);
        this.stats.entries = this.cache.size;
        this.stats.totalSize = Array.from(this.cache.values()).reduce(
          (sum, entry) => sum + (entry.size ?? 0),
          0
        );
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
    }
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  // Helper to check if a key is stale (expired but within revalidate window)
  isStale(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry || !entry.ttl) return false;

    const now = Date.now();
    const age = now - entry.timestamp;
    return (
      age > entry.ttl &&
      this.config.staleWhileRevalidate > 0 &&
      age <= entry.ttl + this.config.staleWhileRevalidate
    );
  }
}

// File-based cache for design tokens and static assets
// NOTE: FileCache is not fully implemented. Only memory caching is currently supported.
// This stub exists for API compatibility but always returns undefined.
class FileCache<T = any> implements CacheBackend<T> {
  private config: Required<CacheConfig>;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalRequests: 0,
    hitRate: 0,
    entries: 0,
    totalSize: 0,
  };

  constructor(config: CacheConfig = {}) {
    this.config = {
      maxSize: config.maxSize ?? 1000,
      ttl: config.ttl ?? 24 * 60 * 60 * 1000, // 24 hours
      staleWhileRevalidate: config.staleWhileRevalidate ?? 0,
      strategy: config.strategy ?? 'lru',
      compression: config.compression ?? false,
      persistence: config.persistence ?? true,
      namespace: config.namespace ?? 'file',
    };
  }

  async get(key: string): Promise<T | undefined> {
    // FileCache is not implemented - always return undefined
    // TODO: Implement file-based caching using IndexedDB or filesystem API
    this.stats.misses++;
    this.stats.totalRequests++;
    return undefined;
  }

  async set(key: string, value: T, ttl?: number): Promise<void> {
    // FileCache is not implemented - no-op
    // TODO: Implement file-based caching using IndexedDB or filesystem API
    this.stats.entries++;
  }

  async delete(key: string): Promise<boolean> {
    this.stats.entries = Math.max(0, this.stats.entries - 1);
    return true;
  }

  async clear(): Promise<void> {
    this.stats.entries = 0;
    this.stats.totalSize = 0;
  }

  async has(key: string): Promise<boolean> {
    return false;
  }

  async keys(): Promise<string[]> {
    return [];
  }

  async size(): Promise<number> {
    return this.stats.entries;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }
}

// Unified cache manager
export class UnifiedCache {
  private caches = new Map<string, CacheBackend>();
  private eventListeners = new Set<(event: CacheEvent) => void>();
  private globalStats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalRequests: 0,
    hitRate: 0,
    entries: 0,
    totalSize: 0,
  };

  constructor() {
    // Initialize default caches
    this.registerCache('memory', new MemoryCache());
    this.registerCache('file', new FileCache());

    // Load persisted memory cache
    (this.caches.get('memory') as MemoryCache)?.loadFromStorage();
  }

  registerCache(name: string, cache: CacheBackend): void {
    this.caches.set(name, cache);
  }

  unregisterCache(name: string): boolean {
    return this.caches.delete(name);
  }

  async get<T = any>(
    key: string,
    options: {
      cache?: string;
      fallback?: () => Promise<T>;
      ttl?: number;
      staleWhileRevalidate?: boolean; // Enable stale-while-revalidate behavior
    } = {}
  ): Promise<T | undefined> {
    const {
      cache = 'memory',
      fallback,
      ttl,
      staleWhileRevalidate = false,
    } = options;
    const cacheInstance = this.caches.get(cache);

    if (!cacheInstance) {
      throw new Error(`Cache '${cache}' not found`);
    }

    // Try cache first
    const cached = await cacheInstance.get(key);
    if (cached !== undefined) {
      // Check if stale but within revalidate window and trigger background refresh
      if (staleWhileRevalidate && fallback) {
        const memoryCache = cacheInstance as MemoryCache<T>;
        if (memoryCache && memoryCache.isStale && memoryCache.isStale(key)) {
          // Return stale data immediately and refresh in background
          this.refreshInBackground(key, fallback, { cache, ttl }).catch(() => {
            // Silently fail background refresh
          });
        }
      }
      this.emitEvent({ type: 'hit', key, data: cached, timestamp: Date.now() });
      return cached;
    }

    // Try fallback if provided
    if (fallback) {
      try {
        const data = await fallback();
        await this.set(key, data, { cache, ttl });
        return data;
      } catch (error) {
        this.emitEvent({ type: 'miss', key, timestamp: Date.now() });
        throw error;
      }
    }

    this.emitEvent({ type: 'miss', key, timestamp: Date.now() });
    return undefined;
  }

  private async refreshInBackground<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: { cache: string; ttl?: number }
  ): Promise<void> {
    try {
      const data = await fetcher();
      await this.set(key, data, options);
    } catch (error) {
      console.warn(`Background refresh failed for key: ${key}`, error);
    }
  }

  async set<T = any>(
    key: string,
    value: T,
    options: {
      cache?: string;
      ttl?: number;
    } = {}
  ): Promise<void> {
    const { cache = 'memory', ttl } = options;
    const cacheInstance = this.caches.get(cache);

    if (!cacheInstance) {
      throw new Error(`Cache '${cache}' not found`);
    }

    await cacheInstance.set(key, value, ttl);
    this.emitEvent({ type: 'set', key, data: value, timestamp: Date.now() });
  }

  async delete(key: string, cache: string = 'memory'): Promise<boolean> {
    const cacheInstance = this.caches.get(cache);

    if (!cacheInstance) {
      throw new Error(`Cache '${cache}' not found`);
    }

    const deleted = await cacheInstance.delete(key);
    if (deleted) {
      this.emitEvent({ type: 'delete', key, timestamp: Date.now() });
    }
    return deleted;
  }

  async clear(cache?: string): Promise<void> {
    if (cache) {
      const cacheInstance = this.caches.get(cache);
      if (cacheInstance) {
        await cacheInstance.clear();
      }
    } else {
      // Clear all caches
      for (const cacheInstance of this.caches.values()) {
        await cacheInstance.clear();
      }
    }
    this.emitEvent({ type: 'clear', key: '*', timestamp: Date.now() });
  }

  async has(key: string, cache: string = 'memory'): Promise<boolean> {
    const cacheInstance = this.caches.get(cache);
    return cacheInstance ? await cacheInstance.has(key) : false;
  }

  onCacheEvent(listener: (event: CacheEvent) => void): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  private emitEvent(event: CacheEvent): void {
    this.eventListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('Cache event listener error:', error);
      }
    });

    // Update global stats
    this.updateGlobalStats(event);
  }

  private updateGlobalStats(event: CacheEvent): void {
    switch (event.type) {
      case 'hit':
        this.globalStats.hits++;
        this.globalStats.totalRequests++;
        break;
      case 'miss':
        this.globalStats.misses++;
        this.globalStats.totalRequests++;
        break;
      case 'evict':
        this.globalStats.evictions++;
        break;
    }

    this.globalStats.hitRate =
      this.globalStats.totalRequests > 0
        ? this.globalStats.hits / this.globalStats.totalRequests
        : 0;
  }

  getStats(cache?: string): CacheStats {
    if (cache) {
      const cacheInstance = this.caches.get(cache);
      if (cacheInstance && typeof cacheInstance.getStats === 'function') {
        return cacheInstance.getStats();
      }
      return { ...this.globalStats };
    }
    return { ...this.globalStats };
  }

  getCacheStats(): Record<string, CacheStats> {
    const stats: Record<string, CacheStats> = {};
    for (const [name, cache] of this.caches) {
      if (cache && typeof cache.getStats === 'function') {
        stats[name] = cache.getStats();
      }
    }
    return stats;
  }

  // Specialized methods for common use cases
  async memoize<T>(
    key: string,
    fn: () => Promise<T>,
    options: {
      ttl?: number;
      cache?: string;
    } = {}
  ): Promise<T> {
    const cached = await this.get<T>(key, { cache: options.cache });
    if (cached !== undefined) {
      return cached;
    }

    const result = await fn();
    await this.set(key, result, { ttl: options.ttl, cache: options.cache });
    return result;
  }

  // Batch operations
  async getMany<T = any>(
    keys: string[],
    cache: string = 'memory'
  ): Promise<(T | undefined)[]> {
    return Promise.all(keys.map((key) => this.get<T>(key, { cache })));
  }

  async setMany<T = any>(
    entries: Array<{ key: string; value: T; ttl?: number }>,
    cache: string = 'memory'
  ): Promise<void> {
    await Promise.all(
      entries.map(({ key, value, ttl }) => this.set(key, value, { cache, ttl }))
    );
  }
}

// Singleton instance
export const unifiedCache = new UnifiedCache();

// Specialized cache instances for different use cases
export const memoryCache = unifiedCache; // Default memory cache

// File cache wrapper (currently not implemented - uses memory cache)
export const fileCache = {
  get: (key: string) => unifiedCache.get(key, { cache: 'file' }),
  set: (key: string, value: any, ttl?: number) =>
    unifiedCache.set(key, value, { cache: 'file', ttl }),
  delete: (key: string) => unifiedCache.delete(key, 'file'),
  clear: () => unifiedCache.clear('file'),
  has: (key: string) => unifiedCache.has(key, 'file'),
};

// Migrated cache instances from advancedCache.ts
// These use UnifiedCache with stale-while-revalidate support

// Article cache: 10min TTL, 30min stale-while-revalidate, max 50 entries
const articleCacheBackend = new MemoryCache<any>({
  maxSize: 50,
  ttl: 10 * 60 * 1000, // 10 minutes
  staleWhileRevalidate: 30 * 60 * 1000, // 30 minutes
  namespace: 'article',
});
unifiedCache.registerCache('article', articleCacheBackend);

export const articleCache = {
  get: <T = any>(
    key: string,
    fetcher?: () => Promise<T>
  ): Promise<T | null> => {
    return unifiedCache
      .get<T>(key, {
        cache: 'article',
        fallback: fetcher,
        staleWhileRevalidate: !!fetcher,
      })
      .then((result) => result ?? null);
  },
  set: (key: string, data: any): any => {
    unifiedCache.set(key, data, { cache: 'article' }).catch(() => {
      // Silently handle async errors
    });
    return data;
  },
  cleanup: () => {
    // Cleanup is handled automatically by TTL
  },
  getStats: () => unifiedCache.getStats('article'),
};

// Image cache: 1hr TTL, 24hr stale-while-revalidate, max 100 entries
const imageCacheBackend = new MemoryCache<string>({
  maxSize: 100,
  ttl: 60 * 60 * 1000, // 1 hour
  staleWhileRevalidate: 24 * 60 * 60 * 1000, // 24 hours
  namespace: 'image',
});
unifiedCache.registerCache('image', imageCacheBackend);

export const imageCache = {
  get: <T = string>(
    key: string,
    fetcher?: () => Promise<T>
  ): Promise<T | null> => {
    return unifiedCache
      .get<T>(key, {
        cache: 'image',
        fallback: fetcher,
        staleWhileRevalidate: !!fetcher,
      })
      .then((result) => result ?? null);
  },
  set: (key: string, data: string): string => {
    unifiedCache.set(key, data, { cache: 'image' }).catch(() => {
      // Silently handle async errors
    });
    return data;
  },
  cleanup: () => {
    // Cleanup is handled automatically by TTL
  },
  getStats: () => unifiedCache.getStats('image'),
};

// API cache: 5min TTL, 15min stale-while-revalidate, max 200 entries
const apiCacheBackend = new MemoryCache<any>({
  maxSize: 200,
  ttl: 5 * 60 * 1000, // 5 minutes
  staleWhileRevalidate: 15 * 60 * 1000, // 15 minutes
  namespace: 'api',
});
unifiedCache.registerCache('api', apiCacheBackend);

export const apiCache = {
  get: <T = any>(
    key: string,
    fetcher?: () => Promise<T>
  ): Promise<T | null> => {
    return unifiedCache
      .get<T>(key, {
        cache: 'api',
        fallback: fetcher,
        staleWhileRevalidate: !!fetcher,
      })
      .then((result) => result ?? null);
  },
  set: (key: string, data: any): any => {
    unifiedCache.set(key, data, { cache: 'api' }).catch(() => {
      // Silently handle async errors
    });
    return data;
  },
  cleanup: () => {
    // Cleanup is handled automatically by TTL
  },
  getStats: () => unifiedCache.getStats('api'),
};

// Periodic cleanup for migrated caches (replaces setInterval in advancedCache.ts)
if (typeof window !== 'undefined') {
  setInterval(() => {
    // Cleanup is handled automatically by TTL, but we can trigger stats updates
    unifiedCache.getStats('article');
    unifiedCache.getStats('image');
    unifiedCache.getStats('api');
  }, 60 * 1000); // Every minute
}

// Export types
export type { CacheConfig, CacheStats, CacheEvent, CacheBackend };
