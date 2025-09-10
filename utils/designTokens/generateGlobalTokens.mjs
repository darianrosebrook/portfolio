#!/usr/bin/env node
// Global token generator (JS version)
// - Reads components/designTokens.json
// - Emits app/designTokens.scss with :root, .light, .dark, and prefers-color-scheme: dark blocks

import fs from 'fs';
import path from 'path';
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const TOKENS_PATH = path.join(PROJECT_ROOT, 'components', 'designTokens.json');
const OUTPUT_PATH = path.join(PROJECT_ROOT, 'app', 'designTokens.scss');

function readTokens() {
  const raw = fs.readFileSync(TOKENS_PATH, 'utf8');
  return JSON.parse(raw);
}

function tokenPathToCSSVar(pathStr) {
  return `--${String(pathStr).replace(/\./g, '-')}`;
}

function resolveNode(node, pathStr, theme) {
  let raw = node;
  if (raw && typeof raw === 'object' && '$value' in raw) {
    raw = raw.$value;
  }

  if (node && typeof node === 'object' && '$extensions' in node) {
    const ext = node.$extensions || {};
    const key = `design.paths.${theme}`;
    if (
      ext &&
      typeof ext === 'object' &&
      key in ext &&
      typeof ext[key] === 'string'
    ) {
      raw = ext[key];
    }
  }

  if (typeof raw === 'string') {
    return raw.replace(
      /\{([^}]+)\}/g,
      (_, refPath) => `var(${tokenPathToCSSVar(refPath)})`
    );
  }
  if (typeof raw === 'number' || typeof raw === 'boolean') {
    return String(raw);
  }
  return `var(${tokenPathToCSSVar(pathStr)})`;
}

function collectMaps(tokens, currentPath, inheritedType, maps) {
  for (const [key, val] of Object.entries(tokens)) {
    if (key.startsWith('$')) continue;
    const nextPath = [...currentPath, key];
    const pathStr = nextPath.join('.');

    if (val && typeof val === 'object' && !Array.isArray(val)) {
      const nodeType =
        typeof val.$type === 'string' ? val.$type : inheritedType;
      const hasValue = Object.prototype.hasOwnProperty.call(val, '$value');
      if (hasValue) {
        const v = val.$value;
        if (typeof v === 'string' || typeof v === 'number') {
          const cssVar = tokenPathToCSSVar(pathStr);
          // Root always uses light/default resolution
          const lightVal = resolveNode(val, pathStr, 'light');
          maps.root[cssVar] = lightVal;

          // Only theme color tokens that have extensions
          if (nodeType === 'color' && val.$extensions) {
            const ext = val.$extensions || {};
            const hasLightPath = Object.prototype.hasOwnProperty.call(
              ext,
              'design.paths.light'
            );
            const hasDarkPath = Object.prototype.hasOwnProperty.call(
              ext,
              'design.paths.dark'
            );

            if (hasLightPath || hasDarkPath) {
              const lightVal = resolveNode(val, pathStr, 'light');
              const darkVal = resolveNode(val, pathStr, 'dark');

              if (hasLightPath) maps.lightColors[cssVar] = lightVal;
              if (hasDarkPath) {
                maps.darkColors[cssVar] = darkVal;
                maps.hasDarkOverride = true;
              }
            }
          }
        }
      }
      // Recurse
      for (const [childKey, childVal] of Object.entries(val)) {
        if (childKey.startsWith('$')) continue;
        collectMaps({ [childKey]: childVal }, nextPath, nodeType, maps);
      }
    }
  }
}

function formatBlock(selector, map) {
  const lines = Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');
  return `${selector} {\n${lines}\n}`;
}

function run() {
  if (!fs.existsSync(TOKENS_PATH)) {
    console.error(
      `[tokens] Missing ${path.relative(PROJECT_ROOT, TOKENS_PATH)}`
    );
    process.exit(1);
  }

  const tokens = readTokens();
  const maps = {
    root: {},
    lightColors: {},
    darkColors: {},
    hasDarkOverride: false,
  };
  collectMaps(tokens, [], undefined, maps);

  const banner = `/* AUTO-GENERATED: Do not edit directly.\n * Source: components/designTokens.json\n */`;
  const rootBlock = formatBlock(':root', maps.root);
  const lightBlock = formatBlock('.light', maps.lightColors);
  const darkBlock = formatBlock('.dark', maps.darkColors);
  const prefersBlock = maps.hasDarkOverride
    ? `@media (prefers-color-scheme: dark) {\n${formatBlock('  :root', maps.darkColors)}\n${formatBlock('  .light', maps.lightColors)}\n}`
    : '';

  const content = [
    banner,
    rootBlock,
    lightBlock,
    darkBlock,
    prefersBlock,
    '',
  ].join('\n\n');
  fs.writeFileSync(OUTPUT_PATH, content, 'utf8');
  console.log(`[tokens] Wrote ${path.relative(PROJECT_ROOT, OUTPUT_PATH)}`);
}

run();
