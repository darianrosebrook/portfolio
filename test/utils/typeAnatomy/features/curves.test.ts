/**
 * Tests for curve feature detectors: loop, arc, shoulder, spine, hook, tail.
 *
 * The legacy boolean detectors (hasLoop, hasArc, hasShoulder, hasSpine,
 * hasHook, hasTail) are tuned for real typeface geometry. Synthetic
 * polygon-approximated SHAPE_* fixtures generally don't trigger them — the
 * pinned `false` assertions below document that limit. Real positive
 * coverage lives in test/typeAnatomy/feature-accuracy.test.ts (e.g.,
 * Newsreader g loop, Nohemi S spine, Nohemi Q tail).
 */
import { describe, it, expect } from 'vitest';
import { hasLoop } from '@/utils/typeAnatomy/loop';
import { hasArc } from '@/utils/typeAnatomy/arc';
import { hasShoulder } from '@/utils/typeAnatomy/shoulder';
import { hasSpine } from '@/utils/typeAnatomy/spine';
import { hasHook } from '@/utils/typeAnatomy/hook';
import { hasTail } from '@/utils/typeAnatomy/tail';
import {
  mockGlyphFromPath,
  mockNonDrawableGlyph,
  standardMetrics,
} from '../../fixtures/mockGlyph';
import {
  CIRCLE,
  DONUT,
  VERTICAL_STEM,
  ARC_SHAPE,
  HOOK_SHAPE,
  SHOULDER_SHAPE,
  SPINE_SHAPE,
  EMPTY_PATH,
} from '../../fixtures/svgPaths';

describe('curve features (synthetic geometry)', () => {
  const metrics = standardMetrics;

  describe('hasLoop', () => {
    it('detects a loop in a polygon donut (closed inner region)', () => {
      // The inner ring of the donut is treated as the loop body. This is the
      // only synthetic primitive the legacy heuristic accepts.
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);
      expect(hasLoop(glyph, metrics)).toBe(true);
    });

    it('rejects a solid circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);
      expect(hasLoop(glyph, metrics)).toBe(false);
    });

    it('rejects a vertical stem', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);
      expect(hasLoop(glyph, metrics)).toBe(false);
    });

    it('returns false for non-drawable glyph', () => {
      expect(hasLoop(mockNonDrawableGlyph('null-path'), metrics)).toBe(false);
    });
  });

  describe('hasArc', () => {
    // The legacy hasArc heuristic does not recognize the synthetic ARC_SHAPE
    // polygon as an arc. Real arc-stroke detection is exercised on real
    // fonts in feature-accuracy.test.ts indirectly via spine/loop/eye.
    it('rejects ARC_SHAPE (legacy heuristic does not match polygon arcs)', () => {
      const glyph = mockGlyphFromPath(ARC_SHAPE.d, ARC_SHAPE.bbox);
      expect(hasArc(glyph, metrics)).toBe(false);
    });

    it('rejects a solid circle', () => {
      expect(hasArc(mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox), metrics)).toBe(
        false
      );
    });

    it('rejects a donut', () => {
      expect(hasArc(mockGlyphFromPath(DONUT.d, DONUT.bbox), metrics)).toBe(
        false
      );
    });

    it('rejects a vertical stem', () => {
      expect(
        hasArc(mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox), metrics)
      ).toBe(false);
    });

    it('returns false for non-drawable glyph', () => {
      expect(hasArc(mockNonDrawableGlyph('null-path'), metrics)).toBe(false);
    });
  });

  describe('hasShoulder', () => {
    it('rejects SHOULDER_SHAPE (synthetic polygon does not match real shoulder)', () => {
      const glyph = mockGlyphFromPath(SHOULDER_SHAPE.d, SHOULDER_SHAPE.bbox);
      expect(hasShoulder(glyph, metrics)).toBe(false);
    });

    it('rejects a vertical stem', () => {
      expect(
        hasShoulder(
          mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox),
          metrics
        )
      ).toBe(false);
    });

    it('rejects a solid circle', () => {
      expect(
        hasShoulder(mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox), metrics)
      ).toBe(false);
    });

    it('returns false for non-drawable glyph', () => {
      expect(hasShoulder(mockNonDrawableGlyph('null-path'), metrics)).toBe(
        false
      );
    });
  });

  describe('hasSpine', () => {
    // Real spine detection is verified on Nohemi S in feature-accuracy.
    // The synthetic SPINE_SHAPE polygon does not match the legacy heuristic.
    it('rejects SPINE_SHAPE (synthetic polygon does not match real spine)', () => {
      const glyph = mockGlyphFromPath(SPINE_SHAPE.d, SPINE_SHAPE.bbox);
      expect(hasSpine(glyph, metrics)).toBe(false);
    });

    it('rejects a vertical stem', () => {
      expect(
        hasSpine(
          mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox),
          metrics
        )
      ).toBe(false);
    });

    it('rejects a solid circle', () => {
      expect(hasSpine(mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox), metrics)).toBe(
        false
      );
    });

    it('returns false for non-drawable glyph', () => {
      expect(hasSpine(mockNonDrawableGlyph('null-path'), metrics)).toBe(false);
    });
  });

  describe('hasHook', () => {
    it('rejects HOOK_SHAPE (synthetic polygon does not match real hook)', () => {
      const glyph = mockGlyphFromPath(HOOK_SHAPE.d, HOOK_SHAPE.bbox);
      expect(hasHook(glyph, metrics)).toBe(false);
    });

    it('rejects a vertical stem', () => {
      expect(
        hasHook(
          mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox),
          metrics
        )
      ).toBe(false);
    });

    it('rejects a solid circle', () => {
      expect(hasHook(mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox), metrics)).toBe(
        false
      );
    });

    it('returns false for non-drawable glyph', () => {
      expect(hasHook(mockNonDrawableGlyph('null-path'), metrics)).toBe(false);
    });
  });

  describe('hasTail', () => {
    it('rejects a vertical stem', () => {
      expect(
        hasTail(
          mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox),
          metrics
        )
      ).toBe(false);
    });

    it('rejects a solid circle', () => {
      expect(hasTail(mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox), metrics)).toBe(
        false
      );
    });

    it('returns false for non-drawable glyph', () => {
      expect(hasTail(mockNonDrawableGlyph('null-path'), metrics)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('handles empty path gracefully across all curve detectors', () => {
      const glyph = mockGlyphFromPath(EMPTY_PATH.d, EMPTY_PATH.bbox);

      expect(() => hasLoop(glyph, metrics)).not.toThrow();
      expect(() => hasArc(glyph, metrics)).not.toThrow();
      expect(() => hasShoulder(glyph, metrics)).not.toThrow();
      expect(() => hasSpine(glyph, metrics)).not.toThrow();
      expect(() => hasHook(glyph, metrics)).not.toThrow();
      expect(() => hasTail(glyph, metrics)).not.toThrow();
    });

    it('handles glyph positioned entirely below baseline', () => {
      const underscorePath = 'M -100 -50 L 100 -50 L 100 -80 L -100 -80 Z';
      const underscoreBbox = { minX: -100, minY: -80, maxX: 100, maxY: -50 };
      const glyph = mockGlyphFromPath(underscorePath, underscoreBbox);

      expect(() => hasTail(glyph, metrics)).not.toThrow();
      expect(() => hasLoop(glyph, metrics)).not.toThrow();
    });
  });
});
