/** Interior junctions lie on the empty side of the meeting strokes. */
import { junctionPoints } from './apex';
import type { FeatureInstance, GeometryCache } from '../types';
export function detectCrotch(geo: GeometryCache): FeatureInstance[] {
  return junctionPoints(geo.glyph, geo.metrics, 'crotch', geo.italicAngle).map(
    (point) => ({
      id: 'crotch',
      shape: { type: 'point', ...point, label: 'Crotch' },
      confidence: 0.9,
      anchors: { position: point },
      debug: { source: 'occupied-interior-junction' },
    })
  );
}
