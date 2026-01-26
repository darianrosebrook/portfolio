/**
 * Tests for terminal feature detectors: terminal, tittle, finial.
 * These features detect stroke endings and diacritical marks.
 *
 * Note: These tests focus on API contracts, error handling, and type safety.
 * Detection accuracy depends on glyph geometry matching detector heuristics.
 */
import { describe, it, expect } from 'vitest';
import { getTerminal, hasTerminal } from '@/utils/typeAnatomy/terminal';
import { getTittle, hasTittle } from '@/utils/typeAnatomy/tittle';
import { hasFinial } from '@/utils/typeAnatomy/finial';
import { detectFeature } from '@/utils/typeAnatomy/detector';
import {
  mockGlyphFromPath,
  mockNonDrawableGlyph,
  mockFont,
  standardMetrics,
} from '../../fixtures/mockGlyph';
import {
  CIRCLE,
  SMALL_CIRCLE,
  VERTICAL_STEM,
  LETTER_I_LOWERCASE,
  LETTER_I_SERIF,
  LETTER_I_SANS,
  DONUT,
  EMPTY_PATH,
} from '../../fixtures/svgPaths';

describe('terminal features', () => {
  const metrics = standardMetrics;
  const font = mockFont();

  describe('getTerminal / hasTerminal', () => {
    it('returns FeatureResult object', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      const result = getTerminal(glyph, metrics);

      expect(result).toHaveProperty('found');
      expect(typeof result.found).toBe('boolean');
    });

    it('returns boolean for vertical stem', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      const result = getTerminal(glyph, metrics);
      expect(result).toHaveProperty('found');
    });

    it('returns shape for ball terminal when found', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      const result = getTerminal(glyph, metrics);

      // If found with shape, should be circle type for ball terminal
      if (result.found && result.shape) {
        expect(result.shape.type).toBe('circle');
      }
    });

    it('hasTerminal returns boolean', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      const result = hasTerminal(glyph, metrics);

      expect(typeof result).toBe('boolean');
    });

    it('returns found: false for non-drawable glyph', () => {
      const glyph = mockNonDrawableGlyph('null-path');

      const result = getTerminal(glyph, metrics);

      expect(result.found).toBe(false);
    });

    it('returns found: false for empty glyph', () => {
      const glyph = mockNonDrawableGlyph('empty');

      const result = getTerminal(glyph, metrics);

      expect(result.found).toBe(false);
    });

    it('works via detector orchestration', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      const result = detectFeature('Terminal', glyph, metrics);

      expect(result).toHaveProperty('found');
      expect(typeof result.found).toBe('boolean');
    });
  });

  describe('getTittle / hasTittle', () => {
    it('returns FeatureResult for lowercase i', () => {
      const glyph = mockGlyphFromPath(LETTER_I_LOWERCASE.d, LETTER_I_LOWERCASE.bbox);

      const result = getTittle(glyph, metrics, font);

      expect(result).toHaveProperty('found');
      expect(typeof result.found).toBe('boolean');
    });

    it('returns circle shape when tittle found', () => {
      const glyph = mockGlyphFromPath(LETTER_I_LOWERCASE.d, LETTER_I_LOWERCASE.bbox);

      const result = getTittle(glyph, metrics, font);

      if (result.found && result.shape) {
        expect(result.shape.type).toBe('circle');
        if (result.shape.type === 'circle') {
          expect(result.shape).toHaveProperty('cx');
          expect(result.shape).toHaveProperty('cy');
          expect(result.shape).toHaveProperty('r');
        }
      }
    });

    it('returns FeatureResult for vertical stem', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      const result = getTittle(glyph, metrics, font);

      expect(result).toHaveProperty('found');
    });

    it('returns FeatureResult for circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      const result = getTittle(glyph, metrics, font);

      expect(result).toHaveProperty('found');
    });

    it('returns FeatureResult for donut', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);

      const result = getTittle(glyph, metrics, font);

      expect(result).toHaveProperty('found');
    });

    it('hasTittle returns boolean', () => {
      const glyph = mockGlyphFromPath(LETTER_I_LOWERCASE.d, LETTER_I_LOWERCASE.bbox);

      const result = hasTittle(glyph, metrics, font);

      expect(typeof result).toBe('boolean');
    });

    it('returns found: false for non-drawable glyph', () => {
      const glyph = mockNonDrawableGlyph('null-path');

      const result = getTittle(glyph, metrics, font);

      expect(result.found).toBe(false);
    });

    it('works without font parameter', () => {
      const glyph = mockGlyphFromPath(LETTER_I_LOWERCASE.d, LETTER_I_LOWERCASE.bbox);

      // Should not throw when font is undefined
      const result = getTittle(glyph, metrics);

      expect(result).toHaveProperty('found');
    });

    it('works via detector orchestration', () => {
      const glyph = mockGlyphFromPath(LETTER_I_LOWERCASE.d, LETTER_I_LOWERCASE.bbox);

      const result = detectFeature('Tittle', glyph, metrics, font);

      expect(result).toHaveProperty('found');
      expect(typeof result.found).toBe('boolean');
    });
  });

  describe('hasFinial', () => {
    it('returns boolean for sans-serif stem', () => {
      const glyph = mockGlyphFromPath(LETTER_I_SANS.d, LETTER_I_SANS.bbox);

      const result = hasFinial(glyph, metrics);

      expect(typeof result).toBe('boolean');
    });

    it('returns boolean for polygon circle', () => {
      // Polygon approximation may have edges detected as finials
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      expect(typeof hasFinial(glyph, metrics)).toBe('boolean');
    });

    it('returns false for non-drawable glyph', () => {
      const glyph = mockNonDrawableGlyph('null-path');

      expect(hasFinial(glyph, metrics)).toBe(false);
    });

    it('works via detector orchestration', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      const result = detectFeature('Finial', glyph, metrics);

      expect(result).toHaveProperty('found');
      expect(typeof result.found).toBe('boolean');
    });
  });

  describe('edge cases', () => {
    it('handles very small tittle-like shape', () => {
      // Small square positioned above x-height
      const smallDot = 'M -20 580 L 20 580 L 20 620 L -20 620 Z';
      const smallBbox = { minX: -20, minY: 580, maxX: 20, maxY: 620 };
      const glyph = mockGlyphFromPath(smallDot, smallBbox);

      expect(() => getTittle(glyph, metrics, font)).not.toThrow();
    });

    it('handles empty path gracefully', () => {
      const glyph = mockGlyphFromPath(EMPTY_PATH.d, EMPTY_PATH.bbox);

      expect(() => getTerminal(glyph, metrics)).not.toThrow();
      expect(() => getTittle(glyph, metrics, font)).not.toThrow();
      expect(() => hasFinial(glyph, metrics)).not.toThrow();
    });

    it('handles metrics with extreme values', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);
      const extremeMetrics = {
        baseline: 0,
        xHeight: 10000,
        capHeight: 15000,
        ascent: 20000,
        descent: -5000,
      };

      expect(() => getTerminal(glyph, extremeMetrics)).not.toThrow();
      expect(() => getTittle(glyph, extremeMetrics, font)).not.toThrow();
    });

    it('handles font with different unitsPerEm', () => {
      const glyph = mockGlyphFromPath(LETTER_I_LOWERCASE.d, LETTER_I_LOWERCASE.bbox);
      const font2000 = mockFont({ unitsPerEm: 2000 });

      const result = getTittle(glyph, metrics, font2000);

      expect(result).toHaveProperty('found');
    });
  });
});
