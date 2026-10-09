import type { Glyph } from 'fontkit';
import { getFilledGeometry } from '@/utils/geometry/filledGeometry';
import {
  findOutlineCorners,
  interiorPointsDown,
  isInTopBand,
  isSharpExteriorCorner,
} from './evidence/corners';
import type { Metrics } from './index';

/** Sharp upper meeting, measured on actual occupied outer boundaries. */
export function hasApex(g: Glyph, _m: Metrics): boolean {
  if (!g?.path?.commands?.length || !g.bbox) return false;
  if (hasConvergingPlateau(g, true)) return true;
  return getFilledGeometry(g).bodies.some((body) =>
    findOutlineCorners(body.points).some(
      (corner) =>
        isSharpExteriorCorner(corner) &&
        isInTopBand(corner, body.bbox) &&
        interiorPointsDown(corner)
    )
  );
}

/** A flat tip also qualifies when the two adjoining legs converge from opposite sides. */
export function hasConvergingPlateau(g: Glyph, upper: boolean): boolean {
  return getFilledGeometry(g).bodies.some((body) =>
    body.points.some((a, i, points) => {
      const b = points[(i + 1) % points.length],
        before = points[(i - 1 + points.length) % points.length],
        after = points[(i + 2) % points.length];
      const level = upper ? body.bbox.maxY : body.bbox.minY;
      if (Math.abs(a.y - level) > 1e-6 || Math.abs(b.y - level) > 1e-6)
        return false;
      if (
        upper
          ? before.y >= level || after.y >= level
          : before.y <= level || after.y <= level
      )
        return false;
      const left = Math.min(a.x, b.x),
        right = Math.max(a.x, b.x);
      return (
        (before.x < left && after.x > right) ||
        (before.x > right && after.x < left)
      );
    })
  );
}
