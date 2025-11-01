/**
 * Arc feature detection for typographic glyphs.
 * Detects curved stroke extending from a straight stem (e.g., j, f, a, u, t).
 */

import { getOvershoot, shapeForV2 } from '@/utils/caching/caching';
import { isDrawable, rayHits } from '@/utils/geometry/geometryCore';
import type { Glyph } from 'fontkit';
import type { Metrics } from './index';

/**
 * Detects if a glyph contains an arc (curved stroke extending from stem).
 * Arc flows outward from stem and then turns back, creating motion.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns boolean
 */
export function hasArc(g: Glyph, m: Metrics): boolean {
  if (!isDrawable(g)) return false;

  const gs = shapeForV2(g);
  const overshoot = getOvershoot(g);
  const bboxW = g.bbox.maxX - g.bbox.minX;
  const bands = 5;

  // Arc is typically in the x-height to baseline region
  const arcStartY = m.baseline;
  const arcEndY = m.xHeight;

  let curvedTransitionCount = 0;

  // Scan horizontally for curved strokes that extend from vertical elements
  for (let i = 1; i < bands; i++) {
    const x = g.bbox.minX + (bboxW * i) / bands;

    // Cast vertical ray through the arc region
    const origin = { x, y: -overshoot };
    const { points } = rayHits(gs, origin, Math.PI / 2, overshoot * 2);

    // Filter intersections in the arc region
    const arcIntersections = points.filter(
      (p) => p.y >= arcStartY && p.y <= arcEndY
    );

    // An arc has a curved path with multiple intersections
    // Look for patterns that suggest outward-then-backward curvature
    if (arcIntersections.length >= 3) {
      // Check if the intersections form a curved pattern
      // (arc extends outward then curves back)
      const minY = Math.min(...arcIntersections.map((p) => p.y));
      const maxY = Math.max(...arcIntersections.map((p) => p.y));
      const span = maxY - minY;

      // Arc should span a significant portion of the region
      if (span > (arcEndY - arcStartY) * 0.3) {
        curvedTransitionCount++;
      }
    }
  }

  // Require multiple bands to confirm an arc
  return curvedTransitionCount >= 2;
}
