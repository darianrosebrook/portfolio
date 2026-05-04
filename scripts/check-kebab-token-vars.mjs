#!/usr/bin/env node
/**
 * check-kebab-token-vars.mjs
 *
 * Fails (exit 1) if any var(--X) call in ui/components SCSS files has a
 * camelCase segment — a lowercase letter immediately followed by an uppercase
 * letter — in the custom property name.
 *
 * The generator emits kebab-case names (--foo-font-weight). camelCase references
 * (--foo-fontWeight) resolve to their initial (empty) value with no browser error,
 * causing silent runtime breakage.
 *
 * Usage:
 *   node scripts/check-kebab-token-vars.mjs              # check all
 *   node scripts/check-kebab-token-vars.mjs --fix        # also list matches
 *
 * Exit codes: 0 = no camelCase var refs found, 1 = violations found
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const COMPONENTS_DIR = path.join(ROOT, 'ui', 'components');

const RESET  = '\x1b[0m';
const RED    = '\x1b[31m';
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BOLD   = '\x1b[1m';

// Detect a camelCase segment: lowercase letter immediately followed by uppercase.
// Tested on each captured property name (not the full line) for precision.
const CAMEL_SEGMENT = /[a-z][A-Z]/;

// Match: var(--propertyName)
// Captures the full property name after --
const VAR_PATTERN = /var\(--([^)\s,]+)/g;

function findScssFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findScssFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.scss')) {
      results.push(full);
    }
  }
  return results;
}

function relPath(absPath) {
  return path.relative(ROOT, absPath);
}

// ── main ─────────────────────────────────────────────────────────────────────

const scssFiles = findScssFiles(COMPONENTS_DIR);
const violations = [];

for (const filePath of scssFiles) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let match;
    VAR_PATTERN.lastIndex = 0;
    while ((match = VAR_PATTERN.exec(line)) !== null) {
      const propName = match[1];
      if (CAMEL_SEGMENT.test(propName)) {
        violations.push({
          file: relPath(filePath),
          line: i + 1,
          prop: `--${propName}`,
          text: line.trim(),
        });
      }
    }
  }
}

if (violations.length === 0) {
  console.log(`${GREEN}${BOLD}tokens:lint: 0 camelCase CSS var references — all clear${RESET}`);
  process.exit(0);
}

console.error(`\n${RED}${BOLD}tokens:lint: ${violations.length} camelCase CSS var reference(s) found${RESET}`);
console.error(`${YELLOW}The generator emits kebab-case; camelCase names resolve silently to empty.${RESET}\n`);

let currentFile = '';
for (const v of violations) {
  if (v.file !== currentFile) {
    currentFile = v.file;
    console.error(`${BOLD}${v.file}${RESET}`);
  }
  console.error(`  ${RED}line ${v.line}:${RESET} ${v.prop}`);
  console.error(`    ${YELLOW}${v.text}${RESET}`);
}

console.error(`\n${RED}${BOLD}Fix: convert camelCase segments to kebab-case (e.g. fontWeight → font-weight)${RESET}`);
process.exit(1);
