/**
 * Helper Utilities
 *
 * Small, reusable utility functions for common operations.
 */

// Animation utilities
// Note: debounce and throttle are available but not currently used in the codebase.
// They are kept as useful utilities for future use cases like search input, scroll events, etc.
export * from './debounce';
export * from './throttle';
export * from './linearInterpolation';

// Data utilities
export * from './hashing';
export * from './numberHelpers';

// Formatting utilities
export * from './colorFormat';
export * from './colorHelpers';

// Color conversion (new hub-based system)
// Note: colorFromTo exports duplicate functions from colorHelpers, so we don't export it here
// to avoid conflicts. Use colorHelpers for color conversion functions.

// Logging utilities
export * from './logger';

// Legacy re-exports (consider moving to proper locations)
export { horizontalLoop } from './horizontalLoop';
