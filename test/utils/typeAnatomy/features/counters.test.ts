/**
 * Tests for counter-related feature detectors: bowl, counter, eye.
 *
 * These pin behavior of the legacy boolean detectors on synthetic geometric
 * primitives. Real-font correctness assertions live in
 * test/typeAnatomy/feature-accuracy.test.ts (e.g., Nohemi O bowl/counter,
 * Nohemi e eye). The tests below guard the *negative space*: shapes the
 * detectors must NOT classify as bowls/eyes, plus pinned positive behavior
 * for fixtures that currently trigger detection.
 */
import { describe, it, expect } from 'vitest';
import { hasBowl } from '@/utils/typeAnatomy/bowl';
import { getCounter } from '@/utils/typeAnatomy/counter';
import { hasEye } from '@/utils/typeAnatomy/eye';
import {
  mockGlyphFromPath,
  mockNonDrawableGlyph,
  standardMetrics,
} from '../../fixtures/mockGlyph';
import {
  DONUT,
  CIRCLE,
  RECTANGLE,
  VERTICAL_STEM,
  EMPTY_PATH,
  FIGURE_EIGHT,
} from '../../fixtures/svgPaths';

describe('counter features (synthetic geometry)', () => {
  const metrics = standardMetrics;

  describe('hasBowl', () => {
    // The legacy hasBowl heuristic is calibrated for real typefaces and does
    // not fire on synthetic polygon-approximated donuts. Real bowl detection
    // is verified in feature-accuracy.test.ts on Nohemi O.
    it('rejects a polygon donut (legacy heuristic only fires on real bowls)', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);
      expect(hasBowl(glyph, metrics)).toBe(false);
    });

    it('rejects a solid circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);
      expect(hasBowl(glyph, metrics)).toBe(false);
    });

    it('rejects a rectangle', () => {
      const glyph = mockGlyphFromPath(RECTANGLE.d, RECTANGLE.bbox);
      expect(hasBowl(glyph, metrics)).toBe(false);
    });

    it('rejects a vertical stem', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);
      expect(hasBowl(glyph, metrics)).toBe(false);
    });

    it('returns false for non-drawable glyph', () => {
      expect(hasBowl(mockNonDrawableGlyph('null-path'), metrics)).toBe(false);
    });

    it('returns false for empty glyph', () => {
      expect(hasBowl(mockNonDrawableGlyph('empty'), metrics)).toBe(false);
    });

    it('detects a figure-eight shape (two stacked counters)', () => {
      // Figure-eight has two enclosed bowl-like regions; the heuristic fires.
      const glyph = mockGlyphFromPath(FIGURE_EIGHT.d, FIGURE_EIGHT.bbox);
      expect(hasBowl(glyph, metrics)).toBe(true);
    });
  });

  describe('getCounter', () => {
    it('finds a counter in a donut and returns a polyline shape', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);
      const result = getCounter(glyph, metrics);

      expect(result.found).toBe(true);
      expect(result.shape?.type).toBe('polyline');
      if (result.shape?.type === 'polyline') {
        expect(result.shape.points.length).toBeGreaterThan(0);
      }
    });

    it('finds a counter in a solid circle (single enclosed region)', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);
      const result = getCounter(glyph, metrics);
      expect(result.found).toBe(true);
    });

    it('finds a counter in a rectangle (single enclosed region)', () => {
      const glyph = mockGlyphFromPath(RECTANGLE.d, RECTANGLE.bbox);
      const result = getCounter(glyph, metrics);
      expect(result.found).toBe(true);
    });

    it('returns found: false for non-drawable glyph', () => {
      const result = getCounter(mockNonDrawableGlyph('null-path'), metrics);
      expect(result.found).toBe(false);
    });

    it('returns found: false for empty path', () => {
      const glyph = mockGlyphFromPath(EMPTY_PATH.d, EMPTY_PATH.bbox);
      const result = getCounter(glyph, metrics);
      expect(result.found).toBe(false);
    });
  });

  describe('hasEye', () => {
    // Eye is a tightly-constrained shape (small enclosed region inside an e).
    // None of the synthetic primitives match — all should return false.
    it('rejects a donut', () => {
      expect(hasEye(mockGlyphFromPath(DONUT.d, DONUT.bbox), metrics)).toBe(
        false
      );
    });

    it('rejects a solid circle', () => {
      expect(hasEye(mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox), metrics)).toBe(
        false
      );
    });

    it('rejects a vertical stem', () => {
      expect(
        hasEye(mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox), metrics)
      ).toBe(false);
    });

    it('returns false for non-drawable glyph', () => {
      expect(hasEye(mockNonDrawableGlyph('null-path'), metrics)).toBe(false);
    });

    it('returns false for empty glyph', () => {
      expect(hasEye(mockNonDrawableGlyph('empty'), metrics)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('does not throw on unusual metrics (negative baseline)', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);
      const unusualMetrics = { ...standardMetrics, baseline: -100 };
      expect(() => hasBowl(glyph, unusualMetrics)).not.toThrow();
    });

    it('does not throw on inverted metrics (xHeight below baseline)', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);
      const unusualMetrics = { ...standardMetrics, xHeight: -100 };
      expect(() => hasBowl(glyph, unusualMetrics)).not.toThrow();
    });

    it('does not throw on a sub-em-square glyph', () => {
      const smallBbox = { minX: 0, minY: 0, maxX: 5, maxY: 5 };
      const glyph = mockGlyphFromPath('M 0 0 L 5 0 L 5 5 L 0 5 Z', smallBbox);
      expect(() => hasBowl(glyph, metrics)).not.toThrow();
      expect(() => getCounter(glyph, metrics)).not.toThrow();
    });

    it('does not throw on far-from-origin coordinates', () => {
      // Polygon-approximated donut at extreme coordinates.
      const extremeBbox = {
        minX: 10000,
        minY: 10000,
        maxX: 10600,
        maxY: 10600,
      };
      const outer = `M 10300 10000 L 10600 10300 L 10300 10600 L 10000 10300 Z`;
      const inner = `M 10300 10180 L 10120 10300 L 10300 10420 L 10480 10300 Z`;
      const glyph = mockGlyphFromPath(`${outer} ${inner}`, extremeBbox);
      expect(() => hasBowl(glyph, metrics)).not.toThrow();
    });
  });
});
