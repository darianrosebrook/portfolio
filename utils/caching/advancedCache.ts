/**
 * Advanced Caching Strategy for Portfolio Site
 * Implements multiple caching layers for optimal performance
 */

interface CacheConfig {
  maxAge: number;
  staleWhileRevalidate: number;
  maxSize: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

class AdvancedCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxAge: 5 * 60 * 1000, // 5 minutes
      staleWhileRevalidate: 10 * 60 * 1000, // 10 minutes
      maxSize: 100,
      ...config,
    };
  }

  /**
   * Get cached data with intelligent stale-while-revalidate logic
   */
  async get(key: string, fetcher?: () => Promise<T>): Promise<T | null> {
    const entry = this.cache.get(key);
    const now = Date.now();

    if (!entry) {
      if (fetcher) {
        return this.set(key, await fetcher());
      }
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = now;

    const age = now - entry.timestamp;
    const isStale = age > this.config.maxAge;
    const isExpired = age > this.config.staleWhileRevalidate;

    if (isExpired) {
      this.cache.delete(key);
      if (fetcher) {
        return this.set(key, await fetcher());
      }
      return null;
    }

    // If stale but not expired, return cached data and refresh in background
    if (isStale && fetcher) {
      this.refreshInBackground(key, fetcher);
    }

    return entry.data;
  }

  /**
   * Set cache entry with automatic cleanup
   */
  set(key: string, data: T): T {
    const now = Date.now();

    // Cleanup if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      accessCount: 1,
      lastAccessed: now,
    });

    return data;
  }

  /**
   * Refresh data in background without blocking
   */
  private async refreshInBackground(key: string, fetcher: () => Promise<T>) {
    try {
      const newData = await fetcher();
      this.set(key, newData);
    } catch (error) {
      console.warn(`Background refresh failed for key: ${key}`, error);
    }
  }

  /**
   * Evict least recently used entries
   */
  private evictLRU() {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Clear expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.config.staleWhileRevalidate) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let totalAge = 0;
    let totalAccesses = 0;

    for (const entry of this.cache.values()) {
      totalAge += now - entry.timestamp;
      totalAccesses += entry.accessCount;
    }

    return {
      size: this.cache.size,
      averageAge: this.cache.size > 0 ? totalAge / this.cache.size : 0,
      totalAccesses,
      averageAccesses:
        this.cache.size > 0 ? totalAccesses / this.cache.size : 0,
    };
  }
}

// Pre-configured cache instances
export const articleCache = new AdvancedCache<any>({
  maxAge: 10 * 60 * 1000, // 10 minutes
  staleWhileRevalidate: 30 * 60 * 1000, // 30 minutes
  maxSize: 50,
});

export const imageCache = new AdvancedCache<string>({
  maxAge: 60 * 60 * 1000, // 1 hour
  staleWhileRevalidate: 24 * 60 * 60 * 1000, // 24 hours
  maxSize: 100,
});

export const apiCache = new AdvancedCache<any>({
  maxAge: 5 * 60 * 1000, // 5 minutes
  staleWhileRevalidate: 15 * 60 * 1000, // 15 minutes
  maxSize: 200,
});

// Cleanup expired entries periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    articleCache.cleanup();
    imageCache.cleanup();
    apiCache.cleanup();
  }, 60 * 1000); // Every minute
}
