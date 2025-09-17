#!/usr/bin/env node
/**
 * Global Token Generator
 *
 * Consolidates both .mjs and .ts implementations into a single,
 * TypeScript-based generator for global design tokens.
 */

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
  maps: ThemeMaps
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

        // Handle theme-specific values
        if (typeof tokenValue === 'object' && tokenValue !== null) {
          const themeObj = tokenValue as Record<string, unknown>;

          if ('light' in themeObj || 'dark' in themeObj) {
            maps.hasDarkOverride = true;

            // Light theme value
            if ('light' in themeObj) {
              const lightValue = processTokenValue(themeObj.light, context);
              maps.lightColors[cssVar] = lightValue;
            }

            // Dark theme value
            if ('dark' in themeObj) {
              const darkValue = processTokenValue(themeObj.dark, context);
              maps.darkColors[cssVar] = darkValue;
            }
          } else {
            // Regular object value (not theme-specific)
            const processedValue = processTokenValue(tokenValue, context);
            maps.root[cssVar] = processedValue;
          }
        } else {
          // Simple value
          const processedValue = processTokenValue(tokenValue, context);

          // Determine where to place based on token type or path
          if (
            tokenType === 'color' ||
            currentPath.some((p) => p.includes('color'))
          ) {
            maps.lightColors[cssVar] = processedValue;
            if (!maps.darkColors[cssVar]) {
              maps.darkColors[cssVar] = processedValue; // Fallback to same value
            }
          } else {
            maps.root[cssVar] = processedValue;
          }
        }
      } else {
        // This is a group, recurse
        collectTokens(value as TokenGroup, currentPath, context, maps);
      }
    }
  }
}

/**
 * Process token value and handle references
 */
function processTokenValue(value: unknown, context: CollectionContext): string {
  if (typeof value === 'string') {
    // Handle token references like {core.color.blue.500}
    const processedValue = value.replace(/\{([^}]+)\}/g, (match, tokenPath) => {
      const cssVar = tokenPathToCSSVar(tokenPath);
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
export function generateGlobalTokens(): boolean {
  console.log('[tokens] Generating global tokens...');

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
  collectTokens(tokens, [], context, maps);

  // Validate references
  const referenceErrors = validateReferences(context);
  if (referenceErrors.length > 0) {
    console.warn('[tokens] Reference validation warnings:');
    referenceErrors.forEach((error) => console.warn(`  - ${error}`));
  }

  // Generate CSS content
  const banner = generateBanner(PATHS.tokens);
  const rootBlock = formatCSSBlock(':root', maps.root);
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
