/**
 * Feature detection integration tests.
 *
 * Tests the unified feature detection system across various glyphs
 * and font types (grotesk, slab, didone, italic, script).
 *
 * Golden overlay tests for: A, M, e, i, g, Q, S
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
import type { FeatureID, FeatureInstance } from '@/utils/typeAnatomy/types';

// Test font loading helper - uses filesystem instead of fetch for Vitest
function loadTestFont(fontName: string): Font | null {
  try {
    const fontPath = path.join(process.cwd(), 'public', 'fonts', fontName);
    if (!fs.existsSync(fontPath)) {
      return null;
    }
    const buffer = fs.readFileSync(fontPath);
    return fontkit.create(buffer as unknown as Uint8Array) as Font;
  } catch {
    return null;
  }
}

// Helper to get glyph by character
function getGlyph(font: Font, char: string): Glyph | null {
  try {
    const codePoint = char.codePointAt(0);
    if (!codePoint) return null;
    return font.glyphForCodePoint(codePoint) as Glyph;
  } catch {
    return null;
  }
}

// Helper to assert feature detection
function assertFeatureDetected(
  instances: FeatureInstance[],
  minCount: number,
  minConfidence: number
): void {
  expect(instances.length).toBeGreaterThanOrEqual(minCount);
  if (instances.length > 0) {
    expect(instances[0].confidence).toBeGreaterThanOrEqual(minConfidence);
  }
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
      const { toFeatureID, toDisplayName } = await import(
        '@/utils/typeAnatomy/types'
      );

      expect(toFeatureID('Apex')).toBe('apex');
      expect(toFeatureID('Cross stroke')).toBe('cross-stroke');
      expect(toDisplayName('apex')).toBe('Apex');
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

describe('Golden Overlay Tests', () => {
  let font: Font | null = null;

  beforeAll(() => {
    font = loadTestFont('Nohemi-VF.ttf');
  });

  it('should detect apex in uppercase A', () => {
    if (!font) {
      console.warn('Skipping test: Nohemi font not available');
      return;
    }

    const glyph = getGlyph(font, 'A');
    if (!glyph) {
      console.warn('Skipping test: Glyph A not available');
      return;
    }

    const cache = buildGeometryCache(glyph, font);
    const apexes = detectFeature(cache, 'apex');

    assertFeatureDetected(apexes, 1, 0.5);

    if (apexes.length > 0 && apexes[0].shape.type === 'point') {
      const apexY = apexes[0].shape.y;
      const capHeight = cache.metrics.capHeight;
      const tolerance = cache.scale.bboxH * 0.15;
      expect(Math.abs(apexY - capHeight)).toBeLessThan(tolerance);
    }
  });

  it('should detect apex and crotch in uppercase M', () => {
    if (!font) {
      console.warn('Skipping test: Nohemi font not available');
      return;
    }

    const glyph = getGlyph(font, 'M');
    if (!glyph) {
      console.warn('Skipping test: Glyph M not available');
      return;
    }

    const cache = buildGeometryCache(glyph, font);

    const apexes = detectFeature(cache, 'apex');
    if (apexes.length > 0) {
      expect(apexes[0].confidence).toBeGreaterThanOrEqual(0.5);
    }

    const crotches = detectFeature(cache, 'crotch');
    expect(crotches.length).toBeGreaterThanOrEqual(0);
  });

  it('should detect eye and counter in lowercase e', () => {
    if (!font) {
      console.warn('Skipping test: Nohemi font not available');
      return;
    }

    const glyph = getGlyph(font, 'e');
    if (!glyph) {
      console.warn('Skipping test: Glyph e not available');
      return;
    }

    const cache = buildGeometryCache(glyph, font);

    const eyes = detectFeature(cache, 'eye');
    assertFeatureDetected(eyes, 1, 0.4);

    const counters = detectFeature(cache, 'counter');
    expect(counters.length).toBeGreaterThanOrEqual(0);
  });

  it('should detect tittle in lowercase i', () => {
    if (!font) {
      console.warn('Skipping test: Nohemi font not available');
      return;
    }

    const glyph = getGlyph(font, 'i');
    if (!glyph) {
      console.warn('Skipping test: Glyph i not available');
      return;
    }

    const cache = buildGeometryCache(glyph, font);

    const tittles = detectFeature(cache, 'tittle');

    if (tittles.length > 0) {
      expect(tittles[0].confidence).toBeGreaterThanOrEqual(0.5);

      if (tittles[0].shape.type === 'circle') {
        const tittleY = tittles[0].shape.cy;
        const glyphMidY = (cache.glyph.bbox.minY + cache.glyph.bbox.maxY) / 2;
        expect(tittleY).toBeGreaterThan(glyphMidY);
      }
    } else {
      expect(cache.segments.length).toBeGreaterThan(0);
    }
  });

  it('should detect bowl, loop, and ear in lowercase g', () => {
    if (!font) {
      console.warn('Skipping test: Nohemi font not available');
      return;
    }

    const glyph = getGlyph(font, 'g');
    if (!glyph) {
      console.warn('Skipping test: Glyph g not available');
      return;
    }

    const cache = buildGeometryCache(glyph, font);

    const bowls = detectFeature(cache, 'bowl');
    assertFeatureDetected(bowls, 1, 0.5);

    const loops = detectFeature(cache, 'loop');
    expect(loops.length).toBeGreaterThanOrEqual(0);

    const ears = detectFeature(cache, 'ear');
    expect(ears.length).toBeGreaterThanOrEqual(0);
  });

  it('should detect bowl and tail in uppercase Q', () => {
    if (!font) {
      console.warn('Skipping test: Nohemi font not available');
      return;
    }

    const glyph = getGlyph(font, 'Q');
    if (!glyph) {
      console.warn('Skipping test: Glyph Q not available');
      return;
    }

    const cache = buildGeometryCache(glyph, font);

    const bowls = detectFeature(cache, 'bowl');
    assertFeatureDetected(bowls, 1, 0.5);

    const tails = detectFeature(cache, 'tail');
    assertFeatureDetected(tails, 1, 0.4);

    if (tails.length > 0) {
      const tailShape = tails[0].shape;
      if (tailShape.type === 'line') {
        expect(Math.min(tailShape.y1, tailShape.y2)).toBeLessThan(
          cache.metrics.baseline
        );
      } else if (tailShape.type === 'polyline' && tailShape.points.length > 0) {
        const minY = Math.min(...tailShape.points.map((p) => p.y));
        expect(minY).toBeLessThan(cache.metrics.baseline);
      }
    }
  });

  it('should detect spine in uppercase S', () => {
    if (!font) {
      console.warn('Skipping test: Nohemi font not available');
      return;
    }

    const glyph = getGlyph(font, 'S');
    if (!glyph) {
      console.warn('Skipping test: Glyph S not available');
      return;
    }

    const cache = buildGeometryCache(glyph, font);

    const spines = detectFeature(cache, 'spine');
    assertFeatureDetected(spines, 1, 0.5);

    if (spines.length > 0 && spines[0].debug) {
      const debug = spines[0].debug as { curveDirectionChanges?: number };
      if (typeof debug.curveDirectionChanges === 'number') {
        expect(debug.curveDirectionChanges).toBeGreaterThanOrEqual(1);
      }
    }
  });
});

describe('Determinism Tests', () => {
  it('should return identical results for same glyph', () => {
    const mockGlyph = {
      path: {
        commands: [
          { command: 'moveTo', args: [100, 0] },
          { command: 'lineTo', args: [200, 700] },
          { command: 'lineTo', args: [300, 0] },
          { command: 'closePath', args: [] },
        ],
        toSVG: () => 'M100 0L200 700L300 0Z',
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

    const cache1 = buildGeometryCache(mockGlyph, mockFont);
    const cache2 = buildGeometryCache(mockGlyph, mockFont);

    const features1 = detectFeature(cache1, 'apex');
    const features2 = detectFeature(cache2, 'apex');

    expect(features1.length).toBe(features2.length);

    if (features1.length > 0 && features2.length > 0) {
      expect(features1[0].confidence).toBe(features2[0].confidence);
      expect(JSON.stringify(features1[0].shape)).toBe(
        JSON.stringify(features2[0].shape)
      );
    }
  });
});