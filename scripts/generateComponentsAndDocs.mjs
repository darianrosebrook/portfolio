#!/usr/bin/env node
/**
 * Generate Components and Docs from components-transformed.json
 *
 * - Scaffolds UI components with our CLI
 * - Creates docs pages for each component under app/blueprints/component-standards/[slug]/page.tsx
 *
 * Usage:
 *   node scripts/generateComponentsAndDocs.mjs [--dry-run] [--limit 10] [--force]
 */

import fs from 'fs';
import path from 'path';
import url from 'url';
import { spawnSync } from 'child_process';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const args = { dryRun: false, limit: null, force: false };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--force') args.force = true;
    else if (arg === '--limit') {
      args.limit = Number(argv[i + 1]);
      i += 1;
    }
  }
  return args;
}

function toPascalCase(input) {
  return input
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

function toKebabCase(input) {
  return input
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function chooseLayer(name) {
  const n = name.toLowerCase();
  const composers = [
    'modal',
    'dialog',
    'drawer',
    'popover',
    'tooltip',
    'select',
    'combo box',
    'combobox',
    'menu',
    'context menu',
    'navigation',
    'tabs',
    'tab',
    'toolbar',
    'table',
    'editor',
    'tiptap',
  ];
  if (composers.some((k) => n.includes(k))) return 'composer';
  // Many are better as compound by default
  return 'compound';
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function writeFile(p, content, force) {
  if (!force && fs.existsSync(p)) return false;
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, content, 'utf8');
  return true;
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function main() {
  const args = parseArgs(process.argv);
  const sourcePath = path.resolve(
    projectRoot,
    'app/blueprints/component-standards/components-transformed.json'
  );
  if (!fs.existsSync(sourcePath)) {
    console.error('Could not find components-transformed.json at', sourcePath);
    process.exit(1);
  }
  const json = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  const items = Array.isArray(json.components) ? json.components : [];
  const limited = args.limit ? items.slice(0, args.limit) : items;

  console.log(
    `Generating ${limited.length} components and docs${args.dryRun ? ' (dry run)' : ''}${args.force ? ' [force docs overwrite]' : ''}...`
  );

  const docsBase = path.resolve(
    projectRoot,
    'app/blueprints/component-standards'
  );

  let createdCount = 0;

  for (const item of limited) {
    const name = item.component || 'Component';
    const Name = toPascalCase(name);
    const slug = toKebabCase(name);
    const layer = item.layer || chooseLayer(name); // primitives|compounds|composers
    const complexity = layer; // keep string as-is
    const category = item.category || '';
    const description = item.description || '';
    const alt = Array.isArray(item.alternativeNames)
      ? item.alternativeNames
      : [];
    const status = item.status || '';
    const a11yPitfalls = Array.isArray(item?.a11y?.pitfalls)
      ? item.a11y.pitfalls
      : [];

    // Scaffold component
    if (!args.dryRun) {
      const res = spawnSync(
        'node',
        ['scripts/scaffoldComponent.mjs', '--name', Name, '--layer', layer],
        { cwd: path.resolve(projectRoot), stdio: 'inherit' }
      );
      if (res.status !== 0) {
        console.error('Scaffold failed for', Name);
      }
    } else {
      console.log(`[dry-run] scaffold ${Name} (${layer})`);
    }

    // Build tags/keywords (include complexity)
    const tags = Array.from(
      new Set(
        [Name, slug, category, complexity, `complexity-${complexity}`, ...alt]
          .filter(Boolean)
          .map((t) => String(t))
      )
    );

    // Create docs page
    const pageDir = path.join(docsBase, slug);
    const pageFile = path.join(pageDir, 'page.tsx');
    const pageContent = `import ComponentDocPage from '../_components/ComponentDocPage';
import { getComponentBySlug, getRelatedComponents } from '../_lib/componentsData';

export const metadata = {
  title: '${Name} | Component Standards',
  description: ${JSON.stringify(description)},
  keywords: ${JSON.stringify(tags)},
  complexity: '${complexity}',
};

export default function Page() {
  const item = getComponentBySlug('${slug}');
  const related = getRelatedComponents('${slug}', { limit: 6 });
  if (!item) return null;
  return <ComponentDocPage item={item} related={related} />;
}
`;

    const wrote = writeFile(pageFile, pageContent, args.force);
    if (wrote) {
      createdCount += 1;
      console.log(
        (args.force ? 'UPDATED ' : 'CREATED ') +
          ' app/blueprints/component-standards/' +
          slug +
          '/page.tsx'
      );
    } else {
      console.log(
        'SKIPPED  app/blueprints/component-standards/' + slug + '/page.tsx'
      );
    }
  }

  console.log(`\nDone. Wrote ${createdCount} docs pages.`);
}

main();
