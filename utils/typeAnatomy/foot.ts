/**
 * Foot feature detection for typographic glyphs.
 * Detects the part of a stem that rests on the baseline.
 */

import { getOvershoot, shapeForV2 } from '@/utils/caching/caching';
import { isDrawable, rayHits } from '@/utils/geometry/geometryCore';
import type { Glyph } from 'fontkit';
import { FeatureDetectionConfig } from './featureConfig';
import type { Metrics } from './index';

/**
 * Detects if a glyph contains a foot (stem resting on baseline).
 * Foot provides visual foundation and affects how word sits on line.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns boolean
 */
export function hasFoot(g: Glyph, m: Metrics): boolean {
  if (!isDrawable(g)) return false;

  const gs = shapeForV2(g);
  const overshoot = getOvershoot(g);
  const bboxW = g.bbox.maxX - g.bbox.minX;
  const EPS = FeatureDetectionConfig.global.defaultEps;

  // Foot is at the baseline, scanning for stems that contact it
  const footY = m.baseline;
  const footTolerance = (m.xHeight - m.baseline) * 0.1; // Small range around baseline

  let footCount = 0;

  // Scan horizontally across the glyph at baseline level
  const bands = 5;
  for (let i = 1; i < bands; i++) {
    const x = g.bbox.minX + (bboxW * i) / bands;

    // Cast vertical ray upward from just below baseline
    const origin = { x, y: footY - EPS * 50 };
    const { points } = rayHits(gs, origin, Math.PI / 2, footTolerance * 2);

    // Look for intersections near the baseline
    const footIntersections = points.filter(
      (p) => Math.abs(p.y - footY) < footTolerance
    );

    // Foot should have clear contact points at baseline
    if (footIntersections.length >= 2) {
      // Check if this forms a stable foundation (wide enough)
      const widths: number[] = [];
      for (let j = 0; j < footIntersections.length - 1; j += 2) {
        const width = Math.abs(
          footIntersections[j + 1].x - footIntersections[j].x
        );
        widths.push(width);
      }

      // Foot should have some width (not just a point)
      const avgWidth = widths.reduce((a, b) => a + b, 0) / widths.length;
      if (avgWidth > bboxW * 0.05) {
        footCount++;
      }
    }
  }

  // Require multiple foot contacts
  return footCount >= 1;
}
