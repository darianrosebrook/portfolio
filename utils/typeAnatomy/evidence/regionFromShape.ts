/**
 * Adapters that turn the existing FeatureShape variants into RegionPolygon
 * point lists. Detectors that already compute a polygon-shaped output (rect,
 * circle, polyline) use these to populate FeatureInstance.region without
 * inventing a new geometry pipeline.
 *
 * All inputs and outputs are in glyph design units. The renderer applies the
 * single viewport transform at draw time.
 */

import type { Glyph } from 'fontkit';
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

interface PathCommand {
  command: string;
  args: number[];
}

interface PathLikeGlyph {
  path?: { commands?: PathCommand[] };
}

/**
 * Extract a polygon from a contour's path commands. Walks the
 * `[startIndex, endIndex]` slice of the glyph's command list and collects
 * endpoint coordinates from each move/line/curve. For curves, only the
 * endpoint is recorded — fine for small features (tittle, dot accents)
 * where the polygon's job is to bound a clip mask, not to trace every
 * Bézier inflection.
 *
 * Returns [] if the contour can't be extracted (missing path data, no
 * move commands, sub-3 vertex count). Callers should fall back to
 * `rectToPolygon`/`circleToPolygon` in that case.
 */
export function extractContourPolygon(
  glyph: PathLikeGlyph | Glyph,
  startIndex: number,
  endIndex: number
): Point2D[] {
  const cmds = (glyph as PathLikeGlyph).path?.commands;
  if (!cmds) return [];
  const slice = cmds.slice(startIndex, endIndex + 1);
  const points: Point2D[] = [];
  for (const c of slice) {
    switch (c.command) {
      case 'moveTo':
      case 'lineTo':
        points.push({ x: c.args[0], y: c.args[1] });
        break;
      case 'quadraticCurveTo':
        // Args: [cx, cy, x, y] — endpoint at indices 2,3
        points.push({ x: c.args[2], y: c.args[3] });
        break;
      case 'bezierCurveTo':
        // Args: [c1x, c1y, c2x, c2y, x, y] — endpoint at indices 4,5
        points.push({ x: c.args[4], y: c.args[5] });
        break;
      case 'closePath':
        // Implicit closure; renderer connects last to first.
        break;
      default:
        // Unknown command (e.g. arc) — bail to keep callers honest about
        // approximation vs exact extraction.
        return [];
    }
  }
  // Drop a trailing duplicate-of-first if upstream produced one.
  if (points.length >= 2) {
    const last = points[points.length - 1];
    const first = points[0];
    if (last.x === first.x && last.y === first.y) {
      points.pop();
    }
  }
  return points.length >= 3 ? points : [];
}
