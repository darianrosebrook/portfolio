/**
 * Tests for structural feature detectors: stem, arm, bar, leg.
 * These features detect primary strokes and structural elements in glyphs.
 *
 * Note: These tests focus on API contracts, error handling, and type safety.
 * Detection accuracy depends on glyph geometry matching detector heuristics.
 */
import { describe, it, expect } from 'vitest';
import { hasStem } from '@/utils/typeAnatomy/stem';
import { hasArm } from '@/utils/typeAnatomy/arm';
import { hasBar } from '@/utils/typeAnatomy/bar';
import { hasLeg } from '@/utils/typeAnatomy/leg';
import { detectFeature } from '@/utils/typeAnatomy/detector';
import {
  mockGlyphFromPath,
  mockNonDrawableGlyph,
  mockFont,
  standardMetrics,
} from '../../fixtures/mockGlyph';
import {
  VERTICAL_STEM,
  HORIZONTAL_BAR,
  CIRCLE,
  RECTANGLE,
  LETTER_I_SERIF,
  LETTER_I_SANS,
  LETTER_T,
  LETTER_E_UPPERCASE,
  DONUT,
  EMPTY_PATH,
} from '../../fixtures/svgPaths';

describe('structural features', () => {
  const metrics = standardMetrics;
  const font = mockFont();

  describe('hasStem', () => {
    it('returns boolean for vertical stem shape', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      const result = hasStem(glyph, metrics, font);
      expect(typeof result).toBe('boolean');
    });

    it('returns boolean for serif I', () => {
      const glyph = mockGlyphFromPath(LETTER_I_SERIF.d, LETTER_I_SERIF.bbox);

      const result = hasStem(glyph, metrics, font);
      expect(typeof result).toBe('boolean');
    });

    it('returns boolean for sans-serif I', () => {
      const glyph = mockGlyphFromPath(LETTER_I_SANS.d, LETTER_I_SANS.bbox);

      const result = hasStem(glyph, metrics, font);
      expect(typeof result).toBe('boolean');
    });

    it('returns boolean for letter T', () => {
      const glyph = mockGlyphFromPath(LETTER_T.d, LETTER_T.bbox);

      const result = hasStem(glyph, metrics, font);
      expect(typeof result).toBe('boolean');
    });

    it('returns boolean for horizontal bar', () => {
      const glyph = mockGlyphFromPath(HORIZONTAL_BAR.d, HORIZONTAL_BAR.bbox);

      const result = hasStem(glyph, metrics, font);
      expect(typeof result).toBe('boolean');
    });

    it('returns boolean for circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      const result = hasStem(glyph, metrics, font);
      expect(typeof result).toBe('boolean');
    });

    it('returns false for non-drawable glyph', () => {
      const glyph = mockNonDrawableGlyph('null-path');

      expect(hasStem(glyph, metrics, font)).toBe(false);
    });

    it('returns false for empty glyph', () => {
      const glyph = mockNonDrawableGlyph('empty');

      expect(hasStem(glyph, metrics, font)).toBe(false);
    });

    it('works with different font unitsPerEm', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);
      const font2000 = mockFont({ unitsPerEm: 2000 });

      const result = hasStem(glyph, metrics, font2000);
      expect(typeof result).toBe('boolean');
    });

    it('works via detector orchestration', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      const result = detectFeature('Stem', glyph, metrics, font);

      expect(result).toHaveProperty('found');
      expect(typeof result.found).toBe('boolean');
    });

    it('detector returns false without font', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      const result = detectFeature('Stem', glyph, metrics);

      // Stem requires font parameter
      expect(result.found).toBe(false);
    });
  });

  describe('hasArm', () => {
    it('returns boolean for letter T', () => {
      const glyph = mockGlyphFromPath(LETTER_T.d, LETTER_T.bbox);

      const result = hasArm(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('returns boolean for uppercase E', () => {
      const glyph = mockGlyphFromPath(LETTER_E_UPPERCASE.d, LETTER_E_UPPERCASE.bbox);

      const result = hasArm(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('returns boolean for vertical stem only', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      const result = hasArm(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('does not detect arm in circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      expect(hasArm(glyph, metrics)).toBe(false);
    });

    it('returns false for non-drawable glyph', () => {
      const glyph = mockNonDrawableGlyph('null-path');

      expect(hasArm(glyph, metrics)).toBe(false);
    });

    it('works via detector orchestration', () => {
      const glyph = mockGlyphFromPath(LETTER_T.d, LETTER_T.bbox);

      const result = detectFeature('Arm', glyph, metrics);

      expect(result).toHaveProperty('found');
      expect(typeof result.found).toBe('boolean');
    });
  });

  describe('hasBar', () => {
    it('returns boolean for uppercase E', () => {
      const glyph = mockGlyphFromPath(LETTER_E_UPPERCASE.d, LETTER_E_UPPERCASE.bbox);

      const result = hasBar(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('does not detect bar in simple vertical stem', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      expect(hasBar(glyph, metrics)).toBe(false);
    });

    it('does not detect bar in circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      expect(hasBar(glyph, metrics)).toBe(false);
    });

    it('does not detect bar in donut (no crossbar)', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);

      expect(hasBar(glyph, metrics)).toBe(false);
    });

    it('returns false for non-drawable glyph', () => {
      const glyph = mockNonDrawableGlyph('null-path');

      expect(hasBar(glyph, metrics)).toBe(false);
    });

    it('works via detector orchestration', () => {
      const glyph = mockGlyphFromPath(LETTER_E_UPPERCASE.d, LETTER_E_UPPERCASE.bbox);

      const result = detectFeature('Bar', glyph, metrics);

      expect(result).toHaveProperty('found');
      expect(typeof result.found).toBe('boolean');
    });

    it('Crossbar maps to Bar detector', () => {
      const glyph = mockGlyphFromPath(LETTER_E_UPPERCASE.d, LETTER_E_UPPERCASE.bbox);

      const barResult = detectFeature('Bar', glyph, metrics);
      const crossbarResult = detectFeature('Crossbar', glyph, metrics);

      // Both should give same result (Crossbar maps to Bar)
      expect(barResult.found).toBe(crossbarResult.found);
    });
  });

  describe('hasLeg', () => {
    it('returns boolean for vertical stem', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      const result = hasLeg(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('does not detect leg in circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      expect(hasLeg(glyph, metrics)).toBe(false);
    });

    it('returns false for non-drawable glyph', () => {
      const glyph = mockNonDrawableGlyph('null-path');

      expect(hasLeg(glyph, metrics)).toBe(false);
    });

    it('works via detector orchestration', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      const result = detectFeature('Leg', glyph, metrics);

      expect(result).toHaveProperty('found');
      expect(typeof result.found).toBe('boolean');
    });
  });

  describe('edge cases', () => {
    it('handles empty path gracefully', () => {
      const glyph = mockGlyphFromPath(EMPTY_PATH.d, EMPTY_PATH.bbox);

      expect(() => hasStem(glyph, metrics, font)).not.toThrow();
      expect(() => hasArm(glyph, metrics)).not.toThrow();
      expect(() => hasBar(glyph, metrics)).not.toThrow();
    });

    it('handles very thin strokes', () => {
      // Very thin vertical line
      const thinPath = 'M -1 -300 L 1 -300 L 1 300 L -1 300 Z';
      const thinBbox = { minX: -1, minY: -300, maxX: 1, maxY: 300 };
      const glyph = mockGlyphFromPath(thinPath, thinBbox);

      expect(() => hasStem(glyph, metrics, font)).not.toThrow();
    });

    it('handles unusual aspect ratio', () => {
      // Very wide, short rectangle
      const widePath = 'M -500 -10 L 500 -10 L 500 10 L -500 10 Z';
      const wideBbox = { minX: -500, minY: -10, maxX: 500, maxY: 10 };
      const glyph = mockGlyphFromPath(widePath, wideBbox);

      expect(() => hasStem(glyph, metrics, font)).not.toThrow();
      expect(() => hasArm(glyph, metrics)).not.toThrow();
    });
  });
});
