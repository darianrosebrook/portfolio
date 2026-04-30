/**
 * Tests for projection feature detectors: serif, ear, spur, beak, bracket.
 *
 * Real-font correctness lives in test/typeAnatomy/feature-accuracy.test.ts.
 * The legacy hasSpur heuristic is known to over-fire on synthetic geometry —
 * those false positives are pinned below so a future fix forces the tests
 * to be re-examined.
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
  DONUT,
  EMPTY_PATH,
} from '../../fixtures/svgPaths';

describe('projection features (synthetic geometry)', () => {
  const metrics = standardMetrics;

  describe('hasSerif', () => {
    it('rejects a polygon circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);
      expect(hasSerif(glyph, metrics)).toBe(false);
    });

    it('rejects a plain rectangle', () => {
      const glyph = mockGlyphFromPath(RECTANGLE.d, RECTANGLE.bbox);
      expect(hasSerif(glyph, metrics)).toBe(false);
    });

    it('rejects a polygon donut', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);
      expect(hasSerif(glyph, metrics)).toBe(false);
    });

    it('returns false for non-drawable glyph', () => {
      expect(hasSerif(mockNonDrawableGlyph('null-path'), metrics)).toBe(false);
    });

    it('returns false for empty glyph', () => {
      expect(hasSerif(mockNonDrawableGlyph('empty'), metrics)).toBe(false);
    });
  });

  describe('hasEar', () => {
    it('does not detect ear in vertical stem', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);
      expect(hasEar(glyph, metrics)).toBe(false);
    });

    it('does not detect ear in circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);
      expect(hasEar(glyph, metrics)).toBe(false);
    });

    it('returns false for non-drawable glyph', () => {
      expect(hasEar(mockNonDrawableGlyph('null-path'), metrics)).toBe(false);
    });
  });

  describe('hasSpur', () => {
    // Pinned: the legacy hasSpur heuristic over-fires on every synthetic
    // primitive that has a closed contour. Real spur detection on Nohemi G
    // is currently `it.fails` in feature-accuracy.test.ts. When the
    // heuristic is repaired the assertions below will fail and force a
    // matching update here.
    it('over-fires on a polygon circle (legacy heuristic limitation)', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);
      expect(hasSpur(glyph, metrics)).toBe(true);
    });

    it('over-fires on a vertical stem (legacy heuristic limitation)', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);
      expect(hasSpur(glyph, metrics)).toBe(true);
    });

    it('over-fires on a rectangle (legacy heuristic limitation)', () => {
      const glyph = mockGlyphFromPath(RECTANGLE.d, RECTANGLE.bbox);
      expect(hasSpur(glyph, metrics)).toBe(true);
    });

    it('returns false for non-drawable glyph', () => {
      expect(hasSpur(mockNonDrawableGlyph('null-path'), metrics)).toBe(false);
    });

    it('orchestrator surfaces hasSpur output via Spur feature', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);
      // Same over-fire as the unit detector — pinned so the orchestration
      // path is verified to forward the value.
      expect(detectFeature('Spur', glyph, metrics).found).toBe(true);
    });
  });

  describe('hasBeak', () => {
    it('rejects a polygon circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);
      expect(hasBeak(glyph, metrics)).toBe(false);
    });

    it('rejects a vertical stem', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);
      expect(hasBeak(glyph, metrics)).toBe(false);
    });

    it('returns false for non-drawable glyph', () => {
      expect(hasBeak(mockNonDrawableGlyph('null-path'), metrics)).toBe(false);
    });

    it('orchestrator returns found: false for Beak on a circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);
      expect(detectFeature('Beak', glyph, metrics).found).toBe(false);
    });
  });

  describe('hasBracket', () => {
    it('does not detect bracket in circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);
      expect(hasBracket(glyph, metrics)).toBe(false);
    });

    it('returns false for non-drawable glyph', () => {
      expect(hasBracket(mockNonDrawableGlyph('null-path'), metrics)).toBe(
        false
      );
    });
  });

  describe('edge cases', () => {
    it('does not throw on empty path across all projection detectors', () => {
      const glyph = mockGlyphFromPath(EMPTY_PATH.d, EMPTY_PATH.bbox);

      expect(() => hasSerif(glyph, metrics)).not.toThrow();
      expect(() => hasEar(glyph, metrics)).not.toThrow();
      expect(() => hasSpur(glyph, metrics)).not.toThrow();
      expect(() => hasBeak(glyph, metrics)).not.toThrow();
      expect(() => hasBracket(glyph, metrics)).not.toThrow();
    });

    it('does not throw on a small tab/projection shape', () => {
      const tabPath = `
        M -20 0 L 20 0 L 20 100 L 40 100 L 40 120 L 20 120
        L 20 200 L -20 200 L -20 120 L -40 120 L -40 100 L -20 100 Z
      `
        .replace(/\s+/g, ' ')
        .trim();
      const tabBbox = { minX: -40, minY: 0, maxX: 40, maxY: 200 };
      const glyph = mockGlyphFromPath(tabPath, tabBbox);

      expect(() => hasSerif(glyph, metrics)).not.toThrow();
      expect(() => hasEar(glyph, metrics)).not.toThrow();
    });

    it('does not throw on a complex multi-projection shape', () => {
      const complexPath = `
        M 0 0 L 100 0 L 100 -20 L 120 -20 L 120 20 L 100 20 L 100 100
        L 120 100 L 120 140 L 100 140 L 100 200 L 0 200 L 0 140 L -20 140
        L -20 100 L 0 100 L 0 20 L -20 20 L -20 -20 L 0 -20 Z
      `
        .replace(/\s+/g, ' ')
        .trim();
      const complexBbox = { minX: -20, minY: -20, maxX: 120, maxY: 200 };
      const glyph = mockGlyphFromPath(complexPath, complexBbox);

      expect(() => hasSerif(glyph, metrics)).not.toThrow();
      expect(() => hasSpur(glyph, metrics)).not.toThrow();
    });
  });
});
