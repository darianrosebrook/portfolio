import { hasConvergingPlateau } from './apex';
import type { Glyph } from 'fontkit';
import { getFilledGeometry } from '@/utils/geometry/filledGeometry';
import {
  findOutlineCorners,
  interiorPointsUp,
  isInBottomBand,
  isSharpExteriorCorner,
} from './evidence/corners';
import type { Metrics } from './index';

/** Sharp lower meeting, excluding right-angle stem and rectangle ends. */
export function hasVertex(g: Glyph, _m: Metrics): boolean {
  if (!g?.path?.commands?.length || !g.bbox) return false;
  if (hasConvergingPlateau(g, false)) return true;
  return getFilledGeometry(g).bodies.some((body) =>
    findOutlineCorners(body.points).some(
      (corner) =>
        isSharpExteriorCorner(corner) &&
        isInBottomBand(corner, body.bbox) &&
        interiorPointsUp(corner)
    )
  );
}
