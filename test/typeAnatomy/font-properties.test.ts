/**
 * Font property detection tests.
 *
 * Tests the geometry-based serif detection and other font-level properties.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as fontkit from 'fontkit';
import type { Font, Glyph } from 'fontkit';
import {
  buildGeometryCache,
  invalidateGeometryCache,
} from '@/utils/typeAnatomy/geometryCache';
import { mockFont, mockGlyphFromPath } from '@/test/utils/fixtures/mockGlyph';
import { detectAllFeatures } from '@/utils/typeAnatomy/detectorRegistry';

// Test font loading helper — throws on missing font so tests hard-fail instead of silently passing.
function loadTestFont(fontName: string): Font {
  const fontPath = path.join(process.cwd(), 'public', 'fonts', fontName);
  const buffer = fs.readFileSync(fontPath);
  return fontkit.create(buffer as unknown as Uint8Array) as Font;
}

// Helper to get glyph by character — throws on missing glyph.
function getGlyph(font: Font, char: string): Glyph {
  const codePoint = char.codePointAt(0);
  if (!codePoint) throw new Error(`no code point for '${char}'`);
  return font.glyphForCodePoint(codePoint) as Glyph;
}

describe('Font Property Detection', () => {
  describe('Empty occupied scale and feature evidence', () => {
    it.each([
      ['Nohemi-VF.ttf', 4],
      ['InterVariable.ttf', 2.048],
      ['MonaspaceNeonVF.ttf', 2],
      ['Newsreader-VF.ttf', 2],
    ] as const)(
      'keeps %s spaces finite and produces no positive anatomy at all supported axis extremes',
      (filename, eps) => {
        const base = loadTestFont(filename);
        const extremes = Object.entries(base.variationAxes).reduce<
          Record<string, number>[]
        >(
          (settings, [axis, range]) =>
            settings.flatMap((setting) => [
              { ...setting, [axis]: range.min },
              { ...setting, [axis]: range.max },
            ]),
          [{}]
        );
        for (const axes of [null, ...extremes]) {
          const font = axes ? base.getVariation(axes) : base;
          const glyph = getGlyph(font, ' ');
          expect(glyph.path.commands).toHaveLength(0);
          const cache = buildGeometryCache(glyph, font);
          expect(cache.filled!.bodies).toEqual([]);
          expect(cache.scale).toEqual({
            eps,
            bboxW: 0,
            bboxH: 0,
            stemWidth: 0,
            overshoot: 0,
          });
          expect(Object.values(cache.scale).every(Number.isFinite)).toBe(true);
          // The registry retains IDs mapped to []; map.size is not anatomy.
          const positive = [...detectAllFeatures(cache)].filter(
            ([, instances]) => instances.length > 0
          );
          expect(positive, `${filename} ${JSON.stringify(axes)}`).toEqual([]);
        }
      }
    );
    it.each([
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
      { minX: NaN, minY: NaN, maxX: NaN, maxY: NaN },
      { minX: 0, minY: 0, maxX: 0, maxY: 0 },
      { minX: 100, minY: 200, maxX: 200, maxY: 300 },
      { minX: 5, minY: 5, maxX: 1, maxY: 1 },
    ])('does not invent an ink box from empty source bbox %s', (bbox) => {
      const cache = buildGeometryCache(
        mockGlyphFromPath('M0 0', bbox),
        mockFont()
      );
      expect(cache.scale).toEqual({
        eps: 1,
        bboxW: 0,
        bboxH: 0,
        stemWidth: 0,
        overshoot: 0,
      });
    });
    it('assigns zero ink size to a degenerate diagonal despite positive source bbox dimensions', () => {
      const glyph = mockGlyphFromPath('M0 0L10 10L20 20Z', {
        minX: 0,
        minY: 0,
        maxX: 20,
        maxY: 20,
      });
      const cache = buildGeometryCache(glyph, mockFont());
      expect(cache.filled!.bodies).toEqual([]);
      expect(cache.scale).toEqual({
        eps: 1,
        bboxW: 0,
        bboxH: 0,
        stemWidth: 0,
        overshoot: 0,
      });
    });
    it('derives existing actual ink dimensions from fill when source bbox is invalid', () => {
      const glyph = mockGlyphFromPath('M0 0L20 0L20 600L0 600Z', {
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity,
      });
      const scale = buildGeometryCache(glyph, mockFont()).scale;
      expect(scale).toEqual({
        eps: 1,
        bboxW: 20,
        bboxH: 600,
        stemWidth: 20,
        overshoot: 1200,
      });
    });
    it.each([Infinity, NaN, 0])(
      'retains finite empty-scale epsilon with invalid UPM %s',
      (unitsPerEm) => {
        const cache = buildGeometryCache(
          mockGlyphFromPath('M0 0', { minX: 0, minY: 0, maxX: 0, maxY: 0 }),
          mockFont({ unitsPerEm })
        );
        expect(cache.scale).toEqual({
          eps: 1,
          bboxW: 0,
          bboxH: 0,
          stemWidth: 0,
          overshoot: 0,
        });
      }
    );
  });
  describe('Serif Detection', () => {
    it('should detect Nohemi as sans-serif', () => {
      const font = loadTestFont('Nohemi-VF.ttf');
      const glyph = getGlyph(font, 'A');
      const cache = buildGeometryCache(glyph, font);
      expect(cache.context.isSerif).toBe(false);
    });

    it('should detect Inter as sans-serif', () => {
      const font = loadTestFont('InterVariable.ttf');
      const glyph = getGlyph(font, 'A');
      const cache = buildGeometryCache(glyph, font);
      expect(cache.context.isSerif).toBe(false);
    });

    it('should detect Newsreader as serif', () => {
      const font = loadTestFont('Newsreader-VF.ttf');
      const glyph = getGlyph(font, 'A');
      const cache = buildGeometryCache(glyph, font);
      expect(cache.context.isSerif).toBe(true);
    });

    it('detects Monaspace as monospace from current advance spacing despite its unset post flag', () => {
      const font = loadTestFont('MonaspaceNeonVF.ttf');
      const glyph = getGlyph(font, 'A');
      const cache = buildGeometryCache(glyph, font);
      expect(cache.context.isMono).toBe(true);
    });
    it.each(['InterVariable.ttf', 'Newsreader-VF.ttf'])(
      'does not report proportional %s as fixed-cell spacing',
      (filename) => {
        const font = loadTestFont(filename);
        expect(
          buildGeometryCache(getGlyph(font, 'i'), font).context.isMono
        ).toBe(false);
      }
    );
  });

  describe('Italic Detection', () => {
    it('should detect upright fonts correctly', () => {
      const font = loadTestFont('Nohemi-VF.ttf');
      const glyph = getGlyph(font, 'A');
      const cache = buildGeometryCache(glyph, font);
      expect(cache.context.isItalic).toBe(false);
      expect(cache.context.italicAngle).toBe(0);
    });
    it('uses the effective slant coordinate and weight on a current Monaspace variation', () => {
      const font = loadTestFont('MonaspaceNeonVF.ttf').getVariation({
        wght: 650,
        slnt: -9,
      });
      const cache = buildGeometryCache(getGlyph(font, 'A'), font);
      expect(cache.context.weight).toBe(650);
      expect(cache.context.italicAngle).toBe(-9);
      expect(cache.italicAngle).toBe(-9);
      expect(cache.context.isItalic).toBe(true);
      expect(cache.context.isMono).toBe(true);
    });
    it('aligns Inter weight with its wght axis after the opsz axis', () => {
      const font = loadTestFont('InterVariable.ttf').getVariation({
        opsz: 27,
        wght: 675,
      });
      const cache = buildGeometryCache(getGlyph(font, 'A'), font);
      expect(cache.context.weight).toBe(675);
      expect(cache.context.isItalic).toBe(false);
    });
  });

  describe('Scale Primitives', () => {
    it('uses repeated physical stroke spans rather than aeacute’s merged middle connector', () => {
      const base = loadTestFont('Nohemi-VF.ttf');
      const estimates = [100, 400, 900].map((weight) => {
        const font = base.getVariation({ wght: weight });
        return buildGeometryCache(getGlyph(font, 'ǽ'), font).scale.stemWidth;
      });
      // Native path stroke probes bound the light/regular/heavy physical widths;
      // the connector's 3250..3559-unit width is outside every allowed range.
      expect(estimates[0]).toBeGreaterThanOrEqual(50);
      expect(estimates[0]).toBeLessThanOrEqual(150);
      expect(estimates[1]).toBeGreaterThanOrEqual(100);
      expect(estimates[1]).toBeLessThanOrEqual(900);
      expect(estimates[2]).toBeGreaterThanOrEqual(300);
      expect(estimates[2]).toBeLessThanOrEqual(1200);
      expect(estimates[1]).toBeGreaterThan(estimates[0]);
      expect(estimates[2]).toBeGreaterThan(estimates[1]);
    });
    it.each([
      [100, 80, 84],
      [400, 390, 420],
      [900, 770, 950],
    ])(
      'preserves H physical stroke scale at weight %s',
      (weight, minimum, maximum) => {
        const font = loadTestFont('Nohemi-VF.ttf').getVariation({
          wght: weight,
        });
        const estimate = buildGeometryCache(getGlyph(font, 'H'), font).scale
          .stemWidth;
        // These are the current outline's horizontal crossbar thickness and
        // vertical stem width, independently read from native straight edges.
        expect(estimate).toBeGreaterThanOrEqual(minimum);
        expect(estimate).toBeLessThanOrEqual(maximum);
      }
    );
    it.each([
      [100, 80],
      [400, 390],
      [900, 720],
    ])(
      'measures a horizontal Nohemi bar at weight %s orthogonally',
      (weight, expected) => {
        const font = loadTestFont('Nohemi-VF.ttf').getVariation({
          wght: weight,
        });
        const glyph = getGlyph(font, '-');
        expect(glyph.bbox.maxY - glyph.bbox.minY).toBe(expected);
        expect(buildGeometryCache(glyph, font).scale.stemWidth).toBe(expected);
      }
    );
    it.each([
      [
        'M0 0L20 0L20 600L0 600Z',
        { minX: 0, minY: 0, maxX: 20, maxY: 600 },
        20,
      ],
      [
        'M0 100L600 100L600 140L0 140Z',
        { minX: 0, minY: 100, maxX: 600, maxY: 140 },
        40,
      ],
      ['M0 0', { minX: 0, minY: 0, maxX: 0, maxY: 0 }, 0],
    ] as const)(
      'uses the physical thickness of a straight/empty control %s',
      (d, bbox, expected) => {
        expect(
          buildGeometryCache(mockGlyphFromPath(d, bbox), mockFont()).scale
            .stemWidth
        ).toBe(expected);
      }
    );
    it('should compute reasonable stem width estimate', () => {
      const font = loadTestFont('Nohemi-VF.ttf');
      const glyph = getGlyph(font, 'H');
      const cache = buildGeometryCache(glyph, font);

      expect(cache.scale.stemWidth).toBeGreaterThan(0);
      expect(cache.scale.stemWidth).toBeLessThan(cache.scale.bboxW);

      const stemRatio = cache.scale.stemWidth / cache.scale.bboxW;
      expect(stemRatio).toBeGreaterThan(0.01);
      expect(stemRatio).toBeLessThan(0.6);
    });

    it('should compute reasonable epsilon', () => {
      const font = loadTestFont('Nohemi-VF.ttf');
      const glyph = getGlyph(font, 'A');
      const cache = buildGeometryCache(glyph, font);

      expect(cache.scale.eps).toBeGreaterThan(0);
      expect(cache.scale.eps).toBeLessThan(cache.scale.bboxW * 0.01);
    });
  });

  describe('Current variation reference heights', () => {
    it.each([
      { wght: 200, opsz: 6 },
      { wght: 800, opsz: 72 },
    ])('derives Newsreader heights from current x/H outlines at %s', (axes) => {
      const font = loadTestFont('Newsreader-VF.ttf').getVariation(axes);
      const cache = buildGeometryCache(getGlyph(font, 'e'), font);
      const actualX = getGlyph(font, 'x').bbox.maxY;
      const actualH = getGlyph(font, 'H').bbox.maxY;
      expect(cache.metrics.xHeight).toBe(actualX);
      expect(cache.metrics.capHeight).toBe(actualH);
      expect(cache.metrics.xHeight).not.toBe(font.xHeight);
      expect(cache.metrics.ascent).toBe(font.ascent);
      expect(cache.metrics.descent).toBe(font.descent);
    });
    it('preserves Nohemi ordinary reference heights', () => {
      const font = loadTestFont('Nohemi-VF.ttf');
      const metrics = buildGeometryCache(getGlyph(font, 'H'), font).metrics;
      expect(metrics.xHeight).toBe(getGlyph(font, 'x').bbox.maxY);
      expect(metrics.capHeight).toBe(getGlyph(font, 'H').bbox.maxY);
    });
    it('uses font metadata when reference characters are absent', () => {
      const font = mockFont();
      const glyph = mockGlyphFromPath('M0 0L20 0L20 600L0 600Z', {
        minX: 0,
        minY: 0,
        maxX: 20,
        maxY: 600,
      });
      const metrics = buildGeometryCache(glyph, font).metrics;
      expect(metrics.xHeight).toBe(500);
      expect(metrics.capHeight).toBe(700);
    });
  });

  describe('Detection Context Consistency', () => {
    it('should return consistent context for same font', () => {
      const font = loadTestFont('Nohemi-VF.ttf');
      const glyphA = getGlyph(font, 'A');
      const glyphB = getGlyph(font, 'B');
      const cacheA = buildGeometryCache(glyphA, font);
      const cacheB = buildGeometryCache(glyphB, font);

      expect(cacheA.context.isSerif).toBe(cacheB.context.isSerif);
      expect(cacheA.context.isItalic).toBe(cacheB.context.isItalic);
      expect(cacheA.context.isMono).toBe(cacheB.context.isMono);
      expect(cacheA.context.weight).toBe(cacheB.context.weight);
      expect(cacheA.context.unitsPerEm).toBe(cacheB.context.unitsPerEm);
    });
  });
});

describe('Variable Font Cache Invalidation', () => {
  function sharedGlyphContexts() {
    const glyph = mockGlyphFromPath(
      'M0 0L20 0L20 600L0 600Z M0 800L20 800L20 820L0 820Z',
      { minX: 0, minY: 0, maxX: 20, maxY: 820 }
    );
    const firstFont = Object.assign(mockFont({ unitsPerEm: 1000 }), {
      xHeight: 500,
      capHeight: 700,
      ascent: 800,
      descent: -200,
      post: { italicAngle: 0, isFixedPitch: false },
      'OS/2': { usWeightClass: 300 },
    });
    const secondFont = Object.assign(mockFont({ unitsPerEm: 2000 }), {
      xHeight: 1000,
      capHeight: 1400,
      ascent: 1600,
      descent: -400,
      post: { italicAngle: -9, isFixedPitch: true },
      'OS/2': { usWeightClass: 700 },
    });
    return { glyph, firstFont, secondFont };
  }

  it('does not inherit another Font’s metrics and context when glyph and variation identities match', () => {
    const { glyph, firstFont, secondFont } = sharedGlyphContexts();
    expect(firstFont.postscriptName).toBe(secondFont.postscriptName);
    const first = buildGeometryCache(glyph, firstFont, { wght: 400 });
    const second = buildGeometryCache(glyph, secondFont, { wght: 400 });
    expect(second.metrics).toEqual({
      baseline: 0,
      xHeight: 1000,
      capHeight: 1400,
      ascent: 1600,
      descent: -400,
    });
    expect(second.context).toEqual({
      isSerif: false,
      isItalic: true,
      italicAngle: -9,
      isMono: true,
      weight: 700,
      unitsPerEm: 2000,
    });
    expect(second.scale.eps).toBe(2);
    expect(second.contours.map((contour) => contour.type)).toEqual([
      'base',
      'base',
    ]);
    expect(first.metrics.xHeight).toBe(500);
    expect(first.contours.map((contour) => contour.type)).toEqual([
      'base',
      'mark',
    ]);
    expect(second.font).toBe(secondFont);
    expect(second).not.toBe(first);
    expect(second.filled).toBe(first.filled);
  });

  it('reuses each same-glyph same-font variation entry after visiting another font context', () => {
    const { glyph, firstFont, secondFont } = sharedGlyphContexts();
    const first = buildGeometryCache(glyph, firstFont, { wght: 400 });
    const second = buildGeometryCache(glyph, secondFont, { wght: 400 });
    expect(buildGeometryCache(glyph, firstFont, { wght: 400 })).toBe(first);
    expect(buildGeometryCache(glyph, secondFont, { wght: 400 })).toBe(second);
    expect(first.context.weight).toBe(300);
    expect(second.context.weight).toBe(700);
  });

  it('invalidates every variation in every font context for a glyph while preserving unrelated glyph entries', () => {
    const { glyph, firstFont, secondFont } = sharedGlyphContexts();
    const entries = [firstFont, secondFont].flatMap((font) =>
      [400, 700].map((wght) => ({
        font,
        wght,
        cache: buildGeometryCache(glyph, font, { wght }),
      }))
    );
    const unrelated = mockGlyphFromPath('M0 0L20 0L20 600L0 600Z', {
      minX: 0,
      minY: 0,
      maxX: 20,
      maxY: 600,
    });
    const unrelatedCache = buildGeometryCache(unrelated, firstFont);
    invalidateGeometryCache(glyph);
    for (const { font, wght, cache } of entries) {
      const rebuilt = buildGeometryCache(glyph, font, { wght });
      expect(rebuilt).not.toBe(cache);
      expect(rebuilt.metrics.xHeight).toBe(font === firstFont ? 500 : 1000);
      expect(rebuilt.context.weight).toBe(font === firstFont ? 300 : 700);
      expect(buildGeometryCache(glyph, font, { wght })).toBe(rebuilt);
    }
    expect(buildGeometryCache(unrelated, firstFont)).toBe(unrelatedCache);
  });
  it('should create different caches for different variation settings', () => {
    const font = loadTestFont('Nohemi-VF.ttf');

    const variationAxes = (
      font as Font & { variationAxes?: Record<string, unknown> }
    ).variationAxes;
    expect(variationAxes).toHaveProperty('wght');

    const glyph = getGlyph(font, 'A');
    const cache1 = buildGeometryCache(glyph, font, { wght: 400 });
    const cache2 = buildGeometryCache(glyph, font, { wght: 700 });
    const cache3 = buildGeometryCache(glyph, font, { wght: 400 });

    expect(cache1.variationKey).not.toBe(cache2.variationKey);
    expect(cache1.variationKey).toBe(cache3.variationKey);
  });
  it('does not alias distinct fractional variation settings in its cache key', () => {
    const font = loadTestFont('Nohemi-VF.ttf');
    const glyph = getGlyph(font, 'A');
    const first = buildGeometryCache(glyph, font, { wght: 400.001 });
    const second = buildGeometryCache(glyph, font, { wght: 400.002 });
    expect(first).not.toBe(second);
    expect(first.variationKey).not.toBe(second.variationKey);
  });

  it('should produce separate caches for each glyph', () => {
    const font = loadTestFont('Nohemi-VF.ttf');
    const glyphA = getGlyph(font, 'A');
    const glyphB = getGlyph(font, 'B');
    const cacheA = buildGeometryCache(glyphA, font);
    const cacheB = buildGeometryCache(glyphB, font);

    expect(cacheA.glyph).toBe(glyphA);
    expect(cacheB.glyph).toBe(glyphB);
    expect(cacheA.glyph).not.toBe(cacheB.glyph);
    expect(cacheA.scale.bboxW).not.toBe(cacheB.scale.bboxW);
  });

  it('should compute glyph-specific scale primitives', () => {
    const font = loadTestFont('Nohemi-VF.ttf');
    const glyphI = getGlyph(font, 'I');
    const glyphM = getGlyph(font, 'M');
    const cacheI = buildGeometryCache(glyphI, font);
    const cacheM = buildGeometryCache(glyphM, font);

    expect(cacheI.scale.bboxW).toBeLessThan(cacheM.scale.bboxW);
    expect(cacheI.scale.eps).toBeGreaterThan(0);
    expect(cacheM.scale.eps).toBeGreaterThan(0);
    expect(cacheI.scale.stemWidth).toBeGreaterThan(0);
    expect(cacheM.scale.stemWidth).toBeGreaterThan(0);
  });

  it('should handle missing variation settings gracefully', () => {
    const font = loadTestFont('Nohemi-VF.ttf');
    const glyph = getGlyph(font, 'A');
    const cacheDefault = buildGeometryCache(glyph, font);
    const cacheEmpty = buildGeometryCache(glyph, font, {});

    expect(cacheDefault.scale.stemWidth).toBeGreaterThan(0);
    expect(cacheEmpty.scale.stemWidth).toBeGreaterThan(0);
    expect(cacheDefault.variationKey).toBeDefined();
    expect(cacheEmpty.variationKey).toBeDefined();
  });
});
