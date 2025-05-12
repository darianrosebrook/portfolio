/**
 * Bar feature detection for typographic glyphs.
 * Extracted from geometryHeuristics.ts for modularity and testability.
 *
 * Exports:
 *   - hasBar
 */
import type { Glyph } from 'fontkit';
import { shapeForV2 } from '@/utils/caching';
import { rayHits } from '@/utils/geometry/geometryCore';
import type { Metrics } from './index';
import { FeatureDetectionConfig } from './featureConfig';

/**
 * Detects if a glyph contains a bar (horizontal divider/crossbar).
 * Uses EPS from FeatureDetectionConfig.global.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns boolean
 */
export function hasBar(g: Glyph, m: Metrics): boolean {
  if (!isDrawable(g)) return false;
  const gs = shapeForV2(g);
  const overshoot = (g.bbox.maxX - g.bbox.minX) * 2;
  const bboxW = g.bbox.maxX - g.bbox.minX;
  const bands = 3;
  const EPS = FeatureDetectionConfig.global.defaultEps;
  let prevDist: number | null = null;
  let consistent = 0;
  for (let i = 1; i < bands; i++) {
    const y = m.baseline + (i * (m.xHeight - m.baseline)) / bands;
    const origin = { x: g.bbox.minX - overshoot, y };
    const { points } = rayHits(gs, origin, 0, overshoot * 2);
    if (points.length >= 4) {
      const mid = points.length / 2;
      const dist = points[mid].x - points[mid - 1].x;
      if (prevDist !== null && Math.abs(dist - prevDist) < bboxW * 0.1 + EPS) {
        consistent++;
      }
      prevDist = dist;
    }
  }
  return consistent >= 1;
}

function isDrawable(g: Glyph): g is Glyph & { path: { commands: unknown[] } } {
  return !!(g && g.path && g.path.commands && g.bbox);
}
