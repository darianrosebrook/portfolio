/**
 * Design Token Generators
 *
 * Functions for generating various output formats from design tokens.
 */

// Token composition
export * from './compose';

// Global CSS generation
export * from './global';

// TypeScript type generation
export * from './types';

// Component-specific CSS generation
// Curated re-export: a blind `export *` here collides with core/index's
// tokenPathToCSSVar in the designTokens barrel (TS2308). The generator's
// public API surface excludes names owned by core.
export {
  refToCssVar,
  buildFallbackResolver,
  buildCssForComponent,
  flattenTokens,
} from './generateCSSTokens.mjs';

// Schema generation
export * from './generateSchema.mjs';
