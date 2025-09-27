/**
 * Design Token Resolution Types
 *
 * Core type definitions for token resolution, transformation, and diagnostics.
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
