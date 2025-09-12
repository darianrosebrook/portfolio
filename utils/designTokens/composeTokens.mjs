#!/usr/bin/env node
// Compose split token sources into components/designTokens.json
// Sources:
// Preferred:
// - components/designTokens/core.tokens.json
// - components/designTokens/semantic.tokens.json
// Legacy (back-compat):
// - components/designTokens/core.json
// - components/designTokens/typography.json
// - components/designTokens/light.json
// - components/designTokens/dark.json

import fs from 'fs';
import path from 'path';
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

const SOURCES_DIR = path.join(projectRoot, 'ui', 'designTokens');
const OUTPUT_PATH = path.join(projectRoot, 'ui', 'designTokens.json');

function readIfExists(p) {
  if (!fs.existsSync(p)) return null;
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(raw);
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
  // Preferred new inputs: core/semantic W3C DT files (un-namespaced paths)
  const coreTokensPath = path.join(SOURCES_DIR, 'core.tokens.json');
  const semanticTokensPath = path.join(SOURCES_DIR, 'semantic.tokens.json');
  const hasNewInputs =
    fs.existsSync(coreTokensPath) && fs.existsSync(semanticTokensPath);

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

  if (hasNewInputs) {
    const coreRaw = readIfExists(coreTokensPath) || {};
    const semanticRaw = readIfExists(semanticTokensPath) || {};
    const coreNamespaced = { core: transformRefs(coreRaw, defaultPrefixer) };
    const semanticNamespaced = {
      semantic: transformRefs(semanticRaw, defaultPrefixer),
    };
    const composedNew = deepMerge({}, coreNamespaced);
    deepMerge(composedNew, semanticNamespaced);
    const jsonNew = JSON.stringify(composedNew, null, 2) + '\n';
    fs.writeFileSync(OUTPUT_PATH, jsonNew, 'utf8');
    console.log(
      '[tokens] Composed (core/semantic) ->',
      path.relative(projectRoot, OUTPUT_PATH)
    );
    return;
  }

  const core = readIfExists(path.join(SOURCES_DIR, 'core.json')) || {};
  const typography =
    readIfExists(path.join(SOURCES_DIR, 'typography.json')) || {};
  const light = readIfExists(path.join(SOURCES_DIR, 'light.json')) || {};
  const dark = readIfExists(path.join(SOURCES_DIR, 'dark.json')) || {};

  // Merge base structures: core + typography
  const composed = deepMerge({}, core);
  deepMerge(composed, typography);

  // Derive $extensions.design.paths.light|dark from explicit light/dark token values
  // Strategy: for any token present in light.semantic.* or dark.semantic.*, set the extension on the corresponding token node
  function applyModeExtensions(modeObj, modeKey) {
    const semantic = modeObj.semantic;
    if (!semantic) return;
    const paths = collectPaths(semantic);
    for (const p of paths) {
      const fullPath = `semantic.${p}`; // p already starts with color/background/etc
      // ensure node exists in composed
      // create minimal node if missing
      // get or create node
      const segs = fullPath.split('.');
      let node = composed;
      for (const s of segs) {
        if (!node[s] || typeof node[s] !== 'object') node[s] = {};
        node = node[s];
      }
      if (!('$extensions' in node)) node.$extensions = {};
      node.$extensions[`design.paths.${modeKey}`] = `{${fullPath}}`;
    }
  }

  applyModeExtensions(light, 'light');
  applyModeExtensions(dark, 'dark');

  // Merge semantic color/background/border/data base values from light as default $value if missing
  // This keeps light as base values; dark overrides via $extensions.
  deepMerge(composed, light);

  // Write output
  const json = JSON.stringify(composed, null, 2) + '\n';
  fs.writeFileSync(OUTPUT_PATH, json, 'utf8');
  console.log(
    '[tokens] Composed (legacy) ->',
    path.relative(projectRoot, OUTPUT_PATH)
  );
}

compose();
