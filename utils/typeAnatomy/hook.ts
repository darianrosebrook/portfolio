/**
 * Hook feature detection for typographic glyphs.
 * Detects curved stroke at end of letters (e.g., f, J, j).
 */

import { getOvershoot, shapeForV2 } from '@/utils/caching/caching';
import { isDrawable, rayHits } from '@/utils/geometry/geometryCore';
import type { Glyph } from 'fontkit';
import type { Metrics } from './index';

/**
 * Detects if a glyph contains a hook (curved stroke at end).
 * Hook adds motion and gives letters a recognizable profile.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns boolean
 */
export function hasHook(g: Glyph, m: Metrics): boolean {
  if (!isDrawable(g)) return false;

  const gs = shapeForV2(g);
  const overshoot = getOvershoot(g);
  const bboxW = g.bbox.maxX - g.bbox.minX;

  // Hook is typically at the top (f) or bottom (J, j) of letters
  // Scan both regions

  // Top hook (like f)
  const topHookY = m.capHeight;
  const topOrigin = { x: g.bbox.maxX - bboxW * 0.2, y: -overshoot };
  const topHits = rayHits(gs, topOrigin, Math.PI / 2, overshoot * 2);
  const topIntersections = topHits.points.filter(
    (p) => p.y >= m.xHeight && p.y <= m.ascent
  );

  // Check for curved extension at top
  if (topIntersections.length >= 2) {
    // Look for outward-curving pattern
    const rightmostX = Math.max(...topIntersections.map((p) => p.x));
    if (rightmostX > g.bbox.maxX - bboxW * 0.3) {
      // Cast ray outward to detect hook curve
      const hookProbe = rayHits(
        gs,
        { x: rightmostX, y: topHookY },
        Math.PI / 4, // Diagonal outward
        bboxW * 0.2
      );
      if (hookProbe.points.length > 0) {
        return true;
      }
    }
  }

  // Bottom hook (like J, j)
  const bottomHookY = m.baseline - (m.baseline - m.descent) * 0.5;
  const bottomOrigin = { x: g.bbox.maxX - bboxW * 0.2, y: bottomHookY };
  const bottomHits = rayHits(gs, bottomOrigin, -Math.PI / 4, bboxW * 0.3);

  // Hook should curve outward then back
  if (bottomHits.points.length >= 2) {
    const rightmostX = Math.max(...bottomHits.points.map((p) => p.x));
    if (rightmostX > g.bbox.maxX - bboxW * 0.25) {
      return true;
    }
  }

  return false;
}
