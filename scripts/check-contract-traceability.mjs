#!/usr/bin/env node
/**
 * check-contract-traceability.mjs
 *
 * Reads all *.contract.json files and checks whether high-risk behavioral
 * obligations have matching contractTest() calls in the component's test file.
 *
 * High-risk obligations (exit non-zero if uncovered):
 *   - focus.strategy = "trap"
 *   - dismissal.triggers containing { event: "escape" }
 *
 * Medium-risk obligations (warn, do not fail):
 *   - focus.wrap = true
 *   - a11y.apgPattern (any value)
 *
 * Usage:
 *   node scripts/check-contract-traceability.mjs
 *   node scripts/check-contract-traceability.mjs --component Dialog
 *
 * Exit codes: 0 = all high-risk covered, 1 = any high-risk obligation uncovered
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const COMPONENTS_DIR = path.join(ROOT, 'ui', 'components');

const args = process.argv.slice(2);
const componentArg = (() => {
  const idx = args.indexOf('--component');
  return idx !== -1 ? args[idx + 1] : null;
})();

const RESET  = '\x1b[0m';
const RED    = '\x1b[31m';
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BOLD   = '\x1b[1m';

// ── helpers ──────────────────────────────────────────────────────────────────

function contractFiles() {
  const entries = fs.readdirSync(COMPONENTS_DIR, { withFileTypes: true });
  return entries
    .filter(e => e.isDirectory())
    .filter(e => !componentArg || e.name === componentArg)
    .map(e => ({
      name: e.name,
      contractPath: path.join(COMPONENTS_DIR, e.name, `${e.name}.contract.json`),
      testPath: path.join(COMPONENTS_DIR, e.name, 'tests', `${e.name}.test.tsx`),
    }))
    .filter(c => fs.existsSync(c.contractPath));
}

/**
 * Extracts behavioral obligations that require contractTest coverage.
 * Returns array of { field, value, risk: 'high' | 'medium' }
 */
function extractObligations(contract) {
  const obligations = [];

  if (contract.focus?.strategy === 'trap') {
    obligations.push({ field: 'focus.strategy', value: 'trap', risk: 'high' });
  }
  if (contract.focus?.wrap === true) {
    obligations.push({ field: 'focus.wrap', value: 'true', risk: 'medium' });
  }

  if (Array.isArray(contract.dismissal?.triggers)) {
    const hasEscape = contract.dismissal.triggers.some(t => t.event === 'escape');
    if (hasEscape) {
      obligations.push({ field: 'dismissal.triggers', value: 'escape', risk: 'high' });
    }
  }

  if (contract.a11y?.apgPattern) {
    obligations.push({
      field: 'a11y.apgPattern',
      value: contract.a11y.apgPattern,
      risk: 'medium',
    });
  }

  return obligations;
}

/**
 * Returns the set of contract fields covered by contractTest() calls
 * in the given test file. The suffix after '/' in the field argument is
 * stripped for matching:  'focus.wrap/Tab-forward' → covers 'focus.wrap'.
 */
function coveredFields(testPath, componentName) {
  if (!fs.existsSync(testPath)) return new Set();

  const content = fs.readFileSync(testPath, 'utf8');
  const covered = new Set();

  // Match: contractTest('ComponentName', 'field.path', ...)
  // Handles single quotes, double quotes, and template literals.
  const pattern = new RegExp(
    `contractTest\\s*\\(\\s*['"\`]${componentName}['"\`]\\s*,\\s*['"\`]([^'"\`]+)['"\`]`,
    'g'
  );

  let match;
  while ((match = pattern.exec(content)) !== null) {
    const rawField = match[1];
    covered.add(rawField.split('/')[0]);
  }

  return covered;
}

// ── main ─────────────────────────────────────────────────────────────────────

const files = contractFiles();
if (files.length === 0) {
  const scope = componentArg ? `component '${componentArg}'` : 'ui/components/';
  console.error(`${RED}No contract files found under ${scope}${RESET}`);
  process.exit(1);
}

const results = [];

for (const { name, contractPath, testPath } of files) {
  let contract;
  try {
    contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
  } catch {
    continue;
  }

  const obligations = extractObligations(contract);
  if (obligations.length === 0) continue;

  const covered = coveredFields(testPath, name);

  for (const ob of obligations) {
    results.push({
      component: name,
      field: ob.field,
      value: ob.value,
      risk: ob.risk,
      covered: covered.has(ob.field),
      hasTestFile: fs.existsSync(testPath),
    });
  }
}

// ── report ────────────────────────────────────────────────────────────────────

const coveredResults   = results.filter(r => r.covered);
const uncoveredHigh    = results.filter(r => !r.covered && r.risk === 'high');
const uncoveredMedium  = results.filter(r => !r.covered && r.risk === 'medium');

console.log(`\nContract traceability: ${coveredResults.length} covered, ${uncoveredHigh.length + uncoveredMedium.length} uncovered\n`);

if (coveredResults.length > 0) {
  for (const r of coveredResults) {
    console.log(`${GREEN}  ✓ ${r.component}: ${r.field} = ${r.value}${RESET}`);
  }
}

if (uncoveredHigh.length > 0 || uncoveredMedium.length > 0) {
  console.log('');
  for (const r of uncoveredHigh) {
    console.error(`${RED}  ✗ ${r.component}: ${r.field} = ${r.value}  [high-risk — must be covered]${RESET}`);
    if (!r.hasTestFile) {
      console.error(`${RED}    (no test file found at ui/components/${r.component}/tests/${r.component}.test.tsx)${RESET}`);
    }
  }
  for (const r of uncoveredMedium) {
    console.log(`${YELLOW}  ⚠  ${r.component}: ${r.field} = ${r.value}  [medium — recommended]${RESET}`);
  }
}

if (uncoveredHigh.length > 0) {
  console.error(
    `\n${RED}${BOLD}Traceability: ${uncoveredHigh.length} high-risk obligation(s) have no contractTest coverage${RESET}`
  );
  process.exit(1);
}

if (uncoveredMedium.length > 0) {
  console.log(
    `\n${YELLOW}${BOLD}Traceability: ${uncoveredMedium.length} medium-risk obligation(s) recommended for coverage${RESET}`
  );
}

process.exit(0);
