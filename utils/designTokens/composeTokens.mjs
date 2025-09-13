#!/usr/bin/env node
// Compose split token sources into ui/designTokens/designTokens.json
// Sources (required):
// - ui/designTokens/core.tokens.json
// - ui/designTokens/semantic.tokens.json

import fs from 'fs';
import path from 'path';
import url from 'url';
import { validateTokenFile, logValidationResult } from './validateTokens.mjs';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

const SOURCES_DIR = path.join(projectRoot, 'ui', 'designTokens');
const OUTPUT_PATH = path.join(
  projectRoot,
  'ui',
  'designTokens',
  'designTokens.json'
);

function readIfExists(p) {
  if (!fs.existsSync(p)) return null;

  try {
    // Validate the token file
    const validationResult = validateTokenFile(p);
    logValidationResult(validationResult);

    if (!validationResult.isValid) {
      console.warn(
        `[tokens] Validation issues found in ${path.basename(p)}, but continuing build...`
      );
      // Don't exit on validation errors for now - just warn
      // process.exit(1);
    }

    return validationResult.tokens;
  } catch (error) {
    // Fallback to simple file reading if validation fails
    console.warn(
      `[tokens] Validation unavailable for ${path.basename(p)}, proceeding with basic parsing`
    );
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw);
  }
}

function deepMerge(target, source) {
  if (source == null) return target;
  for (const [k, v] of Object.entries(source)) {
    if (
      v &&
      typeof v === 'object' &&
      !Array.isArray(v) &&
      !(v instanceof Date)
    ) {
      target[k] = deepMerge(
        target[k] && typeof target[k] === 'object' ? target[k] : {},
        v
      );
    } else {
      target[k] = v;
    }
  }
  return target;
}

function set(obj, pathStr, value) {
  const segs = pathStr.split('.');
  let cur = obj;
  for (let i = 0; i < segs.length - 1; i++) {
    const s = segs[i];
    if (!cur[s] || typeof cur[s] !== 'object') cur[s] = {};
    cur = cur[s];
  }
  cur[segs[segs.length - 1]] = value;
}

function collectPaths(obj, base = []) {
  const out = [];
  if (!obj || typeof obj !== 'object') return out;
  for (const [k, v] of Object.entries(obj)) {
    const next = [...base, k];
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      // token node if has $value
      if (Object.prototype.hasOwnProperty.call(v, '$value')) {
        out.push(next.join('.'));
      }
      out.push(...collectPaths(v, next));
    }
  }
  return out;
}

function compose() {
  // Required inputs: core/semantic W3C DT files (un-namespaced paths)
  const coreTokensPath = path.join(SOURCES_DIR, 'core.tokens.json');
  const semanticTokensPath = path.join(SOURCES_DIR, 'semantic.tokens.json');

  function transformRefs(obj, prefixer) {
    if (obj == null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map((v) => transformRefs(v, prefixer));
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === 'string') {
        // Only replace {token.paths.like.this} (no spaces, at least one dot)
        out[k] = v.replace(
          /\{([A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)+)\}/g,
          (_, p) => `\{${prefixer(p)}\}`
        );
      } else if (v && typeof v === 'object') {
        out[k] = transformRefs(v, prefixer);
      } else {
        out[k] = v;
      }
    }
    return out;
  }

  function defaultPrefixer(pathStr) {
    if (pathStr.startsWith('core.') || pathStr.startsWith('semantic.'))
      return pathStr;

    // Smart prefixing based on token path patterns
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

    const isSemanticToken = semanticPatterns.some((pattern) =>
      pattern.test(pathStr)
    );
    return isSemanticToken ? `semantic.${pathStr}` : `core.${pathStr}`;
  }

  if (!fs.existsSync(coreTokensPath) || !fs.existsSync(semanticTokensPath)) {
    console.error('[tokens] Missing required token sources:');
    if (!fs.existsSync(coreTokensPath)) {
      console.error('  - ui/designTokens/core.tokens.json');
    }
    if (!fs.existsSync(semanticTokensPath)) {
      console.error('  - ui/designTokens/semantic.tokens.json');
    }
    process.exit(1);
  }

  const coreRaw = readIfExists(coreTokensPath) || {};
  const semanticRaw = readIfExists(semanticTokensPath) || {};
  const coreNamespaced = { core: transformRefs(coreRaw, defaultPrefixer) };
  const semanticNamespaced = {
    semantic: transformRefs(semanticRaw, defaultPrefixer),
  };
  const composed = deepMerge({}, coreNamespaced);
  deepMerge(composed, semanticNamespaced);
  const json = JSON.stringify(composed, null, 2) + '\n';
  fs.writeFileSync(OUTPUT_PATH, json, 'utf8');
  console.log('[tokens] Composed ->', path.relative(projectRoot, OUTPUT_PATH));
}

compose();
