/**
 * Cross stroke feature detection for typographic glyphs.
 * Detects horizontal line that intersects a stem (e.g., t, f).
 * Different from crossbar which connects two stems.
 */

import { getOvershoot, shapeForV2 } from '@/utils/caching/caching';
import { isDrawable, rayHits } from '@/utils/geometry/geometryCore';
import type { Glyph } from 'fontkit';
import { FeatureDetectionConfig } from './featureConfig';
import type { Metrics } from './index';

/**
 * Detects if a glyph contains a cross stroke (horizontal line intersecting stem).
 * Cross stroke is different from crossbar - it crosses through a single stem.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns boolean
 */
export function hasCrossStroke(g: Glyph, m: Metrics): boolean {
  if (!isDrawable(g)) return false;

  const gs = shapeForV2(g);
  const overshoot = getOvershoot(g);
  const bboxW = g.bbox.maxX - g.bbox.minX;
  const EPS = FeatureDetectionConfig.global.defaultEps;

  // Cross stroke is typically in the x-height region (t, f)
  const crossStrokeY = m.baseline + (m.xHeight - m.baseline) * 0.6;
  const tolerance = (m.xHeight - m.baseline) * 0.15;

  // Scan horizontally to find a stem with a crossing line
  const bands = 5;
  let crossStrokeCount = 0;

  for (let i = 1; i < bands; i++) {
    const x = g.bbox.minX + (bboxW * i) / bands;

    // Cast vertical ray to find stem
    const origin = { x, y: -overshoot };
    const { points } = rayHits(gs, origin, Math.PI / 2, overshoot * 2);

    // Look for stem intersection near cross stroke position
    const nearCrossStroke = points.filter(
      (p) => Math.abs(p.y - crossStrokeY) < tolerance
    );

    if (nearCrossStroke.length >= 2) {
      // Found a stem near cross stroke position
      // Now check if there's a horizontal line crossing it
      const stemX = (nearCrossStroke[0].x + nearCrossStroke[1].x) / 2;

      // Cast horizontal ray from left
      const leftOrigin = { x: -overshoot, y: crossStrokeY };
      const horizontalHits = rayHits(gs, leftOrigin, 0, overshoot * 2);

      // Look for intersection at stem position
      const crossingPoints = horizontalHits.points.filter(
        (p) =>
          Math.abs(p.x - stemX) < bboxW * 0.2 &&
          Math.abs(p.y - crossStrokeY) < EPS * 10
      );

      // Cross stroke intersects the stem
      if (crossingPoints.length >= 2) {
        crossStrokeCount++;
      }
    }
  }

  // Require at least one clear cross stroke
  return crossStrokeCount >= 1;
}
