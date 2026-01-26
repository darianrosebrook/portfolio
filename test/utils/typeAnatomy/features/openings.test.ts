/**
 * Tests for opening feature detectors: aperture, link, neck.
 * These features detect openings, connections, and narrow passages in glyphs.
 *
 * Note: These tests focus on API contracts, error handling, and type safety.
 * Detection accuracy depends on glyph geometry matching detector heuristics.
 */
import { describe, it, expect } from 'vitest';
import { hasAperture } from '@/utils/typeAnatomy/aperture';
import { hasLink } from '@/utils/typeAnatomy/link';
import { hasNeck } from '@/utils/typeAnatomy/neck';
import { detectFeature } from '@/utils/typeAnatomy/detector';
import {
  mockGlyphFromPath,
  mockNonDrawableGlyph,
  standardMetrics,
} from '../../fixtures/mockGlyph';
import {
  CIRCLE,
  DONUT,
  VERTICAL_STEM,
  LETTER_E_LOWERCASE,
  LETTER_G_LOWERCASE,
  RECTANGLE,
  EMPTY_PATH,
} from '../../fixtures/svgPaths';

describe('opening features', () => {
  const metrics = standardMetrics;

  describe('hasAperture', () => {
    it('returns boolean for lowercase e', () => {
      const glyph = mockGlyphFromPath(LETTER_E_LOWERCASE.d, LETTER_E_LOWERCASE.bbox);

      const result = hasAperture(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('returns boolean for donut', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);

      const result = hasAperture(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('does not detect aperture in solid circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      expect(hasAperture(glyph, metrics)).toBe(false);
    });

    it('does not detect aperture in vertical stem', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      expect(hasAperture(glyph, metrics)).toBe(false);
    });

    it('does not detect aperture in rectangle', () => {
      const glyph = mockGlyphFromPath(RECTANGLE.d, RECTANGLE.bbox);

      expect(hasAperture(glyph, metrics)).toBe(false);
    });

    it('returns false for non-drawable glyph', () => {
      const glyph = mockNonDrawableGlyph('null-path');

      expect(hasAperture(glyph, metrics)).toBe(false);
    });

    it('returns false for empty glyph', () => {
      const glyph = mockNonDrawableGlyph('empty');

      expect(hasAperture(glyph, metrics)).toBe(false);
    });

    it('works via detector orchestration', () => {
      const glyph = mockGlyphFromPath(LETTER_E_LOWERCASE.d, LETTER_E_LOWERCASE.bbox);

      const result = detectFeature('Aperture', glyph, metrics);

      expect(result).toHaveProperty('found');
      expect(typeof result.found).toBe('boolean');
    });
  });

  describe('hasLink', () => {
    it('returns boolean for lowercase g', () => {
      const glyph = mockGlyphFromPath(LETTER_G_LOWERCASE.d, LETTER_G_LOWERCASE.bbox);

      const result = hasLink(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('does not detect link in donut (single enclosed region)', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);

      expect(hasLink(glyph, metrics)).toBe(false);
    });

    it('does not detect link in circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      expect(hasLink(glyph, metrics)).toBe(false);
    });

    it('does not detect link in vertical stem', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      expect(hasLink(glyph, metrics)).toBe(false);
    });

    it('returns false for non-drawable glyph', () => {
      const glyph = mockNonDrawableGlyph('null-path');

      expect(hasLink(glyph, metrics)).toBe(false);
    });

    it('works via detector orchestration', () => {
      const glyph = mockGlyphFromPath(LETTER_G_LOWERCASE.d, LETTER_G_LOWERCASE.bbox);

      const result = detectFeature('Link', glyph, metrics);

      expect(result).toHaveProperty('found');
      expect(typeof result.found).toBe('boolean');
    });
  });

  describe('hasNeck', () => {
    it('does not detect neck in circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      expect(hasNeck(glyph, metrics)).toBe(false);
    });

    it('does not detect neck in vertical stem', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      expect(hasNeck(glyph, metrics)).toBe(false);
    });

    it('does not detect neck in donut', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);

      expect(hasNeck(glyph, metrics)).toBe(false);
    });

    it('returns false for non-drawable glyph', () => {
      const glyph = mockNonDrawableGlyph('null-path');

      expect(hasNeck(glyph, metrics)).toBe(false);
    });

    it('works via detector orchestration', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      const result = detectFeature('Neck', glyph, metrics);

      expect(result).toHaveProperty('found');
      expect(typeof result.found).toBe('boolean');
    });
  });

  describe('edge cases', () => {
    it('handles empty path gracefully', () => {
      const glyph = mockGlyphFromPath(EMPTY_PATH.d, EMPTY_PATH.bbox);

      expect(() => hasAperture(glyph, metrics)).not.toThrow();
      expect(() => hasLink(glyph, metrics)).not.toThrow();
      expect(() => hasNeck(glyph, metrics)).not.toThrow();
    });

    it('handles path with multiple openings', () => {
      // C-like shape with opening (polygon approximation)
      const cPath = `
        M 150 0 L 200 50 L 200 350 L 150 400 L -150 400 L -200 350 L -200 50 L -150 0 L 50 0 L 50 50
        L -150 50 L -150 350 L 150 350 L 150 50 L 50 50 L 50 0 Z
      `.replace(/\s+/g, ' ').trim();
      const cBbox = { minX: -200, minY: 0, maxX: 200, maxY: 400 };
      const glyph = mockGlyphFromPath(cPath, cBbox);

      expect(() => hasAperture(glyph, metrics)).not.toThrow();
    });

    it('handles narrow connection shape (potential neck)', () => {
      // Hourglass-like shape with narrow middle
      const hourglassPath = `
        M -100 0 L 100 0 L 20 100 L 100 200 L -100 200 L -20 100 Z
      `.replace(/\s+/g, ' ').trim();
      const hourglassBbox = { minX: -100, minY: 0, maxX: 100, maxY: 200 };
      const glyph = mockGlyphFromPath(hourglassPath, hourglassBbox);

      expect(() => hasNeck(glyph, metrics)).not.toThrow();
    });

    it('handles unusual metrics for link detection', () => {
      const glyph = mockGlyphFromPath(LETTER_G_LOWERCASE.d, LETTER_G_LOWERCASE.bbox);
      const unusualMetrics = {
        baseline: 100, // Elevated baseline
        xHeight: 400,
        capHeight: 500,
        ascent: 600,
        descent: -200,
      };

      expect(() => hasLink(glyph, unusualMetrics)).not.toThrow();
    });

    it('handles glyph with complex nested openings', () => {
      // Figure-8 like shape (polygon approximation)
      const figure8Path = `
        M 0 -325 L 150 -250 L 150 -100 L 0 -25 L -150 -100 L -150 -250 Z
        M 0 -250 L 75 -200 L 75 -150 L 0 -100 L -75 -150 L -75 -200 Z
        M 0 325 L 150 250 L 150 100 L 0 25 L -150 100 L -150 250 Z
        M 0 250 L 75 200 L 75 150 L 0 100 L -75 150 L -75 200 Z
      `.replace(/\s+/g, ' ').trim();
      const figure8Bbox = { minX: -150, minY: -325, maxX: 150, maxY: 325 };
      const glyph = mockGlyphFromPath(figure8Path, figure8Bbox);

      expect(() => hasAperture(glyph, metrics)).not.toThrow();
      expect(() => hasLink(glyph, metrics)).not.toThrow();
    });
  });
});
