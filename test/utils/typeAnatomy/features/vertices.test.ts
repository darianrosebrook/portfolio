/**
 * Tests for vertex feature detectors: apex, vertex, crotch.
 * These features detect junction points and angles in glyphs.
 *
 * Note: These tests focus on API contracts, error handling, and type safety.
 * Detection accuracy depends on glyph geometry matching detector heuristics.
 */
import { describe, it, expect } from 'vitest';
import { hasApex } from '@/utils/typeAnatomy/apex';
import { hasVertex } from '@/utils/typeAnatomy/vertex';
import { hasCrotch } from '@/utils/typeAnatomy/crotch';
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
  LETTER_A,
  LETTER_V,
  DONUT,
  EMPTY_PATH,
} from '../../fixtures/svgPaths';

describe('vertex features', () => {
  const metrics = standardMetrics;

  describe('hasApex', () => {
    it('returns boolean for letter A shape', () => {
      const glyph = mockGlyphFromPath(LETTER_A.d, LETTER_A.bbox);

      const result = hasApex(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('returns boolean for letter V', () => {
      const glyph = mockGlyphFromPath(LETTER_V.d, LETTER_V.bbox);

      const result = hasApex(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('does not detect apex in circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      expect(hasApex(glyph, metrics)).toBe(false);
    });

    it('does not detect apex in rectangle', () => {
      const glyph = mockGlyphFromPath(RECTANGLE.d, RECTANGLE.bbox);

      expect(hasApex(glyph, metrics)).toBe(false);
    });

    it('does not detect apex in vertical stem', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      expect(hasApex(glyph, metrics)).toBe(false);
    });

    it('does not detect apex in donut', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);

      expect(hasApex(glyph, metrics)).toBe(false);
    });

    it('returns false for non-drawable glyph', () => {
      const glyph = mockNonDrawableGlyph('null-path');

      expect(hasApex(glyph, metrics)).toBe(false);
    });

    it('returns false for empty glyph', () => {
      const glyph = mockNonDrawableGlyph('empty');

      expect(hasApex(glyph, metrics)).toBe(false);
    });

    it('works via detector orchestration', () => {
      const glyph = mockGlyphFromPath(LETTER_A.d, LETTER_A.bbox);

      const result = detectFeature('Apex', glyph, metrics);

      expect(result).toHaveProperty('found');
      expect(typeof result.found).toBe('boolean');
    });
  });

  describe('hasVertex', () => {
    it('returns boolean for letter V', () => {
      const glyph = mockGlyphFromPath(LETTER_V.d, LETTER_V.bbox);

      const result = hasVertex(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('returns boolean for polygon circle', () => {
      // Polygon approximation of circle has vertices at polygon corners
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      expect(typeof hasVertex(glyph, metrics)).toBe('boolean');
    });

    it('returns boolean for rectangle', () => {
      // Rectangle has corner vertices
      const glyph = mockGlyphFromPath(RECTANGLE.d, RECTANGLE.bbox);

      expect(typeof hasVertex(glyph, metrics)).toBe('boolean');
    });

    it('returns boolean for vertical stem', () => {
      // Vertical stem has corner vertices
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      expect(typeof hasVertex(glyph, metrics)).toBe('boolean');
    });

    it('returns false for non-drawable glyph', () => {
      const glyph = mockNonDrawableGlyph('null-path');

      expect(hasVertex(glyph, metrics)).toBe(false);
    });

    it('returns false for empty glyph', () => {
      const glyph = mockNonDrawableGlyph('empty');

      expect(hasVertex(glyph, metrics)).toBe(false);
    });

    it('works via detector orchestration', () => {
      const glyph = mockGlyphFromPath(LETTER_V.d, LETTER_V.bbox);

      const result = detectFeature('Vertex', glyph, metrics);

      expect(result).toHaveProperty('found');
      expect(typeof result.found).toBe('boolean');
    });
  });

  describe('hasCrotch', () => {
    it('returns boolean for letter A', () => {
      const glyph = mockGlyphFromPath(LETTER_A.d, LETTER_A.bbox);

      const result = hasCrotch(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('returns boolean for letter V', () => {
      const glyph = mockGlyphFromPath(LETTER_V.d, LETTER_V.bbox);

      const result = hasCrotch(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('does not detect crotch in circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      expect(hasCrotch(glyph, metrics)).toBe(false);
    });

    it('does not detect crotch in vertical stem', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      expect(hasCrotch(glyph, metrics)).toBe(false);
    });

    it('does not detect crotch in donut', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);

      expect(hasCrotch(glyph, metrics)).toBe(false);
    });

    it('returns false for non-drawable glyph', () => {
      const glyph = mockNonDrawableGlyph('null-path');

      expect(hasCrotch(glyph, metrics)).toBe(false);
    });

    it('works via detector orchestration', () => {
      const glyph = mockGlyphFromPath(LETTER_A.d, LETTER_A.bbox);

      const result = detectFeature('Crotch', glyph, metrics);

      expect(result).toHaveProperty('found');
      expect(typeof result.found).toBe('boolean');
    });
  });

  describe('edge cases', () => {
    it('handles empty path gracefully', () => {
      const glyph = mockGlyphFromPath(EMPTY_PATH.d, EMPTY_PATH.bbox);

      expect(() => hasApex(glyph, metrics)).not.toThrow();
      expect(() => hasVertex(glyph, metrics)).not.toThrow();
      expect(() => hasCrotch(glyph, metrics)).not.toThrow();
    });

    it('handles extreme metrics', () => {
      const glyph = mockGlyphFromPath(LETTER_A.d, LETTER_A.bbox);
      const extremeMetrics = {
        baseline: -1000,
        xHeight: 500,
        capHeight: 700,
        ascent: 800,
        descent: -2000,
      };

      expect(() => hasApex(glyph, extremeMetrics)).not.toThrow();
      expect(() => hasVertex(glyph, extremeMetrics)).not.toThrow();
      expect(() => hasCrotch(glyph, extremeMetrics)).not.toThrow();
    });

    it('handles very flat triangular shape', () => {
      // Wide, flat triangle
      const flatTriangle = 'M -200 0 L 200 0 L 0 -50 Z';
      const flatBbox = { minX: -200, minY: -50, maxX: 200, maxY: 0 };
      const glyph = mockGlyphFromPath(flatTriangle, flatBbox);

      expect(() => hasApex(glyph, metrics)).not.toThrow();
      expect(() => hasCrotch(glyph, metrics)).not.toThrow();
    });

    it('handles very tall narrow triangle', () => {
      // Tall, narrow triangle
      const tallTriangle = 'M -20 300 L 20 300 L 0 -300 Z';
      const tallBbox = { minX: -20, minY: -300, maxX: 20, maxY: 300 };
      const glyph = mockGlyphFromPath(tallTriangle, tallBbox);

      expect(() => hasApex(glyph, metrics)).not.toThrow();
      expect(() => hasVertex(glyph, metrics)).not.toThrow();
    });
  });
});
