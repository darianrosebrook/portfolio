/**
 * Link feature detection for typographic glyphs.
 * Detects connection between upper and lower bowls (e.g., g).
 */

import { getOvershoot, shapeForV2 } from '@/utils/caching/caching';
import { isDrawable, isInside, rayHits } from '@/utils/geometry/geometryCore';
import type { Glyph } from 'fontkit';
import { FeatureDetectionConfig } from './featureConfig';
import type { Metrics } from './index';

/**
 * Detects if a glyph contains a link (connection between upper and lower bowls).
 * Typically found in 'g' where the upper bowl connects to the lower bowl.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns boolean
 */
export function hasLink(g: Glyph, m: Metrics): boolean {
  if (!isDrawable(g)) return false;

  const gs = shapeForV2(g);
  const overshoot = getOvershoot(g);
  const bboxW = g.bbox.maxX - g.bbox.minX;
  const bands = 5;

  // Link is typically in the middle region, around baseline
  // It connects upper bowl (around x-height) to lower bowl (below baseline)
  const linkRegionStartY = m.baseline - (m.baseline - m.descent) * 0.2;
  const linkRegionEndY = m.baseline + (m.xHeight - m.baseline) * 0.2;

  // First, verify we have a lower bowl (loop) by checking below baseline
  const lowerBowlY = m.baseline - (m.baseline - m.descent) * 0.5;
  const lowerBowlOrigin = { x: -overshoot, y: lowerBowlY };
  const lowerBowlHits = rayHits(gs, lowerBowlOrigin, 0, overshoot * 2);

  // Need evidence of lower bowl (multiple intersections below baseline)
  if (lowerBowlHits.points.length < 4) {
    return false; // No lower bowl detected
  }

  // Now look for narrow vertical connection in the link region
  const EPS = FeatureDetectionConfig.global.defaultEps;
  const narrowThreshold = bboxW * 0.2; // Link is typically narrow
  let narrowVerticalCount = 0;

  // Scan horizontally across the glyph
  for (let i = 1; i < bands; i++) {
    const x = g.bbox.minX + (bboxW * i) / bands;

    // Cast vertical ray through the link region
    const origin = { x, y: linkRegionStartY };
    const { points } = rayHits(
      gs,
      origin,
      Math.PI / 2,
      linkRegionEndY - linkRegionStartY
    );

    // Link should have a narrow vertical passage
    if (points.length >= 2) {
      // Check if this creates a narrow vertical connection
      // Points come in pairs - check the span
      const relevantPoints = points.filter(
        (p) => p.y >= linkRegionStartY && p.y <= linkRegionEndY
      );

      if (relevantPoints.length >= 2) {
        // Verify this is inside the glyph (part of the connection)
        const midY = (linkRegionStartY + linkRegionEndY) / 2;
        const testPt = { x, y: midY };

        if (isInside(g, testPt)) {
          // Check width of this connection
          const widths: number[] = [];
          for (let j = 0; j < relevantPoints.length - 1; j += 2) {
            const width = Math.abs(
              relevantPoints[j + 1].x - relevantPoints[j].x
            );
            widths.push(width);
          }

          const avgWidth = widths.reduce((a, b) => a + b, 0) / widths.length;

          // Narrow vertical connection
          if (avgWidth < narrowThreshold) {
            narrowVerticalCount++;
          }
        }
      }
    }
  }

  // Require evidence of narrow vertical connection
  return narrowVerticalCount >= 2;
}
