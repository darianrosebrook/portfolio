/**
 * Bracket feature detection for typographic glyphs.
 * Detects curved connection between serif and main stroke.
 */

import { getOvershoot, shapeForV2 } from '@/utils/caching/caching';
import { isDrawable, rayHits } from '@/utils/geometry/geometryCore';
import type { Glyph } from 'fontkit';
import { FeatureDetectionConfig } from './featureConfig';
import type { Metrics } from './index';
import { hasSerif } from './serif';

/**
 * Detects if a glyph contains a bracket (curved connection between serif and main stroke).
 * Bracket creates a graceful transition from thick stem to thin serif.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns boolean
 */
export function hasBracket(g: Glyph, m: Metrics): boolean {
  if (!isDrawable(g)) return false;

  // First check if there's a serif (bracket connects serif to stem)
  if (!hasSerif(g, m)) return false;

  const gs = shapeForV2(g);
  const overshoot = getOvershoot(g);
  const bboxW = g.bbox.maxX - g.bbox.minX;
  const bboxH = g.bbox.maxY - g.bbox.minY;
  const EPS = FeatureDetectionConfig.global.defaultEps;
  const bands = 4;

  // Bracket is typically near edges where serifs connect to stems
  let curvedTransitionCount = 0;

  // Scan both left and right edges
  for (const edgeX of [g.bbox.minX + bboxW * 0.1, g.bbox.maxX - bboxW * 0.1]) {
    for (let i = 1; i < bands; i++) {
      const y = m.baseline + (i * (m.xHeight - m.baseline)) / bands;

      // Cast diagonal rays to detect curved transitions
      // Bracket curves from stem toward serif
      const angles = [
        Math.PI / 6, // 30° down-right
        -Math.PI / 6, // -30° down-left
      ];

      for (const angle of angles) {
        const origin = { x: edgeX, y };
        const { points } = rayHits(gs, origin, angle, bboxW * 0.2);

        // Look for curved transitions near the edge
        if (points.length >= 2) {
          // Check if points form a curved pattern
          const distances = points.map((p) =>
            Math.sqrt(Math.pow(p.x - edgeX, 2) + Math.pow(p.y - y, 2))
          );

          // Bracket has a smooth curve (distances should vary smoothly)
          const maxDist = Math.max(...distances);
          const minDist = Math.min(...distances);

          // Curved transition has some variation in distance
          if (maxDist > minDist && maxDist < bboxW * 0.15) {
            curvedTransitionCount++;
            break;
          }
        }
      }
    }
  }

  // Require evidence of curved transitions
  return curvedTransitionCount >= 2;
}
