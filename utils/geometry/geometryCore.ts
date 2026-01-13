/**
 * Core geometry helpers for typographic feature detection.
 * Extracted from geometryHeuristics.ts for modularity and testability.
 *
 * Exports:
 *   - rayHits
 *   - windingNumber
 *   - isInside
 *   - safeIntersect
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
// Used indirectly via pointInPathFn setter
declare const _IntersectionQuery: unknown;

/**
 * Optional point-in-path function for fast inside checks.
 * Set via setPointInPath() from patch-kld.ts when available.
 */
let pointInPathFn: ((shape: SvgShape, pt: Point2D) => boolean) | null = null;

/**
 * Registers a point-in-path function for fast inside checks.
 * Called from patch-kld.ts when IntersectionQuery is available.
 */
export function setPointInPath(
  fn: (shape: SvgShape, pt: Point2D) => boolean
): void {
  pointInPathFn = fn;
}

/**
 * Default epsilon for deduplication (will be scaled by ray length)
 */
const RAY_DEDUP_EPS = 0.5;

/**
 * Sorts points along a ray direction and deduplicates near-equal points.
 * @param points - Array of intersection points
 * @param angle - Ray angle in radians
 * @param eps - Deduplication tolerance
 * @returns Sorted and deduplicated points
 */
function sortAndDedupeAlongRay(
  points: Point2D[],
  angle: number,
  eps: number
): Point2D[] {
  if (points.length <= 1) return points;

  const ux = Math.cos(angle);
  const uy = Math.sin(angle);

  // Project each point onto ray direction and sort
  const sorted = points
    .slice()
    .sort((a, b) => a.x * ux + a.y * uy - (b.x * ux + b.y * uy));

  // Deduplicate: keep first point of each cluster
  const result: Point2D[] = [];
  for (const pt of sorted) {
    if (result.length === 0) {
      result.push(pt);
      continue;
    }
    const last = result[result.length - 1];
    const dist = Math.hypot(pt.x - last.x, pt.y - last.y);
    if (dist > eps) {
      result.push(pt);
    }
  }

  return result;
}

/**
 * Casts a ray (line probe) at a glyph shape and returns intersection points.
 * Points are sorted along the ray direction and deduplicated.
 * @param gs - SvgShape for the glyph
 * @param origin - Start point of the ray
 * @param angle - Angle in radians
 * @param len - Length of the ray
 * @param dedupEps - Optional deduplication epsilon (default: RAY_DEDUP_EPS)
 * @returns { points: Point2D[] } Sorted, deduplicated intersection points
 */
export function rayHits(
  gs: SvgShape,
  origin: Point2D,
  angle: number,
  len: number,
  dedupEps?: number
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

  // Sort along ray direction and deduplicate
  const eps = dedupEps ?? Math.max(RAY_DEDUP_EPS, len * 0.001);
  const sorted = sortAndDedupeAlongRay(result.points, angle, eps);

  return { points: sorted };
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
 * Uses registered pointInPath function if available, else falls back to ray/parity check.
 * @param g - The fontkit Glyph object.
 * @param pt - The point to test.
 * @returns boolean
 */
export function isInside(g: Glyph, pt: Point2D): boolean {
  const gs = shapeForV2(g);

  // Fast path: use registered pointInPath function
  if (pointInPathFn) {
    return pointInPathFn(gs, pt);
  }

  // Fallback: horizontal ray cast with parity check
  // Use bbox-aware far-left position instead of fixed -1e6
  const bboxLeft = g.bbox ? g.bbox.minX - (g.bbox.maxX - g.bbox.minX) : -1e6;
  // Jitter Y slightly to avoid grazing vertices exactly
  const EPS = 0.01;
  const jitteredY = pt.y + EPS;
  const probe = shape('line', {
    x1: bboxLeft,
    y1: jitteredY,
    x2: pt.x,
    y2: jitteredY,
  });

  // Parity check: odd number of crossings = inside
  return Math.abs(windingNumber(gs, probe)) % 2 === 1;
}

/**
 * Performs a robust intersection, falling back to poly-line tessellation if the result is unstable.
 * NOTE: Tessellation fallback is currently disabled until real implementation exists.
 * @param a - First SvgShape
 * @param b - Second SvgShape
 * @returns intersection result
 */
const tessellationEnabled = false; // Set to true when tessellate() is implemented

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

    // Validate all points for NaN/infinity (not just first point)
    const hasInvalidPoints = res.points.some(
      (p) => !Number.isFinite(p.x) || !Number.isFinite(p.y)
    );

    if (hasInvalidPoints) {
      if (tessellationEnabled) {
        // Fallback: poly-line tessellation with caching
        try {
          const fallback = intersect(flatMemo(a, 0.25), flatMemo(b, 0.25)) as {
            status: string;
            points: Point2D[];
          };
          if (
            !fallback ||
            typeof fallback !== 'object' ||
            !Array.isArray(fallback.points)
          ) {
            return { status: 'Error', points: [] };
          }
          return fallback;
        } catch {
          Logger.warn('[safeIntersect] Fallback tessellation failed', { a, b });
          return { status: 'Error', points: [] };
        }
      } else {
        // Tessellation not implemented - return error
        Logger.warn(
          '[safeIntersect] Invalid points detected but tessellation disabled',
          { a, b }
        );
        return { status: 'Error', points: [] };
      }
    }
    return res;
  } catch (err) {
    if (tessellationEnabled) {
      // If intersect throws, fallback to tessellation
      try {
        const fallback = intersect(flatMemo(a, 0.25), flatMemo(b, 0.25)) as {
          status: string;
          points: Point2D[];
        };
        if (
          !fallback ||
          typeof fallback !== 'object' ||
          !Array.isArray(fallback.points)
        ) {
          return { status: 'Error', points: [] };
        }
        return fallback;
      } catch {
        Logger.warn('[safeIntersect] Fallback tessellation failed', { a, b });
        return { status: 'Error', points: [] };
      }
    }
    Logger.error('[safeIntersect] Intersection failed:', err, { a, b });
    return { status: 'Error', points: [] };
  }
}

/**
 * Caches polyline tessellations for SvgShapes by tolerance.
 * Avoids redundant tessellation work in safeIntersect fallback.
 */
const flatCache = new WeakMap<object, Map<number, SvgShape>>();
function flatMemo(s: SvgShape, tol = 0.25): SvgShape {
  let tmap = flatCache.get(s as object);
  if (!tmap) flatCache.set(s as object, (tmap = new Map()));
  if (!tmap.has(tol)) tmap.set(tol, tessellate(s, tol));
  return tmap.get(tol)!;
}

/**
 * Tessellates a path shape into a polyline for robust intersection.
 * This is a simplified version - full tessellation with bezier flattening
 * is available in geometryHeuristics.ts for more complex cases.
 */
function tessellate(s: SvgShape, _tol = 0.25): SvgShape {
  // For now, return the shape as-is
  // Full tessellation implementation exists in geometryHeuristics.ts
  // but requires SegmentWithMeta types and bezier-js integration
  return s;
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

/**
 * Scale helpers for consistent thresholding across detectors.
 */

/**
 * Returns a base epsilon value for a glyph based on UPM and bbox.
 * @param upm - Units per em
 * @param bbox - Optional bounding box for scale-aware epsilon
 * @returns Base epsilon value
 */
export function epsFor(
  upm: number,
  bbox?: { minX: number; maxX: number; minY: number; maxY: number }
): number {
  const baseEps = upm * 0.001;
  if (!bbox) return baseEps;
  const width = bbox.maxX - bbox.minX;
  const height = bbox.maxY - bbox.minY;
  // Use 0.1% of the smaller dimension as a scale-aware epsilon
  return Math.max(baseEps, Math.min(width, height) * 0.001);
}

/**
 * Returns cap-band bounds for filtering apex candidates.
 * @param capHeight - Cap height metric
 * @param glyphHeight - Total glyph height (bbox.maxY - bbox.minY)
 * @returns Object with min and max Y values for cap band
 */
export function capBand(
  capHeight: number,
  glyphHeight: number
): { min: number; max: number } {
  // Cap band extends slightly below cap height (for overshoot) and above
  const overshootPad = glyphHeight * 0.06;
  const undershootPad = glyphHeight * 0.12;
  return {
    min: capHeight - undershootPad,
    max: capHeight + overshootPad,
  };
}

/**
 * Checks if a point is within the cap band.
 * @param pt - Point to check
 * @param capHeight - Cap height metric
 * @param glyphHeight - Total glyph height
 * @returns boolean
 */
export function isInCapBand(
  pt: Point2D,
  capHeight: number,
  glyphHeight: number
): boolean {
  const band = capBand(capHeight, glyphHeight);
  return pt.y >= band.min && pt.y <= band.max;
}
