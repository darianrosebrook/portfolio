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
    totalSize: 0
  };

  constructor(config: CacheConfig = {}) {
    this.config = {
      maxSize: config.maxSize ?? 100,
      ttl: config.ttl ?? 0,
      strategy: config.strategy ?? 'lru',
      compression: config.compression ?? false,
      persistence: config.persistence ?? false,
      namespace: config.namespace ?? 'memory'
    };
  }

  async get(key: string): Promise<T | undefined> {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.stats.totalRequests++;
      return undefined;
    }

    // Check TTL
    if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
      await this.delete(key);
      this.stats.misses++;
      this.stats.totalRequests++;
      return undefined;
    }

    // Update access metadata
    entry.hits++;
    entry.lastAccessed = Date.now();

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
      size: this.estimateSize(value)
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
    return entry ? !(entry.ttl && Date.now() - entry.timestamp > entry.ttl) : false;
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

    let keyToEvict: string;

    switch (this.config.strategy) {
      case 'lfu':
        // Least Frequently Used
        keyToEvict = Array.from(this.cache.entries())
          .sort(([,a], [,b]) => a.hits - b.hits)[0][0];
        break;

      case 'fifo':
        // First In First Out
        keyToEvict = this.cache.keys().next().value;
        break;

      case 'lru':
      default:
        // Least Recently Used
        keyToEvict = Array.from(this.cache.entries())
          .sort(([,a], [,b]) => a.lastAccessed - b.lastAccessed)[0][0];
        break;
    }

    const entry = this.cache.get(keyToEvict);
    if (entry) {
      this.cache.delete(keyToEvict);
      this.stats.evictions++;
      this.stats.totalSize -= entry.size ?? 0;
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
    this.stats.hitRate = this.stats.totalRequests > 0
      ? this.stats.hits / this.stats.totalRequests
      : 0;
  }

  private persistToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const data = Array.from(this.cache.entries());
      localStorage.setItem(`cache_${this.config.namespace}`, JSON.stringify(data));
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
        this.stats.totalSize = Array.from(this.cache.values())
          .reduce((sum, entry) => sum + (entry.size ?? 0), 0);
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
    }
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }
}

// File-based cache for design tokens and static assets
class FileCache<T = any> implements CacheBackend<T> {
  private config: Required<CacheConfig>;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalRequests: 0,
    hitRate: 0,
    entries: 0,
    totalSize: 0
  };

  constructor(config: CacheConfig = {}) {
    this.config = {
      maxSize: config.maxSize ?? 1000,
      ttl: config.ttl ?? 24 * 60 * 60 * 1000, // 24 hours
      strategy: config.strategy ?? 'lru',
      compression: config.compression ?? false,
      persistence: config.persistence ?? true,
      namespace: config.namespace ?? 'file'
    };
  }

  async get(key: string): Promise<T | undefined> {
    // Implementation would use file system or IndexedDB
    // This is a simplified version
    this.stats.misses++;
    this.stats.totalRequests++;
    return undefined;
  }

  async set(key: string, value: T, ttl?: number): Promise<void> {
    // Implementation would write to file system or IndexedDB
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
    totalSize: 0
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
    } = {}
  ): Promise<T | undefined> {
    const { cache = 'memory', fallback, ttl } = options;
    const cacheInstance = this.caches.get(cache);

    if (!cacheInstance) {
      throw new Error(`Cache '${cache}' not found`);
    }

    // Try cache first
    const cached = await cacheInstance.get(key);
    if (cached !== undefined) {
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
    this.eventListeners.forEach(listener => {
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

    this.globalStats.hitRate = this.globalStats.totalRequests > 0
      ? this.globalStats.hits / this.globalStats.totalRequests
      : 0;
  }

  getStats(cache?: string): CacheStats {
    if (cache) {
      const cacheInstance = this.caches.get(cache);
      return cacheInstance && 'getStats' in cacheInstance
        ? cacheInstance.getStats()
        : { ...this.globalStats };
    }
    return { ...this.globalStats };
  }

  getCacheStats(): Record<string, CacheStats> {
    const stats: Record<string, CacheStats> = {};
    for (const [name, cache] of this.caches) {
      if ('getStats' in cache) {
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
    return Promise.all(keys.map(key => this.get<T>(key, { cache })));
  }

  async setMany<T = any>(
    entries: Array<{ key: string; value: T; ttl?: number }>,
    cache: string = 'memory'
  ): Promise<void> {
    await Promise.all(
      entries.map(({ key, value, ttl }) =>
        this.set(key, value, { cache, ttl })
      )
    );
  }
}

// Singleton instance
export const unifiedCache = new UnifiedCache();

// Specialized cache instances for different use cases
export const memoryCache = unifiedCache; // Default memory cache
export const fileCache = {
  get: (key: string) => unifiedCache.get(key, { cache: 'file' }),
  set: (key: string, value: any, ttl?: number) =>
    unifiedCache.set(key, value, { cache: 'file', ttl }),
  delete: (key: string) => unifiedCache.delete(key, 'file'),
  clear: () => unifiedCache.clear('file'),
  has: (key: string) => unifiedCache.has(key, 'file')
};

// Export types
export type { CacheConfig, CacheStats, CacheEvent, CacheBackend };


