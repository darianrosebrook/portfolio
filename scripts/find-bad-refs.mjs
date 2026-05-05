#!/usr/bin/env node
/**
 * Find all {path.reference} values in component tokens.json files
 * that generate CSS vars not present in designTokens.scss.
 */
import { readFileSync, readdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const COMPONENTS_DIR = path.join(ROOT, 'ui', 'components');
const DESIGN_TOKENS_SCSS = path.join(ROOT, 'app', 'designTokens.scss');

// Build set of defined CSS var names
const cssContent = readFileSync(DESIGN_TOKENS_SCSS, 'utf8');
const definedVars = new Set();
for (const [, name] of cssContent.matchAll(/--([a-z][a-z0-9-]+)\s*:/g)) {
  definedVars.add(name);
}

// Replicate the CSS var name generation from generateCSSTokens.mjs
function determineNamespace(tokenPath) {
  if (tokenPath.startsWith('core.')) return 'core';
  if (tokenPath.startsWith('semantic.')) return 'semantic';
  const corePatterns = [
    /^color\.(mode|palette|datavis)/,
    /^typography\.(fontFamily|weight|ramp|lineHeight|letterSpacing|features)/,
    /^spacing\.size/,
    /^elevation\.(level|offset|blur|spread)/,
    /^opacity\./,
    /^dimension\./,
    /^shape\.(radius|borderWidth|borderStyle|border\.width|border\.style)/,
    /^motion\.(duration|easing|keyframes|delay|stagger)/,
    /^scale\./,
    /^density\./,
    /^layer\./,
    /^layout\./,
    /^icon\./,
    /^effect\./,
  ];
  if (corePatterns.some((p) => p.test(tokenPath))) return 'core';
  return 'semantic';
}

function tokenPathToCSSVar(tokenPath) {
  const namespace = determineNamespace(tokenPath);
  const pathWithoutNamespace = tokenPath.replace(/^(core|semantic)\./, '');
  const cssVarName = pathWithoutNamespace
    .replace(/\./g, '-')
    .replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())
    .replace(/[\s_]/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
  const namespacePrefix = namespace ? `${namespace}-` : '';
  return '--' + namespacePrefix + cssVarName;
}

// Collect all {path.ref} values from a token value (recursively)
function collectRefs(val, refs = new Set()) {
  if (typeof val === 'string') {
    const m = val.match(/^\{([^}]+)\}$/);
    if (m) refs.add(m[1]);
  } else if (Array.isArray(val)) {
    for (const v of val) collectRefs(v, refs);
  } else if (val && typeof val === 'object') {
    for (const v of Object.values(val)) collectRefs(v, refs);
  }
  return refs;
}

// Map: bad token path → Set of component names
const badRefToComponents = new Map();

const componentDirs = readdirSync(COMPONENTS_DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

for (const name of componentDirs) {
  const jsonPath = path.join(COMPONENTS_DIR, name, `${name}.tokens.json`);
  if (!existsSync(jsonPath)) continue;

  let data;
  try {
    data = JSON.parse(readFileSync(jsonPath, 'utf8'));
  } catch {
    continue;
  }

  const refs = collectRefs(data.tokens ?? data);
  for (const ref of refs) {
    const cssVar = tokenPathToCSSVar(ref);
    const varName = cssVar.slice(2); // strip --
    if (!definedVars.has(varName)) {
      if (!badRefToComponents.has(ref)) badRefToComponents.set(ref, new Set());
      badRefToComponents.get(ref).add(name);
    }
  }
}

console.log('Bad token path references that generate undefined CSS vars:\n');
for (const [ref, comps] of [...badRefToComponents.entries()].sort()) {
  const cssVar = tokenPathToCSSVar(ref);
  console.log(`${ref}`);
  console.log(`  → ${cssVar} (MISSING)`);
  console.log(`  Components: ${[...comps].sort().join(', ')}`);
  console.log();
}
console.log(`Total: ${badRefToComponents.size} bad references`);
