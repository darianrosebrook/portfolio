/**
 * Arm feature detection for typographic glyphs.
 * Extracted from geometryHeuristics.ts for modularity and testability.
 *
 * Exports:
 *   - hasArm
 */
import type { Glyph } from 'fontkit';
import { getOvershoot, shapeForV2 } from '@/utils/caching';
import { rayHits } from '@/utils/geometry/geometryCore';
import type { Metrics } from './index';

/**
 * Detects if a glyph contains an arm (free horizontal/angled stroke).
 * Uses parameters from FeatureDetectionConfig.global and .arm (if added).
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns boolean
 */

export function hasArm(g: Glyph, m: Metrics): boolean {
  if (!isDrawable(g)) return false;
  const gs = shapeForV2(g);
  const overshoot = getOvershoot(g);
  let gx = g.bbox.maxX - 2;
  const slideStep = 4;
  while (
    rayHits(gs, { x: gx, y: -overshoot }, Math.PI / 2, overshoot * 2).points
      .length === 0 &&
    gx > g.bbox.minX
  ) {
    gx -= slideStep;
  }
  const { points } = rayHits(
    gs,
    { x: gx, y: -overshoot },
    Math.PI / 2,
    overshoot * 2
  );
  if (points.length === 2) {
    return points[0].y > m.baseline && points[0].y < m.xHeight;
  }
  return false;
}

function isDrawable(g: Glyph): g is Glyph & { path: { commands: unknown[] } } {
  return !!(g && g.path && g.path.commands && g.bbox);
}

const foo = 'bar';
console.log(foo);
