#!/usr/bin/env node
// Split components/designTokens.json into semantic source files under components/designTokens/
// - core.json: core except core.typography
// - typography.json: core.typography and semantic.typography
// - light.json: semantic color/background/border/data resolved to light mode
// - dark.json: semantic color/background/border/data resolved to dark mode

import fs from 'fs';
import path from 'path';
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

const INPUT_PATH = path.join(projectRoot, 'components', 'designTokens.json');
const OUT_DIR = path.join(projectRoot, 'components', 'designTokens');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readJson(p) {
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(raw);
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function pick(obj, keys) {
  const out = {};
  for (const k of keys) {
    if (obj && Object.prototype.hasOwnProperty.call(obj, k)) out[k] = obj[k];
  }
  return out;
}

function buildModeSemantic(tokens, mode) {
  const src = tokens.semantic || {};
  const result = {};
  const categories = ['color', 'background', 'border', 'data'];

  for (const cat of categories) {
    if (!src[cat]) continue;
    result[cat] = {};
    for (const [k, v] of Object.entries(src[cat])) {
      if (v && typeof v === 'object') {
        const node = clone(v);
        // If $extensions has design.paths.{mode}, move that into $value
        const ext = node.$extensions;
        if (ext && typeof ext === 'object') {
          const themed = ext[`design.paths.${mode}`];
          if (typeof themed === 'string') {
            node.$value = themed;
          }
        }
        result[cat][k] = node;
      } else {
        result[cat][k] = v;
      }
    }
  }
  return { semantic: result };
}

function main() {
  if (!fs.existsSync(INPUT_PATH)) {
    console.error(
      '[tokens] Missing input:',
      path.relative(projectRoot, INPUT_PATH)
    );
    process.exit(1);
  }

  ensureDir(OUT_DIR);
  const tokens = readJson(INPUT_PATH);

  const core = { core: clone(tokens.core || {}) };
  // Remove core.typography from core.json
  if (core.core && core.core.typography) {
    delete core.core.typography;
  }

  const typography = {
    core: { typography: clone(tokens.core?.typography || {}) },
    semantic: { typography: clone(tokens.semantic?.typography || {}) },
  };

  const light = buildModeSemantic(tokens, 'light');
  const dark = buildModeSemantic(tokens, 'dark');

  fs.writeFileSync(
    path.join(OUT_DIR, 'core.json'),
    JSON.stringify(core, null, 2) + '\n',
    'utf8'
  );
  fs.writeFileSync(
    path.join(OUT_DIR, 'typography.json'),
    JSON.stringify(typography, null, 2) + '\n',
    'utf8'
  );
  fs.writeFileSync(
    path.join(OUT_DIR, 'light.json'),
    JSON.stringify(light, null, 2) + '\n',
    'utf8'
  );
  fs.writeFileSync(
    path.join(OUT_DIR, 'dark.json'),
    JSON.stringify(dark, null, 2) + '\n',
    'utf8'
  );
  console.log('[tokens] Split tokens written to components/designTokens/');
}

main();
