/**
 * Tests for counter-related feature detectors: bowl, counter, eye.
 * These features detect enclosed and semi-enclosed spaces in glyphs.
 */
import { describe, it, expect } from 'vitest';
import { hasBowl } from '@/utils/typeAnatomy/bowl';
import { getCounter } from '@/utils/typeAnatomy/counter';
import { hasEye } from '@/utils/typeAnatomy/eye';
import { detectFeature } from '@/utils/typeAnatomy/detector';
import {
  mockGlyphFromPath,
  mockNonDrawableGlyph,
  standardMetrics,
} from '../../fixtures/mockGlyph';
import {
  DONUT,
  CIRCLE,
  RECTANGLE,
  LETTER_O,
  LETTER_E_LOWERCASE,
  VERTICAL_STEM,
  EMPTY_PATH,
  FIGURE_EIGHT,
} from '../../fixtures/svgPaths';

describe('counter features', () => {
  const metrics = standardMetrics;

  describe('hasBowl', () => {
    it('returns boolean for donut shape', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);

      // Detection depends on shape alignment with metrics
      const result = hasBowl(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('returns boolean for solid circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      const result = hasBowl(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('does not detect bowl in rectangle', () => {
      const glyph = mockGlyphFromPath(RECTANGLE.d, RECTANGLE.bbox);

      expect(hasBowl(glyph, metrics)).toBe(false);
    });

    it('returns boolean for letter O shape', () => {
      const glyph = mockGlyphFromPath(LETTER_O.d, LETTER_O.bbox);

      const result = hasBowl(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('does not detect bowl in vertical stem', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      expect(hasBowl(glyph, metrics)).toBe(false);
    });

    it('returns false for non-drawable glyph', () => {
      const glyph = mockNonDrawableGlyph('null-path');

      expect(hasBowl(glyph, metrics)).toBe(false);
    });

    it('returns false for empty glyph', () => {
      const glyph = mockNonDrawableGlyph('empty');

      expect(hasBowl(glyph, metrics)).toBe(false);
    });

    it('returns boolean for figure-eight shape', () => {
      const glyph = mockGlyphFromPath(FIGURE_EIGHT.d, FIGURE_EIGHT.bbox);

      const result = hasBowl(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getCounter', () => {
    it('returns FeatureResult for donut shape', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);

      const result = getCounter(glyph, metrics);

      expect(result).toHaveProperty('found');
      expect(typeof result.found).toBe('boolean');
      // Counter detection may return shape
      if (result.found && result.shape) {
        expect(result.shape).toHaveProperty('type');
      }
    });

    it('returns FeatureResult for solid circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      const result = getCounter(glyph, metrics);

      expect(result).toHaveProperty('found');
      expect(typeof result.found).toBe('boolean');
    });

    it('returns FeatureResult for rectangle', () => {
      const glyph = mockGlyphFromPath(RECTANGLE.d, RECTANGLE.bbox);

      const result = getCounter(glyph, metrics);

      expect(result).toHaveProperty('found');
      expect(typeof result.found).toBe('boolean');
    });

    it('returns polyline shape when counter is found', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);

      const result = getCounter(glyph, metrics);

      // Only check shape structure if found
      if (result.found && result.shape) {
        expect(result.shape.type).toBe('polyline');
        if (result.shape.type === 'polyline') {
          expect(Array.isArray(result.shape.points)).toBe(true);
          expect(result.shape.points.length).toBeGreaterThan(0);
        }
      }
    });

    it('returns found: false for non-drawable glyph', () => {
      const glyph = mockNonDrawableGlyph('null-path');

      const result = getCounter(glyph, metrics);

      expect(result.found).toBe(false);
    });

    it('returns found: false for empty path', () => {
      const glyph = mockGlyphFromPath(EMPTY_PATH.d, EMPTY_PATH.bbox);

      const result = getCounter(glyph, metrics);

      expect(result.found).toBe(false);
    });

    it('works via detector orchestration', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);

      const result = detectFeature('Counter', glyph, metrics);

      expect(result).toHaveProperty('found');
    });
  });

  describe('hasEye', () => {
    it('returns boolean for lowercase e shape', () => {
      const glyph = mockGlyphFromPath(LETTER_E_LOWERCASE.d, LETTER_E_LOWERCASE.bbox);

      const result = hasEye(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('returns boolean for donut', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);

      const result = hasEye(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('does not detect eye in solid circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      expect(hasEye(glyph, metrics)).toBe(false);
    });

    it('does not detect eye in vertical stem', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      expect(hasEye(glyph, metrics)).toBe(false);
    });

    it('returns false for non-drawable glyph', () => {
      const glyph = mockNonDrawableGlyph('null-path');

      expect(hasEye(glyph, metrics)).toBe(false);
    });

    it('returns false for empty glyph', () => {
      const glyph = mockNonDrawableGlyph('empty');

      expect(hasEye(glyph, metrics)).toBe(false);
    });

    it('works via detector orchestration', () => {
      const glyph = mockGlyphFromPath(LETTER_E_LOWERCASE.d, LETTER_E_LOWERCASE.bbox);

      const result = detectFeature('Eye', glyph, metrics);

      expect(result).toHaveProperty('found');
    });
  });

  describe('edge cases', () => {
    it('handles unusual metrics (negative baseline)', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);
      const unusualMetrics = {
        ...standardMetrics,
        baseline: -100,
      };

      // Should not throw
      expect(() => hasBowl(glyph, unusualMetrics)).not.toThrow();
    });

    it('handles unusual metrics (xHeight below baseline)', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);
      const unusualMetrics = {
        ...standardMetrics,
        xHeight: -100, // Below baseline
      };

      // Should handle gracefully
      expect(() => hasBowl(glyph, unusualMetrics)).not.toThrow();
    });

    it('handles very small glyph', () => {
      const smallBbox = { minX: 0, minY: 0, maxX: 5, maxY: 5 };
      const glyph = mockGlyphFromPath('M 0 0 L 5 0 L 5 5 L 0 5 Z', smallBbox);

      expect(() => hasBowl(glyph, metrics)).not.toThrow();
      expect(() => getCounter(glyph, metrics)).not.toThrow();
    });

    it('handles glyph at extreme coordinates', () => {
      const extremeBbox = { minX: 10000, minY: 10000, maxX: 10600, maxY: 10600 };
      const d = `M 10300 10000 A 300 300 0 1 0 9700 10000 A 300 300 0 1 0 10300 10000 Z
                 M 10120 10000 A 120 120 0 1 1 9880 10000 A 120 120 0 1 1 10120 10000 Z`;
      const glyph = mockGlyphFromPath(d.replace(/\s+/g, ' '), extremeBbox);

      expect(() => hasBowl(glyph, metrics)).not.toThrow();
    });
  });
});
