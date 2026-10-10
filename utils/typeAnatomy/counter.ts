import type { Glyph } from 'fontkit';
import type { point2d } from '@/utils/geometry/geometry';
import { contourWinding } from '@/utils/geometry/filledGeometry';
import type { Metrics } from './types';
import { counterSpaces } from './evidence/counterSpaces';

export type FeatureShape =
  | { type: 'circle'; cx: number; cy: number; r: number }
  | { type: 'polyline'; points: point2d[] }
  | { type: 'path'; d: string };
export interface FeatureResult {
  found: boolean;
  shape?: FeatureShape;
}

function largestCounter(glyph: Glyph, metrics?: Metrics) {
  if (!glyph?.path?.commands?.length || !glyph.bbox) return undefined;
  return counterSpaces(glyph, metrics).sort((a, b) => b.area - a.area)[0];
}

/** The legacy singular API selects the largest actual closed or open counter space. */
export function counterSeed(glyph: Glyph, _metrics: Metrics): point2d | null {
  const hole = largestCounter(glyph, _metrics);
  if (!hole) return null;
  return { ...hole.seed };
}

/** Retain the call shape while tracing the empty component containing the seed. */
export function traceRegion(
  glyph: Glyph,
  seed: point2d,
  _step = 6,
  _rad = 1.5
): FeatureShape | null {
  if (!glyph?.path?.commands?.length || !glyph.bbox) return null;
  const hole = counterSpaces(glyph).find(
    (candidate) => contourWinding(candidate.points, seed) !== 0
  );
  return hole ? { type: 'polyline', points: hole.points } : null;
}

export function getCounter(glyph: Glyph, _metrics: Metrics): FeatureResult {
  const hole = largestCounter(glyph, _metrics);
  return hole
    ? { found: true, shape: { type: 'polyline', points: hole.points } }
    : { found: false };
}
