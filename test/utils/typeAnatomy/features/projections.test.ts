/**
 * Tests for projection feature detectors: serif, ear, spur, beak, bracket.
 * These features detect small projections and decorative elements.
 *
 * Note: These tests focus on API contracts, error handling, and type safety.
 * Detection accuracy depends on glyph geometry matching detector heuristics.
 */
import { describe, it, expect } from 'vitest';
import { hasSerif } from '@/utils/typeAnatomy/serif';
import { hasEar } from '@/utils/typeAnatomy/ear';
import { hasSpur } from '@/utils/typeAnatomy/spur';
import { hasBeak } from '@/utils/typeAnatomy/beak';
import { hasBracket } from '@/utils/typeAnatomy/bracket';
import { detectFeature } from '@/utils/typeAnatomy/detector';
import {
  mockGlyphFromPath,
  mockNonDrawableGlyph,
  standardMetrics,
} from '../../fixtures/mockGlyph';
import {
  CIRCLE,
  RECTANGLE,
  VERTICAL_STEM,
  LETTER_I_SERIF,
  LETTER_I_SANS,
  LETTER_R_LOWERCASE,
  DONUT,
  EMPTY_PATH,
} from '../../fixtures/svgPaths';

describe('projection features', () => {
  const metrics = standardMetrics;

  describe('hasSerif', () => {
    it('returns boolean for serif I', () => {
      const glyph = mockGlyphFromPath(LETTER_I_SERIF.d, LETTER_I_SERIF.bbox);

      const result = hasSerif(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('returns boolean for sans-serif I', () => {
      const glyph = mockGlyphFromPath(LETTER_I_SANS.d, LETTER_I_SANS.bbox);

      const result = hasSerif(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('returns boolean for polygon circle', () => {
      // Polygon approximation may have edges detected as serifs
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      expect(typeof hasSerif(glyph, metrics)).toBe('boolean');
    });

    it('returns boolean for plain rectangle', () => {
      const glyph = mockGlyphFromPath(RECTANGLE.d, RECTANGLE.bbox);

      expect(typeof hasSerif(glyph, metrics)).toBe('boolean');
    });

    it('returns boolean for donut', () => {
      // Polygon approximation may have edges detected as serifs
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);

      expect(typeof hasSerif(glyph, metrics)).toBe('boolean');
    });

    it('returns false for non-drawable glyph', () => {
      const glyph = mockNonDrawableGlyph('null-path');

      expect(hasSerif(glyph, metrics)).toBe(false);
    });

    it('returns false for empty glyph', () => {
      const glyph = mockNonDrawableGlyph('empty');

      expect(hasSerif(glyph, metrics)).toBe(false);
    });

    it('works via detector orchestration', () => {
      const glyph = mockGlyphFromPath(LETTER_I_SERIF.d, LETTER_I_SERIF.bbox);

      const result = detectFeature('Serif', glyph, metrics);

      expect(result).toHaveProperty('found');
      expect(typeof result.found).toBe('boolean');
    });
  });

  describe('hasEar', () => {
    it('returns boolean for lowercase r', () => {
      const glyph = mockGlyphFromPath(LETTER_R_LOWERCASE.d, LETTER_R_LOWERCASE.bbox);

      const result = hasEar(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('does not detect ear in vertical stem', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      expect(hasEar(glyph, metrics)).toBe(false);
    });

    it('does not detect ear in circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      expect(hasEar(glyph, metrics)).toBe(false);
    });

    it('returns false for non-drawable glyph', () => {
      const glyph = mockNonDrawableGlyph('null-path');

      expect(hasEar(glyph, metrics)).toBe(false);
    });

    it('works via detector orchestration', () => {
      const glyph = mockGlyphFromPath(LETTER_R_LOWERCASE.d, LETTER_R_LOWERCASE.bbox);

      const result = detectFeature('Ear', glyph, metrics);

      expect(result).toHaveProperty('found');
      expect(typeof result.found).toBe('boolean');
    });
  });

  describe('hasSpur', () => {
    it('returns boolean for circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      const result = hasSpur(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('returns boolean for vertical stem', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      const result = hasSpur(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('returns boolean for rectangle', () => {
      const glyph = mockGlyphFromPath(RECTANGLE.d, RECTANGLE.bbox);

      const result = hasSpur(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('returns false for non-drawable glyph', () => {
      const glyph = mockNonDrawableGlyph('null-path');

      expect(hasSpur(glyph, metrics)).toBe(false);
    });

    it('works via detector orchestration', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      const result = detectFeature('Spur', glyph, metrics);

      expect(result).toHaveProperty('found');
      expect(typeof result.found).toBe('boolean');
    });
  });

  describe('hasBeak', () => {
    it('returns boolean for circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      const result = hasBeak(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('returns boolean for vertical stem', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      const result = hasBeak(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('returns false for non-drawable glyph', () => {
      const glyph = mockNonDrawableGlyph('null-path');

      expect(hasBeak(glyph, metrics)).toBe(false);
    });

    it('works via detector orchestration', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      const result = detectFeature('Beak', glyph, metrics);

      expect(result).toHaveProperty('found');
      expect(typeof result.found).toBe('boolean');
    });
  });

  describe('hasBracket', () => {
    it('returns boolean for serif I', () => {
      const glyph = mockGlyphFromPath(LETTER_I_SERIF.d, LETTER_I_SERIF.bbox);

      const result = hasBracket(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('returns boolean for sans-serif I', () => {
      const glyph = mockGlyphFromPath(LETTER_I_SANS.d, LETTER_I_SANS.bbox);

      const result = hasBracket(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('does not detect bracket in circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      expect(hasBracket(glyph, metrics)).toBe(false);
    });

    it('returns false for non-drawable glyph', () => {
      const glyph = mockNonDrawableGlyph('null-path');

      expect(hasBracket(glyph, metrics)).toBe(false);
    });

    it('works via detector orchestration', () => {
      const glyph = mockGlyphFromPath(LETTER_I_SERIF.d, LETTER_I_SERIF.bbox);

      const result = detectFeature('Bracket', glyph, metrics);

      expect(result).toHaveProperty('found');
      expect(typeof result.found).toBe('boolean');
    });
  });

  describe('edge cases', () => {
    it('handles empty path gracefully', () => {
      const glyph = mockGlyphFromPath(EMPTY_PATH.d, EMPTY_PATH.bbox);

      expect(() => hasSerif(glyph, metrics)).not.toThrow();
      expect(() => hasEar(glyph, metrics)).not.toThrow();
      expect(() => hasSpur(glyph, metrics)).not.toThrow();
      expect(() => hasBeak(glyph, metrics)).not.toThrow();
      expect(() => hasBracket(glyph, metrics)).not.toThrow();
    });

    it('handles very small projection-like shapes', () => {
      // Small tab/projection shape
      const tabPath = `
        M -20 0 L 20 0 L 20 100 L 40 100 L 40 120 L 20 120
        L 20 200 L -20 200 L -20 120 L -40 120 L -40 100 L -20 100 Z
      `.replace(/\s+/g, ' ').trim();
      const tabBbox = { minX: -40, minY: 0, maxX: 40, maxY: 200 };
      const glyph = mockGlyphFromPath(tabPath, tabBbox);

      expect(() => hasSerif(glyph, metrics)).not.toThrow();
      expect(() => hasEar(glyph, metrics)).not.toThrow();
    });

    it('handles complex path with multiple projections', () => {
      // Shape with multiple small projections
      const complexPath = `
        M 0 0 L 100 0 L 100 -20 L 120 -20 L 120 20 L 100 20 L 100 100
        L 120 100 L 120 140 L 100 140 L 100 200 L 0 200 L 0 140 L -20 140
        L -20 100 L 0 100 L 0 20 L -20 20 L -20 -20 L 0 -20 Z
      `.replace(/\s+/g, ' ').trim();
      const complexBbox = { minX: -20, minY: -20, maxX: 120, maxY: 200 };
      const glyph = mockGlyphFromPath(complexPath, complexBbox);

      expect(() => hasSerif(glyph, metrics)).not.toThrow();
      expect(() => hasSpur(glyph, metrics)).not.toThrow();
    });
  });
});
