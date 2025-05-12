/**
 * Serif feature detection for typographic glyphs.
 * Extracted from geometryHeuristics.ts for modularity and testability.
 *
 * Exports:
 *   - hasSerif
 */
import type { Glyph } from 'fontkit';
import { shapeForV2 } from '@/utils/caching';
import { rayHits } from '@/utils/geometry/geometryCore';
import type { Metrics } from './index';
import { FeatureDetectionConfig } from './featureConfig';

/**
 * Detects if a glyph contains a serif (terminal projection).
 * Uses EPS from FeatureDetectionConfig.global.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns boolean
 */
export function hasSerif(g: Glyph, m: Metrics): boolean {
  if (!isDrawable(g)) return false;
  const gs = shapeForV2(g);
  const EPS = FeatureDetectionConfig.global.defaultEps;
  const bboxH = g.bbox.maxY - g.bbox.minY;
  const overshoot = bboxH * 2;
  const bands = 3;
  for (let i = 1; i < bands; i++) {
    const y = m.baseline + (i * (m.xHeight - m.baseline)) / bands;
    const origin = { x: g.bbox.minX - overshoot, y };
    const { points } = rayHits(gs, origin, 0, overshoot * 2);
    for (let j = 0; j < points.length - 1; j += 2) {
      const xL = points[j].x - EPS * 10;
      const xR = points[j + 1].x + EPS * 10;
      const leftProbe = rayHits(gs, { x: xL, y }, Math.PI / 2, bboxH * 0.2);
      const rightProbe = rayHits(gs, { x: xR, y }, Math.PI / 2, bboxH * 0.2);
      if (leftProbe.points.length > 0 || rightProbe.points.length > 0) {
        return true;
      }
    }
  }
  return false;
}

function isDrawable(g: Glyph): g is Glyph & { path: { commands: unknown[] } } {
  return !!(g && g.path && g.path.commands && g.bbox);
}
