import type { Glyph } from 'fontkit';
import { getFilledGeometry } from '@/utils/geometry/filledGeometry';
import {
  findOutlineCorners,
  isSharpExteriorCorner,
  isSharpInteriorCorner,
} from './evidence/corners';
import type { Metrics } from './index';

/** The inward angle of a stroke junction may open into the outside or a cavity. */
export function hasCrotch(g: Glyph, _m: Metrics): boolean {
  if (!g?.path?.commands?.length || !g.bbox) return false;
  const model = getFilledGeometry(g);
  return (
    model.bodies.some((body) =>
      findOutlineCorners(body.points).some((corner) =>
        isSharpInteriorCorner(corner)
      )
    ) ||
    model.enclosedRegions.some((hole) =>
      findOutlineCorners(hole.points).some((corner) =>
        isSharpExteriorCorner(corner)
      )
    )
  );
}
