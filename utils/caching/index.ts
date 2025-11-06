/**
 * Caching Utilities
 *
 * Unified caching system with specialized implementations for
 * different use cases: memory, file-based, glyph shapes, and API responses.
 */

// Unified caching system
export {
  UnifiedCache,
  unifiedCache,
  memoryCache,
  fileCache,
  type CacheConfig,
  type CacheStats,
  type CacheEvent,
  type CacheBackend
} from './unified';

// Legacy exports for backward compatibility
export { shapeForV2, getOvershoot, type SvgShape } from './caching';
export { articleCache, imageCache, apiCache } from './advancedCache';
