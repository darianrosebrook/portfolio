/**
 * Design Tokens API
 *
 * Main entry point for design token utilities.
 * Exports both generation functions and runtime utilities.
 */

// Core utilities
export * from './core/index';

// Generation functions
export { composeTokens } from './generators/compose';
export { generateGlobalTokens } from './generators/global';
export { generateTokenTypes } from './generators/types';

// Build runners
export { buildTokens, runSteps } from './runners/build';

// Runtime utilities (re-export existing functionality)
export { resolveToken, generate } from './componentTokenUtils';

// Convenience re-exports for common operations
export {
  readTokenFile as readTokens,
  writeOutputFile as writeTokens,
  tokenPathToCSSVar as toCSSVar,
  extractTokenPaths as getTokenPaths,
} from './core/index';
