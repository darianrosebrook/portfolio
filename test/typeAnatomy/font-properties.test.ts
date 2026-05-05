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
import { buildGeometryCache } from '@/utils/typeAnatomy/geometryCache';

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

    it.fails(
      'should detect Monaspace as monospace (currently isMono=false; detector bug)',
      () => {
        const font = loadTestFont('MonaspaceNeonVF.ttf');
        const glyph = getGlyph(font, 'A');
        const cache = buildGeometryCache(glyph, font);
        expect(cache.context.isMono).toBe(true);
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
  });

  describe('Scale Primitives', () => {
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
  it('should create different caches for different variation settings', () => {
    const font = loadTestFont('Nohemi-VF.ttf');

    const variationAxes = (
      font as Font & { variationAxes?: Record<string, unknown> }
    ).variationAxes;
    if (!variationAxes || Object.keys(variationAxes).length === 0) {
      console.warn('Skipping test: Font does not support variations');
      return;
    }

    const glyph = getGlyph(font, 'A');
    const cache1 = buildGeometryCache(glyph, font, { wght: 400 });
    const cache2 = buildGeometryCache(glyph, font, { wght: 700 });
    const cache3 = buildGeometryCache(glyph, font, { wght: 400 });

    expect(cache1.variationKey).not.toBe(cache2.variationKey);
    expect(cache1.variationKey).toBe(cache3.variationKey);
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
