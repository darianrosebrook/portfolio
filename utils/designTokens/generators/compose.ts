#!/usr/bin/env node
/**
 * Token Composition Generator
 *
 * Merges core and semantic token files into a single composed file
 * with proper reference handling and validation.
 * Supports both monolithic and modular token structures.
 */

import fs from 'fs';
import path from 'path';
import {
  PATHS,
  PROJECT_ROOT,
  readTokenFile,
  writeOutputFile,
  deepMerge,
  // generateBanner,
  logSummary,
  type TokenGroup,
} from '../core/index';
import {
  getChangedFiles,
  updateFileCache,
  getTokenFilesToCheck,
} from '../core/cache';
import {
  findDeprecatedTokens,
  validateDeprecations,
  formatDeprecationWarning,
} from '../deprecation/index';
import {
  Resolver,
  loadResolverDocument,
  // type ResolutionInput,
} from '../utils/resolver-module';

/**
 * Transform token references in an object to use prefixed paths.
 *
 * Recursively walks through token objects and updates all token references
 * (e.g., "{color.primary}") to use the appropriate namespace prefix
 * (e.g., "{core.color.primary}" or "{semantic.color.primary}").
 *
 * @param obj - Object containing token references to transform
 * @param prefixer - Function that adds namespace prefix to token paths
 * @returns Object with transformed token references
 */
function transformReferences(
  obj: unknown,
  prefixer: (path: string) => string
): unknown {
  if (obj == null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj))
    return obj.map((v) => transformReferences(v, prefixer));

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Transform token references like {token.path.here}
      result[key] = value.replace(
        /\{([A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)+)\}/g,
        (_, tokenPath) => `{${prefixer(tokenPath)}}`
      );
    } else if (value && typeof value === 'object') {
      result[key] = transformReferences(value, prefixer);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Create a smart token path prefixer based on semantic patterns.
 *
 * Analyzes token paths and determines whether they should be prefixed with
 * "core." or "semantic." based on their content and usage patterns.
 *
 * @returns Function that prefixes token paths with appropriate namespace
 */
function createTokenPrefixer(): (path: string) => string {
  // Patterns that indicate semantic tokens
  const semanticPatterns = [
    /^color\.(action|feedback|navigation|syntax|data)/,
    /^typography\.(semanticFamily|body|button|caption|fontWeight|heading|letterSpacing|lineHeight|oversize|meta)/,
    /^spacing\.(padding|gap)/,
    /^elevation\.(default|surface)/,
    /^focus\./,
    /^opacity\.(disabled|overlay)/,
    /^dimension\.(minTarget|buttonMinHeight|breakpoint)/,
    /^shape\.control/,
    /^motion\.interaction/,
    /^components\./,
    /^interaction\./,
    /^control\./,
    /^link\./,
    /^overlay\.(scrimWeak|scrimMedium|scrimStrong)/,
    /^skeleton\./,
    /^datavis\.(onFill|gridline|strokeWidth)/,
  ];

  return function prefixTokenPath(tokenPath: string): string {
    // Already prefixed
    if (tokenPath.startsWith('core.') || tokenPath.startsWith('semantic.')) {
      return tokenPath;
    }

    // Smart prefixing: semantic patterns go to semantic namespace, others to core
    const isSemanticToken = semanticPatterns.some((pattern) =>
      pattern.test(tokenPath)
    );
    return isSemanticToken ? `semantic.${tokenPath}` : `core.${tokenPath}`;
  };
}

/**
 * Load tokens from a modular directory structure
 */
function loadModularTokens(baseDir: string): TokenGroup | null {
  const modulesPath = path.join(PROJECT_ROOT, 'ui', 'designTokens', baseDir);

  if (!fs.existsSync(modulesPath)) {
    return null;
  }

  const merged: TokenGroup = {};
  const files = fs.readdirSync(modulesPath, { withFileTypes: true });

  for (const dirent of files) {
    if (
      dirent.isFile() &&
      dirent.name.endsWith('.tokens.json') &&
      !dirent.name.startsWith('_')
    ) {
      const modulePath = path.join(modulesPath, dirent.name);
      const moduleTokens = readTokenFile(modulePath);
      if (moduleTokens) {
        console.log(`[tokens] Loaded: ${baseDir}/${dirent.name}`);
        // Remove $schema and meta from modules
        const { $schema, meta, ...tokenData } = moduleTokens as Record<
          string,
          unknown
        >;
        deepMerge(merged, tokenData as TokenGroup);
      }
    } else if (dirent.isDirectory()) {
      // Recursively load from subdirectories (e.g., semantic/components)
      const subTokens = loadModularTokens(path.join(baseDir, dirent.name));
      if (subTokens) {
        deepMerge(merged, subTokens);
      }
    }
  }

  return Object.keys(merged).length > 0 ? merged : null;
}

/**
 * Check for and use DTCG 1.0 resolver document if available.
 *
 * Looks for a resolver.json file in the design tokens directory and uses
 * the DTCG 1.0 Resolver Module to compose tokens instead of legacy logic.
 *
 * @returns Resolved token group from resolver module, or null if not available
 */
function tryResolverDocumentComposition(): TokenGroup | null {
  const resolverDocPath = path.join(
    PROJECT_ROOT,
    'ui',
    'designTokens',
    'resolver.json'
  );

  if (!fs.existsSync(resolverDocPath)) {
    return null; // No resolver document found
  }

  console.log('[tokens] 🔧 Using DTCG 1.0 Resolver Module...');

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

    // Resolve tokens for default context (no theme/brand/platform specified)
    const result = resolver.resolve({});
    console.log('[tokens] ✅ Resolver composition successful');

    return result.tokens as TokenGroup;
  } catch (error) {
    console.error(
      `[tokens] ❌ Resolver composition failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    console.log('[tokens] 🔄 Falling back to legacy composition...');
    return null;
  }
}

/**
 * Compose core and semantic tokens into unified token file.
 *
 * Supports both legacy modular token composition and DTCG 1.0 Resolver Module.
 * When a resolver.json document is present, uses the resolver module for composition.
 * Otherwise, falls back to legacy modular token loading and merging.
 *
 * @param incremental - Whether to use incremental building (skip if no changes)
 * @returns Success status of the composition operation
 */
export function composeTokens(incremental = true): boolean {
  console.log('[tokens] Composing token files...');

  // Try DTCG 1.0 Resolver Module first
  const resolverTokens = tryResolverDocumentComposition();
  if (resolverTokens) {
    // Write resolved tokens directly (no banner for JSON files)
    const content = JSON.stringify(resolverTokens, null, 2);

    writeOutputFile(PATHS.tokens, content, 'composed design tokens');
    updateFileCache(PATHS.tokens);

    logSummary({
      totalTokens: Object.keys(resolverTokens).length,
      generatedFiles: 1,
    });

    return true;
  }

  // Fall back to legacy composition logic
  console.log('[tokens] 🔄 Using legacy composition...');

  // Check for incremental build
  if (incremental) {
    const tokenFiles = getTokenFilesToCheck();
    const changedFiles = getChangedFiles(tokenFiles);

    if (changedFiles.length === 0 && fs.existsSync(PATHS.tokens)) {
      console.log(
        '[tokens] ⚡ No token files changed, skipping compose (incremental build)'
      );
      return true;
    }

    if (changedFiles.length > 0) {
      console.log(`[tokens] 📝 ${changedFiles.length} token file(s) changed`);
    }
  }

  // Try loading from modular structure first, fall back to monolithic files
  let coreTokens = loadModularTokens('core');
  let semanticTokens = loadModularTokens('semantic');

  // Fall back to monolithic files if modular structure doesn't exist
  if (!coreTokens) {
    console.log('[tokens] Loading from monolithic core.tokens.json...');
    coreTokens = readTokenFile(PATHS.coreTokens);
  }

  if (!semanticTokens) {
    console.log('[tokens] Loading from monolithic semantic.tokens.json...');
    semanticTokens = readTokenFile(PATHS.semanticTokens);
  }

  // Check for required files
  const missingFiles: string[] = [];
  if (!coreTokens) missingFiles.push('core tokens (modular or monolithic)');
  if (!semanticTokens)
    missingFiles.push('semantic tokens (modular or monolithic)');

  if (missingFiles.length > 0) {
    console.error('[tokens] Missing required token files:');
    missingFiles.forEach((file) => console.error(`  - ${file}`));
    return false;
  }

  // Create prefixer function
  const prefixer = createTokenPrefixer();

  // Transform references in both token sets
  const transformedCore = transformReferences(coreTokens, prefixer);
  const transformedSemantic = transformReferences(semanticTokens, prefixer);

  // Create namespaced structure
  const coreNamespaced = { core: transformedCore };
  const semanticNamespaced = { semantic: transformedSemantic };

  // Merge into final structure
  const composed = deepMerge({}, coreNamespaced);
  const result = deepMerge(composed, semanticNamespaced);

  // Generate output
  const content = JSON.stringify(result, null, 2) + '\n';

  writeOutputFile(PATHS.tokens, content, 'composed design tokens');

  // Update cache for all token files
  const tokenFiles = getTokenFilesToCheck();
  tokenFiles.forEach(updateFileCache);
  updateFileCache(PATHS.tokens);

  // Check for deprecated tokens
  const deprecations = findDeprecatedTokens(result);
  if (deprecations.length > 0) {
    console.log(
      `\n[tokens] ⚠️  Found ${deprecations.length} deprecated token(s):`
    );
    deprecations.forEach((dep) => {
      console.log(formatDeprecationWarning(dep.tokenPath, dep));
    });

    const validation = validateDeprecations(deprecations);
    if (validation.errors.length > 0) {
      console.error('\n[tokens] ❌ Deprecation errors:');
      validation.errors.forEach((err) => console.error(`  - ${err}`));
    }
    if (validation.warnings.length > 0) {
      console.warn('\n[tokens] ⚠️  Deprecation warnings:');
      validation.warnings.forEach((warn) => console.warn(`  - ${warn}`));
    }
  }

  // Log summary
  const coreCount = JSON.stringify(coreTokens).match(/"\$value"/g)?.length || 0;
  const semanticCount =
    JSON.stringify(semanticTokens).match(/"\$value"/g)?.length || 0;

  logSummary({
    totalTokens: coreCount + semanticCount,
    generatedFiles: 1,
  });

  return true;
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const success = composeTokens();
  process.exit(success ? 0 : 1);
}
