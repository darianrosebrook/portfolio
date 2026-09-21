#!/usr/bin/env node
/**
 * Generate the component registry (components-transformed.json) from the
 * implementations on disk, replacing the retired taxonomy-doc pipeline
 * (scripts/buildComponentsFromTaxonomy.mjs, whose input doc no longer exists).
 *
 * Inputs:
 *   1. ui/components/* and ui/modules/* — a directory is a registry member
 *      when it contains {Name}.tsx and {Name}.contract.json (components take
 *      precedence over modules on a name collision). Module directories
 *      without a contract are app chrome, not design-system members.
 *   2. {Name}.contract.json — layer (singular), a11y, description, a2ui.category
 *   3. {Name}.README.md — description fallback when the contract has none
 *   4. the previous registry JSON — legacy seed for categories, aliases,
 *      a11y pitfalls, and Planned (not yet implemented) roadmap entries
 *
 * Usage: node scripts/generateComponentsRegistry.mjs [--generated-at <iso>]
 * Output is deterministic for a fixed --generated-at: entries sorted by name,
 * fixed key order, 2-space JSON. Wired as npm run generate:components-registry.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const OUTPUT_FILE = path.join(
  projectRoot,
  'app/blueprints/component-standards/components-transformed.json'
);
const IMPLEMENTATION_DIRS = ['ui/components', 'ui/modules'];

/** a2ui.contract category → registry category. The single curation point:
 * new entries get their registry category through this map (legacy entries
 * keep theirs). Curate here when a mapping reads wrong in the status matrix. */
const CURATED_CATEGORY_BY_A2UI = {
  action: 'Actions',
  display: 'Display',
  navigation: 'Navigation',
  'form-field': 'Inputs',
  layout: 'Containers',
  overlay: 'Feedback',
  content: 'Textual',
  animation: 'Display',
};
const DEFAULT_CATEGORY = 'Display';

const LAYER_BY_CONTRACT_LAYER = {
  primitive: 'primitives',
  compound: 'compounds',
  composer: 'composers',
};

// Scaffolded READMEs open with this line; it describes the template, not the
// component, so it never becomes a registry description.
const SCAFFOLD_BOILERPLATE = /^scaffolded\b/i;

function normalizeName(s) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function toKebabCase(input) {
  return String(input)
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function buildNormalizedAliases(name, alternativeNames) {
  const set = new Set();
  const base = [
    name,
    ...(Array.isArray(alternativeNames) ? alternativeNames : []),
  ];
  for (const n of base) {
    if (!n) continue;
    const norm = normalizeName(n);
    if (norm) set.add(norm);
  }
  return Array.from(set);
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function readContract(dir, name) {
  return readJson(path.join(dir, `${name}.contract.json`));
}

function readDescriptionFromReadme(dir) {
  const readmeFile = path.join(dir, 'README.md');
  if (!fs.existsSync(readmeFile)) return '';
  const lines = fs.readFileSync(readmeFile, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    if (SCAFFOLD_BOILERPLATE.test(trimmed)) return '';
    return trimmed;
  }
  return '';
}

function scanImplementationDirs() {
  const members = [];
  const missing = [];
  for (const base of IMPLEMENTATION_DIRS) {
    const absBase = path.join(projectRoot, base);
    if (!fs.existsSync(absBase)) continue;
    for (const entry of fs.readdirSync(absBase, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const dir = path.join(absBase, entry.name);
      const hasImpl = fs.existsSync(path.join(dir, `${entry.name}.tsx`));
      const hasContract = fs.existsSync(
        path.join(dir, `${entry.name}.contract.json`)
      );
      if (hasImpl && hasContract) {
        members.push({ name: entry.name, base, dir });
      } else if (base === 'ui/components') {
        // Component dirs are design-system members by convention; a missing
        // contract means the component predates or skipped the contract step.
        missing.push(`${base}/${entry.name}`);
      } else if (hasImpl || hasContract) {
        console.warn(
          `generateComponentsRegistry: skipping ${base}/${entry.name} (no contract pair — app chrome)`
        );
      }
    }
  }
  if (missing.length > 0) {
    console.error(
      'generateComponentsRegistry: component directories missing {Name}.tsx or {Name}.contract.json:\n  ' +
        missing.join('\n  ')
    );
    process.exit(1);
  }
  return members;
}

function legacySeed() {
  const legacy = readJson(OUTPUT_FILE);
  const byNorm = new Map();
  if (legacy && Array.isArray(legacy.components)) {
    for (const item of legacy.components) {
      if (item && item.component)
        byNorm.set(normalizeName(item.component), item);
    }
  }
  return { legacy, byNorm };
}

function mergedAlternativeNames(legacyItem) {
  return Array.isArray(legacyItem?.alternativeNames)
    ? Array.from(new Set(legacyItem.alternativeNames))
    : [];
}

function buildBuiltEntry(member, legacyItem) {
  const { name, base, dir } = member;
  const contract = readContract(dir, name) || {};
  const layer =
    LAYER_BY_CONTRACT_LAYER[contract.layer] ?? legacyItem?.layer ?? 'compounds';
  const description =
    (typeof contract.description === 'string' && contract.description) ||
    readDescriptionFromReadme(dir) ||
    (typeof legacyItem?.description === 'string'
      ? legacyItem.description
      : '') ||
    '';
  const category =
    legacyItem?.category ||
    CURATED_CATEGORY_BY_A2UI[contract?.a2ui?.category] ||
    DEFAULT_CATEGORY;
  const alternativeNames = mergedAlternativeNames(legacyItem);
  const a11y = {
    pitfalls: Array.isArray(legacyItem?.a11y?.pitfalls)
      ? legacyItem.a11y.pitfalls
      : [],
    ...(contract.a11y && typeof contract.a11y === 'object'
      ? contract.a11y
      : {}),
  };

  const entry = {
    component: name,
    id: normalizeName(name),
    slug: toKebabCase(name),
    layer,
    alternativeNames,
    normalizedAliases: buildNormalizedAliases(name, alternativeNames),
    category,
    description,
    a11y,
    status: 'Built',
    paths: { component: `${base}/${name}` },
  };
  if (Array.isArray(legacyItem?.tags) && legacyItem.tags.length > 0) {
    entry.tags = legacyItem.tags;
  }
  return entry;
}

function carryForwardPlanned(legacyItem) {
  const entry = { ...legacyItem };
  // No docs field exists: every registry slug is served by the [slug] route.
  const paths = { ...(entry.paths ?? {}) };
  delete paths.docs;
  if (Object.keys(paths).length > 0) {
    entry.paths = paths;
  } else {
    delete entry.paths;
  }
  // Disk decides Built. A legacy Built entry with no implementation on disk
  // regresses to Planned so the registry never claims a missing component.
  if (!Array.isArray(entry.alternativeNames)) entry.alternativeNames = [];
  if (!Array.isArray(entry.normalizedAliases)) {
    entry.normalizedAliases = buildNormalizedAliases(
      entry.component,
      entry.alternativeNames
    );
  }
  if (!Array.isArray(entry.a11y?.pitfalls)) {
    entry.a11y = { pitfalls: [], ...(entry.a11y ?? {}) };
  }
  if (entry.status === 'Built') {
    entry.status = 'Planned';
    delete entry.paths;
  }
  return entry;
}

function build(generatedAt) {
  const members = scanImplementationDirs();
  const { legacy, byNorm } = legacySeed();

  const builtEntries = [];
  const seenNorms = new Set();
  for (const member of members) {
    const norm = normalizeName(member.name);
    builtEntries.push(buildBuiltEntry(member, byNorm.get(norm)));
    seenNorms.add(norm);
  }

  const carried = [];
  if (legacy && Array.isArray(legacy.components)) {
    for (const item of legacy.components) {
      if (!item || !item.component) continue;
      if (seenNorms.has(normalizeName(item.component))) continue;
      carried.push(carryForwardPlanned(item));
    }
  }

  const components = [...builtEntries, ...carried].sort((a, b) =>
    a.component.localeCompare(b.component)
  );

  const output = {
    components,
    $source: 'scripts/generateComponentsRegistry.mjs',
    $generatedAt: generatedAt,
  };

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2) + '\n');
  console.log(
    `generateComponentsRegistry: wrote ${components.length} entries ` +
      `(${builtEntries.length} Built from disk, ${carried.length} carried forward) ` +
      `to ${path.relative(projectRoot, OUTPUT_FILE)}`
  );
}

function main() {
  const argv = process.argv.slice(2);
  let generatedAt = new Date().toISOString();
  const atIdx = argv.indexOf('--generated-at');
  if (atIdx !== -1) {
    const value = argv[atIdx + 1];
    if (!value || Number.isNaN(Date.parse(value))) {
      console.error(
        'generateComponentsRegistry: --generated-at needs an ISO timestamp'
      );
      process.exit(1);
    }
    generatedAt = new Date(value).toISOString();
  }
  build(generatedAt);
}

main();
