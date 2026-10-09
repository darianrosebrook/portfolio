import { getFilledGeometry } from '@/utils/geometry/filledGeometry';
import { detectAperture } from './aperture';
import type { FeatureInstance, GeometryCache } from '../types';

/** A spine is the connected curved body between opposite open counter recesses. */
export function detectSpine(geo: GeometryCache): FeatureInstance[] {
  if (!geo.glyph?.path?.commands?.length || !geo.glyph.bbox) return [];
  const filled = geo.filled ?? getFilledGeometry(geo.glyph);
  const pockets = detectAperture(geo);
  const sides = new Set(
    pockets.map(
      (instance) => (instance.debug as { side?: string } | undefined)?.side
    )
  );
  if (!sides.has('left') || !sides.has('right')) return [];
  let curvedLength = 0,
    straightLength = 0;
  for (const segment of geo.segments) {
    if (segment.params.length < 2) continue;
    const length = segment.params
      .slice(1)
      .reduce(
        (sum, point, index) =>
          sum +
          Math.hypot(
            point.x - segment.params[index].x,
            point.y - segment.params[index].y
          ),
        0
      );
    if (segment.type.includes('Curve')) curvedLength += length;
    else straightLength += length;
  }
  if (curvedLength < straightLength) return [];
  return filled.bodies.flatMap((body, index): FeatureInstance[] => {
    if (filled.enclosedRegions.some((hole) => hole.bodyIndex === index))
      return [];
    if (body.bbox.maxY - body.bbox.minY < geo.scale.bboxH * 0.6) return [];
    return [
      {
        id: 'spine',
        shape: { type: 'polyline', points: body.points },
        region: { kind: 'stroke', points: body.points },
        confidence: 0.9,
        debug: {
          source: 'opposed-open-counters',
          curvedLength,
          straightLength,
        },
      },
    ];
  });
}
