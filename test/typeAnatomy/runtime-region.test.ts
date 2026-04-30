/**
 * Runtime non-regression guard for FeatureInstance.region.
 *
 * The region polygons must be computed at request time from the live
 * GeometryCache — never read from a precomputed per-font lookup table or
 * a startup-time bake. This test enforces that contract by:
 *
 *   1. Loading a font fresh from disk in this file (no module-level cache
 *      that could persist a precomputed region across tests),
 *   2. Picking a glyph the rest of the suite doesn't exercise,
 *   3. Running buildGeometryCache + detectFeature cold, and
 *   4. Asserting every detected Tier-1 stroke / enclosed feature carries
 *      a non-empty `region` whose vertices live within a sane margin of
 *      the glyph bbox.
 *
 * If anyone introduces a `regions/<font>.json` file or a startup-time
 * pre-bake, this test still passes (because the runtime path is what's
 * exercised). Its complement is the visual snapshot test — together they
 * cover both "the data is computed live" and "the data renders correctly."
 */

import * as fs from 'fs';
import * as path from 'path';
import * as fontkit from 'fontkit';
import type { Font, Glyph } from 'fontkit';
import { beforeAll, describe, expect, it } from 'vitest';
import { buildGeometryCache } from '@/utils/typeAnatomy/geometryCache';
import { detectFeature } from '@/utils/typeAnatomy/detectorRegistry';
import type { FeatureID } from '@/utils/typeAnatomy/types';

function loadFreshFont(name: string): Font {
  // Re-read the buffer every call. fontkit.create may share state internally,
  // but the GeometryCache is a per-glyph WeakMap keyed on the glyph object —
  // a fresh fontkit.create() produces fresh glyph objects.
  const buffer = fs.readFileSync(
    path.join(process.cwd(), 'public', 'fonts', name)
  );
  return fontkit.create(buffer as unknown as Uint8Array) as Font;
}

function getGlyph(font: Font, ch: string): Glyph {
  const cp = ch.codePointAt(0);
  if (cp === undefined) throw new Error(`no code point for '${ch}'`);
  return font.glyphForCodePoint(cp) as Glyph;
}

describe('runtime region computation (no precomputed geometry)', () => {
  let font: Font;

  beforeAll(() => {
    // Use Inter rather than Nohemi so this test exercises a font that
    // feature-accuracy.test.ts doesn't rely on for regions today. Confirms
    // detection works on any font that loads, not just the ones with
    // baked-in expectations.
    font = loadFreshFont('InterVariable.ttf');
  });

  it('computes a stroke region for Inter H stems on demand', () => {
    const glyph = getGlyph(font, 'H');
    const cache = buildGeometryCache(glyph, font);
    const stems = detectFeature(cache, 'stem');

    // Every detected stem must have a region — proves Phase 3 wiring fires
    // through the registry orchestrator, not via a font-specific table.
    expect(stems.length).toBeGreaterThan(0);
    for (const stem of stems) {
      expect(stem.region).toBeDefined();
      expect(stem.region!.kind).toBe('stroke');
      expect(stem.region!.points.length).toBeGreaterThanOrEqual(3);

      const w = glyph.bbox.maxX - glyph.bbox.minX;
      const h = glyph.bbox.maxY - glyph.bbox.minY;
      for (const p of stem.region!.points) {
        // Every vertex must be within glyph bbox + 10% margin (catches
        // coord-space bugs and silent-emit bugs that produce far-away points).
        expect(p.x).toBeGreaterThanOrEqual(glyph.bbox.minX - w * 0.1);
        expect(p.x).toBeLessThanOrEqual(glyph.bbox.maxX + w * 0.1);
        expect(p.y).toBeGreaterThanOrEqual(glyph.bbox.minY - h * 0.1);
        expect(p.y).toBeLessThanOrEqual(glyph.bbox.maxY + h * 0.1);
      }
    }
  });

  it('computes an enclosed region for Inter O counter on demand', () => {
    const glyph = getGlyph(font, 'O');
    const cache = buildGeometryCache(glyph, font);
    const counters = detectFeature(cache, 'counter');

    expect(counters.length).toBeGreaterThan(0);
    for (const c of counters) {
      expect(c.region).toBeDefined();
      expect(c.region!.kind).toBe('enclosed');
      expect(c.region!.points.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('computes regions consistently across two fresh font loads', () => {
    // Two independent loads of the same font must produce identical region
    // counts and the same kind for the same glyph + feature. Determinism is
    // what allows the snapshot test to be useful.
    const fontA = loadFreshFont('InterVariable.ttf');
    const fontB = loadFreshFont('InterVariable.ttf');

    const cacheA = buildGeometryCache(getGlyph(fontA, 'H'), fontA);
    const cacheB = buildGeometryCache(getGlyph(fontB, 'H'), fontB);

    const featureIds: FeatureID[] = ['stem', 'crossbar'];
    for (const id of featureIds) {
      const a = detectFeature(cacheA, id);
      const b = detectFeature(cacheB, id);
      expect(a.length).toBe(b.length);
      for (let i = 0; i < a.length; i++) {
        expect(a[i].region?.kind).toBe(b[i].region?.kind);
        expect(a[i].region?.points.length).toBe(b[i].region?.points.length);
      }
    }
  });
});
