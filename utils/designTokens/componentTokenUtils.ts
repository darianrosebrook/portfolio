/**
 * Design Token Resolution Utilities
 *
 * Provides utilities for resolving design tokens from component token files
 * to actual CSS values, with support for recursive token references and fallbacks.
 */

import designTokens from '../../ui/designTokens/designTokens.json';
import { Logger } from '../helpers/logger';
import {
  parseCssColorToRgb,
  formatHsl,
  formatOklch,
} from '../helpers/colorFormat';
import { rgbToHex, rgbToHsl, rgbToOklch } from '../helpers/colorHelpers';

/**
 * Output Format
 *
 * The output format to use for the design tokens.
 */
export type OutputFormat =
  | 'css-var-map' // { --btn-bg: "...", --btn-fg: "..." }
  | 'css-decl' // string of ":root{...}" or selector-scoped
  | 'js-literals' // { btnBg: "#fff", ... }
  | 'react-native' // { color: "rgba(...)", shadowOffset: {...} }
  | 'android'
  | 'ios'
  | 'ref-map';

export interface ResolverConfig {
  // reference syntax & parsing
  referencePattern?: RegExp; // default: /\{([^}]+)\}/g (supports interpolation)
  fallbackDelimiter?: string; // default: '||'
  maxDepth?: number; // default: 32

  // theming/brands/platforms
  theme?: string; // 'light' | 'dark' | 'hc' | 'brandX'
  platform?: 'web' | 'ios' | 'android' | 'rn';
  brand?: string;

  // naming & output
  output?: OutputFormat;
  cssVarPrefix?: string; // e.g., '--qx'
  nameCase?: 'kebab' | 'camel' | 'pascal';
  includeMeta?: boolean; // include $type/$description in diagnostics

  // resolution behavior
  resolveToReferences?: boolean; // default: true - output CSS var references instead of resolved values
  systemTokenPrefix?: string; // default: '--' - prefix for system-level tokens
  emitVarFallbackChain?: boolean; // default: true - preserve A || B || literal as nested var() fallbacks
  emitVarsOnly?: boolean; // default: false - emit only var names with empty values (for class-driven mapping)
  referenceNamespace?: (path: string) => string; // custom function to transform token paths to CSS var names
  scopeSelector?: string; // CSS selector for scoped output (e.g., '.theme-dark')

  // transforms pipeline: by $type or by path matchers
  transforms?: Transform[];

  // error handling & diagnostics
  onWarn?: (d: Diagnostic) => void;
  onError?: (d: Diagnostic) => void;
  strict?: boolean; // throw on unresolved / circular

  // numeric formatting
  numberPrecision?: number; // e.g., 3 (for LCH/OKLCH etc.)
  unitPreferences?: {
    dimension?: 'px' | 'rem';
    duration?: 'ms' | 's';
    color?: 'hex' | 'rgb' | 'hsl' | 'oklch';
  };

  // caching
  cache?: Map<string, string>;
}

export interface Transform {
  match: (ctx: ResolveContext) => boolean; // by $type or path
  apply: (value: unknown, ctx: ResolveContext) => unknown;
}

export interface ResolveContext {
  path: string; // 'semantic.color.bg.primary'
  node: unknown; // token node (may have $type, $value)
  tokens: Record<string, unknown>;
  config: ResolverConfig;
  theme?: string;
  platform?: string;
  brand?: string;
  type?: string; // $type from token node
}

export interface Diagnostic {
  code:
    | 'CIRCULAR'
    | 'MISSING'
    | 'TYPE_MISMATCH'
    | 'UNRESOLVED_FALLBACK'
    | 'DEPTH_EXCEEDED';
  path: string;
  message: string;
  hint?: string;
}

export class Diagnostics {
  list: Diagnostic[] = [];

  warn(d: Diagnostic) {
    this.list.push(d);
  }

  error(d: Diagnostic) {
    this.list.push(d);
  }

  hasErrors(): boolean {
    return this.list.some(
      (d) =>
        d.code === 'MISSING' ||
        d.code === 'TYPE_MISMATCH' ||
        d.code === 'DEPTH_EXCEEDED'
    );
  }

  clear() {
    this.list = [];
  }
}

// Helper function to get nested object values by dot path
function get(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current, segment) => {
    if (current && typeof current === 'object' && segment in current) {
      return (current as Record<string, unknown>)[segment];
    }
    return undefined;
  }, obj as unknown);
}

// Helper function to select values by theme/brand/platform keys
function selectByKeys(
  obj: Record<string, unknown>,
  keys: (string | undefined)[]
): unknown {
  for (const key of keys) {
    if (key && key in obj) {
      return obj[key];
    }
  }
  return undefined;
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

// Default reference pattern for interpolation
const DEFAULT_REF = /\{([^}]+)\}/g;

/**
 * Converts a token path to a CSS custom property name
 */
function tokenPathToCSSVar(path: string, prefix: string = '--'): string {
  return `${prefix}${path.replace(/\./g, '-')}`;
}

// (removed unused isSingleReference helper)

// (removed unused buildVarFallbackChain helper; fallback chains are constructed inline in resolveInterpolated)

/**
 * Resolves interpolated strings with embedded references and fallbacks
 */
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
 * Enhanced path resolution with theme/mode/platform support and aliases
 */
function resolvePath(
  path: string,
  ctx: ResolveContext,
  visited: string[]
): unknown {
  const key = `@${ctx.theme}|${ctx.platform}|${ctx.brand}|${path}`;
  const cache = ctx.config.cache;
  if (cache?.has(key)) return cache.get(key)!;

  if (visited.includes(path)) {
    ctx.config.onWarn?.({
      code: 'CIRCULAR',
      path,
      message: 'Circular reference detected',
      hint: 'Check for circular dependencies in token definitions',
    });
    return null;
  }

  if (visited.length >= (ctx.config.maxDepth ?? 32)) {
    ctx.config.onError?.({
      code: 'DEPTH_EXCEEDED',
      path,
      message: `Maximum resolution depth exceeded (${ctx.config.maxDepth ?? 32})`,
      hint: 'Check for deeply nested or infinite token references',
    });
    return null;
  }

  visited.push(path);

  const node = get(ctx.tokens, path);
  if (node == null) {
    // In reference mode, emit a CSS var reference rather than failing. This
    // allows late-bound BYODS overrides without flooding warnings.
    if (ctx.config.resolveToReferences !== false) {
      const systemPrefix = ctx.config.systemTokenPrefix ?? '--';
      const cssVarName = ctx.config.referenceNamespace
        ? ctx.config.referenceNamespace(path)
        : tokenPathToCSSVar(path, systemPrefix);
      visited.pop();
      return `var(${cssVarName})`;
    }

    ctx.config.onWarn?.({
      code: 'MISSING',
      path,
      message: 'Token path not found',
      hint: 'Verify the token path exists in your design tokens',
    });
    visited.pop();
    return null;
  }

  // Prefer W3C structure
  const valueNode =
    typeof node === 'object' &&
    node &&
    '$value' in (node as Record<string, unknown>)
      ? (node as Record<string, unknown>).$value
      : node;

  // Theme/platform/brand selection
  let raw = valueNode;
  if (raw && typeof raw === 'object') {
    const themed = selectByKeys(raw as Record<string, unknown>, [
      ctx.brand,
      ctx.theme,
      ctx.platform,
    ]);
    raw = themed ?? raw;
  }

  // $extensions-based overrides (e.g., design.paths.dark -> "{core.color.light}")
  if (typeof node === 'object' && node) {
    const ext = (node as Record<string, unknown>)['$extensions'];
    if (ext && typeof ext === 'object') {
      const extObj = ext as Record<string, unknown>;
      const theme = ctx.theme;
      const extensionKeys = theme
        ? [
            `design.paths.${theme}`,
            `design.tokens.modes.${theme}`,
            `modes.${theme}`,
            `theme.${theme}`,
          ]
        : [];
      for (const k of extensionKeys) {
        if (k in extObj) {
          const extVal = extObj[k];
          if (typeof extVal === 'string') {
            // Allow extVal to be a reference string
            raw = extVal;
          }
          break;
        }
      }
    }
  }

  let out = raw;

  // Alias support: $alias: "semantic.color.bg.primary"
  if (
    typeof node === 'object' &&
    node &&
    '$alias' in (node as Record<string, unknown>)
  ) {
    out = resolvePath(
      (node as Record<string, unknown>).$alias as string,
      ctx,
      visited
    );
  }

  // String with embedded references
  if (
    typeof out === 'string' &&
    (ctx.config.referencePattern ?? DEFAULT_REF).test(out)
  ) {
    out = resolveInterpolated(out, String(out), ctx, visited);
  }

  // Apply transforms by $type or path
  const $type =
    typeof node === 'object' && node
      ? ((node as Record<string, unknown>).$type as string)
      : undefined;

  let next = applyTransforms(out, { ...ctx, node, path, type: $type });

  // If resolveToReferences is true, return CSS custom property reference instead of resolved value
  if (ctx.config.resolveToReferences !== false) {
    const systemPrefix = ctx.config.systemTokenPrefix ?? '--';
    const cssVarName = ctx.config.referenceNamespace
      ? ctx.config.referenceNamespace(path)
      : tokenPathToCSSVar(path, systemPrefix);
    next = `var(${cssVarName})`;
  }

  cache?.set(key, String(next));
  visited.pop();
  return next;
}

/**
 * Recursively resolves a design token reference to its final value
 * @deprecated Use the new configurable resolver with resolvePath instead
 */
export const resolveToken = (
  tokenPath: string,
  fallback: string,
  visited = new Set<string>()
): string => {
  try {
    // Prevent infinite recursion
    if (visited.has(tokenPath)) {
      Logger.warn(
        `Circular reference detected: ${tokenPath}, using fallback: ${fallback}`
      );
      return fallback;
    }
    visited.add(tokenPath);

    // Remove curly braces if present
    const cleanPath = tokenPath.replace(/[{}]/g, '');
    const pathSegments = cleanPath.split('.');

    // Navigate through the design tokens object
    let current: Record<string, unknown> = designTokens;
    for (const segment of pathSegments) {
      if (current && typeof current === 'object' && segment in current) {
        current = current[segment] as Record<string, unknown>;
      } else {
        Logger.warn(
          `Token path not found: ${tokenPath}, using fallback: ${fallback}`
        );
        return fallback;
      }
    }

    // Get the value
    let value: unknown;
    if (current && typeof current === 'object' && '$value' in current) {
      value = current.$value;
    } else if (typeof current === 'string' || typeof current === 'number') {
      value = current;
    } else {
      Logger.warn(
        `Token value not found: ${tokenPath}, using fallback: ${fallback}`
      );
      return fallback;
    }

    // If the value is a string that looks like a token reference, resolve it recursively
    if (typeof value === 'string' && value.match(/^\{[^}]+\}$/)) {
      return resolveToken(value, fallback, visited);
    }

    return String(value);
  } catch (error) {
    Logger.error(
      `Error resolving token: ${tokenPath}, using fallback: ${fallback}`,
      error
    );
    return fallback;
  }
};

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
 * Enhanced token generation with configurable resolution
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
 * Built-in transforms for common token types
 */
export const builtInTransforms: Transform[] = [
  // Dimension transform: numbers to CSS units
  {
    match: ({ type }) => type === 'dimension',
    apply: (value, ctx) => {
      if (typeof value === 'number') {
        const unit = ctx.config.unitPreferences?.dimension ?? 'px';
        return `${value}${unit}`;
      }
      return value;
    },
  },

  // Duration transform: numbers to time units
  {
    match: ({ type }) => type === 'duration',
    apply: (value, ctx) => {
      if (typeof value === 'number') {
        const unit = ctx.config.unitPreferences?.duration ?? 'ms';
        return unit === 's' ? `${value / 1000}s` : `${value}ms`;
      }
      return value;
    },
  },

  // Color transform: normalize color formats
  {
    match: ({ type }) => type === 'color',
    apply: (value, ctx) => {
      if (typeof value !== 'string') return value;
      const target = ctx.config.unitPreferences?.color ?? 'hex';
      const rgb = parseCssColorToRgb(value);
      if (!rgb) return value; // leave unknown formats intact
      switch (target) {
        case 'rgb':
          return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        case 'hsl': {
          const hsl = rgbToHsl(rgb);
          return formatHsl(hsl);
        }
        case 'oklch': {
          const oklch = rgbToOklch(rgb);
          return formatOklch(oklch.L, oklch.c, oklch.h);
        }
        case 'hex':
        default:
          return rgbToHex(rgb);
      }
    },
  },

  // Border transform: add default border style
  {
    match: ({ path }) => path.endsWith('.border'),
    apply: (value) => {
      if (typeof value === 'string' && !value.includes(' ')) {
        return `1px solid ${value}`;
      }
      return value;
    },
  },

  // Typography transform: convert typography objects to CSS
  {
    match: ({ type }) => type === 'typography',
    apply: (value) => {
      if (typeof value === 'object' && value !== null) {
        const typo = value as Record<string, unknown>;
        const parts: string[] = [];

        if (typo.fontFamily) parts.push(`font-family: ${typo.fontFamily}`);
        if (typo.fontSize) parts.push(`font-size: ${typo.fontSize}`);
        if (typo.fontWeight) parts.push(`font-weight: ${typo.fontWeight}`);
        if (typo.lineHeight) parts.push(`line-height: ${typo.lineHeight}`);
        if (typo.letterSpacing)
          parts.push(`letter-spacing: ${typo.letterSpacing}`);

        return parts.join('; ');
      }
      return value;
    },
  },
];

/**
 * Creates a default resolver configuration
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
