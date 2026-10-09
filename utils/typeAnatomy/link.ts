import type { Glyph } from 'fontkit';
import {
  getFilledGeometry,
  occupiedRayIntervals,
} from '@/utils/geometry/filledGeometry';
import type { Metrics } from './index';

/** A link joins separate upper/lower enclosures through a narrow ink band. */
export function hasLink(g: Glyph, m: Metrics): boolean {
  if (!g?.path?.commands?.length || !g.bbox) return false;
  const model = getFilledGeometry(g);
  for (const lower of model.enclosedRegions.filter(
    (hole) => hole.bbox.minY < m.baseline
  )) {
    for (const upper of model.enclosedRegions.filter(
      (hole) => hole.bbox.minY > m.baseline
    )) {
      if (
        lower.bodyIndex === undefined ||
        lower.bodyIndex !== upper.bodyIndex ||
        lower.bbox.maxY >= upper.bbox.minY
      )
        continue;
      const body = model.bodies[lower.bodyIndex];
      const y = (lower.bbox.maxY + upper.bbox.minY) / 2;
      const spans = occupiedRayIntervals(
        model,
        { x: body.bbox.minX - 1, y },
        0,
        body.bbox.maxX - body.bbox.minX + 2
      );
      const maximumWidth =
        Math.min(
          lower.bbox.maxX - lower.bbox.minX,
          upper.bbox.maxX - upper.bbox.minX
        ) * 0.9;
      if (spans.some((span) => span.far.x - span.near.x < maximumWidth))
        return true;
    }
  }
  return false;
}
