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
 * Glyph-backed ray queries use the shared nonzero fill model.
 */
import type { Glyph } from 'fontkit';
import { intersect, shape } from 'svg-intersections';
import { Logger } from '../helpers/logger';
import type { Point2D } from './geometry';
import './patch-kld';
import {
  getFilledGeometry,
  getFilledShape,
  registerFilledShape,
  containsFilledPoint,
  occupiedRayIntervals,
} from './filledGeometry';

export type SvgShape = ReturnType<typeof shape>;

/** Compatibility registration hook. Glyph containment uses source nonzero
 * winding; the legacy generic even-odd point query does not own glyph fill. */
export function setPointInPath(
  _fn: (shape: SvgShape, pt: Point2D) => boolean
): void {}

/** Weak shape cache with exact ray keys and defensive point copies. Sub-unit
 * rays can cross distinct thin boundaries, so key quantization is unsafe. */
let rayHitCache = new WeakMap<object, Map<string, Point2D[]>>();

function rayHitKey(
  origin: Point2D,
  angle: number,
  len: number,
  dedupEps: number | undefined
): string {
  return JSON.stringify([origin.x, origin.y, angle, len, dedupEps ?? null]);
}

/**
 * Clears the intersection cache. Intended for tests; production never needs it
 * (the WeakMap self-cleans as shapes are GC'd).
 */
export function clearRayHitCache(): void {
  rayHitCache = new WeakMap();
  trackedShapes.clear();
}

/**
 * Observability of cache state for tests/diagnostics.
 */
export function getRayHitCacheStats(): {
  entries: number;
  shapes: number;
} {
  let entries = 0;
  let shapes = 0;
  for (const reference of trackedShapes) {
    const target = reference.deref();
    if (!target) {
      trackedShapes.delete(reference);
      continue;
    }
    const m = rayHitCache.get(target);
    if (m) {
      entries += m.size;
      shapes++;
    }
  }
  return { entries, shapes };
}

// Diagnostics retain WeakRef wrappers, preserving weak glyph ownership.
const trackedShapes = new Set<WeakRef<object>>();

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
 *
 * Glyph-backed shapes return occupied span endpoint pairs, clipped to the
 * probe. Generic SVG shapes return raw outline intersections. Exact repeat
 * queries are memoized; returned points can be mutated independently.
 * @param gs - SvgShape for the glyph
 * @param origin - Start point of the ray
 * @param angle - Angle in radians
 * @param len - Length of the ray
 * @param dedupEps - Optional raw SVG intersection deduplication tolerance
 * @returns { points: Point2D[] } Sorted, deduplicated intersection points
 */
export function rayHits(
  gs: SvgShape,
  origin: Point2D,
  angle: number,
  len: number,
  dedupEps?: number
): { points: Point2D[] } {
  const key = rayHitKey(origin, angle, len, dedupEps);
  let shapeMap = rayHitCache.get(gs as object);
  if (shapeMap) {
    const cached = shapeMap.get(key);
    if (cached) {
      return { points: cached.map((p) => ({ ...p })) };
    }
  }

  const filled = getFilledShape(gs as object);
  let sorted: Point2D[];
  if (filled) {
    // Internal crossings are not occupied boundaries. These spans also
    // handle a probe beginning or ending inside occupied ink.
    sorted = occupiedRayIntervals(filled, origin, angle, len).flatMap(
      (interval) => [interval.near, interval.far]
    );
  } else {
    const probe = shape('line', {
      x1: origin.x,
      y1: origin.y,
      x2: origin.x + Math.cos(angle) * len,
      y2: origin.y + Math.sin(angle) * len,
    });
    const result = safeIntersect(gs, probe);
    const numericalEpsilon =
      Number.EPSILON *
      Math.max(
        1,
        ...result.points.flatMap((p) => [Math.abs(p.x), Math.abs(p.y)])
      ) *
      16;
    sorted = sortAndDedupeAlongRay(
      result.points,
      angle,
      dedupEps ?? numericalEpsilon
    );
  }

  // Store in cache (the sorted/deduplicated canonical form).
  if (!shapeMap) {
    shapeMap = new Map();
    rayHitCache.set(gs as object, shapeMap);
    trackedShapes.add(new WeakRef(gs as object));
  }
  shapeMap.set(
    key,
    sorted.map((p) => ({ ...p }))
  );

  return { points: sorted.map((p) => ({ ...p })) };
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
 * Applies the nonzero winding fill rule to the current glyph outline.
 * @param g - The fontkit Glyph object.
 * @param pt - The point to test.
 * @returns boolean
 */
export function isInside(g: Glyph, pt: Point2D): boolean {
  return containsFilledPoint(getFilledGeometry(g), pt);
}

/** Validated raw SVG intersections. Invalid library results fail closed. */
export function safeIntersect(
  a: SvgShape,
  b: SvgShape
): { status: string; points: Point2D[] } {
  try {
    const result = intersect(a, b) as { status: string; points: Point2D[] };
    if (
      !result ||
      !Array.isArray(result.points) ||
      result.points.some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.y))
    ) {
      return { status: 'Error', points: [] };
    }
    return result;
  } catch (error) {
    Logger.error('[safeIntersect] Intersection failed:', error, { a, b });
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
  if (!glyphShapeCacheV2.has(g)) {
    const result = glyphToShape(g);
    registerFilledShape(result as object, getFilledGeometry(g));
    glyphShapeCacheV2.set(g, result);
  }
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
