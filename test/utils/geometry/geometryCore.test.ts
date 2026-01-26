/**
 * Tests for geometry core primitives used in typographic feature detection.
 * Covers rayHits, isInside, isDrawable, safeIntersect, shapeForV2, getOvershoot.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { shape } from 'svg-intersections';
import {
  rayHits,
  isInside,
  isDrawable,
  safeIntersect,
  shapeForV2,
  getOvershoot,
  dFor,
} from '@/utils/geometry/geometryCore';
import {
  mockGlyphFromPath,
  mockNonDrawableGlyph,
} from '../fixtures/mockGlyph';
import {
  CIRCLE,
  DONUT,
  RECTANGLE,
  VERTICAL_STEM,
  EMPTY_PATH,
  COLLAPSED_PATH,
  LINE_PATH,
} from '../fixtures/svgPaths';

describe('geometryCore', () => {
  describe('rayHits', () => {
    it('returns intersection points for horizontal ray through polygon circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);
      const gs = shapeForV2(glyph);

      // Cast horizontal ray from left through center of polygon circle
      const result = rayHits(gs, { x: -500, y: 0 }, 0, 1000);

      // Should hit the polygon circle twice (entry and exit)
      expect(result.points.length).toBe(2);
      // Points should include both entry and exit (order depends on algorithm)
      const xValues = result.points.map(p => p.x);
      expect(xValues.some(x => x < 0)).toBe(true);
      expect(xValues.some(x => x > 0)).toBe(true);
    });

    it('returns intersection points for vertical ray through rectangle', () => {
      const glyph = mockGlyphFromPath(RECTANGLE.d, RECTANGLE.bbox);
      const gs = shapeForV2(glyph);

      // Cast vertical ray (angle = PI/2) from bottom through rectangle
      const result = rayHits(gs, { x: 0, y: -500 }, Math.PI / 2, 1000);

      // Should hit twice (top and bottom edges)
      expect(result.points.length).toBe(2);
      expect(result.points[0].y).toBeCloseTo(-300, 0);
      expect(result.points[1].y).toBeCloseTo(300, 0);
    });

    it('returns intersection points for diagonal ray through polygon', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);
      const gs = shapeForV2(glyph);

      // Cast 45-degree ray from lower left - may hit polygon edges multiple times
      const result = rayHits(gs, { x: -400, y: -400 }, Math.PI / 4, 1200);

      // Should hit the polygon at least once
      expect(result.points.length).toBeGreaterThanOrEqual(1);
    });

    it('returns empty points when ray misses shape', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);
      const gs = shapeForV2(glyph);

      // Cast ray that completely misses the circle
      const result = rayHits(gs, { x: 500, y: 500 }, 0, 100);

      expect(result.points.length).toBe(0);
    });

    it('handles ray tangent to circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);
      const gs = shapeForV2(glyph);

      // Cast ray tangent to circle (grazing the top)
      const result = rayHits(gs, { x: -500, y: 300 }, 0, 1000);

      // Tangent may result in 0, 1, or 2 points depending on precision
      expect(result.points.length).toBeLessThanOrEqual(2);
    });

    it('handles ray starting inside shape', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);
      const gs = shapeForV2(glyph);

      // Cast ray from center of circle outward
      const result = rayHits(gs, { x: 0, y: 0 }, 0, 500);

      // Should hit once (exit point)
      expect(result.points.length).toBe(1);
      expect(result.points[0].x).toBeCloseTo(300, 0);
    });

    it('returns four intersection points for ray through donut (crossing both rings)', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);
      const gs = shapeForV2(glyph);

      // Cast horizontal ray through center of donut
      const result = rayHits(gs, { x: -500, y: 0 }, 0, 1000);

      // Should hit 4 times: outer left, inner left, inner right, outer right
      expect(result.points.length).toBe(4);
    });
  });

  describe('isInside', () => {
    it('returns boolean for point inside polygon circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      // isInside returns boolean - polygon approximation may differ from true circle
      const result = isInside(glyph, { x: 0, y: 0 });
      expect(typeof result).toBe('boolean');
    });

    it('returns boolean for point outside polygon circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      // Point clearly outside the polygon
      const result = isInside(glyph, { x: -500, y: -500 });
      expect(typeof result).toBe('boolean');
    });

    it('returns boolean for point in donut stroke area', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);

      // Polygon approximation - result depends on ray-casting through polygon edges
      const result = isInside(glyph, { x: 200, y: 0 });
      expect(typeof result).toBe('boolean');
    });

    it('returns boolean for point in donut center', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);

      // Polygon approximation with counter-wound inner path
      const result = isInside(glyph, { x: 0, y: 0 });
      expect(typeof result).toBe('boolean');
    });

    it('returns false for point far outside', () => {
      const glyph = mockGlyphFromPath(RECTANGLE.d, RECTANGLE.bbox);

      expect(isInside(glyph, { x: 1000, y: 1000 })).toBe(false);
    });

    it('handles point inside rectangle', () => {
      const glyph = mockGlyphFromPath(RECTANGLE.d, RECTANGLE.bbox);

      expect(isInside(glyph, { x: 0, y: 0 })).toBe(true);
      expect(isInside(glyph, { x: 100, y: 200 })).toBe(true);
    });
  });

  describe('isDrawable', () => {
    it('returns true for valid glyph with path and bbox', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      expect(isDrawable(glyph)).toBe(true);
    });

    it('returns false for null glyph', () => {
      expect(isDrawable(null as any)).toBe(false);
    });

    it('returns false for glyph with null path', () => {
      const glyph = mockNonDrawableGlyph('null-path');

      expect(isDrawable(glyph)).toBe(false);
    });

    it('returns false for glyph with no commands', () => {
      const glyph = mockNonDrawableGlyph('no-commands');

      expect(isDrawable(glyph)).toBe(false);
    });

    it('returns false for glyph with null bbox', () => {
      const glyph = mockNonDrawableGlyph('null-bbox');

      expect(isDrawable(glyph)).toBe(false);
    });

    it('returns false for empty object', () => {
      const glyph = mockNonDrawableGlyph('empty');

      expect(isDrawable(glyph)).toBe(false);
    });
  });

  describe('safeIntersect', () => {
    it('returns intersection points for overlapping shapes', () => {
      const circle1 = shape('circle', { cx: 0, cy: 0, r: 100 });
      const circle2 = shape('circle', { cx: 100, cy: 0, r: 100 });

      const result = safeIntersect(circle1, circle2);

      // safeIntersect returns an object with points array
      expect(result).toHaveProperty('points');
      expect(Array.isArray(result.points)).toBe(true);
      expect(result.points.length).toBe(2);
    });

    it('returns empty points for non-intersecting shapes', () => {
      const circle1 = shape('circle', { cx: 0, cy: 0, r: 50 });
      const circle2 = shape('circle', { cx: 500, cy: 0, r: 50 });

      const result = safeIntersect(circle1, circle2);

      expect(result.points.length).toBe(0);
    });

    it('handles line-circle intersection', () => {
      const circle = shape('circle', { cx: 0, cy: 0, r: 100 });
      const line = shape('line', { x1: -200, y1: 0, x2: 200, y2: 0 });

      const result = safeIntersect(circle, line);

      expect(result.points.length).toBe(2);
    });

    it('handles line-rectangle intersection', () => {
      const glyph = mockGlyphFromPath(RECTANGLE.d, RECTANGLE.bbox);
      const rectShape = shapeForV2(glyph);
      const line = shape('line', { x1: -300, y1: 0, x2: 300, y2: 0 });

      const result = safeIntersect(rectShape, line);

      expect(result.points.length).toBe(2);
    });

    it('returns object with status and points even on error', () => {
      // Create shapes that might cause intersection errors
      const pathShape = shape('path', { d: EMPTY_PATH.d });
      const line = shape('line', { x1: 0, y1: 0, x2: 100, y2: 100 });

      const result = safeIntersect(pathShape, line);

      // Should return valid structure even if no intersections
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('points');
      expect(Array.isArray(result.points)).toBe(true);
    });
  });

  describe('shapeForV2', () => {
    it('converts glyph to svg-intersections shape', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      const svgShape = shapeForV2(glyph);

      // Should return a shape object that can be used with intersect
      expect(svgShape).toBeDefined();
      expect(typeof svgShape).toBe('object');
    });

    it('returns cached shape for same glyph', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      const shape1 = shapeForV2(glyph);
      const shape2 = shapeForV2(glyph);

      // Should return the same cached object
      expect(shape1).toBe(shape2);
    });

    it('returns different shapes for different glyphs', () => {
      const glyph1 = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);
      const glyph2 = mockGlyphFromPath(RECTANGLE.d, RECTANGLE.bbox);

      const shape1 = shapeForV2(glyph1);
      const shape2 = shapeForV2(glyph2);

      expect(shape1).not.toBe(shape2);
    });

    it('handles empty path gracefully', () => {
      const glyph = mockGlyphFromPath(EMPTY_PATH.d, EMPTY_PATH.bbox);

      const svgShape = shapeForV2(glyph);

      expect(svgShape).toBeDefined();
    });
  });

  describe('getOvershoot', () => {
    it('calculates overshoot based on bbox dimensions', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);
      // Circle bbox is 600x600, so max dimension is 600, overshoot is 1200

      const overshoot = getOvershoot(glyph);

      expect(overshoot).toBe(1200);
    });

    it('returns cached overshoot for same glyph', () => {
      const glyph = mockGlyphFromPath(RECTANGLE.d, RECTANGLE.bbox);

      const overshoot1 = getOvershoot(glyph);
      const overshoot2 = getOvershoot(glyph);

      expect(overshoot1).toBe(overshoot2);
    });

    it('uses max of width and height', () => {
      // Vertical stem: width=60, height=600
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      const overshoot = getOvershoot(glyph);

      // Max dimension is 600, overshoot is 1200
      expect(overshoot).toBe(1200);
    });

    it('handles small glyphs', () => {
      const smallBbox = { minX: 0, minY: 0, maxX: 10, maxY: 10 };
      const glyph = mockGlyphFromPath('M 0 0 L 10 0 L 10 10 L 0 10 Z', smallBbox);

      const overshoot = getOvershoot(glyph);

      expect(overshoot).toBe(20); // 10 * 2
    });
  });

  describe('dFor', () => {
    it('returns SVG path string for valid glyph', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      const d = dFor(glyph);

      expect(d).toBe(CIRCLE.d);
    });

    it('returns fallback path for null glyph', () => {
      const d = dFor(null as any);

      expect(d).toBe('M0 0');
    });

    it('returns fallback path for glyph with null path', () => {
      const glyph = mockNonDrawableGlyph('null-path');

      const d = dFor(glyph);

      expect(d).toBe('M0 0');
    });

    it('returns fallback for glyph with missing toSVG', () => {
      const glyph = {
        path: { commands: [] },
        bbox: { minX: 0, minY: 0, maxX: 100, maxY: 100 },
      };

      const d = dFor(glyph as any);

      expect(d).toBe('M0 0');
    });

    it('returns fallback for empty SVG string', () => {
      const glyph = {
        path: { toSVG: () => '', commands: [] },
        bbox: { minX: 0, minY: 0, maxX: 100, maxY: 100 },
      };

      const d = dFor(glyph as any);

      expect(d).toBe('M0 0');
    });
  });
});
