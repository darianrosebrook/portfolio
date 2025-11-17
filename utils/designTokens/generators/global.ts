#!/usr/bin/env node
/**
 * Global Token Generator
 *
 * Consolidates both .mjs and .ts implementations into a single,
 * TypeScript-based generator for global design tokens.
 */

import fs from 'fs';
import path from 'path';
import {
  PATHS,
  readTokenFile,
  writeOutputFile,
  tokenPathToCSSVar,
  formatCSSBlock,
  generateBanner,
  logSummary,
  type TokenGroup,
} from '../core/index';
import { hasFileChanged, updateFileCache } from '../core/cache';
import {
  isTokenDeprecated,
  formatDeprecationWarning,
} from '../deprecation/index';
import {
  Resolver,
  loadResolverDocument,
  type ResolutionInput,
} from '../utils/resolver-module';
import {
  isStructuredColorValue,
  isStructuredDimensionValue,
  colorValueToCSS,
  dimensionValueToCSS,
} from '../utils/transforms';

interface ThemeMaps {
  root: Record<string, string>;
  lightColors: Record<string, string>;
  darkColors: Record<string, string>;
  hasDarkOverride: boolean;
}

interface CollectionContext {
  theme?: 'light' | 'dark';
  definedVars: Set<string>;
  referencedVars: Set<string>;
}

/**
 * Walk token tree and collect CSS custom properties
 */
function collectTokens(
  obj: TokenGroup,
  path: string[] = [],
  context: CollectionContext,
  maps: ThemeMaps,
  tokens: TokenGroup
): void {
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$')) continue; // Skip metadata

    const currentPath = [...path, key];
    const cssVar = tokenPathToCSSVar(currentPath.join('.'));

    if (value && typeof value === 'object') {
      if ('$value' in value) {
        // This is a token
        const tokenValue = value.$value;
        const tokenType = value.$type;

        // Skip tokens with undefined/null values
        if (tokenValue === undefined || tokenValue === null) {
          return;
        }

        // Track defined variables
        context.definedVars.add(cssVar);

        // Check for theme-specific values in $extensions
        const extensions = value.$extensions as
          | Record<string, unknown>
          | undefined;
        const hasThemeExtensions =
          extensions &&
          ('design.paths.light' in extensions ||
            'design.paths.dark' in extensions);

        if (hasThemeExtensions) {
          maps.hasDarkOverride = true;

          // Light theme value (from extension or default)
          const lightValue = extensions!['design.paths.light'] || tokenValue;
          const processedLightValue = processTokenValue(
            lightValue,
            context,
            currentPath.join('.'),
            tokens
          );
          if (processedLightValue) {
            maps.lightColors[cssVar] = processedLightValue;
          }

          // Dark theme value (from extension or default)
          const darkValue = extensions!['design.paths.dark'] || tokenValue;
          const processedDarkValue = processTokenValue(
            darkValue,
            context,
            currentPath.join('.'),
            tokens
          );
          if (processedDarkValue) {
            maps.darkColors[cssVar] = processedDarkValue;
          }
        } else if (typeof tokenValue === 'object' && tokenValue !== null) {
          const themeObj = tokenValue as Record<string, unknown>;

          if ('light' in themeObj || 'dark' in themeObj) {
            maps.hasDarkOverride = true;

            // Light theme value
            if ('light' in themeObj) {
              const lightValue = processTokenValue(
                themeObj.light,
                context,
                currentPath.join('.'),
                tokens
              );
              if (lightValue) {
                maps.lightColors[cssVar] = lightValue;
              }
            }

            // Dark theme value
            if ('dark' in themeObj) {
              const darkValue = processTokenValue(
                themeObj.dark,
                context,
                currentPath.join('.'),
                tokens
              );
              if (darkValue) {
                maps.darkColors[cssVar] = darkValue;
              }
            }
          } else {
            // Regular object value (not theme-specific)
            const processedValue = processTokenValue(
              tokenValue,
              context,
              currentPath.join('.'),
              tokens
            );
            if (processedValue) {
              maps.root[cssVar] = processedValue;
            }
          }
        } else {
          // Simple value
          const processedValue = processTokenValue(
            tokenValue,
            context,
            currentPath.join('.'),
            tokens
          );

          // Skip if value is empty/undefined
          if (!processedValue) {
            return;
          }

          // Determine where to place based on token type or path
          if (
            tokenType === 'color' ||
            currentPath.some((p) => p.includes('color'))
          ) {
            // For color tokens without theme extensions, use default value for both themes
            maps.lightColors[cssVar] = processedValue;
            maps.darkColors[cssVar] = processedValue;
          } else {
            maps.root[cssVar] = processedValue;
          }
        }
      } else {
        // This is a group, recurse
        collectTokens(value as TokenGroup, currentPath, context, maps, tokens);
      }
    } else if (value !== undefined && value !== null) {
      // Handle plain values from resolver module (not DTCG structure)
      // These are already resolved values, not token objects
      
      // Check if value is actually undefined (from unresolved references)
      // The resolver may return undefined for tokens that couldn't be resolved
      if (value === undefined) {
        // Skip undefined values - they're unresolved references
        return;
      }
      
      const processedValue = processTokenValue(
        value,
        context,
        currentPath.join('.'),
        tokens
      );

      // Skip if processed value is empty (but allow 0, false, etc.)
      if (processedValue === '' && value !== '' && value !== 0 && value !== false) {
        return;
      }

      // Track defined variables
      context.definedVars.add(cssVar);

      // Determine where to place based on path
      if (currentPath.some((p) => p.includes('color'))) {
        // For color tokens, use default value for both themes
        maps.lightColors[cssVar] = processedValue;
        maps.darkColors[cssVar] = processedValue;
      } else {
        maps.root[cssVar] = processedValue;
      }
    } else if (value === undefined) {
      // Explicitly handle undefined values from resolver
      // These are tokens that exist but couldn't be resolved
      // Skip them entirely - they're not valid CSS
      return;
    }
  }
}

/**
 * Process token value and handle references.
 *
 * Converts DTCG 1.0 structured values to CSS strings and resolves token references.
 * Supports both legacy string values and new structured objects.
 *
 * @param value - Raw token value to process
 * @param context - Collection context for tracking variables and references
 * @param tokenPath - Current token path (for reference resolution)
 * @param tokens - Full token tree (for reference validation)
 * @returns Processed CSS value string
 */
function processTokenValue(
  value: unknown,
  context: CollectionContext,
  tokenPath?: string,
  tokens?: TokenGroup
): string {
  // Handle undefined/null values - skip them
  if (value === undefined || value === null) {
    return '';
  }

  // Handle DTCG 1.0 structured values first
  if (isStructuredColorValue(value)) {
    return colorValueToCSS(value);
  }

  if (isStructuredDimensionValue(value)) {
    return dimensionValueToCSS(value);
  }

  if (typeof value === 'string') {
    // Handle token references like {core.color.blue.500}
    const processedValue = value.replace(
      /\{([^}]+)\}/g,
      (_match: string, refTokenPath: string) => {
        // Check for deprecation warnings
        if (tokens) {
          const deprecation = isTokenDeprecated(tokens, refTokenPath);
          if (deprecation) {
            console.warn(formatDeprecationWarning(refTokenPath, deprecation));
          }
        }

        const cssVar = tokenPathToCSSVar(refTokenPath);
        context.referencedVars.add(cssVar);
        return `var(${cssVar})`;
      }
    );
    return processedValue;
  }

  // Handle legacy DTCG structured values (objects that are token references)
  if (typeof value === 'object' && value !== null && '$value' in value) {
    const tokenValue = (value as { $value: unknown }).$value;
    // Recursively process the actual value
    return processTokenValue(tokenValue, context, tokenPath, tokens);
  }

  return String(value);
}

/**
 * Validate that all referenced tokens are defined
 */
function validateReferences(context: CollectionContext): string[] {
  const errors: string[] = [];

  for (const referenced of context.referencedVars) {
    if (!context.definedVars.has(referenced)) {
      errors.push(`Referenced token not found: ${referenced}`);
    }
  }

  return errors;
}

/**
 * Generate CSS from resolved token tree (used by resolver module).
 *
 * Converts DTCG 1.0 structured token values to CSS custom properties.
 * Handles color conversions, dimension formatting, and reference validation.
 *
 * @param tokens - Resolved token tree from resolver module
 * @returns Success status of CSS generation
 */
function generateCSSFromTokens(tokens: TokenGroup): boolean {
  const context: CollectionContext = {
    definedVars: new Set(),
    referencedVars: new Set(),
  };

  const maps: ThemeMaps = {
    root: {},
    lightColors: {},
    darkColors: {},
    hasDarkOverride: false,
  };

  // Collect all tokens into CSS variables
  collectTokens(tokens, [], context, maps, tokens);

  // Validate references
  const referenceErrors = validateReferences(context);
  if (referenceErrors.length > 0) {
    console.warn('[tokens] Reference validation warnings:');
    referenceErrors.forEach((error) => console.warn(`  - ${error}`));
  }

  // Generate CSS content
  const banner = generateBanner('Resolver Module');

  // Merge light colors into root as defaults
  const rootWithDefaults = { ...maps.root, ...maps.lightColors };
  const rootBlock = formatCSSBlock(':root', rootWithDefaults);

  const lightBlock = formatCSSBlock('.light', maps.lightColors);
  const darkBlock = formatCSSBlock('.dark', maps.darkColors);

  // Generate prefers-color-scheme media query
  const prefersBlock = maps.hasDarkOverride
    ? `@media (prefers-color-scheme: dark) {\n${formatCSSBlock('  :root', maps.darkColors)}\n${formatCSSBlock('  .light', maps.lightColors)}\n}`
    : '';

  // Combine all blocks
  const content = [banner, rootBlock, prefersBlock, lightBlock, darkBlock, '']
    .filter(Boolean)
    .join('\n\n');

  // Write output file
  writeOutputFile(PATHS.outputScss, content, 'CSS variables');

  // Update cache after file is written
  updateFileCache(PATHS.outputScss);

  // Log summary
  logSummary({
    totalTokens: context.definedVars.size,
    referencedTokens: context.referencedVars.size,
    generatedFiles: 1,
    errors: referenceErrors.length,
  });

  return referenceErrors.length === 0;
}

/**
 * Check for and use DTCG 1.0 resolver document for CSS generation.
 *
 * Loads resolver document and resolves tokens for the specified theme context.
 * Returns resolved tokens that can be directly converted to CSS.
 *
 * @param theme - Theme context to resolve ('light' or 'dark')
 * @returns Resolved token group for the specified theme, or null if resolver unavailable
 */
function tryResolverDocumentCSSGeneration(
  theme?: 'light' | 'dark'
): TokenGroup | null {
  const resolverDocPath = path.join(
    PATHS.tokens.replace('designTokens.json', 'resolver.json')
  );

  if (!fs.existsSync(resolverDocPath)) {
    return null; // No resolver document found
  }

  console.log(
    `[tokens] 🔧 Using DTCG 1.0 Resolver Module for ${theme || 'default'} theme...`
  );

  try {
    const resolverDoc = loadResolverDocument(resolverDocPath);
    if (!resolverDoc) {
      console.warn('[tokens] ⚠️  Failed to load resolver document');
      return null;
    }

    const resolver = new Resolver(resolverDoc, {
      basePath: path.dirname(resolverDocPath),
      onWarn: (d) => console.warn(`[resolver] ⚠️  ${d.message}`),
      onError: (d) => console.error(`[resolver] ❌ ${d.message}`),
    });

    // Resolve tokens for specified theme context
    const input: ResolutionInput = {};
    if (theme) input.theme = theme;

    const result = resolver.resolve(input);
    console.log(
      `[tokens] ✅ Resolver CSS generation successful for ${theme || 'default'}`
    );

    return result.tokens as TokenGroup;
  } catch (error) {
    console.error(
      `[tokens] ❌ Resolver CSS generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    console.log('[tokens] 🔄 Falling back to legacy CSS generation...');
    return null;
  }
}

/**
 * Generate global design tokens CSS.
 *
 * Supports both legacy token processing and DTCG 1.0 Resolver Module.
 * When a resolver document is present, uses resolver module output directly.
 * Otherwise, processes tokens through legacy collection and transformation pipeline.
 *
 * @param incremental - Whether to use incremental building (skip if no changes)
 * @returns Success status of CSS generation
 */
export function generateGlobalTokens(incremental = true): boolean {
  console.log('[tokens] Generating global tokens...');

  // Check for incremental build
  if (incremental) {
    if (!hasFileChanged(PATHS.tokens) && fs.existsSync(PATHS.outputScss)) {
      console.log(
        '[tokens] ⚡ Design tokens unchanged, skipping global generation (incremental build)'
      );
      return true;
    }
  }

  // Try resolver document approach first
  const resolverTokens = tryResolverDocumentCSSGeneration();
  if (resolverTokens) {
    // Generate CSS from resolved tokens
    return generateCSSFromTokens(resolverTokens);
  }

  // Fall back to legacy approach
  console.log('[tokens] 🔄 Using legacy CSS generation...');

  // Read source tokens
  const tokens = readTokenFile(PATHS.tokens);
  if (!tokens) {
    console.error('[tokens] Failed to read design tokens');
    return false;
  }

  // Initialize collection context
  const context: CollectionContext = {
    definedVars: new Set(),
    referencedVars: new Set(),
  };

  // Initialize theme maps
  const maps: ThemeMaps = {
    root: {},
    lightColors: {},
    darkColors: {},
    hasDarkOverride: false,
  };

  // Collect all tokens
  collectTokens(tokens, [], context, maps, tokens);

  // Validate references
  const referenceErrors = validateReferences(context);
  if (referenceErrors.length > 0) {
    console.warn('[tokens] Reference validation warnings:');
    referenceErrors.forEach((error) => console.warn(`  - ${error}`));
  }

  // Generate CSS content
  const banner = generateBanner(PATHS.tokens);

  // Merge light colors into root as defaults
  const rootWithDefaults = { ...maps.root, ...maps.lightColors };
  const rootBlock = formatCSSBlock(':root', rootWithDefaults);

  const lightBlock = formatCSSBlock('.light', maps.lightColors);
  const darkBlock = formatCSSBlock('.dark', maps.darkColors);

  // Generate prefers-color-scheme media query
  const prefersBlock = maps.hasDarkOverride
    ? `@media (prefers-color-scheme: dark) {\n${formatCSSBlock('  :root', maps.darkColors)}\n${formatCSSBlock('  .light', maps.lightColors)}\n}`
    : '';

  // Combine all blocks
  const content = [banner, rootBlock, prefersBlock, lightBlock, darkBlock, '']
    .filter(Boolean)
    .join('\n\n');

  // Write output file
  writeOutputFile(PATHS.outputScss, content, 'global design tokens');

  // Update cache after file is written
  updateFileCache(PATHS.outputScss);

  // Log summary
  logSummary({
    totalTokens: context.definedVars.size,
    referencedTokens: context.referencedVars.size,
    generatedFiles: 1,
    errors: referenceErrors.length,
  });

  return referenceErrors.length === 0;
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const success = generateGlobalTokens();
  process.exit(success ? 0 : 1);
}
