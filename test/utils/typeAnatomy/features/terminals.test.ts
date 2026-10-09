/**
 * Tests for terminal feature detectors: terminal, tittle, finial.
 *
 * The legacy detectors are calibrated for real typeface geometry. Synthetic
 * primitives distinguish actual free stroke caps from closed connected bodies.
 * Real positive coverage on real fonts is in feature-accuracy.test.ts.
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
  VERTICAL_STEM,
  DONUT,
  EMPTY_PATH,
} from '../../fixtures/svgPaths';

describe('terminal features (synthetic geometry)', () => {
  const metrics = standardMetrics;
  const font = mockFont();

  describe('getTerminal / hasTerminal', () => {
    it('detects the flat non-serif endings of a vertical stem', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);
      expect(getTerminal(glyph, metrics).found).toBe(true);
      expect(hasTerminal(glyph, metrics)).toBe(true);
    });

    it('rejects closed circle and donut bodies without a free stroke end', () => {
      expect(
        hasTerminal(mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox), metrics)
      ).toBe(false);
      expect(hasTerminal(mockGlyphFromPath(DONUT.d, DONUT.bbox), metrics)).toBe(
        false
      );
    });

    it('returns found: false for non-drawable glyph', () => {
      expect(
        getTerminal(mockNonDrawableGlyph('null-path'), metrics).found
      ).toBe(false);
    });

    it('returns found: false for empty glyph', () => {
      expect(getTerminal(mockNonDrawableGlyph('empty'), metrics).found).toBe(
        false
      );
    });

    it('orchestrator preserves flat Terminal identity on a vertical stem', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);
      expect(detectFeature('Terminal', glyph, metrics).found).toBe(true);
    });
  });

  describe('getTittle / hasTittle', () => {
    // Tittle requires a disconnected mark contour above x-height. None of the
    // synthetic primitives qualify — all should reject. Real i/j tittle
    // detection is verified in feature-accuracy.test.ts on Nohemi.
    it('rejects a vertical stem', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);
      expect(getTittle(glyph, metrics, font).found).toBe(false);
      expect(hasTittle(glyph, metrics, font)).toBe(false);
    });

    it('rejects a solid circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);
      expect(getTittle(glyph, metrics, font).found).toBe(false);
    });

    it('rejects a polygon donut', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);
      expect(getTittle(glyph, metrics, font).found).toBe(false);
    });

    it('hasTittle rejects connected circle and donut bodies', () => {
      expect(
        hasTittle(mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox), metrics, font)
      ).toBe(false);
      expect(
        hasTittle(mockGlyphFromPath(DONUT.d, DONUT.bbox), metrics, font)
      ).toBe(false);
    });

    it('returns found: false for non-drawable glyph', () => {
      expect(
        getTittle(mockNonDrawableGlyph('null-path'), metrics, font).found
      ).toBe(false);
    });
  });

  describe('hasFinial', () => {
    it('rejects a closed circle without a stroke ending', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);
      expect(hasFinial(glyph, metrics)).toBe(false);
    });

    it('rejects a closed donut without a stroke ending', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);
      expect(hasFinial(glyph, metrics)).toBe(false);
    });

    it('recognizes the flat non-serif caps of a vertical stem', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);
      expect(hasFinial(glyph, metrics)).toBe(true);
    });

    it('returns false for non-drawable glyph', () => {
      expect(hasFinial(mockNonDrawableGlyph('null-path'), metrics)).toBe(false);
    });

    it('orchestrator retains the flat-cap Finial interpretation', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);
      expect(detectFeature('Finial', glyph, metrics).found).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('does not throw on a small mark-like shape above x-height', () => {
      const smallDot = 'M -20 580 L 20 580 L 20 620 L -20 620 Z';
      const smallBbox = { minX: -20, minY: 580, maxX: 20, maxY: 620 };
      const glyph = mockGlyphFromPath(smallDot, smallBbox);

      expect(() => getTittle(glyph, metrics, font)).not.toThrow();
    });

    it('does not throw on empty path', () => {
      const glyph = mockGlyphFromPath(EMPTY_PATH.d, EMPTY_PATH.bbox);

      expect(() => getTerminal(glyph, metrics)).not.toThrow();
      expect(() => getTittle(glyph, metrics, font)).not.toThrow();
      expect(() => hasFinial(glyph, metrics)).not.toThrow();
    });

    it('does not throw on metrics with extreme values', () => {
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
  });
});
