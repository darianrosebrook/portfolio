#!/usr/bin/env node
/**
 * CSS-module hygiene check.
 *
 * A dashboard stylesheet accumulates rules as screens are rewritten: the card,
 * badge and dialog classes that a component used to own stay behind after the
 * component moves to a shared primitive, and nothing fails. This script reads
 * the CSS-module files a `*.tsx` imports and reports any class the stylesheet
 * defines that no importing module references.
 *
 * Usage: node scripts/check-css-module-usage.mjs [--json]
 * Exit: 0 every class is referenced, 1 orphaned rules found, 2 usage error.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const TARGETS = [
  'app/dashboard/articles/articles.module.css',
  'app/dashboard/page.module.css',
  'app/dashboard/_components/ContentCard.module.css',
  'app/dashboard/_components/StatusPill.module.css',
  'app/dashboard/_components/IconButton.module.css',
  'app/dashboard/_components/PageHeader.module.css',
  'app/dashboard/_components/ConfirmDialog.module.css',
  'app/dashboard/_components/DashboardShell.module.css',
  'app/dashboard/_components/WorkspaceRail.module.css',
  'app/dashboard/_components/DashboardHeader.module.css',
];

/** Every .tsx/.ts under the searched directories. */
function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const info = statSync(full);
    if (info.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
}

const sources = [
  ...walk(join(ROOT, 'app')),
  ...walk(join(ROOT, 'test')),
  ...walk(join(ROOT, 'ui')),
];

/** Class names a stylesheet defines, ignoring comments, keyframes and animation names. */
function definedClasses(css) {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const withoutKeyframes = withoutComments.replace(
    /@keyframes[^{]*\{(?:[^{}]*\{[^{}]*\}\s*)*[^{}]*\}/g,
    ''
  );
  const names = new Set();
  for (const match of withoutKeyframes.matchAll(/\.(-?[a-zA-Z_][\w-]*)/g)) {
    names.add(match[1]);
  }
  return names;
}

/** The local identifiers a module binds to the given stylesheet. */
function localBindings(source, base) {
  const names = [];
  // import <local> from './x.module.css'  |  import <local> from '../x.module.css'
  const pattern = new RegExp(
    `import\\s+([A-Za-z_$][\\w$]*)\\s+from\\s+['"][^'"]*${base.replace(
      /\./g,
      '\\.'
    )}['"]`,
    'g'
  );
  for (const match of source.matchAll(pattern)) names.push(match[1]);
  return names;
}

/** Class names a module pulls off its imported stylesheet object. */
function referencedClasses(source, bindings) {
  const names = new Set();
  for (const binding of bindings) {
    const escaped = binding.replace(/\$/g, '\\$');
    for (const match of source.matchAll(
      new RegExp(`${escaped}\\.([a-zA-Z_][\\w]*)`, 'g')
    ))
      names.add(match[1]);
    for (const match of source.matchAll(
      new RegExp(`${escaped}\\[['"]([^'"]+)['"]\\]`, 'g')
    ))
      names.add(match[1]);
  }
  return names;
}

function importersOf(relativeCss) {
  const base = relativeCss.split('/').pop();
  return sources.filter((file) => {
    const text = readFileSync(file, 'utf8');
    return (
      text.includes(`/${base}'`) ||
      text.includes(`/${base}"`) ||
      text.includes(`'./${base}'`) ||
      text.includes(`'../${base}'`)
    );
  });
}

const report = [];
let orphanCount = 0;

for (const target of TARGETS) {
  const cssPath = join(ROOT, target);
  let css;
  try {
    css = readFileSync(cssPath, 'utf8');
  } catch {
    report.push({ module: target, skipped: 'not found' });
    continue;
  }
  const defined = [...definedClasses(css)];
  const importers = importersOf(target);
  const base = target.split('/').pop();
  const referenced = new Set();
  for (const file of importers) {
    const source = readFileSync(file, 'utf8');
    const bindings = localBindings(source, base);
    for (const name of referencedClasses(source, bindings))
      referenced.add(name);
  }
  const orphans = defined.filter((name) => !referenced.has(name));
  orphanCount += orphans.length;
  report.push({
    module: target,
    defined: defined.length,
    importers: importers.map((file) => relative(ROOT, file)),
    orphans,
  });
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ orphanCount, report }, null, 2));
} else {
  for (const entry of report) {
    if (entry.skipped) {
      console.log(`SKIP ${entry.module} (${entry.skipped})`);
      continue;
    }
    const status = entry.orphans.length === 0 ? 'OK  ' : 'DEAD';
    console.log(
      `${status} ${entry.module} — ${entry.defined} classes, ${entry.orphans.length} unreferenced`
    );
    for (const name of entry.orphans) console.log(`       .${name}`);
  }
  console.log(
    `\n${orphanCount} unreferenced class(es) across ${report.length} modules`
  );
}

process.exit(orphanCount === 0 ? 0 : 1);
