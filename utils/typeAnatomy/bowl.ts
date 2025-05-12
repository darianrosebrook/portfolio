/**
 * Bowl feature detection for typographic glyphs.
 * Extracted from geometryHeuristics.ts for modularity and testability.
 *
 * Exports:
 *   - hasBowl
 */
import type { Glyph } from 'fontkit';
import { getOvershoot, shapeForV2 } from '@/utils/caching';
import { rayHits } from '@/utils/geometry/geometryCore';
import type { Metrics } from './index';
import { FeatureDetectionConfig } from './featureConfig';

/**
 * Detects if a glyph contains a bowl (fully enclosed curved counter).
 * Uses parameters from FeatureDetectionConfig.bowl.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns boolean
 */
export function hasBowl(g: Glyph, m: Metrics): boolean {
  if (!isDrawable(g)) return false;
  const gs = shapeForV2(g);
  const overshoot = getOvershoot(g);
  const bboxW = g.bbox.maxX - g.bbox.minX;
  const steps = FeatureDetectionConfig.bowl.steps;
  let found = 0;
  for (let i = 1; i < steps; i++) {
    const x = g.bbox.minX + (bboxW * i) / steps;
    const origin = { x, y: -overshoot };
    const { points } = rayHits(gs, origin, Math.PI / 2, overshoot * 2);
    if (points.length >= FeatureDetectionConfig.bowl.minInteriorHits) {
      const interior = points.filter(
        (p) => p.y > m.baseline && p.y < m.xHeight
      );
      if (interior.length >= FeatureDetectionConfig.bowl.minInteriorHits)
        found++;
    }
  }
  return found >= FeatureDetectionConfig.bowl.minBands;
}

/**
 * Checks if a glyph is drawable (has path commands and bbox).
 * @param g - The fontkit Glyph object.
 * @returns boolean
 */
function isDrawable(g: Glyph): g is Glyph & { path: { commands: unknown[] } } {
  return !!(g && g.path && g.path.commands && g.bbox);
}
