#!/usr/bin/env node
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const COMPONENTS_DIR = path.join(ROOT, 'ui', 'components');
const DESIGN_TOKENS_SCSS = path.join(ROOT, 'app', 'designTokens.scss');

const componentName = process.argv[2] ?? 'Button';

// Build semantic map
const cssContent = readFileSync(DESIGN_TOKENS_SCSS, 'utf8');
const semanticMap = new Map();
for (const [, varName, value] of cssContent.matchAll(/--([a-z][a-z0-9-]+):\s*([^;v][^;]*);/g)) {
  const v = value.trim();
  if (!v.startsWith('var(')) semanticMap.set(varName, v);
}

// Parse bridge SCSS
const scssPath = path.join(COMPONENTS_DIR, componentName, `${componentName}.tokens.generated.scss`);
const scss = readFileSync(scssPath, 'utf8');
const bridge = new Map();
for (const [, lv, rv] of scss.matchAll(/--([a-zA-Z][a-zA-Z0-9-]+):\s*var\(--([a-zA-Z][a-zA-Z0-9-]+)\)/g)) {
  const nlv = lv.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  const nrv = rv.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  bridge.set(nlv, nrv);
}

// Load contract
const contractPath = path.join(COMPONENTS_DIR, componentName, `${componentName}.contract.json`);
const contract = JSON.parse(readFileSync(contractPath, 'utf8'));

// Check each legacy part
for (const [part, tokenValue] of Object.entries(contract.tokens)) {
  if (!Array.isArray(tokenValue)) continue;
  console.log(`\nPart: ${part} (${tokenValue.length} tokens)`);
  let canConvert = true;
  for (const tokenName of tokenValue) {
    const localVar = tokenName.replace(/\./g, '-').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    const semanticVar = bridge.get(localVar);
    const fallback = semanticVar ? (semanticMap.get(semanticVar) ?? '') : '';
    if (!semanticVar || !fallback) {
      console.log(`  CANT_RESOLVE: ${tokenName}`);
      console.log(`    localVar: ${localVar}, semanticVar: ${semanticVar ?? 'NOT_IN_BRIDGE'}, fallback: ${fallback ? fallback.slice(0, 30) : 'EMPTY'}`);
      canConvert = false;
    }
  }
  if (canConvert) console.log('  -> CAN fully migrate');
}
