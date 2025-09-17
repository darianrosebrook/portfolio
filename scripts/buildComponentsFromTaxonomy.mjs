#!/usr/bin/env node
/**
 * Build components-transformed.json from docs/design-taxonomy.md
 * - Parses markdown tables under Primitives, Compounds, Composers
 * - Splits "Component" cells like "Modal / Dialog" into separate entries
 * - Merges in synonyms from slashes and parentheses and existing alternativeNames
 * - Writes to app/blueprints/component-standards/components-transformed.json
 */

import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const TAXONOMY_FILE = path.resolve(projectRoot, 'docs/design-taxonomy.md');
const OUTPUT_FILE = path.resolve(
  projectRoot,
  'app/blueprints/component-standards/components-transformed.json'
);

function readFile(p) {
  return fs.readFileSync(p, 'utf8');
}

function tryReadJson(p) {
  try {
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    // ignore
  }
  return null;
}

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

function toPascalCase(input) {
  return String(input)
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

function toTitleCase(s) {
  return s
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function addVariantNames(name) {
  const variants = new Set();
  const trimmed = name.trim();
  variants.add(trimmed);
  // Add spaced variant for camelCase or PascalCase (e.g., IconButton -> Icon Button)
  const spaced = trimmed.replace(/([a-z])([A-Z])/g, '$1 $2');
  if (spaced !== trimmed) variants.add(spaced);
  // Add singular variant if plural with trailing s
  if (/s$/.test(trimmed) && trimmed.length > 3) {
    variants.add(trimmed.replace(/s$/, ''));
  }
  // Hyphen variant for toggle-group like names
  const hyphen = spaced.replace(/\s+/g, '-');
  if (hyphen && hyphen !== trimmed && hyphen !== spaced) variants.add(hyphen);
  return Array.from(variants);
}

function parseTables(md) {
  const lines = md.split(/\r?\n/);
  const sections = [];
  let currentLayer = null;
  let inTable = false;
  let headers = [];
  let rows = [];

  function pushSection() {
    if (currentLayer && rows.length)
      sections.push({ layer: currentLayer, rows });
    rows = [];
  }

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    // Detect layer headings (plain text lines "Primitives", "Compounds", "Composers")
    if (
      /^Primitives\s*$/.test(line) ||
      /^Compounds\s*$/.test(line) ||
      /^Composers\s*$/.test(line)
    ) {
      // Close previous section
      pushSection();
      currentLayer = line.trim().toLowerCase();
      inTable = false;
      headers = [];
      continue;
    }

    // Tables start with a header row like: | Category | Component | Description | Pitfalls / Gotchas |
    if (/^\|/.test(line)) {
      const cells = line
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim());
      if (!inTable) {
        headers = cells.map((h) => h.toLowerCase());
        inTable = true;
        continue;
      }
      // Skip divider row with --- cells
      const isDivider = cells.every(
        (c) => /^-+$/.test(c) || /^:?-+:?$/.test(c)
      );
      if (isDivider) continue;
      // Data row
      const row = {};
      for (let j = 0; j < Math.min(headers.length, cells.length); j += 1) {
        row[headers[j]] = cells[j];
      }
      rows.push(row);
      continue;
    }

    // Blank line or non-table content ends the table
    if (inTable && !/^\|/.test(line)) {
      inTable = false;
    }
  }
  // Push last section
  pushSection();
  return sections;
}

function normalizeCategory(rawCategory) {
  const value = String(rawCategory || '').trim();
  if (!value) return value;
  // Prefer the first segment before a slash (e.g., "Feedback / Status" -> "Feedback")
  const primary = value.split('/')[0].trim();
  // Title-case the primary for consistency
  return toTitleCase(primary);
}

function parsePitfalls(raw) {
  const input = String(raw || '').trim();
  if (!input) return [];
  // Split by semicolons or periods, keep meaningful phrases
  const parts = input
    .split(/[.;]\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  // Deduplicate
  const seen = new Set();
  const out = [];
  for (const p of parts) {
    const key = p.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(p);
    }
  }
  return out;
}

function buildNormalizedAliases(name, alternativeNames) {
  const set = new Set();
  const base = [
    name,
    ...(Array.isArray(alternativeNames) ? alternativeNames : []),
  ];
  for (const n of base) {
    if (!n) continue;
    const raw = String(n);
    const norm = normalizeName(raw);
    if (norm) set.add(norm);
  }
  return Array.from(set);
}

function detectImplementation(componentName) {
  const Name = toPascalCase(componentName);
  const compDir = path.resolve(projectRoot, 'ui/components', Name);
  const modDir = path.resolve(projectRoot, 'ui/modules', Name);
  const existsComp = fs.existsSync(compDir);
  const existsMod = fs.existsSync(modDir);
  if (existsComp) {
    return {
      status: 'Built',
      paths: { component: `ui/components/${Name}` },
    };
  }
  if (existsMod) {
    return {
      status: 'Built',
      paths: { component: `ui/modules/${Name}` },
    };
  }
  return { status: 'Planned', paths: {} };
}

function expandComponentsFromRow(row, layer) {
  const category = normalizeCategory(row['category'] || '');
  const componentCell = row['component'] || '';
  const description = row['description'] || '';
  const pitfallsRaw = row['pitfalls / gotchas'] || '';

  // Split by slash for synonyms/components
  const parts = componentCell
    .split('/')
    .map((p) => p.trim())
    .filter(Boolean);

  // If there are multiple named components, create an entry per main name
  const entries = [];

  const originalForms = new Set(parts);

  // Also treat parentheses as qualifiers: "Breadcrumbs (simple)" -> main "Breadcrumbs", add qualifier as alt
  function mainFrom(part) {
    return part.replace(/\s*\([^)]*\)\s*/g, '').trim();
  }

  const mains = parts.length ? parts.map(mainFrom) : [mainFrom(componentCell)];

  const baseAlts = new Set();
  for (const p of parts) baseAlts.add(p);
  for (const m of mains) addVariantNames(m).forEach((v) => baseAlts.add(v));

  for (const main of mains) {
    const altSet = new Set(baseAlts);
    altSet.delete(main);
    const slug = toKebabCase(main);
    const id = normalizeName(main);
    const a11y = { pitfalls: parsePitfalls(pitfallsRaw) };
    const aliases = Array.from(altSet);
    const normalizedAliases = buildNormalizedAliases(main, aliases);
    const impl = detectImplementation(main);
    const docsPath = `app/blueprints/component-standards/${slug}/page.tsx`;
    entries.push({
      component: main,
      id,
      slug,
      layer,
      alternativeNames: aliases,
      normalizedAliases,
      category,
      description,
      a11y,
      status: impl.status,
      paths: { ...impl.paths, docs: docsPath },
    });
  }

  return entries;
}

function mergeAlternativeNames(targetItems, existingJson) {
  if (!existingJson || !Array.isArray(existingJson.components))
    return targetItems;
  const byNorm = new Map();
  for (const item of existingJson.components) {
    if (!item || !item.component) continue;
    const key = normalizeName(item.component);
    const alt = Array.isArray(item.alternativeNames)
      ? item.alternativeNames
      : [];
    const set = byNorm.get(key) || new Set();
    for (const a of alt) set.add(a);
    byNorm.set(key, set);
  }
  return targetItems.map((it) => {
    const key = normalizeName(it.component);
    const existing = byNorm.get(key);
    if (!existing) return it;
    const merged = new Set([...(it.alternativeNames || [])]);
    for (const a of existing) merged.add(a);
    return { ...it, alternativeNames: Array.from(merged) };
  });
}

function build() {
  if (!fs.existsSync(TAXONOMY_FILE)) {
    console.error('Missing taxonomy file at', TAXONOMY_FILE);
    process.exit(1);
  }
  const md = readFile(TAXONOMY_FILE);
  const sections = parseTables(md);
  const existing = tryReadJson(OUTPUT_FILE);

  let items = [];
  for (const section of sections) {
    for (const row of section.rows) {
      const expanded = expandComponentsFromRow(row, section.layer);
      items.push(...expanded);
    }
  }

  // Deduplicate by component name (normalized)
  const dedup = new Map();
  for (const item of items) {
    const key = normalizeName(item.component);
    if (!dedup.has(key)) {
      dedup.set(key, item);
    } else {
      // Merge alts/descriptions if needed
      const prev = dedup.get(key);
      const alt = new Set([
        ...(prev.alternativeNames || []),
        ...(item.alternativeNames || []),
      ]);
      const description = prev.description || item.description;
      const category = prev.category || item.category;
      dedup.set(key, {
        ...prev,
        alternativeNames: Array.from(alt),
        description,
        category,
      });
    }
  }
  items = Array.from(dedup.values());

  // Merge with existing alternative names
  items = mergeAlternativeNames(items, existing);

  // Sort by component name
  items.sort((a, b) => a.component.localeCompare(b.component));

  const out = {
    components: items.map(
      ({
        component,
        id,
        slug,
        layer,
        alternativeNames,
        normalizedAliases,
        category,
        description,
        a11y,
        status,
        paths,
      }) => ({
        component,
        id,
        slug,
        layer,
        alternativeNames: Array.isArray(alternativeNames)
          ? alternativeNames
          : [],
        normalizedAliases: Array.isArray(normalizedAliases)
          ? normalizedAliases
          : [],
        category,
        description,
        a11y:
          a11y && Array.isArray(a11y.pitfalls)
            ? { pitfalls: a11y.pitfalls }
            : { pitfalls: [] },
        status: status || 'Planned',
        paths: paths || {},
      })
    ),
    $source: 'docs/design-taxonomy.md',
    $generatedAt: new Date().toISOString(),
  };

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${items.length} components to`, OUTPUT_FILE);
}

build();
