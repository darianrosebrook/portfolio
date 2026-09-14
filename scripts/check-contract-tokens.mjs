#!/usr/bin/env node
/**
 * Verify that structured token resolution entries in component contracts
 * are consistent with the generated <Component>.tokens.css artifacts.
 *
 * For each anatomy part that uses the structured token form
 * ({ resolvesTo, fallback, property? }), this script checks against the
 * generated tokens.css:
 *   1. The token name appears as a --ds-<prefix>-… custom property.
 *   2. The semantic/core var (resolvesTo) is referenced by that property.
 *   3. The contract fallback matches the emitted var() fallback literal.
 *
 * --fix rewrites drifted contract fallback values to the emitted literals.
 * Legacy flat string arrays are skipped unless --warn-legacy is passed,
 * in which case they are reported and counted as failures.
 *
 * Usage:
 *   node scripts/check-contract-tokens.mjs              # all components
 *   node scripts/check-contract-tokens.mjs --component Button
 *   node scripts/check-contract-tokens.mjs --fix         # sync drifted fallbacks
 *   node scripts/check-contract-tokens.mjs --warn-legacy # exit 1 on legacy tokens
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
const FIX = args.includes('--fix');
const componentArg = (() => {
  const idx = args.indexOf('--component');
  return idx !== -1 ? args[idx + 1] : null;
})();

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BOLD = '\x1b[1m';

// ── Pure helpers (exported for tests) ────────────────────────────────────────

function kebabSegments(str) {
  return String(str)
    .replace(/\./g, '-')
    .replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())
    .replace(/[\s_]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

function dotPathToCssVar(dotPath) {
  return '--' + kebabSegments(dotPath).replace(/^-+/, '');
}

/**
 * Map a contract token name (e.g. "button.color.background.default") to the
 * custom property emitted by generateCSSTokens.mjs
 * (e.g. "--ds-button-color-background-default"). The tokens.json `prefix` is
 * matched against the leading path segments after kebab-casing both, so
 * camelCase contract names align with kebab prefixes. Token names that do not
 * start with the component prefix map to their plain --kebab-path form.
 */
function contractTokenToCssVar(tokenName, prefix) {
  const kebab = kebabSegments(tokenName);
  if (kebab.startsWith('box-model-')) {
    return '--ds-' + kebab; // shared slot pool, component-agnostic
  }
  const kebabPrefix = prefix ? kebabSegments(prefix) : null;
  if (kebabPrefix && kebab.startsWith(kebabPrefix + '-')) {
    return '--ds-' + kebab; // prefix is already part of the path
  }
  return '--' + kebab;
}

/**
 * Parse generated tokens.css into a map of
 * varName -> { value, reference, fallback }.
 * `reference` is the var() target when the value is a var() call;
 * `fallback` is the literal after the comma, or null when absent.
 */
function parseEmittedVars(cssContent) {
  const vars = new Map();
  if (!cssContent) return vars;
  const declRe = /--([a-zA-Z][a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
  for (const [, rawName, rawValue] of cssContent.matchAll(declRe)) {
    const name = '--' + kebabSegments(rawName);
    const value = rawValue.trim();
    let reference = null;
    let fallback = null;
    const varMatch = value.match(
      /^var\(\s*(--[a-zA-Z][a-zA-Z0-9-]+)\s*(?:,\s*(.+))?\)$/s
    );
    if (varMatch) {
      reference = varMatch[1];
      if (varMatch[2] !== undefined) {
        fallback = varMatch[2].trim();
      }
    }
    if (!vars.has(name)) {
      vars.set(name, { value, reference, fallback });
    }
  }
  return vars;
}

function expandHexShorthand(value) {
  let s = String(value).toLowerCase().replace(/\s+/g, '');
  const short3 = s.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/);
  if (short3) {
    s =
      '#' +
      short3
        .slice(1)
        .map((c) => c + c)
        .join('');
  }
  const short4 = s.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])$/);
  if (short4) {
    s =
      '#' +
      short4
        .slice(1)
        .map((c) => c + c)
        .join('');
  }
  return s;
}

/**
 * Compare a contract fallback against an emitted var() fallback literal,
 * tolerating case, whitespace, and hex shorthand differences.
 */
function fallbacksMatch(contractFallback, emittedFallback) {
  if (emittedFallback === null || emittedFallback === undefined) return false;
  if (contractFallback === null || contractFallback === undefined) return false;
  return (
    expandHexShorthand(contractFallback) === expandHexShorthand(emittedFallback)
  );
}

export {
  dotPathToCssVar,
  contractTokenToCssVar,
  parseEmittedVars,
  fallbacksMatch,
  kebabSegments,
};

// ── File-system plumbing ─────────────────────────────────────────────────────

// The generated tokens.css is usually named after the component folder, but a
// few legacy/shared-prefix components use the token prefix instead. E.g.
// AlertNotice/ with prefix "alert" → Alert.tokens.css.

function resolveTokensCssPath(componentDir, componentName) {
  const tokensJsonPath = path.join(
    componentDir,
    `${componentName}.tokens.json`
  );
  const candidates = [`${componentName}.tokens.css`];

  if (fs.existsSync(tokensJsonPath)) {
    try {
      const tj = JSON.parse(fs.readFileSync(tokensJsonPath, 'utf8'));
      if (tj.prefix) {
        const p = String(tj.prefix);
        const capitalizedPrefix = p.charAt(0).toUpperCase() + p.slice(1);
        const pascalPrefix = p
          .split(/[-_\s]+/)
          .filter(Boolean)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join('');

        candidates.push(
          `${capitalizedPrefix}.tokens.css`,
          `${pascalPrefix}.tokens.css`
        );
      }
    } catch {}
  }

  for (const fileName of [...new Set(candidates)]) {
    const candidate = path.join(componentDir, fileName);
    if (fs.existsSync(candidate)) return candidate;
  }

  return path.join(componentDir, candidates[0]);
}

function loadComponentPrefix(componentDir, componentName) {
  const tokensJsonPath = path.join(
    componentDir,
    `${componentName}.tokens.json`
  );
  try {
    const tj = JSON.parse(fs.readFileSync(tokensJsonPath, 'utf8'));
    return tj.prefix ? String(tj.prefix) : componentName.toLowerCase();
  } catch {
    return componentName.toLowerCase();
  }
}

function contractFiles() {
  const entries = fs.readdirSync(COMPONENTS_DIR, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory())
    .filter((e) => !componentArg || e.name === componentArg)
    .map((e) => ({
      name: e.name,
      contractPath: path.join(
        COMPONENTS_DIR,
        e.name,
        `${e.name}.contract.json`
      ),
      tokensCssPath: resolveTokensCssPath(
        path.join(COMPONENTS_DIR, e.name),
        e.name
      ),
    }))
    .filter((c) => fs.existsSync(c.contractPath));
}

// ── Main ─────────────────────────────────────────────────────────────────────

let totalPassed = 0;
let totalFailed = 0;
let totalFixed = 0;
let totalSkipped = 0;

const isMain =
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith('check-contract-tokens.mjs');

if (isMain) {
  for (const { name, contractPath, tokensCssPath } of contractFiles()) {
    let contract;
    try {
      contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
    } catch {
      console.error(`${RED}FAIL: ${name} — invalid contract JSON${RESET}`);
      totalFailed++;
      continue;
    }

    if (!contract.tokens || Object.keys(contract.tokens).length === 0) continue;

    const prefix = loadComponentPrefix(path.dirname(tokensCssPath), name);

    let emittedVars = null; // loaded lazily on first structured token
    let contractDirty = false;
    let componentFailed = 0;
    let componentFixed = 0;
    let componentSkipped = 0;
    const errors = [];
    const fixes = [];

    const ensureEmittedVars = () => {
      if (emittedVars === null) {
        const raw = fs.existsSync(tokensCssPath)
          ? fs.readFileSync(tokensCssPath, 'utf8')
          : '';
        emittedVars = parseEmittedVars(raw);
      }
      return emittedVars;
    };

    for (const [part, tokenValue] of Object.entries(contract.tokens)) {
      // Legacy: flat string array
      if (Array.isArray(tokenValue)) {
        if (WARN_LEGACY && tokenValue.length > 0) {
          errors.push(
            `  [${part}] ${tokenValue.length} legacy flat token(s) — migrate to structured form`
          );
          componentSkipped += tokenValue.length;
        } else {
          totalSkipped += tokenValue.length;
        }
        continue;
      }

      // Structured: object mapping token-name → { resolvesTo, fallback, ... } or { literal, property? }
      for (const [tokenName, resolution] of Object.entries(tokenValue)) {
        if (!resolution || typeof resolution !== 'object') continue;

        // Literal form: {literal, property?} — no resolvesTo/fallback expected
        if ('literal' in resolution) {
          const vars = ensureEmittedVars();
          const cssVar = contractTokenToCssVar(tokenName, prefix);
          if (vars.size === 0 || !vars.has(cssVar)) {
            errors.push(
              `  [${part}.${tokenName}] CSS var ${cssVar} not found in generated tokens.css`
            );
            componentFailed++;
          } else {
            totalPassed++;
          }
          continue;
        }

        const { resolvesTo, fallback } = resolution;

        if (!resolvesTo || !fallback) {
          errors.push(
            `  [${part}.${tokenName}] missing resolvesTo or fallback`
          );
          componentFailed++;
          continue;
        }

        const vars = ensureEmittedVars();
        if (vars.size === 0) {
          errors.push(
            `  [${part}.${tokenName}] no .tokens.css found — run \`npm run tokens:components\``
          );
          componentFailed++;
          continue;
        }

        const cssVar = contractTokenToCssVar(tokenName, prefix);
        const semanticVar = dotPathToCssVar(resolvesTo);
        const emitted = vars.get(cssVar);

        if (!emitted) {
          errors.push(
            `  [${part}.${tokenName}] CSS var ${cssVar} not found in generated tokens.css`
          );
          componentFailed++;
          continue;
        }

        if (
          emitted.reference !== semanticVar &&
          !emitted.value.includes(semanticVar)
        ) {
          errors.push(
            `  [${part}.${tokenName}] ${cssVar} does not reference ${semanticVar}`
          );
          componentFailed++;
          continue;
        }

        if (!fallbacksMatch(fallback, emitted.fallback)) {
          if (FIX && emitted.fallback !== null) {
            resolution.fallback = emitted.fallback;
            fixes.push(
              `  [${part}.${tokenName}] fallback ${fallback} → ${emitted.fallback}`
            );
            contractDirty = true;
            componentFixed++;
          } else {
            errors.push(
              `  [${part}.${tokenName}] fallback drift: contract=${fallback} emitted=${
                emitted.fallback ?? '(none)'
              }${FIX ? ' (not fixable: no emitted fallback)' : ' (run with --fix to sync)'}`
            );
            componentFailed++;
          }
          continue;
        }

        totalPassed++;
      }
    }

    if (contractDirty) {
      fs.writeFileSync(
        contractPath,
        JSON.stringify(contract, null, 2) + '\n',
        'utf8'
      );
    }

    if (fixes.length > 0) {
      console.log(`${GREEN}FIXED: ${name}${RESET}`);
      for (const fix of fixes) console.log(fix);
    }

    if (errors.length > 0) {
      const hasHardErrors =
        componentFailed > 0 || (WARN_LEGACY && componentSkipped > 0);
      const label = hasHardErrors
        ? `${RED}FAIL${RESET}`
        : `${YELLOW}WARN${RESET}`;
      console.log(`${label}: ${name}`);
      for (const err of errors) console.log(err);
      if (hasHardErrors) totalFailed++;
      totalSkipped += componentSkipped;
    }

    totalFixed += componentFixed;
  }

  const skippedNote =
    totalSkipped > 0 ? ` (${totalSkipped} legacy flat tokens skipped)` : '';
  const fixedNote = totalFixed > 0 ? `, ${totalFixed} fallback(s) synced` : '';
  const summary =
    totalFailed === 0
      ? `${GREEN}${BOLD}Token fidelity: ${totalPassed} structured tokens verified${fixedNote}${RESET}${skippedNote}`
      : `${RED}${BOLD}Token fidelity: ${totalPassed} passed, ${totalFailed} failed${fixedNote}${RESET}${skippedNote}`;

  console.log(`\n${summary}`);
  process.exit(totalFailed > 0 ? 1 : 0);
}
