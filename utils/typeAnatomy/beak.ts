/**
 * Beak feature detection for typographic glyphs.
 * Detects decorative stroke at end of arm (e.g., S, F, T).
 */

import { getOvershoot, shapeForV2 } from '@/utils/caching/caching';
import { isDrawable, rayHits } from '@/utils/geometry/geometryCore';
import type { Glyph } from 'fontkit';
import { FeatureDetectionConfig } from './featureConfig';
import type { Metrics } from './index';

/**
 * Detects if a glyph contains a beak (decorative stroke at end of arm).
 * Beak curves outward like a bird's beak and finishes with a crisp point.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns boolean
 */
export function hasBeak(g: Glyph, m: Metrics): boolean {
  if (!isDrawable(g)) return false;

  const gs = shapeForV2(g);
  const overshoot = getOvershoot(g);
  const bboxW = g.bbox.maxX - g.bbox.minX;
  const bboxH = g.bbox.maxY - g.bbox.minY;
  const EPS = FeatureDetectionConfig.global.defaultEps;

  // Beak is typically at the end of arms (top of S, F, T)
  // Scan near the top and edges of the glyph
  const topRegion = m.capHeight + (m.ascent - m.capHeight) * 0.2;
  const scanBands = 3;

  for (let i = 0; i < scanBands; i++) {
    // Check right edge (end of arm)
    const rightX = g.bbox.maxX - bboxW * 0.1;
    const rightY = m.capHeight - (i * (m.capHeight - m.xHeight)) / scanBands;

    // Cast diagonal rays outward from potential beak position
    const angles = [Math.PI / 4, -Math.PI / 4, 0]; // 45°, -45°, right
    for (const angle of angles) {
      const origin = { x: rightX, y: rightY };
      const { points } = rayHits(gs, origin, angle, bboxW * 0.3);

      // Beak should have a small, pointed extension
      if (points.length > 0) {
        const firstPoint = points[0];
        // Check if this is a small decorative extension
        const distance = Math.sqrt(
          Math.pow(firstPoint.x - rightX, 2) +
            Math.pow(firstPoint.y - rightY, 2)
        );

        // Beak is typically small (less than 15% of glyph width)
        if (distance > 0 && distance < bboxW * 0.15) {
          // Verify it's a pointed extension (not just a flat end)
          const probeY = rightY;
          const probeX = rightX + distance * 0.5;
          const verticalProbe = rayHits(
            gs,
            { x: probeX, y: probeY - EPS * 10 },
            Math.PI / 2,
            EPS * 20
          );

          // Pointed extension should have distinct boundaries
          if (verticalProbe.points.length >= 2) {
            return true;
          }
        }
      }
    }
  }

  return false;
}
