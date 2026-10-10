/** An exterior bottom meeting of opposed diagonals excludes free leg ends. */
import { junctionPoints } from './apex';
import type { FeatureInstance, GeometryCache } from '../types';
export function detectVertex(geo: GeometryCache): FeatureInstance[] {
  return junctionPoints(geo.glyph, geo.metrics, 'vertex', geo.italicAngle).map(
    (point) => ({
      id: 'vertex',
      shape: { type: 'point', ...point, label: 'Vertex' },
      confidence: 0.9,
      anchors: { tip: point },
      debug: { source: 'occupied-diagonal-junction' },
    })
  );
}
