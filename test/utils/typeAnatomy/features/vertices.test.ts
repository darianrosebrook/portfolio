/**
 * Tests for vertex feature detectors: apex, vertex, crotch.
 *
 * Real-font correctness lives in test/typeAnatomy/feature-accuracy.test.ts
 * (Nohemi A apex, A/V crotch, A vertices). The legacy hasVertex heuristic
 * fires on any closed polygon with sharp corners — those over-fires are
 * pinned below as known behavior.
 */
import { describe, it, expect } from 'vitest';
import { hasApex } from '@/utils/typeAnatomy/apex';
import { hasVertex } from '@/utils/typeAnatomy/vertex';
import { hasCrotch } from '@/utils/typeAnatomy/crotch';
import {
  mockGlyphFromPath,
  mockNonDrawableGlyph,
  standardMetrics,
} from '../../fixtures/mockGlyph';
import {
  CIRCLE,
  RECTANGLE,
  VERTICAL_STEM,
  DONUT,
  EMPTY_PATH,
} from '../../fixtures/svgPaths';

describe('vertex features (synthetic geometry)', () => {
  const metrics = standardMetrics;

  describe('hasApex', () => {
    // None of the synthetic primitives — including a wide flat or tall
    // narrow triangle — trigger the legacy hasApex detector. Real apex
    // detection on Nohemi A is verified in feature-accuracy.test.ts.
    it('rejects a polygon circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);
      expect(hasApex(glyph, metrics)).toBe(false);
    });

    it('rejects a rectangle', () => {
      const glyph = mockGlyphFromPath(RECTANGLE.d, RECTANGLE.bbox);
      expect(hasApex(glyph, metrics)).toBe(false);
    });

    it('rejects a vertical stem', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);
      expect(hasApex(glyph, metrics)).toBe(false);
    });

    it('rejects a polygon donut', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);
      expect(hasApex(glyph, metrics)).toBe(false);
    });

    it('returns false for non-drawable glyph', () => {
      expect(hasApex(mockNonDrawableGlyph('null-path'), metrics)).toBe(false);
    });

    it('returns false for empty glyph', () => {
      expect(hasApex(mockNonDrawableGlyph('empty'), metrics)).toBe(false);
    });
  });

  describe('hasVertex', () => {
    // hasVertex over-fires on any closed polygon with sharp corners. This
    // is calibrated for real typefaces; the synthetic primitives all have
    // 90° or polygon-approximated corners that match. Real vertex
    // accuracy on Nohemi A is in feature-accuracy.test.ts.
    it('over-fires on a polygon circle (corners at every polygon vertex)', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);
      expect(hasVertex(glyph, metrics)).toBe(true);
    });

    it('over-fires on a rectangle (corners at four 90° vertices)', () => {
      const glyph = mockGlyphFromPath(RECTANGLE.d, RECTANGLE.bbox);
      expect(hasVertex(glyph, metrics)).toBe(true);
    });

    it('over-fires on a vertical stem (corners at four 90° vertices)', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);
      expect(hasVertex(glyph, metrics)).toBe(true);
    });

    it('returns false for non-drawable glyph', () => {
      expect(hasVertex(mockNonDrawableGlyph('null-path'), metrics)).toBe(false);
    });

    it('returns false for empty glyph', () => {
      expect(hasVertex(mockNonDrawableGlyph('empty'), metrics)).toBe(false);
    });
  });

  describe('hasCrotch', () => {
    it('rejects a polygon circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);
      expect(hasCrotch(glyph, metrics)).toBe(false);
    });

    it('rejects a vertical stem', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);
      expect(hasCrotch(glyph, metrics)).toBe(false);
    });

    it('rejects a polygon donut', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);
      expect(hasCrotch(glyph, metrics)).toBe(false);
    });

    it('returns false for non-drawable glyph', () => {
      expect(hasCrotch(mockNonDrawableGlyph('null-path'), metrics)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('does not throw on empty path across all vertex detectors', () => {
      const glyph = mockGlyphFromPath(EMPTY_PATH.d, EMPTY_PATH.bbox);

      expect(() => hasApex(glyph, metrics)).not.toThrow();
      expect(() => hasVertex(glyph, metrics)).not.toThrow();
      expect(() => hasCrotch(glyph, metrics)).not.toThrow();
    });

    it('does not throw on a wide flat triangle', () => {
      const flatTriangle = 'M -200 0 L 200 0 L 0 -50 Z';
      const flatBbox = { minX: -200, minY: -50, maxX: 200, maxY: 0 };
      const glyph = mockGlyphFromPath(flatTriangle, flatBbox);

      expect(() => hasApex(glyph, metrics)).not.toThrow();
      expect(() => hasCrotch(glyph, metrics)).not.toThrow();
    });

    it('does not throw on a tall narrow triangle', () => {
      const tallTriangle = 'M -20 300 L 20 300 L 0 -300 Z';
      const tallBbox = { minX: -20, minY: -300, maxX: 20, maxY: 300 };
      const glyph = mockGlyphFromPath(tallTriangle, tallBbox);

      expect(() => hasApex(glyph, metrics)).not.toThrow();
      expect(() => hasVertex(glyph, metrics)).not.toThrow();
    });
  });
});
