import { getFilledGeometry } from '@/utils/geometry/filledGeometry';
import type { FeatureInstance, GeometryCache } from '../types';

/** Enclosed empty components of the current nonzero glyph fill. */
export function detectCounter(geo: GeometryCache): FeatureInstance[] {
  if (!geo.glyph?.path?.commands || !geo.glyph.bbox) return [];
  const filled = geo.filled ?? getFilledGeometry(geo.glyph);
  return filled.enclosedRegions.map((hole, index) => ({
    id: 'counter',
    shape: { type: 'polyline', points: hole.points },
    region: { kind: 'enclosed', points: hole.points },
    confidence: 0.9,
    anchors: {
      center: {
        x: (hole.bbox.minX + hole.bbox.maxX) / 2,
        y: (hole.bbox.minY + hole.bbox.maxY) / 2,
      },
    },
    debug: { source: 'enclosed-fill-component', holeIndex: index },
  }));
}
