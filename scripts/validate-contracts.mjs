#!/usr/bin/env node
/**
 * Validate all component contract files against component.contract.schema.json.
 *
 * Usage:
 *   node scripts/validate-contracts.mjs              # validate all
 *   node scripts/validate-contracts.mjs --component Button  # single component
 *   node scripts/validate-contracts.mjs --fix-schema        # rewrite $schema pointer in-place
 *
 * Exit codes: 0 = all pass, 1 = any failure
 *
 * Semantic checks (beyond JSON Schema):
 *   - props.designed members must all have non-empty descriptions
 *   - props.constrained members must have non-empty description AND constraint
 *   - props.restricted members must have non-empty descriptions
 *   - props.styled or props.hook triggers a migration warning (not a failure)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Ajv from 'ajv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const COMPONENTS_DIR = path.join(ROOT, 'ui', 'components');
const SCHEMA_PATH = path.join(ROOT, 'ui', 'designTokens', 'component.contract.schema.json');

const SCHEMA_REL = path.relative(path.join(ROOT, 'ui', 'components'), SCHEMA_PATH)
  .replace(/\\/g, '/');

const args = process.argv.slice(2);
const FIX_SCHEMA = args.includes('--fix-schema');
const componentArg = (() => {
  const idx = args.indexOf('--component');
  return idx !== -1 ? args[idx + 1] : null;
})();

// ── helpers ─────────────────────────────────────────────────────────────────

function contractFiles() {
  const entries = fs.readdirSync(COMPONENTS_DIR, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (componentArg && entry.name !== componentArg) continue;
    const contractPath = path.join(COMPONENTS_DIR, entry.name, `${entry.name}.contract.json`);
    if (fs.existsSync(contractPath)) files.push(contractPath);
  }
  return files;
}

function relPath(absPath) {
  return path.relative(ROOT, absPath);
}

const RESET  = '\x1b[0m';
const RED    = '\x1b[31m';
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BOLD   = '\x1b[1m';

// ── semantic checks ──────────────────────────────────────────────────────────

/**
 * Returns an array of { level: 'error'|'warn', message } findings for prop
 * bucket conventions that AJV schema cannot fully enforce.
 */
function checkPropBuckets(contract, rel) {
  const findings = [];
  const props = contract.props;
  if (!props) return findings;

  // designed members must all have non-empty descriptions
  for (const member of props.designed?.members ?? []) {
    if (!member.description?.trim()) {
      findings.push({
        level: 'error',
        message: `props.designed member '${member.name}' has an empty description — all designed props must be documented`,
      });
    }
  }

  // constrained members must have non-empty description AND constraint
  for (const member of props.constrained?.members ?? []) {
    if (!member.description?.trim()) {
      findings.push({
        level: 'error',
        message: `props.constrained member '${member.name}' has an empty description`,
      });
    }
    if (!member.constraint?.trim()) {
      findings.push({
        level: 'error',
        message: `props.constrained member '${member.name}' is missing a constraint field`,
      });
    }
  }

  // restricted members must have non-empty descriptions
  for (const member of props.restricted?.members ?? []) {
    if (!member.description?.trim()) {
      findings.push({
        level: 'error',
        message: `props.restricted member '${member.name}' has an empty description — explain why it is forbidden`,
      });
    }
  }

  // warn on legacy surfaces (not a failure — migration is incremental)
  if (props.styled) {
    findings.push({
      level: 'warn',
      message: `props.styled is a legacy surface — migrate to props.designed + props.passthrough`,
    });
  }
  if (props.hook) {
    findings.push({
      level: 'warn',
      message: `props.hook is a legacy surface — migrate hook-accessible props to props.designed`,
    });
  }

  return findings;
}

// ── main ────────────────────────────────────────────────────────────────────

if (!fs.existsSync(SCHEMA_PATH)) {
  console.error(`${RED}Schema not found: ${SCHEMA_PATH}${RESET}`);
  process.exit(1);
}

const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(schema);

const files = contractFiles();
if (files.length === 0) {
  const scope = componentArg ? `component '${componentArg}'` : 'ui/components/';
  console.error(`${RED}No contract files found under ${scope}${RESET}`);
  process.exit(1);
}

let passed = 0;
let failed = 0;
let warned = 0;

for (const filePath of files) {
  const rel = relPath(filePath);

  if (FIX_SCHEMA) {
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      const contract = JSON.parse(raw);
      if (contract.$schema !== SCHEMA_REL) {
        const reordered = { $schema: SCHEMA_REL, ...contract };
        fs.writeFileSync(filePath, JSON.stringify(reordered, null, 2) + '\n');
        console.log(`${YELLOW}Fixed $schema: ${rel}${RESET}`);
      }
    } catch (err) {
      console.error(`${RED}FAIL: ${rel}\n  Invalid JSON: ${err.message}${RESET}`);
      failed++;
    }
    continue;
  }

  let contract;
  try {
    contract = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`${RED}FAIL: ${rel}\n  Invalid JSON: ${err.message}${RESET}`);
    failed++;
    continue;
  }

  const schemaValid = validate(contract);
  const propFindings = checkPropBuckets(contract, rel);
  const propErrors = propFindings.filter((f) => f.level === 'error');
  const propWarns  = propFindings.filter((f) => f.level === 'warn');

  if (schemaValid && propErrors.length === 0) {
    passed++;
    if (propWarns.length > 0) {
      warned++;
      console.log(`${YELLOW}WARN: ${rel}${RESET}`);
      for (const w of propWarns) console.log(`  ⚠  ${w.message}`);
    }
  } else {
    failed++;
    console.error(`${RED}FAIL: ${rel}${RESET}`);
    if (!schemaValid) {
      for (const error of validate.errors) {
        const loc = error.instancePath || '(root)';
        console.error(`  ${loc}: ${error.message}`);
        if (error.params?.allowedValues) {
          console.error(`    allowed: ${error.params.allowedValues.join(', ')}`);
        }
      }
    }
    for (const e of propErrors) {
      console.error(`  props: ${e.message}`);
    }
    for (const w of propWarns) {
      console.log(`  ⚠  ${w.message}`);
    }
  }
}

if (!FIX_SCHEMA) {
  const total = passed + failed;
  const warnSuffix = warned > 0 ? `, ${warned} with migration warnings` : '';
  const status = failed === 0
    ? `${GREEN}${BOLD}Contract validation: ${passed}/${total} passed${warnSuffix}${RESET}`
    : `${RED}${BOLD}Contract validation: ${passed} passed, ${failed} failed (${total} total)${warnSuffix}${RESET}`;
  console.log(`\n${status}`);
}

process.exit(failed > 0 ? 1 : 0);
