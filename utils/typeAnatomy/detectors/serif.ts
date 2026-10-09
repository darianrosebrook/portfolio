/** Terminal widening is measured against an independently traced backbone. */
import {
  getFilledGeometry,
  occupiedRayIntervals,
} from '@/utils/geometry/filledGeometry';
import { detectStem } from './stem';
import type { FeatureInstance, GeometryCache } from '../types';

export function detectSerif(geo: GeometryCache): FeatureInstance[] {
  const { glyph, scale } = geo;
  if (!glyph?.path?.commands?.length || !glyph.bbox || !geo.context.isSerif)
    return [];
  const filled = geo.filled ?? getFilledGeometry(glyph);
  const instances: FeatureInstance[] = [];
  for (const stem of detectStem(geo)) {
    if (stem.shape.type !== 'rect') continue;
    const shaft = stem.shape;
    // Bare line evidence supplies terminal attachment even when the fitted
    // backbone continues through its head/foot flare.
    const debug = stem.debug as { edgeBottom?: number; edgeTop?: number };
    const ends = [
      { y: glyph.bbox.minY, sign: 1 as const, type: 'foot' },
      { y: glyph.bbox.maxY, sign: -1 as const, type: 'cap' },
    ];
    for (const end of ends) {
      const edgeY = end.sign === 1 ? debug?.edgeBottom : debug?.edgeTop;
      if (edgeY === undefined || Math.abs(edgeY - end.y) > scale.bboxH * 0.2)
        continue;
      const y = end.y + end.sign * scale.eps;
      const span = occupiedRayIntervals(
        filled,
        { x: glyph.bbox.minX - scale.eps, y },
        0,
        scale.overshoot
      ).find(
        (s) =>
          s.near.x <= shaft.x + shaft.width / 2 &&
          s.far.x >= shaft.x + shaft.width / 2
      );
      if (!span) continue;
      for (const side of ['left', 'right'] as const) {
        const x1 = side === 'left' ? span.near.x : shaft.x + shaft.width;
        const x2 = side === 'left' ? shaft.x : span.far.x;
        if (x2 - x1 < shaft.width * 0.05) continue;
        const lower = [],
          upper = [];
        for (let band = 0; band <= 24; band++) {
          // Probe inside the two boundary edges; the region includes exact
          // outer/shaft X limits while its height follows the actual flare.
          const x =
            x1 + (x2 - x1) * Math.max(1e-6, Math.min(1 - 1e-6, band / 24));
          const projection = occupiedRayIntervals(
            filled,
            { x, y: glyph.bbox.minY - scale.eps },
            Math.PI / 2,
            scale.overshoot
          ).find((s) => s.near.y <= y && s.far.y >= y);
          if (
            !projection ||
            projection.far.y - projection.near.y > scale.bboxH * 0.2
          )
            break;
          const boundaryX = x1 + ((x2 - x1) * band) / 24;
          lower.push({ x: boundaryX, y: projection.near.y });
          upper.push({ x: boundaryX, y: projection.far.y });
        }
        if (lower.length !== 25) continue;
        const points = [...lower, ...upper.reverse()];
        const anchor = { x: side === 'left' ? x1 : x2, y: end.y };
        instances.push({
          id: 'serif',
          shape: { type: 'point', ...anchor, label: `${end.type} serif` },
          region: { kind: 'stroke', points },
          confidence: 0.85,
          anchors: { position: anchor },
          debug: {
            side,
            type: end.type,
            extensionDistance: x2 - x1,
            source: 'backbone-terminal-widening',
          },
        });
      }
    }
  }
  return instances;
}
