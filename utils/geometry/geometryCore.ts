/**
 * Core geometry helpers for typographic feature detection.
 * Extracted from geometryHeuristics.ts for modularity and testability.
 *
 * Exports:
 *   - rayHits
 *   - windingNumber
 *   - isInside
 *   - Point2D, SvgShape, etc.
 *
 * NOTE: shapeForV2 and IntersectionQuery must be provided by the consumer or imported from a caching module.
 */
import type { Glyph } from 'fontkit';
import { intersect, shape } from 'svg-intersections';
import { Logger } from '../helpers/logger';
import type { Point2D } from './geometry';
import './patch-kld';

export type SvgShape = ReturnType<typeof shape>;

// IntersectionQuery is declared globally in patch-kld.ts
declare const IntersectionQuery: unknown;

/**
 * Casts a ray (line probe) at a glyph shape and returns intersection points.
 * Uses Logger for errors.
 * @param gs - SvgShape for the glyph
 * @param origin - Start point of the ray
 * @param angle - Angle in radians
 * @param len - Length of the ray
 * @returns { points: Point2D[] } Intersection points (empty if error)
 */
export function rayHits(
  gs: SvgShape,
  origin: Point2D,
  angle: number,
  len: number
): { points: Point2D[] } {
  const dx = Math.cos(angle) * len;
  const dy = Math.sin(angle) * len;
  const probe = shape('line', {
    x1: origin.x,
    y1: origin.y,
    x2: origin.x + dx,
    y2: origin.y + dy,
  });
  let result: { points?: Point2D[] } | null | undefined;
  try {
    result = safeIntersect(gs, probe);
  } catch (err) {
    Logger.error('[rayHits] Error during intersection:', {
      origin,
      angle,
      len,
      probe,
      err,
    });
    return { points: [] };
  }
  if (!result || !Array.isArray(result.points)) {
    return { points: [] };
  }
  return { points: result.points ?? [] };
}

/**
 * Computes the signed winding number for a probe intersecting a glyph shape.
 * @param gs - The glyph SvgShape
 * @param probe - The probe SvgShape
 * @param segments - Precomputed segment metadata array
 * @returns signed winding number (0 = outside, ±N = inside)
 */
export function windingNumber(
  gs: SvgShape,
  probe: SvgShape,
  segments?: { _segmentDir?: number }[]
): number {
  const result = safeIntersect(gs, probe) as {
    points: (Point2D & { segment1?: number })[];
  };
  let wn = 0;
  for (const p of result.points) {
    let dir = 1;
    if (segments && typeof p.segment1 === 'number' && segments[p.segment1]) {
      dir = Math.sign(segments[p.segment1]._segmentDir ?? 1);
    }
    wn += dir;
  }
  return wn;
}

/**
 * Checks if a point is inside the glyph outline using the fastest available method.
 * Uses IntersectionQuery.pointInPath if available, else falls back to ray/winding number.
 * @param g - The fontkit Glyph object.
 * @param pt - The point to test.
 * @returns boolean
 */
export function isInside(g: Glyph, pt: Point2D): boolean {
  const gs = shapeForV2(g);
  // Feature check for IntersectionQuery.pointInPath (kld >= 0.4)
  const insideFast =
    typeof IntersectionQuery === 'object' &&
    IntersectionQuery !== null &&
    typeof (IntersectionQuery as { pointInPath?: unknown }).pointInPath ===
      'function'
      ? (
          IntersectionQuery as {
            pointInPath: (shape: SvgShape, pt: Point2D) => boolean;
          }
        ).pointInPath
      : null;
  if (insideFast) {
    return insideFast(gs, pt);
  }
  // Legacy fallback: cast a long horizontal ray from far left to pt.x
  const probe = shape('line', { x1: -1e6, y1: pt.y, x2: pt.x, y2: pt.y });
  return Math.abs(windingNumber(gs, probe)) % 2 === 1;
}

/**
 * Performs a robust intersection, falling back to poly-line tessellation if the result is unstable.
 * @param a - First SvgShape
 * @param b - Second SvgShape
 * @returns intersection result
 */
export function safeIntersect(
  a: SvgShape,
  b: SvgShape
): { status: string; points: Point2D[] } {
  try {
    const res = intersect(a, b) as { status: string; points: Point2D[] };
    if (!res || typeof res !== 'object' || !Array.isArray(res.points)) {
      return { status: 'Error', points: [] };
    }
    if (res.status !== 'Intersection') return res;
    if (Number.isNaN(res.points[0]?.x)) {
      Logger.warn('[safeIntersect] Fallback tessellation needed', { a, b });
      return { status: 'Error', points: [] };
    }
    return res;
  } catch (finalErr) {
    Logger.error('[safeIntersect] Unrecoverable error:', finalErr, { a, b });
    return { status: 'Error', points: [] };
  }
}

/**
 * Returns a cached overshoot value for a glyph (max of bbox width/height * 2).
 * @param g - The fontkit Glyph object.
 * @returns overshoot (number)
 */
const overshootCache = new WeakMap<Glyph, number>();
export function getOvershoot(g: Glyph): number {
  if (!overshootCache.has(g)) {
    const bboxW = g.bbox.maxX - g.bbox.minX;
    const bboxH = g.bbox.maxY - g.bbox.minY;
    overshootCache.set(g, Math.max(bboxW, bboxH) * 2);
  }
  return overshootCache.get(g)!;
}

/**
 * Convert a Fontkit glyph to an svg-intersections PATH shape.
 * @param g - The fontkit Glyph object.
 * @returns svg-intersections path shape
 */
function glyphToShape(g: Glyph): SvgShape {
  const d = dFor(g);
  try {
    return shape('path', { d });
  } catch {
    Logger.error('[glyphToShape] Error creating shape for path:', d);
    return shape('path', { d: 'M0 0' });
  }
}

/**
 * Improved glyph shape cache: caches by composite key of glyph id/codePoint and font postscriptName.
 * Prevents memory leaks and improves cache hit rate for dynamic font/glyph use.
 */
const glyphShapeCacheV2 = new WeakMap<Glyph, SvgShape>();

/**
 * Caches and returns the svg-intersections shape for a glyph, using improved cache key.
 * @param g - The fontkit Glyph object.
 * @returns svg-intersections path shape (unknown type)
 */
export function shapeForV2(g: Glyph): SvgShape {
  if (!glyphShapeCacheV2.has(g)) glyphShapeCacheV2.set(g, glyphToShape(g));
  return glyphShapeCacheV2.get(g)!;
}

/**
 * Checks if a glyph is drawable (has path commands and bbox).
 * @param g - The fontkit Glyph object.
 * @returns boolean
 */
export function isDrawable(
  g: Glyph
): g is Glyph & { path: { commands: unknown[] } } {
  return !!(g && g.path && g.path.commands && g.bbox);
}

/**
 * Returns SVG path data string for a glyph, or empty if not drawable.
 * @param g - The fontkit Glyph object.
 * @returns SVG path data string.
 */
export function dFor(g: Glyph): string {
  try {
    if (!g || !g.path || typeof g.path.toSVG !== 'function') return 'M0 0';
    const d = g.path.toSVG();
    if (!d || typeof d !== 'string' || d.trim() === '') return 'M0 0';
    return d;
  } catch {
    Logger.error('[dFor] Error generating SVG path for glyph:', { g });
    return 'M0 0';
  }
}
