/**
 * Build a closed corridor polygon around a polyline centerline.
 *
 * The output is a closed polygon that hugs the centerline at ±half-thickness
 * along the local normal. The renderer can then clip the glyph fill against
 * it (`kind: 'stroke'`) so the highlight follows the actual stroke geometry
 * along curving features (spine, tail, loop) instead of rendering as a
 * single-pixel polyline.
 *
 * Coordinates are in glyph design units throughout. Closure is implicit —
 * callers should leave the renderer to connect the last vertex to the first.
 */

import type { Point2D } from '@/utils/geometry/geometry';

export type ThicknessFn = (
  midpoint: Point2D,
  tangent: Point2D,
  index: number
) => number;

export interface CorridorOptions {
  /** Centerline samples in order. Need at least 2 distinct points. */
  midpoints: Point2D[];
  /**
   * Stroke thickness at each midpoint. Constant if a number; per-vertex if
   * a function. Returning a non-positive value drops that vertex from the
   * corridor (the helper then bridges across the gap with the next valid
   * sample) so detectors don't need to filter degenerate measurements.
   */
  thickness: number | ThicknessFn;
  /**
   * If true, treat the centerline as closed (last → first). The corridor
   * becomes a ring rather than two parallel offsets joined at the ends.
   * Useful for the lower bowl of `g` (the loop).
   */
  closed?: boolean;
  /**
   * Drop midpoint pairs whose Euclidean distance is below this epsilon.
   * Without this guard, two near-coincident samples produce an undefined
   * tangent and a wildly long offset vertex.
   */
  minSegmentLength?: number;
}

const DEFAULT_MIN_SEGMENT = 1; // 1 design unit; smaller than any real stroke.

function tangentAt(pts: Point2D[], i: number, closed: boolean): Point2D | null {
  const n = pts.length;
  if (n < 2) return null;

  let prev: Point2D | undefined;
  let next: Point2D | undefined;

  if (closed) {
    prev = pts[(i - 1 + n) % n];
    next = pts[(i + 1) % n];
  } else if (i === 0) {
    next = pts[1];
  } else if (i === n - 1) {
    prev = pts[n - 2];
  } else {
    prev = pts[i - 1];
    next = pts[i + 1];
  }

  let dx = 0;
  let dy = 0;
  if (prev && next) {
    dx = next.x - prev.x;
    dy = next.y - prev.y;
  } else if (next) {
    dx = next.x - pts[i].x;
    dy = next.y - pts[i].y;
  } else if (prev) {
    dx = pts[i].x - prev.x;
    dy = pts[i].y - prev.y;
  }
  const mag = Math.hypot(dx, dy);
  if (mag === 0) return null;
  return { x: dx / mag, y: dy / mag };
}

/**
 * Build a closed corridor polygon from a centerline and per-vertex thickness.
 * Returns [] when the inputs cannot produce a valid polygon (fewer than 2
 * usable midpoints, all-zero thickness, etc). Callers should leave
 * `region` undefined in that case so the renderer falls back to the
 * detector's `shape` field.
 */
export function buildCorridorPolygon(opts: CorridorOptions): Point2D[] {
  const closed = opts.closed === true;
  const minSeg = opts.minSegmentLength ?? DEFAULT_MIN_SEGMENT;
  const raw = opts.midpoints;
  if (!raw || raw.length < 2) return [];

  // Drop duplicate / near-coincident consecutive samples so the tangent at
  // each surviving vertex is well-defined.
  const cleaned: Point2D[] = [raw[0]];
  for (let i = 1; i < raw.length; i++) {
    const prev = cleaned[cleaned.length - 1];
    const cur = raw[i];
    if (Math.hypot(cur.x - prev.x, cur.y - prev.y) >= minSeg) {
      cleaned.push(cur);
    }
  }
  if (closed && cleaned.length >= 2) {
    const first = cleaned[0];
    const last = cleaned[cleaned.length - 1];
    if (Math.hypot(first.x - last.x, first.y - last.y) < minSeg) {
      cleaned.pop();
    }
  }
  if (cleaned.length < 2) return [];

  const thicknessFn: ThicknessFn =
    typeof opts.thickness === 'function'
      ? opts.thickness
      : () => opts.thickness as number;

  const right: Point2D[] = [];
  const left: Point2D[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const m = cleaned[i];
    const t = tangentAt(cleaned, i, closed);
    if (!t) continue;
    const w = thicknessFn(m, t, i);
    if (!Number.isFinite(w) || w <= 0) continue;
    const half = w / 2;
    // Right normal = rotate tangent +90° CCW: (-ty, tx)
    const nx = -t.y;
    const ny = t.x;
    right.push({ x: m.x + nx * half, y: m.y + ny * half });
    left.push({ x: m.x - nx * half, y: m.y - ny * half });
  }

  if (right.length < 2) return [];

  // Stitch: forward along the right edge, reverse along the left edge.
  const polygon: Point2D[] = [...right];
  for (let i = left.length - 1; i >= 0; i--) {
    polygon.push(left[i]);
  }
  return polygon;
}
