/**
 * Caching Utilities
 *
 * Glyph shape caching and advanced caching utilities for
 * performance optimization in typography analysis.
 */

// Glyph shape caching
export { shapeForV2, getOvershoot, type SvgShape } from './caching';

// Advanced caching for articles, images, and API responses
export { articleCache, imageCache, apiCache } from './advancedCache';
