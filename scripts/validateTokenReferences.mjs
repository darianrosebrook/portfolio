#!/usr/bin/env node

/**
 * Comprehensive Design Token Reference Validator
 *
 * Validates that design token references resolve correctly across:
 * - JSON token files (DTCG-like format with namespace support)
 * - CSS custom properties (--token-name)
 * - SCSS variables ($var) and CSS var() usages
 *
 * FIXED: Now properly handles namespaced tokens (core.*, semantic.*)
 * FIXED: Supports modular token structure (core/ and semantic/ subdirectories)
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let glob;
try {
  ({ glob } = await import('glob'));
} catch {
  glob = require('glob').glob;
}

const PROJECT_ROOT = process.cwd();
const TOKENS_DIR = path.join(PROJECT_ROOT, 'ui', 'designTokens');
const COMPOSED_TOKENS_FILE = path.join(TOKENS_DIR, 'designTokens.json');
const CSS_TOKENS_FILE = path.join(PROJECT_ROOT, 'app', 'designTokens.scss');

// Allowlists for variables that are generated or come from external sources
const ALLOWED_CSS_VARIABLES = [
  '--font-inter',
  '--font-nohemi',
  '--semantic-',
  '--core-',
  '--color-core-',
  '--colorSwatch-',
  '--color-',
  '--font-weight-',
  '--font-size-',
  '--text-',
  '--heading-',
  '--body-',
  '--line-height-',
  '--space-',
  '--radius-',
  '--surface-',
  '--border-',
  '--shadow-',
  '--font-mono',
  '--font-lineHeight-',
  '--size-',
  '--input-',
  '--label-',
  '--image-',
  '--walkthrough-',
  '--visuallyHidden-',
  '--focus-ring',
  '--focus-ring-offset',
  '--truncate-',
  '--toggle-',
  '--spinner-',
  '--skeleton-',
  '--select-',
  '--animatedLink-',
  '--list-',
  '--field-',
  '--divider-',
  '--details-',
  '--transition-',
  '--blockquote-',
  '--badge-',
  '--aspect-ratio',
  '--aspectRatio-',
  '--grid-gap-',
  '--alert-',
  '--font-family-',
  '--opacity-',
  '--component-',
  '--sidebar-',
  '--popover-',
  '--dialog-',
  '--elevation',
  '--view-transition-name', // CSS View Transitions API
  '--accordion-content-height', // Dynamically set in Accordion component
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

/**
 * Extract tokens from object with namespace support
 */
function extractTokensFromObject(obj, namespace = '', fileName = '') {
  const definitions = new Map();
  const references = [];
  const issues = [];

  function walk(node, cur = '') {
    if (!node || typeof node !== 'object') return;

    if (Object.prototype.hasOwnProperty.call(node, '$value')) {
      const fullPath = namespace ? `${namespace}.${cur}` : cur;
      definitions.set(fullPath, {
        value: node.$value,
        type: node.$type,
        file: fileName,
      });

      const ref = parseTokenReference(node.$value);
      if (ref) {
        // Resolve reference - if it doesn't start with namespace, try adding it
        let resolvedRef = ref;
        if (!ref.startsWith('core.') && !ref.startsWith('semantic.')) {
          // Try with current namespace first
          resolvedRef = namespace ? `${namespace}.${ref}` : ref;
        }
        references.push({ from: fullPath, to: resolvedRef, original: ref });
      }

      if (
        typeof node.$value === 'string' &&
        hasInterpolatedReference(node.$value)
      ) {
        issues.push({
          type: 'interpolated-reference',
          file: fileName,
          path: fullPath,
          message: node.$value,
        });
      }

      // Also check $extensions for references
      if (node.$extensions) {
        const extensions = node.$extensions;
        if (extensions.design?.paths) {
          const paths = extensions.design.paths;
          for (const [key, value] of Object.entries(paths)) {
            if (typeof value === 'string') {
              const ref = parseTokenReference(value);
              if (ref) {
                let resolvedRef = ref;
                if (!ref.startsWith('core.') && !ref.startsWith('semantic.')) {
                  resolvedRef = namespace ? `${namespace}.${ref}` : ref;
                }
                references.push({
                  from: `${fullPath}[${key}]`,
                  to: resolvedRef,
                  original: ref,
                });
              }
            }
          }
        }
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

/**
 * Parse tokens from composed designTokens.json file (preferred)
 * OR from individual files with namespace detection
 */
function parseJsonTokens() {
  const allTokens = new Map();
  const allReferences = new Map();
  const issues = [];

  // Try to use composed file first (has namespaces)
  if (fs.existsSync(COMPOSED_TOKENS_FILE)) {
    try {
      const tokens = JSON.parse(fs.readFileSync(COMPOSED_TOKENS_FILE, 'utf8'));

      // Process core and semantic separately
      if (tokens.core) {
        const {
          definitions,
          references,
          issues: fileIssues,
        } = extractTokensFromObject(tokens.core, 'core', 'designTokens.json');
        for (const [p, d] of definitions) {
          allTokens.set(p, d);
        }
        const existingRefs = allReferences.get('designTokens.json') || [];
        allReferences.set('designTokens.json', [
          ...existingRefs,
          ...references,
        ]);
        issues.push(...fileIssues);
      }

      if (tokens.semantic) {
        const {
          definitions,
          references,
          issues: fileIssues,
        } = extractTokensFromObject(
          tokens.semantic,
          'semantic',
          'designTokens.json'
        );
        for (const [p, d] of definitions) {
          allTokens.set(p, d);
        }
        const existingRefs = allReferences.get('designTokens.json') || [];
        allReferences.set('designTokens.json', [
          ...existingRefs,
          ...references,
        ]);
        issues.push(...fileIssues);
      }

      log(
        colors.green,
        `✅ Loaded ${allTokens.size} tokens from composed file`
      );
      return { allTokens, allReferences, issues };
    } catch (e) {
      issues.push({
        type: 'parse-error',
        file: 'designTokens.json',
        message: e.message,
      });
    }
  }

  // Fallback: Read from individual files (modular structure)
  if (!fs.existsSync(TOKENS_DIR)) {
    return {
      allTokens: new Map(),
      allReferences: new Map(),
      issues: [{ type: 'missing-dir', message: TOKENS_DIR }],
    };
  }

  // Read modular files recursively
  function readDir(dir, namespace = '') {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const dirent of files) {
      const fullPath = path.join(dir, dirent.name);
      if (dirent.isDirectory() && !dirent.name.startsWith('_')) {
        const subNamespace = namespace
          ? `${namespace}.${dirent.name}`
          : dirent.name;
        readDir(fullPath, subNamespace);
      } else if (
        dirent.isFile() &&
        dirent.name.endsWith('.tokens.json') &&
        !dirent.name.startsWith('_')
      ) {
        try {
          const tokens = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
          const fileName = path.relative(TOKENS_DIR, fullPath);
          const {
            definitions,
            references,
            issues: fileIssues,
          } = extractTokensFromObject(tokens, namespace, fileName);

          for (const [p, d] of definitions) {
            if (allTokens.has(p)) {
              issues.push({
                type: 'duplicate-definition',
                file: fileName,
                path: p,
                message: `Already defined in another file`,
              });
            }
            allTokens.set(p, d);
          }
          allReferences.set(fileName, references);
          issues.push(...fileIssues);
        } catch (e) {
          issues.push({
            type: 'parse-error',
            file: path.relative(TOKENS_DIR, fullPath),
            message: e.message,
          });
        }
      }
    }
  }

  readDir(TOKENS_DIR);

  return { allTokens, allReferences, issues };
}

async function parseCssCustomProperties() {
  const properties = new Map();
  const issues = [];
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

/**
 * Parse component token files and extract CSS variables they generate
 */
async function parseComponentTokens() {
  const componentCssVars = new Map();
  const componentTokenRefs = [];
  const issues = [];

  // Find all component token files
  const tokenFiles = await glob('**/*.tokens.json', {
    cwd: PROJECT_ROOT,
    ignore: ['node_modules/**', '.next/**', 'ui/designTokens/**'],
  });

  for (const tokenFile of tokenFiles) {
    try {
      const fullPath = path.join(PROJECT_ROOT, tokenFile);
      const tokens = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

      if (!tokens.prefix || !tokens.tokens) {
        continue; // Not a component token file
      }

      const prefix = tokens.prefix;

      // Extract references from component tokens
      function extractRefs(obj, namespace = '') {
        for (const [key, value] of Object.entries(obj)) {
          if (typeof value === 'string') {
            const ref = parseTokenReference(value);
            if (ref) {
              componentTokenRefs.push({
                from: `${prefix}.${namespace ? `${namespace}.${key}` : key}`,
                to: ref,
                file: tokenFile,
              });
            }
          } else if (
            value &&
            typeof value === 'object' &&
            !Array.isArray(value)
          ) {
            extractRefs(value, namespace ? `${namespace}.${key}` : key);
          }
        }
      }

      extractRefs(tokens.tokens);

      // Check for generated SCSS file and extract CSS variables from it
      const generatedScssPath = fullPath.replace(
        '.tokens.json',
        '.tokens.generated.scss'
      );
      if (fs.existsSync(generatedScssPath)) {
        const scssContent = fs.readFileSync(generatedScssPath, 'utf8');
        // Match CSS variables inside @mixin vars { ... } blocks
        // Also match variables defined outside mixins
        const varRe = /--([a-zA-Z0-9-]+):\s*([^;]+);/g;
        let match;
        while ((match = varRe.exec(scssContent)) !== null) {
          const name = `--${match[1]}`;
          // Also register kebab-case version if camelCase
          const kebabName = name
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .toLowerCase();

          if (!componentCssVars.has(name)) {
            componentCssVars.set(name, {
              value: match[2].trim(),
              file: generatedScssPath.replace(PROJECT_ROOT + '/', ''),
              component: prefix,
            });
          }

          // Also add kebab-case variant if different
          if (kebabName !== name && !componentCssVars.has(kebabName)) {
            componentCssVars.set(kebabName, {
              value: match[2].trim(),
              file: generatedScssPath.replace(PROJECT_ROOT + '/', ''),
              component: prefix,
              alias: name, // Mark as alias
            });
          }
        }
      }
    } catch (e) {
      issues.push({
        type: 'component-token-parse-error',
        file: tokenFile,
        message: e.message,
      });
    }
  }

  return { cssVars: componentCssVars, refs: componentTokenRefs, issues };
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
  scssUses,
  componentCssVars,
  componentTokenRefs
) {
  const issues = [];

  // JSON token refs - check with namespace resolution
  for (const [file, refs] of allReferences) {
    for (const r of refs) {
      // Try exact match first
      if (allTokens.has(r.to)) {
        continue;
      }

      // Try without namespace prefixes
      const parts = r.to.split('.');
      if (
        parts.length > 1 &&
        (parts[0] === 'core' || parts[0] === 'semantic')
      ) {
        const withoutNs = parts.slice(1).join('.');
        if (allTokens.has(withoutNs)) {
          // Reference uses namespace but token doesn't - this is OK
          continue;
        }
      }

      // Try with namespace prefix
      if (!r.to.startsWith('core.') && !r.to.startsWith('semantic.')) {
        const coreVersion = `core.${r.to}`;
        const semanticVersion = `semantic.${r.to}`;
        if (allTokens.has(coreVersion) || allTokens.has(semanticVersion)) {
          continue;
        }
      }

      // Not found
      issues.push({
        type: 'unresolved-token-reference',
        file,
        from: r.from,
        to: r.to,
        original: r.original || r.to,
      });
    }
  }

  // Validate component token references
  for (const ref of componentTokenRefs) {
    if (!allTokens.has(ref.to)) {
      // Try namespace resolution
      const parts = ref.to.split('.');
      let found = false;

      if (
        parts.length > 1 &&
        (parts[0] === 'core' || parts[0] === 'semantic')
      ) {
        const withoutNs = parts.slice(1).join('.');
        if (allTokens.has(withoutNs)) {
          found = true;
        }
      }

      if (
        !found &&
        !ref.to.startsWith('core.') &&
        !ref.to.startsWith('semantic.')
      ) {
        const coreVersion = `core.${ref.to}`;
        const semanticVersion = `semantic.${ref.to}`;
        if (allTokens.has(coreVersion) || allTokens.has(semanticVersion)) {
          found = true;
        }
      }

      if (!found) {
        issues.push({
          type: 'unresolved-component-token-reference',
          file: ref.file,
          from: ref.from,
          to: ref.to,
        });
      }
    }
  }

  // CSS var() usage must exist (skip allowlisted variables)
  // Merge component CSS vars into cssProps for validation
  const allCssProps = new Map([...cssProps]);
  for (const [name, info] of componentCssVars) {
    if (!allCssProps.has(name)) {
      allCssProps.set(name, info);
    }
  }

  for (const [name, uses] of cssVarUsage) {
    // Try exact match first
    if (allCssProps.has(name)) {
      continue;
    }

    // Try kebab-case variant if camelCase
    const kebabName = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    if (kebabName !== name && allCssProps.has(kebabName)) {
      continue;
    }

    // Try camelCase variant if kebab-case
    const camelName = name.replace(/-([a-z])/g, (_, letter) =>
      letter.toUpperCase()
    );
    if (camelName !== name && allCssProps.has(camelName)) {
      continue;
    }

    // Check if it's an allowed variable
    if (isAllowedCssVariable(name)) {
      continue;
    }

    // Not found
    for (const u of uses)
      issues.push({
        type: 'undefined-css-variable',
        variable: name,
        file: u.file,
        line: u.line,
      });
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
  console.log(`  Component tokens: ${counts.componentTokens || 0}`);
  console.log(`  CSS custom properties: ${counts.cssProps}`);
  console.log(`  Component CSS variables: ${counts.componentCssVars || 0}`);
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
    for (const i of list.slice(0, 20)) {
      const details = [];
      if (i.file) details.push(i.file);
      if (i.line) details.push(`:${i.line}`);
      if (i.path) details.push(` ${i.path}`);
      if (i.variable) details.push(` ${i.variable}`);
      if (i.from) details.push(` ${i.from}`);
      if (i.to) details.push(` → ${i.to}`);
      if (i.original && i.original !== i.to)
        details.push(` (original: ${i.original})`);
      if (i.message) details.push(` (${i.message})`);
      console.log(`  -${details.join('')}`);
    }
    if (list.length > 20) console.log(`  ...and ${list.length - 20} more`);
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
  const {
    cssVars: componentCssVars,
    refs: componentTokenRefs,
    issues: componentIssues,
  } = await parseComponentTokens();

  const issues = [
    ...jsonIssues,
    ...componentIssues,
    ...validate(
      allTokens,
      allReferences,
      cssProps,
      cssVarUsage,
      scssDefs,
      scssUses,
      componentCssVars,
      componentTokenRefs
    ),
  ];

  const ok = summarize(issues, {
    tokens: allTokens.size,
    componentTokens: componentTokenRefs.length,
    cssProps: cssProps.size,
    componentCssVars: componentCssVars.size,
    cssVarUsage: cssVarUsage.size,
    scssDefs: scssDefs.size,
  });

  process.exit(ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
