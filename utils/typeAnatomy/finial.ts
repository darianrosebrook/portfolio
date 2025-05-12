/**
 * Finial feature detection for typographic glyphs.
 * Extracted from geometryHeuristics.ts for modularity and testability.
 *
 * Exports:
 *   - hasFinial
 */
import type { Glyph } from 'fontkit';
import { shapeForV2 } from '@/utils/caching';
import { rayHits } from '@/utils/geometry/geometryCore';
import type { Metrics } from './index';
import { FeatureDetectionConfig } from './featureConfig';

/**
 * Detects if a glyph contains a finial (non-serif, non-ball terminal).
 * Uses EPS from FeatureDetectionConfig.global.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns boolean
 */
export function hasFinial(g: Glyph, m: Metrics): boolean {
  if (!isDrawable(g)) return false;
  const gs = shapeForV2(g);
  const EPS = FeatureDetectionConfig.global.defaultEps;
  const overshoot = (g.bbox.maxY - g.bbox.minY) * 2;
  const bands = 3;
  for (let i = 1; i < bands; i++) {
    const y = m.baseline + (i * (m.xHeight - m.baseline)) / bands;
    const origin = { x: g.bbox.minX - overshoot, y };
    const { points } = rayHits(gs, origin, 0, overshoot * 2);
    for (let j = 0; j < points.length - 1; j += 2) {
      const xL = points[j].x - EPS * 10;
      const xR = points[j + 1].x + EPS * 10;
      const diagL = rayHits(gs, { x: xL, y }, 0.785, EPS * 20);
      const diagR = rayHits(gs, { x: xR, y }, -0.785, EPS * 20);
      if (
        (!diagL.points.length ||
          (diagL.points[0] && Math.abs(diagL.points[0].x - xL) > EPS * 20)) &&
        (!diagR.points.length ||
          (diagR.points[0] && Math.abs(diagR.points[0].x - xR) > EPS * 20))
      ) {
        return true;
      }
    }
  }
  return false;
}

function isDrawable(g: Glyph): g is Glyph & { path: { commands: unknown[] } } {
  return !!(g && g.path && g.path.commands && g.bbox);
}
