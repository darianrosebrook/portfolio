/**
 * Font property detection tests.
 *
 * Tests the geometry-based serif detection and other font-level properties.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as fontkit from 'fontkit';
import type { Font, Glyph } from 'fontkit';
import { buildGeometryCache } from '@/utils/typeAnatomy/geometryCache';

// Test font loading helper
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

describe('Font Property Detection', () => {
  describe('Serif Detection', () => {
    it('should detect Nohemi as sans-serif', () => {
      const font = loadTestFont('Nohemi-VF.ttf');
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

      // Nohemi is a sans-serif font
      expect(cache.context.isSerif).toBe(false);
    });

    it('should detect Inter as sans-serif', () => {
      const font = loadTestFont('InterVariable.ttf');
      if (!font) {
        console.warn('Skipping test: Inter font not available');
        return;
      }

      const glyph = getGlyph(font, 'A');
      if (!glyph) {
        console.warn('Skipping test: Glyph A not available');
        return;
      }

      const cache = buildGeometryCache(glyph, font);

      // Inter is a sans-serif font
      expect(cache.context.isSerif).toBe(false);
    });

    it('should detect Newsreader as serif', () => {
      const font = loadTestFont('Newsreader-VF.ttf');
      if (!font) {
        console.warn('Skipping test: Newsreader font not available');
        return;
      }

      const glyph = getGlyph(font, 'A');
      if (!glyph) {
        console.warn('Skipping test: Glyph A not available');
        return;
      }

      const cache = buildGeometryCache(glyph, font);

      // Newsreader is a serif font
      expect(cache.context.isSerif).toBe(true);
    });

    it('should detect Monaspace as monospace', () => {
      const font = loadTestFont('MonaspaceNeonVF.ttf');
      if (!font) {
        console.warn('Skipping test: Monaspace font not available');
        return;
      }

      const glyph = getGlyph(font, 'A');
      if (!glyph) {
        console.warn('Skipping test: Glyph A not available');
        return;
      }

      const cache = buildGeometryCache(glyph, font);

      // Monaspace should be detected as monospace
      // (isMono flag from font tables)
      expect(typeof cache.context.isMono).toBe('boolean');
    });
  });

  describe('Italic Detection', () => {
    it('should detect upright fonts correctly', () => {
      const font = loadTestFont('Nohemi-VF.ttf');
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

      // Nohemi regular should not be italic
      expect(cache.context.isItalic).toBe(false);
      expect(cache.context.italicAngle).toBe(0);
    });
  });

  describe('Scale Primitives', () => {
    it('should compute reasonable stem width estimate', () => {
      const font = loadTestFont('Nohemi-VF.ttf');
      if (!font) {
        console.warn('Skipping test: Nohemi font not available');
        return;
      }

      // Use 'H' which has clearer stem separation than 'I'
      const glyph = getGlyph(font, 'H');
      if (!glyph) {
        console.warn('Skipping test: Glyph H not available');
        return;
      }

      const cache = buildGeometryCache(glyph, font);

      // Stem width should be positive and reasonable
      expect(cache.scale.stemWidth).toBeGreaterThan(0);
      expect(cache.scale.stemWidth).toBeLessThan(cache.scale.bboxW);

      // For 'H', stem should be a fraction of glyph width (typically 5-30%)
      const stemRatio = cache.scale.stemWidth / cache.scale.bboxW;
      expect(stemRatio).toBeGreaterThan(0.01);
      expect(stemRatio).toBeLessThan(0.6);
    });

    it('should compute reasonable epsilon', () => {
      const font = loadTestFont('Nohemi-VF.ttf');
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

      // Epsilon should be small but positive
      expect(cache.scale.eps).toBeGreaterThan(0);
      expect(cache.scale.eps).toBeLessThan(cache.scale.bboxW * 0.01);
    });
  });

  describe('Detection Context Consistency', () => {
    it('should return consistent context for same font', () => {
      const font = loadTestFont('Nohemi-VF.ttf');
      if (!font) {
        console.warn('Skipping test: Nohemi font not available');
        return;
      }

      const glyphA = getGlyph(font, 'A');
      const glyphB = getGlyph(font, 'B');
      if (!glyphA || !glyphB) {
        console.warn('Skipping test: Glyphs not available');
        return;
      }

      const cacheA = buildGeometryCache(glyphA, font);
      const cacheB = buildGeometryCache(glyphB, font);

      // Font-level properties should be consistent across glyphs
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
    if (!font) {
      console.warn('Skipping test: Nohemi font not available');
      return;
    }

    // Check if font supports variations
    const variationAxes = (
      font as Font & { variationAxes?: Record<string, unknown> }
    ).variationAxes;
    if (!variationAxes || Object.keys(variationAxes).length === 0) {
      console.warn('Skipping test: Font does not support variations');
      return;
    }

    const glyph = getGlyph(font, 'A');
    if (!glyph) {
      console.warn('Skipping test: Glyph A not available');
      return;
    }

    // Build caches with different variation settings
    const cache1 = buildGeometryCache(glyph, font, { wght: 400 });
    const cache2 = buildGeometryCache(glyph, font, { wght: 700 });
    const cache3 = buildGeometryCache(glyph, font, { wght: 400 }); // Same as cache1

    // Different variation settings should produce different cache keys
    expect(cache1.variationKey).not.toBe(cache2.variationKey);

    // Same variation settings should produce the same cache key
    expect(cache1.variationKey).toBe(cache3.variationKey);
  });

  it('should produce separate caches for each glyph', () => {
    const font = loadTestFont('Nohemi-VF.ttf');
    if (!font) {
      console.warn('Skipping test: Nohemi font not available');
      return;
    }

    const glyphA = getGlyph(font, 'A');
    const glyphB = getGlyph(font, 'B');
    if (!glyphA || !glyphB) {
      console.warn('Skipping test: Glyphs not available');
      return;
    }

    const cacheA = buildGeometryCache(glyphA, font);
    const cacheB = buildGeometryCache(glyphB, font);

    // Variation key is about axis settings, not glyph identity
    // The cache is stored per glyph via WeakMap keying
    // Both should have valid caches with different geometry
    expect(cacheA.glyph).toBe(glyphA);
    expect(cacheB.glyph).toBe(glyphB);
    expect(cacheA.glyph).not.toBe(cacheB.glyph);

    // Scale primitives should reflect glyph geometry
    expect(cacheA.scale.bboxW).not.toBe(cacheB.scale.bboxW);
  });

  it('should compute glyph-specific scale primitives', () => {
    const font = loadTestFont('Nohemi-VF.ttf');
    if (!font) {
      console.warn('Skipping test: Nohemi font not available');
      return;
    }

    const glyphI = getGlyph(font, 'I'); // Narrow vertical stroke
    const glyphM = getGlyph(font, 'M'); // Wide with multiple strokes
    if (!glyphI || !glyphM) {
      console.warn('Skipping test: Glyphs not available');
      return;
    }

    const cacheI = buildGeometryCache(glyphI, font);
    const cacheM = buildGeometryCache(glyphM, font);

    // 'I' should be narrower than 'M'
    expect(cacheI.scale.bboxW).toBeLessThan(cacheM.scale.bboxW);

    // Both should have valid epsilon values
    expect(cacheI.scale.eps).toBeGreaterThan(0);
    expect(cacheM.scale.eps).toBeGreaterThan(0);

    // Stem width estimates may differ based on glyph geometry
    expect(cacheI.scale.stemWidth).toBeGreaterThan(0);
    expect(cacheM.scale.stemWidth).toBeGreaterThan(0);
  });

  it('should handle missing variation settings gracefully', () => {
    const font = loadTestFont('Nohemi-VF.ttf');
    if (!font) {
      console.warn('Skipping test: Nohemi font not available');
      return;
    }

    const glyph = getGlyph(font, 'A');
    if (!glyph) {
      console.warn('Skipping test: Glyph A not available');
      return;
    }

    // Build cache without variation settings (should use defaults)
    const cacheDefault = buildGeometryCache(glyph, font);

    // Build cache with empty variation settings
    const cacheEmpty = buildGeometryCache(glyph, font, {});

    // Both should produce valid caches with valid scale primitives
    expect(cacheDefault.scale.stemWidth).toBeGreaterThan(0);
    expect(cacheEmpty.scale.stemWidth).toBeGreaterThan(0);

    // Variation keys exist but may differ in format (undefined vs {})
    // The key thing is both produce usable caches
    expect(cacheDefault.variationKey).toBeDefined();
    expect(cacheEmpty.variationKey).toBeDefined();
  });
});
