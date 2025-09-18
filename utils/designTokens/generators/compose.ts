#!/usr/bin/env node
/**
 * Token Composition Generator
 *
 * Merges core and semantic token files into a single composed file
 * with proper reference handling and validation.
 */

import {
  PATHS,
  readTokenFile,
  writeOutputFile,
  deepMerge,
  generateBanner,
  logSummary,
  type TokenGroup,
} from '../core/index';

/**
 * Transform token references in an object
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
 * Smart token path prefixing based on semantic patterns
 */
function createTokenPrefixer(): (path: string) => string {
  // Patterns that indicate semantic tokens
  const semanticPatterns = [
    /^color\.(foreground|background|border|status|data|overlay|gradient)/,
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
 * Compose core and semantic tokens into unified token file
 */
export function composeTokens(): boolean {
  console.log('[tokens] Composing token files...');

  // Read source files
  const coreTokens = readTokenFile(PATHS.coreTokens);
  const semanticTokens = readTokenFile(PATHS.semanticTokens);

  // Check for required files
  const missingFiles: string[] = [];
  if (!coreTokens) missingFiles.push('core.tokens.json');
  if (!semanticTokens) missingFiles.push('semantic.tokens.json');

  if (missingFiles.length > 0) {
    console.error('[tokens] Missing required token files:');
    missingFiles.forEach((file) =>
      console.error(`  - ui/designTokens/${file}`)
    );
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
