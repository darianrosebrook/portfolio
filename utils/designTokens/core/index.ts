/**
 * Design Tokens Core API
 *
 * Consolidated utility functions for reading, processing, and generating
 * design tokens across all output formats.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Common types and interfaces
export interface TokenValue {
  $value: unknown;
  $type?: string;
  $description?: string;
  $extensions?: Record<string, unknown>;
}

export interface TokenGroup {
  [key: string]: TokenValue | TokenGroup;
}

export interface GenerationOptions {
  inputPath: string;
  outputPath: string;
  format: 'scss' | 'css' | 'js' | 'ts' | 'json';
  theme?: 'light' | 'dark' | 'auto';
  prefix?: string;
  banner?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    type: string;
    path: string;
    message: string;
    data?: unknown;
  }>;
  warnings: Array<{
    type: string;
    path: string;
    message: string;
    data?: unknown;
  }>;
}

// Get project paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

export const PATHS = {
  tokens: path.join(PROJECT_ROOT, 'ui', 'designTokens', 'designTokens.json'),
  coreTokens: path.join(PROJECT_ROOT, 'ui', 'designTokens', 'core.tokens.json'),
  semanticTokens: path.join(
    PROJECT_ROOT,
    'ui',
    'designTokens',
    'semantic.tokens.json'
  ),
  outputScss: path.join(PROJECT_ROOT, 'app', 'designTokens.scss'),
  outputTypes: path.join(PROJECT_ROOT, 'types', 'designTokens.ts'),
  componentDir: path.join(PROJECT_ROOT, 'ui', 'components'),
} as const;

/**
 * Safe JSON file reader with error handling
 */
export function readTokenFile(filePath: string): TokenGroup | null {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(
        `[tokens] File not found: ${path.relative(PROJECT_ROOT, filePath)}`
      );
      return null;
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);

    console.log(`[tokens] Loaded: ${path.relative(PROJECT_ROOT, filePath)}`);
    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error(
        `[tokens] JSON parse error in ${path.relative(PROJECT_ROOT, filePath)}:`
      );
      console.error(`  ${error.message}`);
    } else {
      console.error(
        `[tokens] Error reading ${path.relative(PROJECT_ROOT, filePath)}:`,
        error
      );
    }
    return null;
  }
}

/**
 * Write file with directory creation and error handling
 */
export function writeOutputFile(
  filePath: string,
  content: string,
  description?: string
): void {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });

    // Write file
    fs.writeFileSync(filePath, content, 'utf8');

    const relativePath = path.relative(PROJECT_ROOT, filePath);
    const desc = description ? ` (${description})` : '';
    console.log(`[tokens] Generated: ${relativePath}${desc}`);
  } catch (error) {
    console.error(
      `[tokens] Failed to write ${path.relative(PROJECT_ROOT, filePath)}:`,
      error
    );
    throw error;
  }
}

/**
 * Convert token path to CSS custom property name
 */
export function tokenPathToCSSVar(tokenPath: string, prefix = '--'): string {
  return (
    prefix +
    tokenPath
      .replace(/\./g, '-') // Convert dots to hyphens first
      .replace(/[A-Z]/g, (m) => '-' + m.toLowerCase()) // Convert camelCase
      .replace(/[\s_]/g, '-') // Convert spaces and underscores
      .replace(/[^a-z0-9-]/g, '') // Remove any remaining invalid characters
      .replace(/-+/g, '-') // Collapse multiple hyphens into one
  );
}

/**
 * Extract all token paths from a token tree
 */
export function extractTokenPaths(obj: TokenGroup, prefix = ''): string[] {
  const paths: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$')) continue; // Skip metadata

    const currentPath = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object') {
      if ('$value' in value) {
        // This is a token
        paths.push(currentPath);
      } else {
        // This is a group, recurse
        paths.push(...extractTokenPaths(value as TokenGroup, currentPath));
      }
    }
  }

  return paths;
}

/**
 * Deep merge two objects
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T {
  if (!source) return target;

  const result = { ...target };

  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (
        key in result &&
        typeof result[key] === 'object' &&
        !Array.isArray(result[key])
      ) {
        (result as any)[key] = deepMerge(
          result[key] as Record<string, any>,
          value as Record<string, any>
        );
      } else {
        (result as any)[key] = value;
      }
    } else {
      (result as any)[key] = value;
    }
  }

  return result;
}

/**
 * Format CSS block with proper indentation
 */
export function formatCSSBlock(
  selector: string,
  properties: Record<string, string>
): string {
  const lines = Object.entries(properties)
    .map(([prop, value]) => `  ${prop}: ${value};`)
    .join('\n');

  return `${selector} {\n${lines}\n}`;
}

/**
 * Generate standard banner comment
 */
export function generateBanner(sourcePath?: string): string {
  const source = sourcePath
    ? `\n * Source: ${path.relative(PROJECT_ROOT, sourcePath)}`
    : '';
  return `/* AUTO-GENERATED: Do not edit directly.${source}\n */`;
}

/**
 * Log generation summary
 */
export function logSummary(stats: {
  totalTokens?: number;
  referencedTokens?: number;
  generatedFiles?: number;
  errors?: number;
}): void {
  const { totalTokens, referencedTokens, generatedFiles, errors } = stats;

  console.log('\n[tokens] Generation Summary:');
  if (totalTokens !== undefined) {
    console.log(`  - Total tokens: ${totalTokens}`);
  }
  if (referencedTokens !== undefined) {
    console.log(`  - Referenced tokens: ${referencedTokens}`);
  }
  if (generatedFiles !== undefined) {
    console.log(`  - Generated files: ${generatedFiles}`);
  }
  if (errors !== undefined && errors > 0) {
    console.log(`  - Errors: ${errors}`);
  }
}
