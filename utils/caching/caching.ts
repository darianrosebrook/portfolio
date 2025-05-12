/**
 * Glyph shape and overshoot caching utilities for geometry/feature detection.
 * Extracted from geometryHeuristics.ts for modularity and testability.
 *
 * Exports:
 *   - getOvershoot
 *   - shapeForV2
 */
import '../geometry/patch-kld';
import type { Glyph } from 'fontkit';
import { shape } from 'svg-intersections';
import { Logger } from '../helpers/logger';

export type SvgShape = ReturnType<typeof shape>;

/**
 * Improved glyph shape cache: caches by glyph object reference.
 */
const glyphShapeCacheV2 = new WeakMap<Glyph, SvgShape>();

/**
 * Caches and returns the svg-intersections shape for a glyph.
 * @param g - The fontkit Glyph object.
 * @returns svg-intersections path shape
 */
export function shapeForV2(g: Glyph): SvgShape {
  if (!glyphShapeCacheV2.has(g)) {
    try {
      const d = g.path?.toSVG?.() ?? 'M0 0';
      glyphShapeCacheV2.set(g, shape('path', { d }));
    } catch (err) {
      Logger.error('[shapeForV2] Error creating shape for glyph', { g, err });
      glyphShapeCacheV2.set(g, shape('path', { d: 'M0 0' }));
    }
  }
  return glyphShapeCacheV2.get(g)!;
}

/**
 * Returns a cached overshoot value for a glyph (max of bbox width/height * 2).
 * @param g - The fontkit Glyph object.
 * @returns overshoot (number)
 */
const overshootCache = new WeakMap<Glyph, number>();
export function getOvershoot(g: Glyph): number {
  if (!overshootCache.has(g)) {
    try {
      const bboxW = g.bbox.maxX - g.bbox.minX;
      const bboxH = g.bbox.maxY - g.bbox.minY;
      overshootCache.set(g, Math.max(bboxW, bboxH) * 2);
    } catch (err) {
      Logger.error('[getOvershoot] Error computing overshoot', { g, err });
      overshootCache.set(g, 1000); // Safe fallback
    }
  }
  return overshootCache.get(g)!;
}
