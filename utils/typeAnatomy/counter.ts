import type { Glyph } from 'fontkit';
import type { point2d } from '@/utils/geometry/geometry';
import {
  contourWinding,
  getFilledGeometry,
} from '@/utils/geometry/filledGeometry';
import type { Metrics } from './types';

export type FeatureShape =
  | { type: 'circle'; cx: number; cy: number; r: number }
  | { type: 'polyline'; points: point2d[] }
  | { type: 'path'; d: string };
export interface FeatureResult {
  found: boolean;
  shape?: FeatureShape;
}

function largestCounter(glyph: Glyph) {
  if (!glyph?.path?.commands?.length || !glyph.bbox) return undefined;
  return [...getFilledGeometry(glyph).enclosedRegions].sort(
    (a, b) => b.area - a.area
  )[0];
}

/** The legacy singular API selects the largest actual enclosed empty component. */
export function counterSeed(glyph: Glyph, _metrics: Metrics): point2d | null {
  const hole = largestCounter(glyph);
  if (!hole) return null;
  const center = {
    x: (hole.bbox.minX + hole.bbox.maxX) / 2,
    y: (hole.bbox.minY + hole.bbox.maxY) / 2,
  };
  if (contourWinding(hole.points, center) !== 0) return center;
  // A nonconvex enclosure's bbox center can lie outside it. Scan its own
  // vertex-height bands to find an interior point without seeding glyph ink.
  for (const point of hole.points) {
    const y = (point.y + center.y) / 2;
    const hits: number[] = [];
    for (let i = 0; i < hole.points.length; i++) {
      const a = hole.points[i],
        b = hole.points[(i + 1) % hole.points.length];
      if (a.y > y !== b.y > y)
        hits.push(a.x + ((y - a.y) * (b.x - a.x)) / (b.y - a.y));
    }
    hits.sort((a, b) => a - b);
    if (hits.length >= 2) return { x: (hits[0] + hits[1]) / 2, y };
  }
  return null;
}

/** Retain the call shape while tracing the empty component containing the seed. */
export function traceRegion(
  glyph: Glyph,
  seed: point2d,
  _step = 6,
  _rad = 1.5
): FeatureShape | null {
  if (!glyph?.path?.commands?.length || !glyph.bbox) return null;
  const hole = getFilledGeometry(glyph).enclosedRegions.find(
    (candidate) => contourWinding(candidate.points, seed) !== 0
  );
  return hole ? { type: 'polyline', points: hole.points } : null;
}

export function getCounter(glyph: Glyph, _metrics: Metrics): FeatureResult {
  const hole = largestCounter(glyph);
  return hole
    ? { found: true, shape: { type: 'polyline', points: hole.points } }
    : { found: false };
}
