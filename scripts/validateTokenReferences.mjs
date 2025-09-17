#!/usr/bin/env node

/**
 * Comprehensive Design Token Reference Validator
 *
 * Validates that design token references resolve correctly across:
 * - JSON token files (DTCG-like format)
 * - CSS custom properties (--token-name)
 * - SCSS variables ($var) and CSS var() usages
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let glob;
try {
  // Prefer ESM import if available; fall back to require
  ({ glob } = await import('glob'));
} catch {
  glob = require('glob').glob;
}

const PROJECT_ROOT = process.cwd();
const TOKENS_DIR = path.join(PROJECT_ROOT, 'ui', 'designTokens');
const CSS_TOKENS_FILE = path.join(PROJECT_ROOT, 'app', 'designTokens.scss');

// Allowlists for variables that are generated or come from external sources
const ALLOWED_CSS_VARIABLES = [
  '--font-inter', // Next.js font loading
  '--font-nohemi', // Next.js font loading
  '--semantic-', // Generated semantic tokens (prefix)
  '--core-', // Core tokens (prefix)
  '--color-core-', // Color core tokens (prefix)
  '--colorSwatch-', // Color swatch tokens (prefix)
  '--color-', // Color tokens (prefix)
  '--font-weight-', // Font weight tokens (prefix)
  '--font-size-', // Font size tokens (prefix)
  '--text-', // Text size tokens (prefix)
  '--heading-', // Heading tokens (prefix)
  '--body-', // Body text tokens (prefix)
  '--line-height-', // Line height tokens (prefix)
  '--space-', // Spacing tokens (prefix)
  '--radius-', // Radius tokens (prefix)
  '--surface-', // Surface color tokens (prefix)
  '--border-', // Border tokens (prefix)
  '--shadow-', // Shadow tokens (prefix)
  '--font-mono', // Font family tokens
  '--font-lineHeight-', // Font line height tokens (prefix)
  '--size-', // Size tokens (prefix)
  '--input-', // Input component tokens (prefix)
  '--label-', // Label component tokens (prefix)
  '--image-', // Image component tokens (prefix)
  '--walkthrough-', // Walkthrough component tokens (prefix)
  '--visuallyHidden-', // VisuallyHidden component tokens (prefix)
  '--focus-ring', // Focus ring tokens
  '--focus-ring-offset', // Focus ring offset tokens
  '--truncate-', // Truncate component tokens (prefix)
  '--toggle-', // Toggle component tokens (prefix)
  '--spinner-', // Spinner component tokens (prefix)
  '--skeleton-', // Skeleton component tokens (prefix)
  '--select-', // Select component tokens (prefix)
  '--animatedLink-', // AnimatedLink component tokens (prefix)
  '--list-', // List component tokens (prefix)
  '--field-', // Field component tokens (prefix)
  '--divider-', // Divider component tokens (prefix)
  '--details-', // Details component tokens (prefix)
  '--transition-', // Transition tokens (prefix)
  '--blockquote-', // Blockquote component tokens (prefix)
  '--badge-', // Badge component tokens (prefix)
  '--aspect-ratio', // Aspect ratio tokens
  '--aspectRatio-', // AspectRatio component tokens (prefix)
  '--grid-gap-', // Grid gap tokens (prefix)
  '--alert-', // Alert component tokens (prefix)
  '--font-family-', // Font family tokens (prefix)
  '--opacity-', // Opacity tokens (prefix)
  '--component-', // Component-specific tokens (prefix)
  '--sidebar-', // Sidebar-specific tokens (prefix)
  '--popover-', // Popover-specific tokens (prefix)
  '--dialog-', // Dialog-specific tokens (prefix)
  '--elevation', // Elevation tokens
];

function isAllowedCssVariable(varName) {
  return ALLOWED_CSS_VARIABLES.some((prefix) => varName.startsWith(prefix));
}

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(color, msg) {
  console.log(color + msg + colors.reset);
}

function parseTokenReference(value) {
  if (typeof value !== 'string') return null;
  const t = value.trim();
  if (!t.startsWith('{') || !t.endsWith('}')) return null;
  const inner = t.slice(1, -1).trim();
  if (!inner || /\s/.test(inner)) return null;
  return inner;
}

function hasInterpolatedReference(value) {
  if (typeof value !== 'string') return false;
  const matches = value.match(/\{[^}]+\}/g);
  if (!matches) return false;
  return !(matches.length === 1 && matches[0] === value.trim());
}

function extractTokensFromObject(obj, fileName) {
  const definitions = new Map();
  const references = [];
  const issues = [];

  function walk(node, cur = '') {
    if (!node || typeof node !== 'object') return;

    if (Object.prototype.hasOwnProperty.call(node, '$value')) {
      definitions.set(cur, {
        value: node.$value,
        type: node.$type,
        file: fileName,
      });

      const ref = parseTokenReference(node.$value);
      if (ref) references.push({ from: cur, to: ref, file: fileName });
      if (
        typeof node.$value === 'string' &&
        hasInterpolatedReference(node.$value)
      ) {
        issues.push({
          type: 'interpolated-reference',
          file: fileName,
          path: cur,
          message: node.$value,
        });
      }
    }

    for (const [k, v] of Object.entries(node)) {
      if (!k.startsWith('$') && typeof v === 'object') {
        walk(v, cur ? `${cur}.${k}` : k);
      }
    }
  }

  walk(obj, '');
  return { definitions, references, issues };
}

function parseJsonTokens() {
  if (!fs.existsSync(TOKENS_DIR)) {
    return {
      allTokens: new Map(),
      allReferences: new Map(),
      issues: [{ type: 'missing-dir', message: TOKENS_DIR }],
    };
  }
  const files = fs
    .readdirSync(TOKENS_DIR)
    .filter((f) => f.endsWith('.tokens.json') && f !== 'designTokens.json')
    .map((f) => path.join(TOKENS_DIR, f));

  const allTokens = new Map();
  const allReferences = new Map();
  const issues = [];

  for (const filePath of files) {
    try {
      const tokens = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const {
        definitions,
        references,
        issues: fileIssues,
      } = extractTokensFromObject(tokens, path.basename(filePath));

      // Check for duplicates within the same file first
      const fileTokens = new Map();
      for (const [p, d] of definitions) {
        if (fileTokens.has(p)) {
          issues.push({
            type: 'duplicate-definition',
            file: path.basename(filePath),
            path: p,
            message: `Duplicate definition within ${path.basename(filePath)}`,
          });
        }
        fileTokens.set(p, d);

        // Allow semantic tokens to override core tokens (this is expected)
        // Only flag as duplicate if it's not a semantic override
        if (allTokens.has(p) && !path.basename(filePath).includes('semantic')) {
          issues.push({
            type: 'duplicate-definition',
            file: path.basename(filePath),
            path: p,
            message: `Already defined in another file`,
          });
        }
        allTokens.set(p, d);
      }
      allReferences.set(path.basename(filePath), references);
      issues.push(...fileIssues);
    } catch (e) {
      issues.push({
        type: 'parse-error',
        file: path.basename(filePath),
        message: e.message,
      });
    }
  }
  return { allTokens, allReferences, issues };
}

async function parseCssCustomProperties() {
  const properties = new Map();
  const issues = [];
  // Scan all scss/css files for custom property definitions, not just the generated tokens file
  const files = await glob('**/*.{scss,css}', {
    cwd: PROJECT_ROOT,
    ignore: ['node_modules/**', '.next/**'],
  });
  const re = /--([a-zA-Z0-9-]+):\s*([^;]+);/g;
  for (const f of files) {
    try {
      const content = fs.readFileSync(path.join(PROJECT_ROOT, f), 'utf8');
      let m;
      while ((m = re.exec(content)) !== null) {
        const name = `--${m[1]}`;
        if (!properties.has(name)) {
          properties.set(name, { value: m[2].trim(), file: f });
        }
      }
    } catch (e) {
      issues.push({ type: 'file-read-error', file: f, message: e.message });
    }
  }
  return { properties, issues };
}

async function findCssVarUsage() {
  const files = await glob('**/*.{scss,css}', {
    cwd: PROJECT_ROOT,
    ignore: ['node_modules/**', '.next/**'],
  });
  const usage = new Map();
  for (const f of files) {
    const content = fs.readFileSync(path.join(PROJECT_ROOT, f), 'utf8');
    const re = /var\(\s*(--[a-zA-Z0-9-]+)(?:\s*,\s*([^)]+))?\s*\)/g;
    let m;
    while ((m = re.exec(content)) !== null) {
      const name = m[1];
      if (!usage.has(name)) usage.set(name, []);
      usage
        .get(name)
        .push({ file: f, line: content.slice(0, m.index).split('\n').length });
    }
  }
  return usage;
}

async function findScssVariables() {
  const files = await glob('**/*.scss', {
    cwd: PROJECT_ROOT,
    ignore: ['node_modules/**', '.next/**'],
  });
  const defs = new Map();
  const uses = new Map();
  for (const f of files) {
    const content = fs.readFileSync(path.join(PROJECT_ROOT, f), 'utf8');
    let m;
    const defRe = /\$([a-zA-Z0-9-_]+):\s*([^;]+);/g;
    while ((m = defRe.exec(content)) !== null) {
      const name = `$${m[1]}`;
      if (!defs.has(name)) defs.set(name, []);
      defs.get(name).push({
        file: f,
        line: content.slice(0, m.index).split('\n').length,
        value: m[2].trim(),
      });
    }
    const useRe = /\$([a-zA-Z0-9-_]+)/g;
    while ((m = useRe.exec(content)) !== null) {
      const name = `$${m[1]}`;
      if (!uses.has(name)) uses.set(name, []);
      uses
        .get(name)
        .push({ file: f, line: content.slice(0, m.index).split('\n').length });
    }
  }
  return { defs, uses };
}

function validate(
  allTokens,
  allReferences,
  cssProps,
  cssVarUsage,
  scssDefs,
  scssUses
) {
  const issues = [];

  // JSON token refs
  for (const [file, refs] of allReferences) {
    for (const r of refs) {
      if (!allTokens.has(r.to)) {
        issues.push({
          type: 'unresolved-token-reference',
          file,
          from: r.from,
          to: r.to,
        });
      }
    }
  }

  // CSS var() usage must exist (skip allowlisted variables)
  for (const [name, uses] of cssVarUsage) {
    if (!cssProps.has(name) && !isAllowedCssVariable(name)) {
      for (const u of uses)
        issues.push({
          type: 'undefined-css-variable',
          variable: name,
          file: u.file,
          line: u.line,
        });
    }
  }

  // SCSS variable usage must be defined somewhere
  for (const [name, uses] of scssUses) {
    if (!scssDefs.has(name)) {
      for (const u of uses)
        issues.push({
          type: 'undefined-scss-variable',
          variable: name,
          file: u.file,
          line: u.line,
        });
    }
  }

  return issues;
}

function summarize(issues, counts) {
  log(colors.bold + colors.cyan, '\n🔍 Design Token Reference Validation');
  console.log(`  JSON tokens: ${counts.tokens}`);
  console.log(`  CSS custom properties: ${counts.cssProps}`);
  console.log(`  CSS var() names used: ${counts.cssVarUsage}`);
  console.log(`  SCSS variables defined: ${counts.scssDefs}`);

  if (issues.length === 0) {
    log(colors.bold + colors.green, '\n✅ No issues found.');
    return true;
  }

  log(colors.bold + colors.yellow, `\n⚠️  Found ${issues.length} issue(s):`);
  const byType = new Map();
  for (const i of issues) {
    if (!byType.has(i.type)) byType.set(i.type, []);
    byType.get(i.type).push(i);
  }
  for (const [type, list] of byType) {
    log(colors.yellow, `\n• ${type} (${list.length})`);
    for (const i of list.slice(0, 30)) {
      const details = [];
      if (i.file) details.push(i.file);
      if (i.line) details.push(`:${i.line}`);
      if (i.path) details.push(` ${i.path}`);
      if (i.variable) details.push(` ${i.variable}`);
      if (i.from) details.push(` ${i.from}`);
      if (i.to) details.push(` → ${i.to}`);
      if (i.message) details.push(` (${i.message})`);
      console.log(`  -${details.join('')}`);
    }
    if (list.length > 10) console.log(`  ...and ${list.length - 10} more`);
  }
  return false;
}

async function main() {
  log(
    colors.bold + colors.blue,
    '🚀 Starting comprehensive token validation...'
  );

  const { allTokens, allReferences, issues: jsonIssues } = parseJsonTokens();
  const { properties: cssProps } = await parseCssCustomProperties();
  const cssVarUsage = await findCssVarUsage();
  const { defs: scssDefs, uses: scssUses } = await findScssVariables();

  const issues = [
    ...jsonIssues,
    ...validate(
      allTokens,
      allReferences,
      cssProps,
      cssVarUsage,
      scssDefs,
      scssUses
    ),
  ];

  const ok = summarize(issues, {
    tokens: allTokens.size,
    cssProps: cssProps.size,
    cssVarUsage: cssVarUsage.size,
    scssDefs: scssDefs.size,
  });

  process.exit(ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
