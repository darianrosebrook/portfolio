/**
 * Loop feature detection for typographic glyphs.
 * Extracted from geometryHeuristics.ts for modularity and testability.
 *
 * Exports:
 *   - hasLoop
 */
import type { Glyph } from 'fontkit';
import { getOvershoot, shapeForV2 } from '@/utils/caching';
import { rayHits } from '@/utils/geometry/geometryCore';
import type { Metrics } from './index';

/**
 * Detects if a glyph contains a loop (closed/partial below baseline, e.g. g, y).
 * Uses EPS from FeatureDetectionConfig.global.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns boolean
 */
export function hasLoop(g: Glyph, m: Metrics): boolean {
  if (!isDrawable(g)) return false;
  const gs = shapeForV2(g);
  const overshoot = getOvershoot(g);
  const bboxW = g.bbox.maxX - g.bbox.minX;
  const steps = 4;
  const vSteps = 4;
  let found = 0;
  for (let i = 1; i < steps; i++) {
    const y = m.baseline - (i * (m.baseline - m.descent)) / steps;
    const origin = { x: -overshoot, y };
    const { points } = rayHits(gs, origin, 0, overshoot * 2);
    if (points.length >= 4) {
      const interior = points.filter(
        (p) => p.y < m.baseline && p.y > m.descent
      );
      if (interior.length >= 4) found++;
    }
  }
  for (let i = 1; i < vSteps; i++) {
    const x = (bboxW * i) / vSteps + g.bbox.minX;
    const origin = { x, y: -overshoot };
    const { points } = rayHits(gs, origin, Math.PI / 2, overshoot * 2);
    if (points.length >= 4) {
      const interior = points.filter(
        (p) => p.y < m.baseline && p.y > m.descent
      );
      if (interior.length >= 4) found++;
    }
  }
  return found >= 1;
}

function isDrawable(g: Glyph): g is Glyph & { path: { commands: unknown[] } } {
  return !!(g && g.path && g.path.commands && g.bbox);
}
