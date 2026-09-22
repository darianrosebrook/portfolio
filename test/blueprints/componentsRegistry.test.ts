import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Drift guard for the component registry (components-transformed.json).
 * The registry is a generated artifact of scripts/generateComponentsRegistry.mjs;
 * these tests pin the contract that keeps the docs honest:
 * - every Built entry resolves to a real directory with {Name}.tsx + {Name}.contract.json
 * - every on-disk component with that pair is registered exactly once as Built
 * - no entry claims a per-slug docs path (docs are served by the [slug] route)
 * - shape fields the registry index SSG dereferences unguarded are always present
 * A failure here means the registry is stale relative to the component library:
 * run `npm run generate:components-registry` and review the diff.
 */

const root = path.resolve(__dirname, '..', '..');
const registryFile = path.join(
  root,
  'app/blueprints/component-standards/components-transformed.json'
);

const IMPLEMENTATION_DIRS = ['ui/components', 'ui/modules'];

function readRegistry() {
  return JSON.parse(fs.readFileSync(registryFile, 'utf8'));
}

function onDiskComponentDirs() {
  const found: Array<{ name: string; dir: string }> = [];
  for (const base of IMPLEMENTATION_DIRS) {
    const absBase = path.join(root, base);
    if (!fs.existsSync(absBase)) continue;
    for (const entry of fs.readdirSync(absBase, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const implFile = path.join(absBase, entry.name, `${entry.name}.tsx`);
      const contractFile = path.join(
        absBase,
        entry.name,
        `${entry.name}.contract.json`
      );
      if (fs.existsSync(implFile) && fs.existsSync(contractFile)) {
        found.push({ name: entry.name, dir: `${base}/${entry.name}` });
      }
    }
  }
  return found;
}

describe('components-transformed.json registry', () => {
  it('exists with generator provenance', () => {
    const json = readRegistry();
    expect(Array.isArray(json.components)).toBe(true);
    expect(json.$source).toBe('scripts/generateComponentsRegistry.mjs');
    expect(Number.isNaN(Date.parse(json.$generatedAt))).toBe(false);
  });

  it('entries carry every field the docs pages dereference', () => {
    const json = readRegistry();
    expect(json.components.length).toBeGreaterThan(0);
    for (const item of json.components) {
      expect(typeof item.component, item.component).toBe('string');
      expect(item.id, item.component).toMatch(/^[a-z0-9]+$/);
      expect(item.slug, item.component).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(
        ['primitives', 'compounds', 'composers'],
        item.component
      ).toContain(item.layer);
      expect(typeof item.category, item.component).toBe('string');
      expect(item.category, item.component).not.toMatch(/\//);
      expect(typeof item.description, item.component).toBe('string');
      expect(
        item.a11y && Array.isArray(item.a11y.pitfalls),
        item.component
      ).toBe(true);
      expect(['Planned', 'Built', 'DocOnly'], item.component).toContain(
        item.status
      );
      // page.tsx renders alternativeNames.slice(0, 3) and
      // alternativeNames.length unguarded — a missing array crashes SSG
      expect(Array.isArray(item.alternativeNames), item.component).toBe(true);
      expect(Array.isArray(item.normalizedAliases), item.component).toBe(true);
    }
  });

  it('slugs and ids are unique', () => {
    const json = readRegistry();
    const slugs = new Set<string>();
    const ids = new Set<string>();
    for (const item of json.components) {
      expect(slugs.has(item.slug), `duplicate slug ${item.slug}`).toBe(false);
      expect(ids.has(item.id), `duplicate id ${item.id}`).toBe(false);
      slugs.add(item.slug);
      ids.add(item.id);
    }
  });

  it('no entry claims a per-slug docs path', () => {
    const json = readRegistry();
    for (const item of json.components) {
      expect(item.paths?.docs, item.component).toBeUndefined();
    }
  });

  it('every Built entry resolves to a real implementation directory', () => {
    const json = readRegistry();
    for (const item of json.components) {
      if (item.status !== 'Built') continue;
      const rel = item.paths?.component;
      expect(rel, `${item.component} must record paths.component`).toBeTruthy();
      const dir = path.join(root, rel);
      expect(fs.existsSync(dir), `${rel} must exist`).toBe(true);
      expect(
        fs.existsSync(path.join(dir, `${item.component}.tsx`)),
        `${rel}/${item.component}.tsx must exist`
      ).toBe(true);
      expect(
        fs.existsSync(path.join(dir, `${item.component}.contract.json`)),
        `${rel}/${item.component}.contract.json must exist`
      ).toBe(true);
    }
  });

  it('every implementation directory is registered exactly once as Built', () => {
    const json = readRegistry();
    const builtByDir = new Map<string, string>();
    for (const item of json.components) {
      if (item.status !== 'Built') continue;
      const rel = item.paths?.component ?? '';
      expect(
        builtByDir.has(rel),
        `${rel} registered twice (${builtByDir.get(rel)} and ${item.component})`
      ).toBe(false);
      builtByDir.set(rel, item.component);
    }
    for (const { name, dir } of onDiskComponentDirs()) {
      expect(
        builtByDir.has(dir),
        `${dir} exists on disk but is missing from the registry (or is not Built) — regenerate the registry`
      ).toBe(true);
      expect(builtByDir.get(dir)).toBe(name);
    }
  });

  it('every Built entry resolves to a module entrypoint and stylesheet on disk', () => {
    // Tier-1 file invariant (mirrors scripts/validateComponentVisibility.mjs):
    // an index barrel (index.ts or index.tsx), the main {Name}.tsx, and a
    // stylesheet ({Name}.css or {Name}.module.scss). This runs in npm test
    // and pre-push — it is the enforced form of the visibility gate.
    const json = readRegistry();
    for (const item of json.components) {
      if (item.status !== 'Built') continue;
      const dir = path.join(root, item.paths?.component ?? '');
      const name = item.component;
      const hasIndex =
        fs.existsSync(path.join(dir, 'index.ts')) ||
        fs.existsSync(path.join(dir, 'index.tsx'));
      expect(
        hasIndex,
        `${item.paths.component}: missing index.ts|index.tsx`
      ).toBe(true);
      expect(
        fs.existsSync(path.join(dir, `${name}.tsx`)),
        `${item.paths.component}: missing ${name}.tsx`
      ).toBe(true);
      const hasStylesheet =
        fs.existsSync(path.join(dir, `${name}.css`)) ||
        fs.existsSync(path.join(dir, `${name}.module.scss`));
      expect(
        hasStylesheet,
        `${item.paths.component}: missing ${name}.css|.module.scss`
      ).toBe(true);
    }
  });

  it('Sidebar resolves to its module implementation, not a component dir', () => {
    // Regression pin: Sidebar lived at ui/components/Sidebar in a stale
    // registry, so its doc page silently rendered an empty props table.
    const json = readRegistry();
    const sidebar = json.components.find((c: any) => c.component === 'Sidebar');
    expect(sidebar).toBeTruthy();
    expect(sidebar.status).toBe('Built');
    expect(sidebar.paths.component).toBe('ui/modules/Sidebar');
  });
});
