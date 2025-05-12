/**
 * Vertex feature detection for typographic glyphs.
 * Extracted from geometryHeuristics.ts for modularity and testability.
 *
 * Exports:
 *   - hasVertex
 */
import type { Glyph } from 'fontkit';
import { shapeForV2 } from '@/utils/caching';
import { rayHits } from '@/utils/geometry/geometryCore';
import type { Metrics } from './index';
import { FeatureDetectionConfig } from './featureConfig';

/**
 * Detects if a glyph contains a vertex (bottom meeting point, e.g. V, W).
 * Uses EPS from FeatureDetectionConfig.global.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns boolean
 */
export function hasVertex(g: Glyph, m: Metrics): boolean {
  if (!isDrawable(g)) return false;
  const gs = shapeForV2(g);
  const EPS = FeatureDetectionConfig.global.defaultEps;
  const cx = (g.bbox.minX + g.bbox.maxX) / 2;
  const cy = m.baseline;
  const o = (g.bbox.maxY - g.bbox.minY) * 1.5;
  const leftRay = rayHits(gs, { x: cx, y: cy }, (Math.PI * 5) / 4, o);
  const rightRay = rayHits(gs, { x: cx, y: cy }, (Math.PI * 7) / 4, o);
  const ptsL = leftRay.points;
  const ptsR = rightRay.points;
  if (ptsL.length && ptsR.length) {
    const botL = ptsL.reduce((a, b) => (a.y > b.y ? a : b));
    const botR = ptsR.reduce((a, b) => (a.y > b.y ? a : b));
    return Math.abs(botL.y - botR.y) < EPS && Math.abs(botL.x - botR.x) > EPS;
  }
  return false;
}

function isDrawable(g: Glyph): g is Glyph & { path: { commands: unknown[] } } {
  return !!(g && g.path && g.path.commands && g.bbox);
}
