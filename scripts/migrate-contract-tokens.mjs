#!/usr/bin/env node
/**
 * Migrate component contract token sections from legacy flat string arrays
 * to structured { resolvesTo, fallback, property, layer } objects.
 *
 * Data pipeline per token:
 *   1. Token name (e.g. "button.color.background.default")
 *      → look up in {Component}.tokens.generated.scss to find which CSS var
 *        it maps to (e.g. --semantic-color-action-background-primary-default)
 *   2. That semantic CSS var → look up in app/designTokens.scss for resolved
 *      hex fallback (e.g. #d9292b)
 *   3. Token path keywords → infer CSS property
 *   4. resolvesTo prefix → infer layer
 *
 * Usage:
 *   node scripts/migrate-contract-tokens.mjs              # all components
 *   node scripts/migrate-contract-tokens.mjs --component Button
 *   node scripts/migrate-contract-tokens.mjs --dry-run    # print changes, no write
 *   node scripts/migrate-contract-tokens.mjs --skip-missing-scss  # skip if no bridge file
 *
 * Exit codes: 0 = success, 1 = error
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const COMPONENTS_DIR = path.join(ROOT, 'ui', 'components');
const DESIGN_TOKENS_SCSS = path.join(ROOT, 'app', 'designTokens.scss');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const SKIP_MISSING_SCSS = args.includes('--skip-missing-scss');
const componentArg = (() => {
  const idx = args.indexOf('--component');
  return idx !== -1 ? args[idx + 1] : null;
})();

const RESET  = '\x1b[0m';
const RED    = '\x1b[31m';
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BOLD   = '\x1b[1m';

// ── Build global semantic CSS var → resolved value map ───────────────────────

function buildSemanticMap(scssPath) {
  const content = fs.readFileSync(scssPath, 'utf8');
  const map = new Map();
  // Matches: --var-name: #hex; or --var-name: rgba(...); or bare values
  // We only want literal values (not var() references)
  for (const [, varName, value] of content.matchAll(/--([a-z][a-z0-9-]+):\s*([^;v][^;]*);/g)) {
    const v = value.trim();
    // Skip lines that are var() references (CSS var chains)
    if (!v.startsWith('var(')) {
      map.set(varName, v);
    }
  }
  return map;
}

// ── Resolve the generated SCSS path for a component ─────────────────────────
// The bridge SCSS file is named using capitalize(prefix) from tokens.json,
// NOT necessarily the folder name. E.g. AlertNotice/ with prefix "alert" → Alert.tokens.generated.scss

function resolveScssPath(componentDir, componentName) {
  const tokensJsonPath = path.join(componentDir, `${componentName}.tokens.json`);
  let prefix = componentName;
  if (fs.existsSync(tokensJsonPath)) {
    try {
      const tj = JSON.parse(fs.readFileSync(tokensJsonPath, 'utf8'));
      if (tj.prefix) {
        const p = String(tj.prefix);
        prefix = p.charAt(0).toUpperCase() + p.slice(1);
      }
    } catch {}
  }
  return path.join(componentDir, `${prefix}.tokens.generated.scss`);
}

// ── Parse component bridge SCSS ───────────────────────────────────────────────
// Returns Map<cssVarName, semanticVarName> e.g.
//   "button-color-background-default" → "semantic-color-action-background-primary-default"

function parseBridgeScss(scssPath) {
  const bridge = new Map();
  if (!fs.existsSync(scssPath)) return bridge;

  const content = fs.readFileSync(scssPath, 'utf8');
  for (const [, localVar, refVar] of content.matchAll(/--([a-zA-Z][a-zA-Z0-9-]+):\s*var\(--([a-zA-Z][a-zA-Z0-9-]+)\)/g)) {
    // Normalize camelCase prefixes (e.g. brandSwitcher → brand-switcher)
    const normalizedLocal = localVar.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    const normalizedRef = refVar.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    bridge.set(normalizedLocal, normalizedRef);
  }
  return bridge;
}

// ── Parse bridge SCSS for literal (non-var) values ───────────────────────────
// Returns Map<cssVarName, literalValue> e.g.
//   "dialog-size-sm-width" → "400px"

function parseBridgeLiterals(scssPath) {
  const literals = new Map();
  if (!fs.existsSync(scssPath)) return literals;
  const content = fs.readFileSync(scssPath, 'utf8');
  // Match --var: <literal-value>; where value is NOT a var() reference
  for (const [, localVar, value] of content.matchAll(/--([a-zA-Z][a-zA-Z0-9-]+):\s*((?!var\()[^;]+);/g)) {
    const v = value.trim();
    if (v && !v.startsWith('var(') && !v.startsWith('/*')) {
      const normalizedLocal = localVar.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
      literals.set(normalizedLocal, v);
    }
  }
  return literals;
}

// ── CSS property inference from token path ────────────────────────────────────

function inferProperty(tokenPath) {
  const p = tokenPath.toLowerCase();

  if (p.includes('background')) return 'background-color';
  if (p.includes('foreground') || p.includes('text.color') || p.includes('color.text')) return 'color';
  if (p.includes('color.border') || p.includes('border.color')) return 'border-color';
  if (p.includes('border.width') || (p.includes('border') && p.includes('width'))) return 'border-width';
  if (p.includes('radius')) return 'border-radius';
  if (p.includes('shadow')) return 'box-shadow';
  if (p.includes('opacity')) return 'opacity';
  if (p.includes('duration')) return 'transition-duration';
  if (p.includes('easing') || p.includes('timing')) return 'transition-timing-function';
  if (p.includes('font.size') || (p.includes('text') && p.includes('size'))) return 'font-size';
  if (p.includes('font.weight') || p.includes('text.weight')) return 'font-weight';
  if (p.includes('line.height') || p.includes('lineheight')) return 'line-height';
  if (p.includes('gap')) return 'gap';
  if (p.includes('padding')) return 'padding';
  if (p.includes('size.min') || p.includes('min.height') || p.includes('size.height')) return 'min-height';
  if (p.includes('size.width') || p.includes('min.width')) return 'min-width';

  return null; // omit property when it cannot be inferred
}

function inferLayer(resolvesTo) {
  if (resolvesTo.startsWith('semantic.')) return 'semantic';
  if (resolvesTo.startsWith('core.')) return 'core';
  return null;
}

// ── Convert a dot-path token name to a CSS var name ──────────────────────────
// "button.color.background.focusVisible" → "button-color-background-focus-visible"

function dotToCssVar(dotPath) {
  return dotPath
    .replace(/\./g, '-')
    .replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())
    .replace(/-+/g, '-')
    .toLowerCase();
}

// ── Migrate one component's contract ─────────────────────────────────────────

function migrateComponent(name, semanticMap) {
  const contractPath = path.join(COMPONENTS_DIR, name, `${name}.contract.json`);
  const componentDir = path.join(COMPONENTS_DIR, name);
  const scssPath = resolveScssPath(componentDir, name);

  let contract;
  try {
    contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
  } catch {
    console.error(`${RED}FAIL: ${name} — cannot read contract${RESET}`);
    return false;
  }

  if (!contract.tokens || Object.keys(contract.tokens).length === 0) {
    return true; // nothing to migrate
  }

  // Check if already fully migrated
  const allStructured = Object.values(contract.tokens).every(
    (v) => !Array.isArray(v)
  );
  if (allStructured) {
    return true; // already done
  }

  const bridge = parseBridgeScss(scssPath);
  const literals = parseBridgeLiterals(scssPath);

  const newTokens = {};
  let migrated = 0;
  const skippedParts = [];

  for (const [part, tokenValue] of Object.entries(contract.tokens)) {
    // Already structured — preserve as-is
    if (!Array.isArray(tokenValue)) {
      newTokens[part] = tokenValue;
      continue;
    }

    // Attempt to resolve every token in this part.
    // A part is only converted if ALL tokens fully resolve (have both
    // resolvesTo and a non-empty fallback). Partial parts stay legacy.
    const resolved = [];
    let canConvert = true;

    for (const tokenName of tokenValue) {
      const localVarName = dotToCssVar(tokenName);
      const semanticVarName = bridge.get(localVarName);

      if (!semanticVarName) {
        // Try literal value fallback
        const literalValue = literals.get(localVarName);
        if (literalValue) {
          const property = inferProperty(tokenName);
          const entry = { literal: literalValue };
          if (property) entry.property = property;
          resolved.push([tokenName, entry]);
          continue; // don't set canConvert=false
        }
        canConvert = false;
        break;
      }

      const resolvesTo = semanticVarName.replace(/-/g, '.');
      const fallback = semanticMap.get(semanticVarName) ?? '';

      if (!fallback) {
        canConvert = false;
        break;
      }

      const property = inferProperty(tokenName);
      const layer = inferLayer(resolvesTo);
      const entry = { resolvesTo, fallback };
      if (property) entry.property = property;
      if (layer) entry.layer = layer;
      resolved.push([tokenName, entry]);
    }

    if (canConvert && resolved.length > 0) {
      newTokens[part] = Object.fromEntries(resolved);
      migrated += resolved.length;
    } else {
      newTokens[part] = tokenValue; // keep as legacy
      if (!canConvert) skippedParts.push(part);
    }
  }

  if (migrated === 0) return true; // nothing changed

  if (skippedParts.length > 0) {
    console.log(`${YELLOW}  ${name}: kept ${skippedParts.length} part(s) as legacy (${skippedParts.join(', ')})${RESET}`);
  }

  const updated = { ...contract, tokens: newTokens };
  const output = `${JSON.stringify(updated, null, 2)}\n`;

  if (DRY_RUN) {
    console.log(`${YELLOW}Would migrate: ${name} (${migrated} tokens)${RESET}`);
  } else {
    fs.writeFileSync(contractPath, output);
    console.log(`${GREEN}Migrated: ${name} (${migrated} tokens)${RESET}`);
  }

  return true;
}

// ── Main ─────────────────────────────────────────────────────────────────────

function components() {
  return fs.readdirSync(COMPONENTS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .filter((e) => !componentArg || e.name === componentArg)
    .map((e) => e.name)
    .filter((name) => fs.existsSync(path.join(COMPONENTS_DIR, name, `${name}.contract.json`)))
    .sort((a, b) => a.localeCompare(b));
}

if (!fs.existsSync(DESIGN_TOKENS_SCSS)) {
  console.error(`${RED}Missing: ${DESIGN_TOKENS_SCSS}${RESET}`);
  process.exit(1);
}

const semanticMap = buildSemanticMap(DESIGN_TOKENS_SCSS);
console.log(`Loaded ${semanticMap.size} resolved CSS vars from designTokens.scss`);

const names = components();
if (names.length === 0) {
  console.error(`${RED}No components found${RESET}`);
  process.exit(1);
}

let failed = 0;
for (const name of names) {
  if (!migrateComponent(name, semanticMap)) failed++;
}

const verb = DRY_RUN ? 'Would migrate' : 'Migrated';
console.log(`\n${failed === 0 ? GREEN : RED}${BOLD}${verb} ${names.length - failed}/${names.length} components${RESET}`);
process.exit(failed > 0 ? 1 : 0);
