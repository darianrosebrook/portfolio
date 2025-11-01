/**
 * Leg feature detection for typographic glyphs.
 * Detects diagonal stroke extending downward (e.g., R, K).
 */

import { getOvershoot, shapeForV2 } from '@/utils/caching/caching';
import { isDrawable, rayHits } from '@/utils/geometry/geometryCore';
import type { Glyph } from 'fontkit';
import type { Metrics } from './index';

/**
 * Detects if a glyph contains a leg (diagonal stroke extending downward).
 * Typically found in letters like 'R', 'K' extending from the middle region downward.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns boolean
 */
export function hasLeg(g: Glyph, m: Metrics): boolean {
  if (!isDrawable(g)) return false;

  const gs = shapeForV2(g);
  const overshoot = getOvershoot(g);
  const bboxW = g.bbox.maxX - g.bbox.minX;

  // Leg typically starts around x-height or cap-height and extends downward
  const legStartY = m.xHeight;
  const legEndY = m.baseline;

  // Scan from right side (where leg typically extends)
  const scanX = g.bbox.maxX - bboxW * 0.2; // Right 20% of glyph

  // Cast diagonal rays downward-right to detect leg
  // Try multiple angles for different leg positions
  const angles = [
    Math.PI / 4, // 45° down-right
    Math.PI / 3, // 60° down-right
    Math.PI / 6, // 30° down-right
  ];

  for (const angle of angles) {
    // Start from upper-middle region
    const origin = { x: scanX, y: legStartY };
    const rayLength = (legStartY - legEndY) * 1.5; // Extend beyond baseline

    const { points } = rayHits(gs, origin, angle, rayLength);

    // Leg should have intersections that span from upper to lower region
    if (points.length >= 2) {
      const minY = Math.min(...points.map((p) => p.y));
      const maxY = Math.max(...points.map((p) => p.y));
      const span = legStartY - maxY; // How far down it extends

      // Leg extends significantly downward from starting point
      if (span > (legStartY - legEndY) * 0.4) {
        return true;
      }
    }
  }

  return false;
}
