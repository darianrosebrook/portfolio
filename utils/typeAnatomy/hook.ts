import type { Glyph } from 'fontkit';
import {
  getFilledGeometry,
  occupiedRayIntervals,
} from '@/utils/geometry/filledGeometry';
import type { Metrics } from './index';

/** A terminal bends away from a long shaft; a solid round body has no shaft. */
export function hasHook(g: Glyph, _m: Metrics): boolean {
  if (!g?.path?.commands?.length || !g.bbox) return false;
  const model = getFilledGeometry(g);
  for (const body of model.bodies) {
    const height = body.bbox.maxY - body.bbox.minY;
    const width = body.bbox.maxX - body.bbox.minX;
    if (height <= 0 || width <= 0) continue;
    const scan = (y: number) =>
      occupiedRayIntervals(model, { x: body.bbox.minX - 1, y }, 0, width + 2);
    for (let i = 0; i < body.points.length; i++) {
      const a = body.points[i],
        b = body.points[(i + 1) % body.points.length];
      const edgeHeight = Math.abs(a.y - b.y);
      if (edgeHeight < height * 0.35 || Math.abs(a.x - b.x) > edgeHeight * 0.08)
        continue;
      const middle = (a.y + b.y) / 2,
        reference = scan(middle).find(
          (span) =>
            span.near.x <= (a.x + b.x) / 2 + 1 &&
            span.far.x >= (a.x + b.x) / 2 - 1
        );
      if (!reference) continue;
      const shaftWidth = reference.far.x - reference.near.x;
      const shaftCenter = (reference.near.x + reference.far.x) / 2;
      for (const upper of [true, false]) {
        const edgeY = upper ? Math.max(a.y, b.y) : Math.min(a.y, b.y);
        const terminalY = upper ? body.bbox.maxY : body.bbox.minY;
        if (
          Math.abs(edgeY - terminalY) < height * 0.04 ||
          Math.abs(edgeY - terminalY) > height * 0.45
        )
          continue;
        const y = terminalY + (upper ? -1 : 1) * height * 0.03;
        const spans = scan(y);
        if (spans.length !== 1) continue;
        const span = spans[0],
          center = (span.near.x + span.far.x) / 2;
        if (
          Math.abs(center - shaftCenter) > shaftWidth * 0.5 &&
          span.far.x - span.near.x < width * 0.95
        )
          return true;
      }
    }
  }
  return false;
}
