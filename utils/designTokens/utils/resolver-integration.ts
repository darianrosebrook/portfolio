/**
 * Integration layer between legacy resolver and new Resolver Module
 *
 * This provides backward compatibility while allowing migration to the
 * DTCG 1.0 Resolver Module specification.
 */

import path from 'path';
import {
  Resolver,
  loadResolverDocument,
  type ResolutionInput,
} from './resolver-module';
import type { ResolverConfig } from './types';

/**
 * Check if a resolver document exists and use it, otherwise fall back to legacy resolution
 */
export function resolveWithResolverModule(
  tokens: Record<string, unknown>,
  config: ResolverConfig,
  resolverDocPath?: string
): Record<string, unknown> {
  // Try to load resolver document if path provided
  if (resolverDocPath) {
    const doc = loadResolverDocument(resolverDocPath);
    if (doc) {
      const resolver = new Resolver(doc, {
        basePath: path.dirname(resolverDocPath),
        onWarn: config.onWarn,
        onError: config.onError,
        strict: config.strict,
      });

      // Build input from config
      const input: ResolutionInput = {};
      if (config.theme) input.theme = config.theme;
      if (config.brand) input.brand = config.brand;
      if (config.platform) input.platform = config.platform;

      const result = resolver.resolve(input);
      return result.tokens;
    }
  }

  // Fall back to legacy resolution
  return tokens;
}

/**
 * Create a resolver instance from a document path
 */
export function createResolver(
  resolverDocPath: string,
  options?: Partial<ResolverConfig>
): Resolver | null {
  const doc = loadResolverDocument(resolverDocPath);
  if (!doc) return null;

  return new Resolver(doc, {
    basePath: path.dirname(resolverDocPath),
    onWarn: options?.onWarn,
    onError: options?.onError,
    strict: options?.strict,
  });
}

/**
 * Helper to get nested value by dot path
 */
export function getNestedValue(
  obj: Record<string, unknown>,
  path: string
): unknown {
  return path.split('.').reduce((current, segment) => {
    if (current && typeof current === 'object' && segment in current) {
      return (current as Record<string, unknown>)[segment];
    }
    return undefined;
  }, obj as unknown);
}

/**
 * Extract $value from token node or return the value itself
 */
export function extractValue(node: unknown): unknown {
  if (
    typeof node === 'object' &&
    node !== null &&
    '$value' in (node as Record<string, unknown>)
  ) {
    return (node as Record<string, unknown>).$value;
  }
  return node;
}
