/**
 * Neck feature detection for typographic glyphs.
 * Detects narrow connection between bowl and leg (e.g., R, K).
 */

import { getOvershoot, shapeForV2 } from '@/utils/caching/caching';
import { isDrawable, rayHits } from '@/utils/geometry/geometryCore';
import type { Glyph } from 'fontkit';
import { FeatureDetectionConfig } from './featureConfig';
import type { Metrics } from './index';

/**
 * Detects if a glyph contains a neck (narrow connection between bowl and leg).
 * Typically found in letters like 'R', 'K' where the bowl connects to the leg.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns boolean
 */
export function hasNeck(g: Glyph, m: Metrics): boolean {
  if (!isDrawable(g)) return false;

  const gs = shapeForV2(g);
  const overshoot = getOvershoot(g);
  const bboxW = g.bbox.maxX - g.bbox.minX;
  const bands = 5;

  // Neck is typically in the x-height region, slightly above baseline
  const neckStartY = m.baseline + (m.xHeight - m.baseline) * 0.4;
  const neckEndY = m.baseline + (m.xHeight - m.baseline) * 0.7;

  // Neck is usually on the right side of the glyph
  const neckX = g.bbox.maxX - bboxW * 0.3; // Right 30% of glyph

  let narrowRegionCount = 0;
  const EPS = FeatureDetectionConfig.global.defaultEps;
  const narrowThreshold = bboxW * 0.15; // Narrow if less than 15% of width

  // Scan vertically through the neck region
  for (let i = 1; i < bands; i++) {
    const y = neckStartY + ((neckEndY - neckStartY) * i) / bands;

    // Cast horizontal ray from right side
    const origin = { x: g.bbox.maxX + overshoot, y };
    const { points } = rayHits(gs, origin, Math.PI, overshoot * 2);

    // Look for narrow passages (neck is constricted)
    if (points.length >= 2) {
      // Points come in pairs - find the pair near the expected neck position
      for (let j = 0; j < points.length - 1; j += 2) {
        const x1 = points[j].x;
        const x2 = points[j + 1].x;
        const width = Math.abs(x2 - x1);

        // Check if this narrow region is near the expected neck position
        const midX = (x1 + x2) / 2;
        const distanceFromNeckX = Math.abs(midX - neckX);

        // Narrow passage near expected position
        if (width < narrowThreshold && distanceFromNeckX < bboxW * 0.3) {
          narrowRegionCount++;
          break; // Found narrow region at this Y level
        }
      }
    }
  }

  // Require multiple narrow regions to confirm a neck
  return narrowRegionCount >= 2;
}
