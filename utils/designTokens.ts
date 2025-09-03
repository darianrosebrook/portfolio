/**
 * Design Token System Utilities
 *
 * Provides a flexible system for loading and applying design tokens
 * with support for bring-your-own-design-system (BYODS) patterns.
 */

import { CSSProperties } from 'react';

/**
 * Core token value types
 */
export type TokenValue = string | number;

/**
 * Token definition with metadata
 */
export interface TokenDefinition {
  $value: TokenValue;
  $type?:
    | 'color'
    | 'dimension'
    | 'number'
    | 'string'
    | 'shadow'
    | 'composition';
  $description?: string;
  $extensions?: Record<string, unknown>;
}

/**
 * Nested token structure
 */
export type TokenGroup = {
  [key: string]: TokenDefinition | TokenGroup;
};

/**
 * Component token configuration
 */
export interface ComponentTokenConfig {
  prefix: string;
  tokens: TokenGroup;
  fallbacks?: Record<string, TokenValue>;
}

/**
 * Token source types
 */
export type TokenSource =
  | { type: 'json'; data: ComponentTokenConfig }
  | { type: 'css'; variables: Record<string, string> }
  | { type: 'inline'; tokens: Record<string, TokenValue> };

/**
 * Resolved token map
 */
export type ResolvedTokens = Record<string, TokenValue>;

/**
 * Token resolution options
 */
export interface TokenResolutionOptions {
  /** Global design tokens for reference resolution */
  globalTokens?: TokenGroup;
  /** Fallback values when tokens are missing */
  fallbacks?: Record<string, TokenValue>;
  /** CSS variable prefix for output */
  cssPrefix?: string;
}

/**
 * Resolves token references (e.g., "{color.primary}" -> actual value)
 */
export function resolveTokenReference(
  value: string,
  tokens: TokenGroup,
  visited = new Set<string>()
): TokenValue {
  // Handle circular references
  if (visited.has(value)) {
    console.warn(`Circular reference detected: ${value}`);
    return value;
  }

  // Check if it's a reference pattern
  const referenceMatch = value.match(/^\{([^}]+)\}$/);
  if (!referenceMatch) {
    return value;
  }

  const path = referenceMatch[1];
  visited.add(value);

  // Navigate the token path
  const pathParts = path.split('.');
  let current: unknown = tokens;

  for (const part of pathParts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      console.warn(`Token reference not found: ${path}`);
      return value;
    }
  }

  // If we found a token definition, get its value
  if (current && typeof current === 'object' && '$value' in current) {
    const tokenValue = current.$value;
    // Recursively resolve if the value is also a reference
    if (typeof tokenValue === 'string' && tokenValue.match(/^\{[^}]+\}$/)) {
      return resolveTokenReference(tokenValue, tokens, visited);
    }
    return tokenValue;
  }

  // If it's a direct value
  if (typeof current === 'string' || typeof current === 'number') {
    return current;
  }

  console.warn(`Invalid token reference: ${path}`);
  return value;
}

/**
 * Flattens nested token structure into a flat key-value map
 */
export function flattenTokens(
  tokens: TokenGroup,
  prefix = '',
  globalTokens?: TokenGroup
): ResolvedTokens {
  const result: ResolvedTokens = {};

  for (const [key, value] of Object.entries(tokens)) {
    const fullKey = prefix ? `${prefix}-${key}` : key;

    if (value && typeof value === 'object') {
      if ('$value' in value) {
        // It's a token definition
        let resolvedValue = value.$value;

        // Resolve references if it's a string reference
        if (
          typeof resolvedValue === 'string' &&
          resolvedValue.match(/^\{[^}]+\}$/)
        ) {
          resolvedValue = resolveTokenReference(
            resolvedValue,
            globalTokens || tokens
          );
        }

        result[fullKey] = resolvedValue;
      } else {
        // It's a nested group, recurse
        Object.assign(
          result,
          flattenTokens(value as TokenGroup, fullKey, globalTokens)
        );
      }
    }
  }

  return result;
}

/**
 * Converts tokens to CSS custom properties
 */
export function tokensToCSSProperties(
  tokens: ResolvedTokens,
  prefix = ''
): CSSProperties {
  const cssProps: CSSProperties = {};

  for (const [key, value] of Object.entries(tokens)) {
    const cssVarName = `--${prefix ? `${prefix}-` : ''}${key}`;
    cssProps[cssVarName as keyof CSSProperties] = String(value);
  }

  return cssProps;
}

/**
 * Merges multiple token sources with precedence
 * Later sources override earlier ones
 */
export function mergeTokenSources(
  sources: TokenSource[],
  options: TokenResolutionOptions = {}
): ResolvedTokens {
  let mergedTokens: ResolvedTokens = {};

  for (const source of sources) {
    let sourceTokens: ResolvedTokens = {};

    switch (source.type) {
      case 'json':
        sourceTokens = flattenTokens(
          source.data.tokens,
          source.data.prefix,
          options.globalTokens
        );
        break;

      case 'css':
        sourceTokens = source.variables;
        break;

      case 'inline':
        sourceTokens = source.tokens;
        break;
    }

    // Merge with existing tokens (later sources win)
    mergedTokens = { ...mergedTokens, ...sourceTokens };
  }

  // Apply fallbacks for missing tokens
  if (options.fallbacks) {
    for (const [key, fallback] of Object.entries(options.fallbacks)) {
      if (!(key in mergedTokens)) {
        mergedTokens[key] = fallback;
      }
    }
  }

  return mergedTokens;
}

/**
 * Creates a token hook for React components
 */
export function createTokenHook<T extends Record<string, TokenValue>>(
  defaultTokens: T,
  componentName: string
) {
  return function useTokens(
    overrides?: Partial<T>,
    sources?: TokenSource[]
  ): { tokens: T; cssProperties: CSSProperties } {
    // Start with default tokens
    let resolvedTokens = { ...defaultTokens };

    // Apply token sources if provided
    if (sources && sources.length > 0) {
      const mergedFromSources = mergeTokenSources(sources, {
        fallbacks: defaultTokens,
        cssPrefix: componentName,
      });

      // Override defaults with source tokens
      resolvedTokens = { ...resolvedTokens, ...mergedFromSources } as T;
    }

    // Apply direct overrides
    if (overrides) {
      resolvedTokens = { ...resolvedTokens, ...overrides };
    }

    // Generate CSS properties
    const cssProperties = tokensToCSSProperties(resolvedTokens, componentName);

    return {
      tokens: resolvedTokens,
      cssProperties,
    };
  };
}

/**
 * Utility to load tokens from a JSON file (for build-time usage)
 */
export async function loadTokensFromJSON(
  path: string
): Promise<ComponentTokenConfig> {
  try {
    const moduleImport = await import(path);
    return moduleImport.default || moduleImport;
  } catch (error) {
    console.warn(`Failed to load tokens from ${path}:`, error);
    throw error;
  }
}

/**
 * Safe defaults and fail-fast guards for token values
 */
export function safeTokenValue(
  value: TokenValue | undefined,
  fallback: TokenValue,
  validator?: (val: TokenValue) => boolean
): TokenValue {
  // Early return for undefined/null
  if (value === undefined || value === null) {
    return fallback;
  }

  // Apply validator if provided
  if (validator && !validator(value)) {
    console.warn(
      `Token value failed validation: ${value}, using fallback: ${fallback}`
    );
    return fallback;
  }

  return value;
}

/**
 * Validates CSS dimension values
 */
export function isValidDimension(value: TokenValue): boolean {
  if (typeof value === 'number') return true;
  if (typeof value !== 'string') return false;

  // Check for valid CSS units
  return /^-?\d*\.?\d+(px|em|rem|%|vh|vw|vmin|vmax|ch|ex|cm|mm|in|pt|pc)$/.test(
    value
  );
}

/**
 * Validates CSS color values
 */
export function isValidColor(value: TokenValue): boolean {
  if (typeof value !== 'string') return false;

  // Basic color validation (hex, rgb, hsl, named colors, etc.)
  return /^(#[0-9a-fA-F]{3,8}|rgb\(|rgba\(|hsl\(|hsla\(|[a-zA-Z]+|transparent)/.test(
    value
  );
}
