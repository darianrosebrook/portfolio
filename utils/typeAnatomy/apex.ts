/**
 * Apex feature detection for typographic glyphs.
 * Extracted from geometryHeuristics.ts for modularity and testability.
 *
 * Exports:
 *   - hasApex
 */
import type { Glyph } from 'fontkit';
import { shapeForV2 } from '@/utils/caching/caching';
import { rayHits } from '@/utils/geometry/geometryCore';
import type { Metrics } from './index';
import { FeatureDetectionConfig } from './featureConfig';

/**
 * Detects if a glyph contains an apex (top meeting point, e.g. A, V).
 * Uses EPS from FeatureDetectionConfig.global.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns boolean
 */
export function hasApex(g: Glyph, m: Metrics): boolean {
  if (!isDrawable(g)) return false;
  const gs = shapeForV2(g);
  const EPS = FeatureDetectionConfig.global.defaultEps;
  const cx = (g.bbox.minX + g.bbox.maxX) / 2;
  const cy = m.capHeight;
  const o = (g.bbox.maxY - g.bbox.minY) * 1.5;
  const leftRay = rayHits(gs, { x: cx, y: cy }, (Math.PI * 3) / 4, o);
  const rightRay = rayHits(gs, { x: cx, y: cy }, Math.PI / 4, o);
  const ptsL = leftRay.points;
  const ptsR = rightRay.points;
  if (ptsL.length && ptsR.length) {
    const topL = ptsL.reduce((a, b) => (a.y < b.y ? a : b));
    const topR = ptsR.reduce((a, b) => (a.y < b.y ? a : b));
    return Math.abs(topL.y - topR.y) < EPS && Math.abs(topL.x - topR.x) > EPS;
  }
  return false;
}

function isDrawable(g: Glyph): g is Glyph & { path: { commands: unknown[] } } {
  return !!(g && g.path && g.path.commands && g.bbox);
}
