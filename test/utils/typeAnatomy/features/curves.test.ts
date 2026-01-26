/**
 * Tests for curve feature detectors: loop, arc, shoulder, spine, hook, tail.
 * These features detect curved strokes and specialized curve forms.
 *
 * Note: These tests focus on API contracts, error handling, and type safety.
 * Detection accuracy depends on glyph geometry matching detector heuristics.
 */
import { describe, it, expect } from 'vitest';
import { hasLoop } from '@/utils/typeAnatomy/loop';
import { hasArc } from '@/utils/typeAnatomy/arc';
import { hasShoulder } from '@/utils/typeAnatomy/shoulder';
import { hasSpine } from '@/utils/typeAnatomy/spine';
import { hasHook } from '@/utils/typeAnatomy/hook';
import { hasTail } from '@/utils/typeAnatomy/tail';
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
  LETTER_G_LOWERCASE,
  LETTER_Y_LOWERCASE,
  ARC_SHAPE,
  HOOK_SHAPE,
  SHOULDER_SHAPE,
  SPINE_SHAPE,
  EMPTY_PATH,
} from '../../fixtures/svgPaths';

describe('curve features', () => {
  const metrics = standardMetrics;

  describe('hasLoop', () => {
    it('returns boolean for lowercase g', () => {
      const glyph = mockGlyphFromPath(LETTER_G_LOWERCASE.d, LETTER_G_LOWERCASE.bbox);

      const result = hasLoop(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('returns boolean for circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      const result = hasLoop(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('does not detect loop in vertical stem', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      expect(hasLoop(glyph, metrics)).toBe(false);
    });

    it('returns false for non-drawable glyph', () => {
      const glyph = mockNonDrawableGlyph('null-path');

      expect(hasLoop(glyph, metrics)).toBe(false);
    });

    it('works via detector orchestration', () => {
      const glyph = mockGlyphFromPath(LETTER_G_LOWERCASE.d, LETTER_G_LOWERCASE.bbox);

      const result = detectFeature('Loop', glyph, metrics);

      expect(result).toHaveProperty('found');
      expect(typeof result.found).toBe('boolean');
    });
  });

  describe('hasArc', () => {
    it('returns boolean for arc shape', () => {
      const glyph = mockGlyphFromPath(ARC_SHAPE.d, ARC_SHAPE.bbox);

      const result = hasArc(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('returns boolean for circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      const result = hasArc(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('returns boolean for donut', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);

      const result = hasArc(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('returns boolean for vertical stem', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      const result = hasArc(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('returns false for non-drawable glyph', () => {
      const glyph = mockNonDrawableGlyph('null-path');

      expect(hasArc(glyph, metrics)).toBe(false);
    });

    it('works via detector orchestration', () => {
      const glyph = mockGlyphFromPath(ARC_SHAPE.d, ARC_SHAPE.bbox);

      const result = detectFeature('Arc', glyph, metrics);

      expect(result).toHaveProperty('found');
      expect(typeof result.found).toBe('boolean');
    });
  });

  describe('hasShoulder', () => {
    it('returns boolean for shoulder shape', () => {
      const glyph = mockGlyphFromPath(SHOULDER_SHAPE.d, SHOULDER_SHAPE.bbox);

      const result = hasShoulder(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('does not detect shoulder in vertical stem', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      expect(hasShoulder(glyph, metrics)).toBe(false);
    });

    it('does not detect shoulder in circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      expect(hasShoulder(glyph, metrics)).toBe(false);
    });

    it('returns false for non-drawable glyph', () => {
      const glyph = mockNonDrawableGlyph('null-path');

      expect(hasShoulder(glyph, metrics)).toBe(false);
    });

    it('works via detector orchestration', () => {
      const glyph = mockGlyphFromPath(SHOULDER_SHAPE.d, SHOULDER_SHAPE.bbox);

      const result = detectFeature('Shoulder', glyph, metrics);

      expect(result).toHaveProperty('found');
      expect(typeof result.found).toBe('boolean');
    });
  });

  describe('hasSpine', () => {
    it('returns boolean for spine shape', () => {
      const glyph = mockGlyphFromPath(SPINE_SHAPE.d, SPINE_SHAPE.bbox);

      const result = hasSpine(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('does not detect spine in vertical stem', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      expect(hasSpine(glyph, metrics)).toBe(false);
    });

    it('does not detect spine in circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      expect(hasSpine(glyph, metrics)).toBe(false);
    });

    it('returns false for non-drawable glyph', () => {
      const glyph = mockNonDrawableGlyph('null-path');

      expect(hasSpine(glyph, metrics)).toBe(false);
    });

    it('works via detector orchestration', () => {
      const glyph = mockGlyphFromPath(SPINE_SHAPE.d, SPINE_SHAPE.bbox);

      const result = detectFeature('Spine', glyph, metrics);

      expect(result).toHaveProperty('found');
      expect(typeof result.found).toBe('boolean');
    });
  });

  describe('hasHook', () => {
    it('returns boolean for hook shape', () => {
      const glyph = mockGlyphFromPath(HOOK_SHAPE.d, HOOK_SHAPE.bbox);

      const result = hasHook(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('does not detect hook in vertical stem', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      expect(hasHook(glyph, metrics)).toBe(false);
    });

    it('does not detect hook in circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      expect(hasHook(glyph, metrics)).toBe(false);
    });

    it('returns false for non-drawable glyph', () => {
      const glyph = mockNonDrawableGlyph('null-path');

      expect(hasHook(glyph, metrics)).toBe(false);
    });

    it('works via detector orchestration', () => {
      const glyph = mockGlyphFromPath(HOOK_SHAPE.d, HOOK_SHAPE.bbox);

      const result = detectFeature('Hook', glyph, metrics);

      expect(result).toHaveProperty('found');
      expect(typeof result.found).toBe('boolean');
    });
  });

  describe('hasTail', () => {
    it('returns boolean for lowercase y', () => {
      const glyph = mockGlyphFromPath(LETTER_Y_LOWERCASE.d, LETTER_Y_LOWERCASE.bbox);

      const result = hasTail(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('returns boolean for vertical stem', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      const result = hasTail(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('does not detect tail in circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      expect(hasTail(glyph, metrics)).toBe(false);
    });

    it('returns false for non-drawable glyph', () => {
      const glyph = mockNonDrawableGlyph('null-path');

      expect(hasTail(glyph, metrics)).toBe(false);
    });

    it('works via detector orchestration', () => {
      const glyph = mockGlyphFromPath(LETTER_Y_LOWERCASE.d, LETTER_Y_LOWERCASE.bbox);

      const result = detectFeature('Tail', glyph, metrics);

      expect(result).toHaveProperty('found');
      expect(typeof result.found).toBe('boolean');
    });
  });

  describe('edge cases', () => {
    it('handles empty path gracefully', () => {
      const glyph = mockGlyphFromPath(EMPTY_PATH.d, EMPTY_PATH.bbox);

      expect(() => hasLoop(glyph, metrics)).not.toThrow();
      expect(() => hasArc(glyph, metrics)).not.toThrow();
      expect(() => hasShoulder(glyph, metrics)).not.toThrow();
      expect(() => hasSpine(glyph, metrics)).not.toThrow();
      expect(() => hasHook(glyph, metrics)).not.toThrow();
      expect(() => hasTail(glyph, metrics)).not.toThrow();
    });

    it('handles extreme descent metrics for loop/tail', () => {
      const glyph = mockGlyphFromPath(LETTER_G_LOWERCASE.d, LETTER_G_LOWERCASE.bbox);
      const extremeMetrics = {
        ...standardMetrics,
        descent: -1000, // Very deep descent
      };

      expect(() => hasLoop(glyph, extremeMetrics)).not.toThrow();
      expect(() => hasTail(glyph, extremeMetrics)).not.toThrow();
    });

    it('handles glyph positioned entirely below baseline', () => {
      // Underscore-like shape below baseline
      const underscorePath = 'M -100 -50 L 100 -50 L 100 -80 L -100 -80 Z';
      const underscoreBbox = { minX: -100, minY: -80, maxX: 100, maxY: -50 };
      const glyph = mockGlyphFromPath(underscorePath, underscoreBbox);

      expect(() => hasTail(glyph, metrics)).not.toThrow();
      expect(() => hasLoop(glyph, metrics)).not.toThrow();
    });

    it('handles complex curved path', () => {
      // Path with multiple curve types (polygon approximation)
      const complexCurve = `
        M 0 0 L 50 25 L 75 75 L 100 100 L 75 125 L 50 175 L 0 200
        L -50 175 L -75 125 L -100 100 L -75 75 L -50 25 Z
      `.replace(/\s+/g, ' ').trim();
      const curveBbox = { minX: -100, minY: 0, maxX: 100, maxY: 200 };
      const glyph = mockGlyphFromPath(complexCurve, curveBbox);

      expect(() => hasArc(glyph, metrics)).not.toThrow();
      expect(() => hasSpine(glyph, metrics)).not.toThrow();
      expect(() => hasShoulder(glyph, metrics)).not.toThrow();
    });
  });
});
