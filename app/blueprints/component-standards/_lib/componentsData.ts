import fs from 'fs';
import path from 'path';

export type ComponentItem = {
  component: string;
  id: string;
  slug: string;
  layer: 'primitives' | 'compounds' | 'composers';
  alternativeNames: string[];
  normalizedAliases: string[];
  category: string;
  description: string;
  a11y: { pitfalls: string[] };
  status: 'Planned' | 'Built' | 'DocOnly';
  paths?: { component?: string; docs?: string };
  tags?: string[];
  contentDesign?: {
    voice?: string;
    tone?: string;
    examples?: { good: string; bad: string }[];
    patterns?: string[];
  };
  changelog?: {
    version: string;
    date: string;
    changes: {
      type:
        | 'added'
        | 'changed'
        | 'deprecated'
        | 'removed'
        | 'fixed'
        | 'security';
      description: string;
    }[];
  }[];
};

type ComponentsJson = {
  components: ComponentItem[];
  $source: string;
  $generatedAt: string;
};

let cache: ComponentsJson | null = null;

export function readTransformed(): ComponentsJson {
  if (cache) return cache;
  const file = path.resolve(
    process.cwd(),
    'app/blueprints/component-standards/components-transformed.json'
  );
  const json = JSON.parse(fs.readFileSync(file, 'utf8')) as ComponentsJson;
  cache = json;
  return json;
}

export function getAllComponents(): ComponentItem[] {
  return readTransformed().components;
}

export function getComponentBySlug(slug: string): ComponentItem | null {
  const items = getAllComponents();
  return items.find((it) => it.slug === slug) || null;
}

export function getRelatedComponents(
  slug: string,
  opts: { limit?: number } = {}
): ComponentItem[] {
  const items = getAllComponents();
  const self = items.find((it) => it.slug === slug);
  if (!self) return [];
  const sameCategory = items.filter(
    (it) => it.slug !== slug && it.category === self.category
  );
  const sameLayer = items.filter(
    (it) => it.slug !== slug && it.layer === self.layer
  );
  const merged: ComponentItem[] = [];
  const seen = new Set<string>();
  for (const list of [sameCategory, sameLayer]) {
    for (const it of list) {
      if (seen.has(it.slug)) continue;
      seen.add(it.slug);
      merged.push(it);
    }
  }
  return merged.slice(0, opts.limit ?? 6);
}
