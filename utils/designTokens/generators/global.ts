#!/usr/bin/env node
/**
 * Global Token Generator
 *
 * Consolidates both .mjs and .ts implementations into a single,
 * TypeScript-based generator for global design tokens.
 */

import fs from 'fs';
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
          maps.lightColors[cssVar] = processedLightValue;

          // Dark theme value (from extension or default)
          const darkValue = extensions!['design.paths.dark'] || tokenValue;
          const processedDarkValue = processTokenValue(
            darkValue,
            context,
            currentPath.join('.'),
            tokens
          );
          maps.darkColors[cssVar] = processedDarkValue;
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
              maps.lightColors[cssVar] = lightValue;
            }

            // Dark theme value
            if ('dark' in themeObj) {
              const darkValue = processTokenValue(
                themeObj.dark,
                context,
                currentPath.join('.'),
                tokens
              );
              maps.darkColors[cssVar] = darkValue;
            }
          } else {
            // Regular object value (not theme-specific)
            const processedValue = processTokenValue(
              tokenValue,
              context,
              currentPath.join('.'),
              tokens
            );
            maps.root[cssVar] = processedValue;
          }
        } else {
          // Simple value
          const processedValue = processTokenValue(
            tokenValue,
            context,
            currentPath.join('.'),
            tokens
          );

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
    }
  }
}

/**
 * Process token value and handle references
 */
function processTokenValue(
  value: unknown,
  context: CollectionContext,
  tokenPath?: string,
  tokens?: TokenGroup
): string {
  if (typeof value === 'string') {
    // Handle token references like {core.color.blue.500}
    const processedValue = value.replace(/\{([^}]+)\}/g, (match, refTokenPath) => {
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
    });
    return processedValue;
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
 * Generate global design tokens CSS
 */
export function generateGlobalTokens(incremental = true): boolean {
  console.log('[tokens] Generating global tokens...');

  // Check for incremental build
  if (incremental) {
    if (
      !hasFileChanged(PATHS.tokens) &&
      fs.existsSync(PATHS.outputScss)
    ) {
      console.log('[tokens] ⚡ Design tokens unchanged, skipping global generation (incremental build)');
      return true;
    }
  }

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
