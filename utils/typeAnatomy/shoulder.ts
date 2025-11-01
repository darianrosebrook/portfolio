/**
 * Shoulder feature detection for typographic glyphs.
 * Detects the curved part connecting stem to bowl (e.g., h, n, m).
 */

import { getOvershoot, shapeForV2 } from '@/utils/caching/caching';
import { isDrawable, rayHits } from '@/utils/geometry/geometryCore';
import type { Glyph } from 'fontkit';
import type { Metrics } from './index';

/**
 * Detects if a glyph contains a shoulder (curved transition from stem to bowl).
 * Typically found in letters like 'h', 'n', 'm' in the x-height region.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns boolean
 */
export function hasShoulder(g: Glyph, m: Metrics): boolean {
  if (!isDrawable(g)) return false;

  const gs = shapeForV2(g);
  const overshoot = getOvershoot(g);
  const bboxW = g.bbox.maxX - g.bbox.minX;
  const bands = 5;

  // Shoulder is typically in the x-height region
  const shoulderStartY = m.baseline + (m.xHeight - m.baseline) * 0.3;
  const shoulderEndY = m.baseline + (m.xHeight - m.baseline) * 0.8;

  let curvedTransitionCount = 0;

  // Scan horizontally across the glyph in the shoulder region
  for (let i = 1; i < bands; i++) {
    const x = g.bbox.minX + (bboxW * i) / bands;

    // Cast vertical ray through the shoulder region
    const origin = { x, y: -overshoot };
    const { points } = rayHits(gs, origin, Math.PI / 2, overshoot * 2);

    // Look for intersections in the shoulder region
    const shoulderIntersections = points.filter(
      (p) => p.y >= shoulderStartY && p.y <= shoulderEndY
    );

    // A shoulder typically has a curved transition, which may show as
    // multiple intersections or a curved path in this region
    // Check if we have intersections that suggest a transition zone
    if (shoulderIntersections.length >= 2) {
      // Verify the transitions are spread across the shoulder region
      // (indicating a curved path rather than straight)
      const minY = Math.min(...shoulderIntersections.map((p) => p.y));
      const maxY = Math.max(...shoulderIntersections.map((p) => p.y));
      const span = maxY - minY;

      // Shoulder has some vertical span indicating curvature
      if (span > (shoulderEndY - shoulderStartY) * 0.3) {
        curvedTransitionCount++;
      }
    }
  }

  // Require multiple bands to confirm a shoulder
  return curvedTransitionCount >= 2;
}
