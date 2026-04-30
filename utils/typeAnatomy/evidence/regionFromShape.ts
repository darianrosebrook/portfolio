/**
 * Adapters that turn the existing FeatureShape variants into RegionPolygon
 * point lists. Detectors that already compute a polygon-shaped output (rect,
 * circle, polyline) use these to populate FeatureInstance.region without
 * inventing a new geometry pipeline.
 *
 * All inputs and outputs are in glyph design units. The renderer applies the
 * single viewport transform at draw time.
 */

import type { Point2D } from '@/utils/geometry/geometry';

/** Convert a {x, y, width, height} rect to its 4 corners in CCW order. */
export function rectToPolygon(rect: {
  x: number;
  y: number;
  width: number;
  height: number;
}): Point2D[] {
  const { x, y, width, height } = rect;
  return [
    { x, y },
    { x: x + width, y },
    { x: x + width, y: y + height },
    { x, y: y + height },
  ];
}

/**
 * Approximate a circle as a regular polygon with `sides` vertices.
 * 32 sides is enough that the visible silhouette reads as a circle at typical
 * inspector scale; raise if higher fidelity is needed.
 */
export function circleToPolygon(
  circle: { cx: number; cy: number; r: number },
  sides = 32
): Point2D[] {
  const { cx, cy, r } = circle;
  const out: Point2D[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2;
    out.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    });
  }
  return out;
}

/**
 * Treat the polyline's point list as a closed polygon. Drops a trailing
 * point that duplicates the start (some upstream code emits closed
 * polylines with a repeated first/last vertex; the renderer closes the
 * polygon implicitly).
 */
export function polylineToPolygon(polyline: { points: Point2D[] }): Point2D[] {
  const pts = polyline.points;
  if (pts.length < 2) return [];
  const last = pts[pts.length - 1];
  const first = pts[0];
  if (last.x === first.x && last.y === first.y) {
    return pts.slice(0, -1);
  }
  return pts.slice();
}
