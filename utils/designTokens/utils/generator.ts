/**
 * Design Token Generator
 *
 * Functions for generating component-specific CSS variables and token utilities.
 */

import type {
  ComponentTokenConfig,
  ResolverConfig,
  ResolveContext,
} from './types';
import { resolvePath, DEFAULT_REF } from './resolver';
import { builtInTransforms } from './transforms';
import { Logger } from '../../helpers/logger';

/**
 * Component token configuration interface
 */
export interface ComponentTokenConfig {
  prefix: string;
  tokens: Record<string, unknown>;
}

/**
 * Builds CSS variable names with configurable casing and prefixes
 */
function buildName(
  prefix: string,
  path: string[],
  nameCase: 'kebab' | 'camel' | 'pascal',
  cssVarPrefix: string
): string {
  const segments = [prefix, ...path];

  switch (nameCase) {
    case 'camel':
      return segments
        .map((s, i) => (i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)))
        .join('');
    case 'pascal':
      return segments
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join('');
    case 'kebab':
    default:
      return `${cssVarPrefix}${segments.join('-')}`;
  }
}

/**
 * Walks through token objects recursively
 */
function walk(
  obj: Record<string, unknown>,
  path: string[],
  callback: (path: string[], value: unknown, node: unknown) => void
): void {
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = [...path, key];

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      walk(value as Record<string, unknown>, currentPath, callback);
    } else {
      callback(currentPath, value, obj);
    }
  }
}

/**
 * Generates component-specific CSS variables from token configuration.
 *
 * This function takes component token definitions and resolves them to CSS custom properties,
 * applying transformations, theme/platform selection, and reference resolution as configured.
 *
 * @param tokenConfig - Configuration defining the component tokens and naming prefix
 * @param tokens - The global token system to resolve references against
 * @param config - Configuration options for resolution behavior and output format
 * @returns Object mapping CSS variable names to their resolved values
 *
 * @example
 * ```typescript
 * const config = {
 *   prefix: 'btn',
 *   tokens: { color: '{semantic.color.primary}', size: '16px' }
 * };
 *
 * const cssVars = generate(config, designTokens, createDefaultConfig());
 * // Returns: { '--btn-color': 'var(--semantic-color-primary)', '--btn-size': '16px' }
 * ```
 */
export function generate(
  tokenConfig: ComponentTokenConfig,
  tokens: Record<string, unknown>,
  config: ResolverConfig
): Record<string, string> {
  const cssVars: Record<string, string> = {};
  const { prefix } = tokenConfig;

  walk(tokenConfig.tokens, [], (path, raw, node) => {
    const name = buildName(
      prefix,
      path,
      config.nameCase ?? 'kebab',
      config.cssVarPrefix ?? '--'
    );

    const ctx: ResolveContext = {
      path: path.join('.'),
      node,
      tokens,
      config,
      theme: config.theme,
      platform: config.platform,
      brand: config.brand,
    };

    const visited: string[] = [];
    let resolved: unknown;

    if (config.output === 'ref-map') {
      // Emit references instead of computed values
      const refValue =
        typeof raw === 'string' ? String(raw) : `${prefix}.${path.join('.')}`;
      cssVars[name] = refValue;
      return;
    }

    if (config.emitVarsOnly) {
      // Only declare variable names; host CSS/classes should map values
      cssVars[name] = '';
      return;
    }

    if (typeof raw === 'string') {
      resolved = resolveInterpolated(raw, String(raw), ctx, visited);
    } else {
      // For non-string values, apply transforms directly
      resolved = applyTransforms(raw, ctx);
    }

    cssVars[name] = String(resolved);
  });

  return cssVars;
}

/**
 * Creates a default configuration for token resolution with sensible defaults.
 *
 * This provides a baseline configuration that works well for most use cases,
 * with options to override specific behaviors as needed.
 *
 * @param overrides - Partial configuration to merge with defaults
 * @returns Complete resolver configuration with defaults applied
 *
 * @example
 * ```typescript
 * const config = createDefaultConfig({
 *   theme: 'dark',
 *   output: 'css-decl',
 *   cssVarPrefix: '--my-app'
 * });
 * ```
 */
export function createDefaultConfig(
  overrides: Partial<ResolverConfig> = {}
): ResolverConfig {
  return {
    output: 'css-var-map',
    cssVarPrefix: '--',
    nameCase: 'kebab',
    theme: 'light',
    platform: 'web',
    fallbackDelimiter: '||',
    referencePattern: DEFAULT_REF,
    maxDepth: 32,
    resolveToReferences: true, // Default to reference-based resolution
    systemTokenPrefix: '--', // Default system token prefix
    emitVarFallbackChain: true,
    emitVarsOnly: false,
    numberPrecision: 3,
    unitPreferences: {
      dimension: 'px',
      duration: 'ms',
      color: 'hex',
    },
    transforms: builtInTransforms,
    cache: new Map(),
    onWarn: (d) => Logger.warn(`${d.code} @ ${d.path} — ${d.message}`),
    onError: (d) => Logger.error(`${d.code} @ ${d.path} — ${d.message}`),
    strict: false,
    ...overrides,
  };
}

/**
 * Validates that a token path exists in the design system
 *
 * @param tokenPath - The token path to validate
 * @returns boolean indicating if the token exists
 */
export const validateTokenPath = (tokenPath: string): boolean => {
  try {
    const cleanPath = tokenPath.replace(/[{}]/g, '');
    const node = get(designTokens, cleanPath);

    if (node == null) return false;

    // Check if it has a $value or is a primitive value
    return (
      (typeof node === 'object' && '$value' in node) ||
      typeof node === 'string' ||
      typeof node === 'number'
    );
  } catch {
    return false;
  }
};

/**
 * Formats CSS variables as CSS declarations
 */
export function formatAsCSS(
  cssVars: Record<string, string>,
  selector = ':root'
): string {
  const declarations = Object.entries(cssVars)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');

  return `${selector} {\n${declarations}\n}`;
}

/**
 * Gets all available token paths from the design system
 *
 * @param obj - Object to traverse (defaults to design tokens)
 * @param prefix - Current path prefix
 * @returns Array of all available token paths
 */
export const getAvailableTokenPaths = (
  obj: Record<string, unknown> = designTokens,
  prefix = ''
): string[] => {
  const paths: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const currentPath = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      if ('$value' in value) {
        // This is a token with a value
        paths.push(currentPath);
      } else {
        // This is a nested object, recurse
        paths.push(
          ...getAvailableTokenPaths(
            value as Record<string, unknown>,
            currentPath
          )
        );
      }
    } else if (typeof value === 'string' || typeof value === 'number') {
      // This is a direct value
      paths.push(currentPath);
    }
  }

  return paths;
};

// Import design tokens at the module level
import designTokens from '../../../ui/designTokens/designTokens.json';
import { Logger } from '../../helpers/logger';
import { DEFAULT_REF } from './resolver';

// Helper function to get nested object values by dot path
function get(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current, segment) => {
    if (current && typeof current === 'object' && segment in current) {
      return (current as Record<string, unknown>)[segment];
    }
    return undefined;
  }, obj as unknown);
}

// Helper function to apply transforms
function applyTransforms(value: unknown, ctx: ResolveContext): unknown {
  const transforms = ctx.config.transforms ?? [];
  let result = value;

  for (const transform of transforms) {
    if (transform.match(ctx)) {
      result = transform.apply(result, ctx);
    }
  }

  return result;
}

// Helper function to resolve interpolated strings with embedded references and fallbacks
function resolveInterpolated(
  input: string,
  fallback: string,
  ctx: ResolveContext,
  visited: string[]
): string {
  const parts = input
    .split(ctx.config.fallbackDelimiter ?? '||')
    .map((s) => s.trim());

  // If reference mode with fallback chain enabled, always build fallback chains
  // regardless of whether tokens exist or not
  if (
    ctx.config.resolveToReferences !== false &&
    (ctx.config.emitVarFallbackChain ?? true) &&
    parts.length > 1
  ) {
    const pattern = ctx.config.referencePattern ?? DEFAULT_REF;
    const systemPrefix = ctx.config.systemTokenPrefix ?? '--';

    // Process each part to handle interpolation within it
    const processedParts = parts.map((part) => {
      // If the part contains references, replace them with var() calls
      if (pattern.test(part)) {
        return part.replace(pattern, (_, path) => {
          return `var(${tokenPathToCSSVar(path, systemPrefix)})`;
        });
      }
      return part;
    });

    // For interpolated strings, build nested fallbacks manually
    let result = processedParts[processedParts.length - 1];
    for (let i = processedParts.length - 2; i >= 0; i--) {
      const current = processedParts[i];
      // Check if current part has var() calls that need fallbacks
      if (current.includes('var(--')) {
        // Replace each var() with a fallback version
        result = current.replace(/var\((--[^)]+)\)/g, (match, varName) => {
          return `var(${varName}, ${result})`;
        });
      } else {
        result = current;
      }
    }
    return result;
  }

  // Fallback to original logic for non-reference mode or when fallback chains are disabled
  for (const candidate of parts) {
    try {
      const resolved = candidate.replace(
        ctx.config.referencePattern ?? DEFAULT_REF,
        (_, path) => {
          const v = resolvePath(path, ctx, visited);
          if (v == null) throw new Error(`Unresolved ${path}`);
          return String(v);
        }
      );
      // If no unresolved references remain, return the resolved value
      if (!resolved.match(ctx.config.referencePattern ?? DEFAULT_REF)) {
        return resolved;
      }
    } catch {
      // Continue to next fallback candidate
      continue;
    }
  }

  // All candidates failed → use provided fallback literal
  ctx.config.onWarn?.({
    code: 'UNRESOLVED_FALLBACK',
    path: ctx.path,
    message: `Could not resolve any fallback for: ${input}`,
    hint: 'Check that all referenced tokens exist and are accessible',
  });
  return fallback;
}

/**
 * Converts a token path to a CSS custom property name
 */
function tokenPathToCSSVar(path: string, prefix: string = '--'): string {
  return `${prefix}${path.replace(/\./g, '-')}`;
}
