import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('components-transformed.json', () => {
  const root = path.resolve(__dirname, '..', '..');
  const file = path.join(
    root,
    'app/blueprints/component-standards/components-transformed.json'
  );

  it('exists and contains components array', () => {
    expect(fs.existsSync(file)).toBe(true);
    const json = JSON.parse(fs.readFileSync(file, 'utf8'));
    expect(Array.isArray(json.components)).toBe(true);
    expect(json.$source).toBe('docs/design-taxonomy.md');
  });

  it('each item has required fields and normalized values', () => {
    const json = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const item of json.components) {
      expect(typeof item.component).toBe('string');
      expect(item.component.length).toBeGreaterThan(0);
      expect(item.id).toMatch(/^[a-z0-9]+$/);
      expect(item.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(['primitives', 'compounds', 'composers']).toContain(item.layer);
      expect(typeof item.category).toBe('string');
      expect(item.category).not.toMatch(/\//);
      expect(item.a11y && Array.isArray(item.a11y.pitfalls)).toBe(true);
      expect(['Planned', 'Built', 'DocOnly']).toContain(item.status);
    }
  });
});
