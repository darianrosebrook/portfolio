import {
  getFilledGeometry,
  type FilledBoundary,
} from '@/utils/geometry/filledGeometry';
import type { FeatureInstance, GeometryCache, Point2D } from '../types';
import { detectAperture } from './aperture';

/** The long lower boundary of an eye is supplied by its horizontal bar. */
export function eyeFloor(
  hole: FilledBoundary,
  geo: GeometryCache
): [Point2D, Point2D] | null {
  const width = hole.bbox.maxX - hole.bbox.minX;
  const height = hole.bbox.maxY - hole.bbox.minY;
  if (width <= 0 || height <= 0) return null;
  const lowerOpening = detectAperture(geo).some((instance) => {
    const bottom = instance.anchors?.mouthBottom;
    return (
      bottom &&
      bottom.y < hole.bbox.minY &&
      instance.region?.points.some(
        (point) => point.y < hole.bbox.minY - geo.scale.stemWidth * 0.2
      )
    );
  });
  if (!lowerOpening) return null;
  for (let i = 0; i < hole.points.length; i++) {
    const a = hole.points[i];
    const b = hole.points[(i + 1) % hole.points.length];
    const dx = Math.abs(b.x - a.x);
    if (
      dx >= width * 0.35 &&
      Math.abs(b.y - a.y) <=
        Math.max(geo.filled?.tolerance ?? 0.2, dx * 0.12) &&
      Math.max(a.y, b.y) <= hole.bbox.minY + height * 0.1
    )
      return a.x < b.x ? [a, b] : [b, a];
  }
  return null;
}

/** A curved enclosure above a bar, rather than any gap found on a scanline. */
export function detectEye(geo: GeometryCache): FeatureInstance[] {
  if (!geo.glyph?.path?.commands || !geo.glyph.bbox) return [];
  const filled = geo.filled ?? getFilledGeometry(geo.glyph);
  return filled.enclosedRegions.flatMap((hole, index) => {
    const floor = eyeFloor(hole, geo);
    if (!floor) return [];
    return [
      {
        id: 'eye' as const,
        shape: { type: 'polyline' as const, points: hole.points },
        region: { kind: 'enclosed' as const, points: hole.points },
        confidence: 0.95,
        anchors: {
          center: {
            x: (hole.bbox.minX + hole.bbox.maxX) / 2,
            y: (hole.bbox.minY + hole.bbox.maxY) / 2,
          },
          barLeft: floor[0],
          barRight: floor[1],
        },
        debug: { source: 'bar-bounded-enclosure', holeIndex: index },
      },
    ];
  });
}
