/**
 * Feature detection integration tests.
 *
 * Tests the unified feature detection system across various glyphs
 * and font types (grotesk, slab, didone, italic, script).
 *
 * Golden overlay tests for: A, M, e, i, g, Q, S
 *
 * Note: Glyph-level positional assertions live in feature-accuracy.test.ts.
 * This file proves the orchestration layer (registry, hints, geometry cache,
 * determinism) and uses the Golden Overlay block as a sanity-check on the
 * counts the orchestrator surfaces for each known glyph.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as fontkit from 'fontkit';
import type { Font, Glyph } from 'fontkit';
import { buildGeometryCache } from '@/utils/typeAnatomy/geometryCache';
import {
  detectFeature,
  getRegisteredFeatures,
} from '@/utils/typeAnatomy/detectorRegistry';
import { getFeatureHints } from '@/utils/typeAnatomy/glyphFeatureHints';
import type { FeatureID } from '@/utils/typeAnatomy/types';

// Hard-fail helpers: a missing font or glyph is a test setup error, not a
// silent skip. Mirrors font-properties.test.ts.
function loadTestFont(fontName: string): Font {
  const fontPath = path.join(process.cwd(), 'public', 'fonts', fontName);
  const buffer = fs.readFileSync(fontPath);
  return fontkit.create(buffer as unknown as Uint8Array) as Font;
}

function getGlyph(font: Font, char: string): Glyph {
  const codePoint = char.codePointAt(0);
  if (!codePoint) throw new Error(`no code point for '${char}'`);
  return font.glyphForCodePoint(codePoint) as Glyph;
}

describe('Feature Detection System', () => {
  describe('Type definitions', () => {
    it('should export all feature IDs', async () => {
      const { ALL_FEATURE_IDS } = await import('@/utils/typeAnatomy/types');
      expect(ALL_FEATURE_IDS).toBeInstanceOf(Array);
      expect(ALL_FEATURE_IDS.length).toBeGreaterThan(10);
      expect(ALL_FEATURE_IDS).toContain('apex');
      expect(ALL_FEATURE_IDS).toContain('bowl');
      expect(ALL_FEATURE_IDS).toContain('stem');
    });

    it('should convert between display names and feature IDs', async () => {
      const { toFeatureID, toDisplayName } =
        await import('@/utils/typeAnatomy/types');

      expect(toFeatureID('Apex')).toBe('apex');
      // Display key matches the canonical anatomy.json term 'Cross-stroke'
      // (was 'Cross stroke' before the JSON-driven toggle migration).
      expect(toFeatureID('Cross-stroke')).toBe('cross-stroke');
      expect(toDisplayName('apex')).toBe('Apex');
      // 'Bar' is a back-compat alias for the same FeatureID as 'Crossbar';
      // both map to the registered crossbar detector.
      expect(toFeatureID('Bar')).toBe('crossbar');
      expect(toFeatureID('Crossbar')).toBe('crossbar');
    });
  });

  describe('isSerifFont heuristic', () => {
    // The inspector's `DetectionContext.isSerif` flag drives which feature
    // toggles are visible (every `serif`-gated hint disappears when the
    // flag is false). The heuristic must therefore correctly classify
    // bundled serif fonts whose name doesn't contain the literal
    // substring "serif" (Newsreader is the canonical case).
    //
    // See ui/modules/FontInspector/fontHeuristics.ts.

    it('flags Newsreader as a serif despite the name not containing "serif"', async () => {
      const { isSerifFont } = await import(
        '@/ui/modules/FontInspector/fontHeuristics'
      );
      // Real fontkit value for public/fonts/Newsreader-VF.ttf.
      expect(isSerifFont('Newsreader 16pt Regular')).toBe(true);
      // Family-name fallback path.
      expect(isSerifFont('Newsreader 16pt')).toBe(true);
    });

    it('flags Inter Variable as sans-serif', async () => {
      const { isSerifFont } = await import(
        '@/ui/modules/FontInspector/fontHeuristics'
      );
      expect(isSerifFont('Inter Variable')).toBe(false);
    });

    it('flags Nohemi as sans-serif', async () => {
      const { isSerifFont } = await import(
        '@/ui/modules/FontInspector/fontHeuristics'
      );
      expect(isSerifFont('Nohemi Regular')).toBe(false);
    });

    it('flags fonts whose name contains "Serif" via substring fallback', async () => {
      const { isSerifFont } = await import(
        '@/ui/modules/FontInspector/fontHeuristics'
      );
      expect(isSerifFont('PT Serif')).toBe(true);
      expect(isSerifFont('Crimson Text Serif')).toBe(true);
    });

    it('rejects sans-serif and grotesk variants that incidentally contain "serif"', async () => {
      const { isSerifFont } = await import(
        '@/ui/modules/FontInspector/fontHeuristics'
      );
      // The substring fallback explicitly excludes sans / grotesk.
      expect(isSerifFont('PT Sans Serif')).toBe(false);
      expect(isSerifFont('Roboto Serif Grotesk')).toBe(false);
    });
  });

  describe('Geometry Cache', () => {
    it('should build geometry cache from mock glyph', () => {
      const mockGlyph = {
        path: {
          commands: [
            { command: 'moveTo', args: [100, 0] },
            { command: 'lineTo', args: [200, 700] },
            { command: 'lineTo', args: [300, 0] },
            { command: 'closePath', args: [] },
          ],
        },
        bbox: { minX: 100, minY: 0, maxX: 300, maxY: 700 },
        advanceWidth: 400,
        codePoints: [65],
        name: 'A',
      } as unknown as Glyph;

      const mockFont = {
        unitsPerEm: 1000,
        xHeight: 500,
        capHeight: 700,
        ascent: 800,
        descent: -200,
        fullName: 'Test Font',
        familyName: 'Test',
      } as unknown as Font;

      const cache = buildGeometryCache(mockGlyph, mockFont);

      expect(cache).toBeDefined();
      expect(cache.glyph).toBe(mockGlyph);
      expect(cache.font).toBe(mockFont);
      expect(cache.metrics.xHeight).toBe(500);
      expect(cache.metrics.capHeight).toBe(700);
      expect(cache.segments).toBeInstanceOf(Array);
      expect(cache.contours).toBeInstanceOf(Array);
      expect(cache.scale).toBeDefined();
      expect(cache.scale.stemWidth).toBeGreaterThan(0);
    });
  });

  describe('Feature Hints', () => {
    it('should return hints for uppercase A', () => {
      const ctx = {
        isSerif: false,
        isItalic: false,
        italicAngle: 0,
        isMono: false,
        weight: 400,
        unitsPerEm: 1000,
      };

      const hints = getFeatureHints('A', ctx);
      const ids = hints.map((h) => h.id);

      expect(ids).toContain('apex');
      expect(ids).toContain('crossbar');
      expect(ids).toContain('stem');
      expect(ids).toContain('crotch');
    });

    it('should include serif hints for serif fonts', () => {
      const serifCtx = {
        isSerif: true,
        isItalic: false,
        italicAngle: 0,
        isMono: false,
        weight: 400,
        unitsPerEm: 1000,
      };

      const sansCtx = {
        isSerif: false,
        isItalic: false,
        italicAngle: 0,
        isMono: false,
        weight: 400,
        unitsPerEm: 1000,
      };

      const serifHints = getFeatureHints('A', serifCtx);
      const sansHints = getFeatureHints('A', sansCtx);

      const serifIds = serifHints.map((h) => h.id);
      const sansIds = sansHints.map((h) => h.id);

      expect(serifIds).toContain('serif');
      expect(sansIds).not.toContain('serif');
    });

    it('should return tittle hints for lowercase i', () => {
      const ctx = {
        isSerif: false,
        isItalic: false,
        italicAngle: 0,
        isMono: false,
        weight: 400,
        unitsPerEm: 1000,
      };

      const hints = getFeatureHints('i', ctx);
      const ids = hints.map((h) => h.id);

      expect(ids).toContain('tittle');
      expect(ids).toContain('stem');
    });

    it('should return bowl and eye hints for lowercase e', () => {
      const ctx = {
        isSerif: false,
        isItalic: false,
        italicAngle: 0,
        isMono: false,
        weight: 400,
        unitsPerEm: 1000,
      };

      const hints = getFeatureHints('e', ctx);
      const ids = hints.map((h) => h.id);

      expect(ids).toContain('eye');
      expect(ids).toContain('counter');
    });
  });

  describe('Detector Registry', () => {
    it('should return registered features', () => {
      const features = getRegisteredFeatures();
      expect(features).toBeInstanceOf(Array);
      expect(features.length).toBeGreaterThan(10);
    });

    it('should return empty array for missing detector', () => {
      const mockGlyph = {
        path: { commands: [] },
        bbox: { minX: 0, minY: 0, maxX: 100, maxY: 100 },
      } as unknown as Glyph;

      const mockFont = {
        unitsPerEm: 1000,
        xHeight: 500,
        capHeight: 700,
        ascent: 800,
        descent: -200,
      } as unknown as Font;

      const cache = buildGeometryCache(mockGlyph, mockFont);

      const result = detectFeature(cache, 'bar' as FeatureID);
      expect(result).toEqual([]);
    });
  });
});

/**
 * Golden Overlay block — assert the specific counts the orchestrator
 * surfaces for each glyph in Nohemi. These counts are determined empirically
 * (see probe in commit history); detector behavior on these glyphs is the
 * contract between the detector layer and the visual overlay.
 *
 * Positional / shape-level assertions live in feature-accuracy.test.ts.
 * Here we only assert *that* the orchestrator finds N instances — the
 * accuracy file proves *where* and *how* they are shaped.
 */
describe('Golden Overlay Tests (Nohemi-VF)', () => {
  let font!: Font;

  beforeAll(() => {
    font = loadTestFont('Nohemi-VF.ttf');
  });

  it('uppercase A: apex=1, crotch=1, vertex=2', () => {
    const cache = buildGeometryCache(getGlyph(font, 'A'), font);
    expect(detectFeature(cache, 'apex')).toHaveLength(1);
    expect(detectFeature(cache, 'crotch')).toHaveLength(1);
    expect(detectFeature(cache, 'vertex')).toHaveLength(2);
  });

  it('uppercase M: apex=0, crotch=1, vertex=1', () => {
    // Nohemi M outer peaks are flat-cut (no apex); the inner V junction at
    // the bottom registers as both vertex and crotch at the same point.
    const cache = buildGeometryCache(getGlyph(font, 'M'), font);
    expect(detectFeature(cache, 'apex')).toHaveLength(0);
    expect(detectFeature(cache, 'crotch')).toHaveLength(1);
    expect(detectFeature(cache, 'vertex')).toHaveLength(1);
  });

  it('lowercase e: eye=1, counter=1, aperture=2', () => {
    const cache = buildGeometryCache(getGlyph(font, 'e'), font);
    expect(detectFeature(cache, 'eye')).toHaveLength(1);
    expect(detectFeature(cache, 'counter')).toHaveLength(1);
    // Nohemi e has two aperture detections (the counter-form opening on the
    // right surfaces twice through the aperture detector). feature-accuracy
    // pins the right-side opening's position.
    expect(detectFeature(cache, 'aperture')).toHaveLength(2);
  });

  it('lowercase i: tittle=1, stem=1', () => {
    const cache = buildGeometryCache(getGlyph(font, 'i'), font);
    expect(detectFeature(cache, 'tittle')).toHaveLength(1);
    expect(detectFeature(cache, 'stem')).toHaveLength(1);
  });

  it('lowercase g: bowl=1, loop=1, ear=0 (Nohemi has no ear)', () => {
    const cache = buildGeometryCache(getGlyph(font, 'g'), font);
    expect(detectFeature(cache, 'bowl')).toHaveLength(1);
    expect(detectFeature(cache, 'loop')).toHaveLength(1);
    // Nohemi g is geometric and lacks the ear projection; Newsreader g
    // does, and feature-accuracy.test.ts covers that case.
    expect(detectFeature(cache, 'ear')).toHaveLength(0);
  });

  it('uppercase Q: bowl=1, tail=1, counter=1', () => {
    const cache = buildGeometryCache(getGlyph(font, 'Q'), font);
    expect(detectFeature(cache, 'bowl')).toHaveLength(1);
    expect(detectFeature(cache, 'tail')).toHaveLength(1);
    expect(detectFeature(cache, 'counter')).toHaveLength(1);
  });

  it('uppercase S: spine=1', () => {
    const cache = buildGeometryCache(getGlyph(font, 'S'), font);
    expect(detectFeature(cache, 'spine')).toHaveLength(1);
  });
});

describe('Determinism Tests', () => {
  it('returns identical apex results for Nohemi A across two cache builds', () => {
    // Nohemi A reliably produces 1 apex; comparing two runs verifies the
    // detector is deterministic over the same input. Using a synthetic
    // fixture would silently pass (0 === 0) if the detector returned [].
    const font = loadTestFont('Nohemi-VF.ttf');
    const glyph = getGlyph(font, 'A');

    const cache1 = buildGeometryCache(glyph, font);
    const cache2 = buildGeometryCache(glyph, font);

    const features1 = detectFeature(cache1, 'apex');
    const features2 = detectFeature(cache2, 'apex');

    expect(features1).toHaveLength(1);
    expect(features2).toHaveLength(1);
    expect(features1[0].confidence).toBe(features2[0].confidence);
    expect(JSON.stringify(features1[0].shape)).toBe(
      JSON.stringify(features2[0].shape)
    );
  });
});
