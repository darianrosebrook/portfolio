import type { Glyph } from 'fontkit';
import type { Point2D } from '@/utils/geometry/geometry';
import { getFilledGeometry } from '@/utils/geometry/filledGeometry';

interface PathLikeGlyph {
  path?: { commands?: Array<{ command: string; args: number[] }> };
}
interface ProjectionOptions {
  glyph: Glyph | PathLikeGlyph;
  anchor: Point2D;
  arcLengthBudget: number;
  contourIndex?: number;
}
const distance = (a: Point2D, b: Point2D) => Math.hypot(b.x - a.x, b.y - a.y);

/** Project onto the actual sampled wall, then stop both walks at their arc budget. */
export function buildProjectionPolygon(opts: ProjectionOptions): Point2D[] {
  if (
    !opts.glyph?.path?.commands?.length ||
    !Number.isFinite(opts.arcLengthBudget) ||
    opts.arcLengthBudget <= 0
  )
    return [];
  const contours = getFilledGeometry(opts.glyph as Glyph).contours.filter(
    (contour) =>
      opts.contourIndex === undefined || contour.index === opts.contourIndex
  );
  let nearest:
    | { points: Point2D[]; index: number; anchor: Point2D; distance: number }
    | undefined;
  for (const contour of contours) {
    for (let i = 0; i < contour.points.length; i++) {
      const a = contour.points[i],
        b = contour.points[(i + 1) % contour.points.length];
      const dx = b.x - a.x,
        dy = b.y - a.y;
      const lengthSq = dx * dx + dy * dy;
      if (!lengthSq) continue;
      const fraction = Math.max(
        0,
        Math.min(
          1,
          ((opts.anchor.x - a.x) * dx + (opts.anchor.y - a.y) * dy) / lengthSq
        )
      );
      const anchor = { x: a.x + dx * fraction, y: a.y + dy * fraction };
      const separation = distance(anchor, opts.anchor);
      if (!nearest || separation < nearest.distance)
        nearest = {
          points: contour.points,
          index: i,
          anchor,
          distance: separation,
        };
    }
  }
  if (!nearest) return [];
  const { points, index, anchor } = nearest;
  const walk = (direction: 1 | -1) => {
    const output: Point2D[] = [];
    let remaining = opts.arcLengthBudget,
      current = anchor;
    let next = direction === 1 ? (index + 1) % points.length : index;
    for (let step = 0; step < points.length && remaining > 0; step++) {
      const target = points[next],
        length = distance(current, target);
      if (length >= remaining && length > 0) {
        output.push({
          x: current.x + ((target.x - current.x) * remaining) / length,
          y: current.y + ((target.y - current.y) * remaining) / length,
        });
        break;
      }
      output.push(target);
      remaining -= length;
      current = target;
      next = (next + direction + points.length) % points.length;
    }
    return output;
  };
  const polygon = [...walk(-1).reverse(), anchor, ...walk(1)].filter(
    (point, i, list) =>
      i === 0 || point.x !== list[i - 1].x || point.y !== list[i - 1].y
  );
  return polygon.length >= 3 ? polygon : [];
}
