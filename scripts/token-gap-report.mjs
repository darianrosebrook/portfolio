#!/usr/bin/env node
/**
 * Report all unresolvable token references across component bridge SCSS files,
 * with correct replacement paths derived from designTokens.json.
 *
 * Output: groups unresolved CSS vars by component token file and suggests fixes.
 *
 * Usage:
 *   node scripts/token-gap-report.mjs              # full report
 *   node scripts/token-gap-report.mjs --json       # machine-readable JSON
 *   node scripts/token-gap-report.mjs --compact    # one line per unresolved var
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const COMPONENTS_DIR = path.join(ROOT, 'ui', 'components');
const DESIGN_TOKENS_SCSS = path.join(ROOT, 'app', 'designTokens.scss');

const args = process.argv.slice(2);
const JSON_OUTPUT = args.includes('--json');
const COMPACT = args.includes('--compact');

// ── Build set of all defined CSS vars from designTokens.scss ─────────────────

const cssContent = fs.readFileSync(DESIGN_TOKENS_SCSS, 'utf8');
const definedVars = new Set();
for (const [, name] of cssContent.matchAll(/--([a-z][a-z0-9-]+)\s*:/g)) {
  definedVars.add(name);
}

// ── Scan all component bridge SCSS files for unresolved var() references ─────

// Map: unresolved CSS var name → Set of component names that use it
const unresolvedToComponents = new Map();
// Map: component name → Set of unresolved vars it references
const componentToUnresolved = new Map();

const componentDirs = fs
  .readdirSync(COMPONENTS_DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

for (const name of componentDirs) {
  const scssPath = path.join(
    COMPONENTS_DIR,
    name,
    `${name}.tokens.generated.scss`
  );
  if (!fs.existsSync(scssPath)) continue;

  const scss = fs.readFileSync(scssPath, 'utf8');
  const componentUnresolved = new Set();

  for (const [, refVar] of scss.matchAll(/var\(--([a-z][a-z0-9-]+)\)/g)) {
    if (!definedVars.has(refVar)) {
      componentUnresolved.add(refVar);
      if (!unresolvedToComponents.has(refVar))
        unresolvedToComponents.set(refVar, new Set());
      unresolvedToComponents.get(refVar).add(name);
    }
  }

  if (componentUnresolved.size > 0) {
    componentToUnresolved.set(name, componentUnresolved);
  }
}

// ── Build candidate suggestions from the defined vars ────────────────────────

function candidates(unresolvedVar, top = 3) {
  // Score each defined var by keyword overlap
  const parts = unresolvedVar.split('-');
  const scored = [];
  for (const defVar of definedVars) {
    const defParts = defVar.split('-');
    const overlap = parts.filter(
      (p) => p.length > 2 && defParts.includes(p)
    ).length;
    if (overlap > 0) scored.push({ var: defVar, score: overlap });
  }
  scored.sort((a, b) => b.score - a.score || a.var.length - b.var.length);
  return scored.slice(0, top).map((s) => s.var);
}

// ── Output ────────────────────────────────────────────────────────────────────

if (JSON_OUTPUT) {
  const out = {};
  for (const [varName, components] of [
    ...unresolvedToComponents.entries(),
  ].sort()) {
    out[varName] = {
      usedBy: [...components].sort(),
      candidates: candidates(varName),
    };
  }
  console.log(JSON.stringify(out, null, 2));
  process.exit(0);
}

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

if (COMPACT) {
  for (const [varName, components] of [
    ...unresolvedToComponents.entries(),
  ].sort()) {
    const suggest = candidates(varName, 1)[0] ?? '(no match)';
    console.log(
      `${RED}--${varName}${RESET} → ${YELLOW}--${suggest}${RESET}  [${[...components].join(', ')}]`
    );
  }
} else {
  console.log(`\n${BOLD}Token Gap Report${RESET}`);
  console.log(
    `${DIM}Scanned ${componentDirs.length} components, found ${unresolvedToComponents.size} unresolved references${RESET}\n`
  );

  for (const [varName, components] of [
    ...unresolvedToComponents.entries(),
  ].sort()) {
    const usedBy = [...components].sort().join(', ');
    const suggest = candidates(varName);
    console.log(`${RED}${BOLD}--${varName}${RESET}`);
    console.log(`  Used by:    ${usedBy}`);
    if (suggest.length > 0) {
      console.log(
        `  Candidates: ${suggest.map((v) => `--${v}`).join('\n              ')}`
      );
    } else {
      console.log(`  Candidates: ${DIM}(none found)${RESET}`);
    }
    console.log();
  }

  // Per-component summary
  console.log(`\n${BOLD}Per-component unresolved count:${RESET}`);
  for (const [name, unresolved] of [
    ...componentToUnresolved.entries(),
  ].sort()) {
    console.log(`  ${name.padEnd(18)} ${unresolved.size} unresolved`);
  }

  const total = unresolvedToComponents.size;
  console.log(
    `\n${total === 0 ? GREEN : RED}${BOLD}Total distinct unresolved CSS vars: ${total}${RESET}`
  );
}

process.exit(unresolvedToComponents.size > 0 ? 1 : 0);
