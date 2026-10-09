import type { Glyph } from 'fontkit';
import { getFilledGeometry } from '@/utils/geometry/filledGeometry';
import type { Metrics } from './types';

function hasCurvedBoundary(points: Array<{ x: number; y: number }>): boolean {
  let smoothTurns = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[(i + points.length - 1) % points.length];
    const b = points[i],
      c = points[(i + 1) % points.length];
    const ux = b.x - a.x,
      uy = b.y - a.y,
      vx = c.x - b.x,
      vy = c.y - b.y;
    const turn = Math.abs(Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy));
    if (turn > 1e-5 && turn < Math.PI / 4) smoothTurns++;
  }
  return smoothTurns >= 8;
}

/** A curved occupied wall around an actual enclosure, not scanline cardinality. */
export function hasBowl(glyph: Glyph, _metrics: Metrics): boolean {
  if (!glyph?.path?.commands?.length || !glyph.bbox) return false;
  const filled = getFilledGeometry(glyph);
  return filled.enclosedRegions.some(
    (hole) =>
      hasCurvedBoundary(hole.points) ||
      (hole.bodyIndex !== undefined &&
        hasCurvedBoundary(filled.bodies[hole.bodyIndex].points))
  );
}
