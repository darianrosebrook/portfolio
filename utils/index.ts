/**
 * Utils Root Export
 *
 * Main export point for all utility functions.
 * Organized by category for better discoverability.
 */

// Core utilities (most commonly used)
export * from './env';
export * from './bluesky';
export * from './gooeyHighlight';

// Helper utilities (small, reusable functions)
export * from './helpers';

// Caching utilities
export * from './caching';

// Performance utilities
export * from './performance';

// Schema utilities
export * from './schemas';

// Domain-specific utilities (use explicit imports for better tree-shaking)
// Example: import { createClient } from '@/utils/supabase';
// Example: import { Logger } from '@/utils/helpers';

// Re-export commonly used items for convenience
export { Logger } from './helpers/logger';
export { createClient } from './supabase/client';
export { generateFileHash } from './helpers/hashing';
export { debounce, throttle } from './helpers';
