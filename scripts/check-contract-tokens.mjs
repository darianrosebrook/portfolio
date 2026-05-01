#!/usr/bin/env node
/**
 * Verify that structured token resolution entries in component contracts
 * are consistent with the generated .tokens.generated.scss files.
 *
 * For each anatomy part that uses the structured token form
 * ({ resolvesTo, fallback, property? }), this script checks:
 *   1. The token name appears as a CSS var in the generated SCSS mixin.
 *   2. The semantic token (resolvesTo) is referenced in that CSS var.
 *
 * Legacy flat string arrays are skipped unless --warn-legacy is passed,
 * in which case they are reported and counted as failures.
 *
 * Usage:
 *   node scripts/check-contract-tokens.mjs              # all components
 *   node scripts/check-contract-tokens.mjs --component Button
 *   node scripts/check-contract-tokens.mjs --warn-legacy  # exit 1 on legacy tokens
 *
 * Exit codes: 0 = pass, 1 = any failure
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const COMPONENTS_DIR = path.join(ROOT, 'ui', 'components');

const args = process.argv.slice(2);
const WARN_LEGACY = args.includes('--warn-legacy');
const componentArg = (() => {
  const idx = args.indexOf('--component');
  return idx !== -1 ? args[idx + 1] : null;
})();

const RESET  = '\x1b[0m';
const RED    = '\x1b[31m';
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BOLD   = '\x1b[1m';

function dotPathToCssVar(dotPath) {
  return '--' + dotPath
    .replace(/\./g, '-')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

function contractFiles() {
  const entries = fs.readdirSync(COMPONENTS_DIR, { withFileTypes: true });
  return entries
    .filter(e => e.isDirectory())
    .filter(e => !componentArg || e.name === componentArg)
    .map(e => ({
      name: e.name,
      contractPath: path.join(COMPONENTS_DIR, e.name, `${e.name}.contract.json`),
      scssPath: path.join(COMPONENTS_DIR, e.name, `${e.name}.tokens.generated.scss`),
    }))
    .filter(c => fs.existsSync(c.contractPath));
}

let totalPassed = 0;
let totalFailed = 0;
let totalSkipped = 0;

for (const { name, contractPath, scssPath } of contractFiles()) {
  let contract;
  try {
    contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
  } catch {
    console.error(`${RED}FAIL: ${name} — invalid contract JSON${RESET}`);
    totalFailed++;
    continue;
  }

  if (!contract.tokens || Object.keys(contract.tokens).length === 0) continue;

  let scssContent = null; // loaded lazily on first structured token
  let componentFailed = 0;
  let componentSkipped = 0;
  const errors = [];

  for (const [part, tokenValue] of Object.entries(contract.tokens)) {
    // Legacy: flat string array
    if (Array.isArray(tokenValue)) {
      if (WARN_LEGACY && tokenValue.length > 0) {
        errors.push(`  [${part}] ${tokenValue.length} legacy flat token(s) — migrate to structured form`);
        componentSkipped += tokenValue.length;
      } else {
        totalSkipped += tokenValue.length;
      }
      continue;
    }

    // Structured: object mapping token-name → { resolvesTo, fallback, ... }
    for (const [tokenName, resolution] of Object.entries(tokenValue)) {
      if (!resolution || typeof resolution !== 'object') continue;
      const { resolvesTo, fallback } = resolution;

      if (!resolvesTo || !fallback) {
        errors.push(`  [${part}.${tokenName}] missing resolvesTo or fallback`);
        componentFailed++;
        continue;
      }

      // Load SCSS on demand (only when we have structured tokens to verify)
      if (scssContent === null) {
        scssContent = fs.existsSync(scssPath) ? fs.readFileSync(scssPath, 'utf8') : '';
      }

      if (scssContent === '') {
        errors.push(`  [${part}.${tokenName}] no .tokens.generated.scss found — run tokens:scss`);
        componentFailed++;
        continue;
      }

      const cssVar = dotPathToCssVar(tokenName);
      const semanticVar = dotPathToCssVar(resolvesTo);

      if (!scssContent.includes(`${cssVar}:`)) {
        errors.push(`  [${part}.${tokenName}] CSS var ${cssVar} not found in generated SCSS`);
        componentFailed++;
        continue;
      }

      if (!scssContent.includes(semanticVar)) {
        errors.push(`  [${part}.${tokenName}] ${cssVar} does not reference ${semanticVar}`);
        componentFailed++;
        continue;
      }

      totalPassed++;
    }
  }

  if (errors.length > 0) {
    const hasHardErrors = componentFailed > 0 || (WARN_LEGACY && componentSkipped > 0);
    const label = hasHardErrors ? `${RED}FAIL${RESET}` : `${YELLOW}WARN${RESET}`;
    console.log(`${label}: ${name}`);
    for (const err of errors) console.log(err);
    if (hasHardErrors) totalFailed++;
    totalSkipped += componentSkipped;
  }
}

const skippedNote = totalSkipped > 0
  ? ` (${totalSkipped} legacy flat tokens skipped)`
  : '';
const summary = totalFailed === 0
  ? `${GREEN}${BOLD}Token fidelity: ${totalPassed} structured tokens verified${RESET}${skippedNote}`
  : `${RED}${BOLD}Token fidelity: ${totalPassed} passed, ${totalFailed} failed${RESET}${skippedNote}`;

console.log(`\n${summary}`);
process.exit(totalFailed > 0 ? 1 : 0);
