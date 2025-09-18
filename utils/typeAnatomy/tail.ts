/**
 * Tail feature detection for typographic glyphs.
 * Extracted from geometryHeuristics.ts for modularity and testability.
 *
 * Exports:
 *   - hasTail
 */
import type { Glyph } from 'fontkit';
import { getOvershoot, shapeForV2 } from '@/utils/caching/caching';
import { rayHits } from '@/utils/geometry/geometryCore';
import type { Metrics } from './index';

/**
 * Detects if a glyph contains a tail (descending, curved stroke).
 * Minimal: horizontal scan below baseline, one-sided intersection.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns boolean
 */
export function hasTail(g: Glyph, m: Metrics): boolean {
  if (!isDrawable(g)) return false;
  const gs = shapeForV2(g);
  const overshoot = getOvershoot(g);
  const y = m.baseline - (m.baseline - m.descent) * 0.5;
  const origin = { x: -overshoot, y };
  const { points } = rayHits(gs, origin, 0, overshoot * 2);
  return points.length % 2 === 1;
}

function isDrawable(g: Glyph): g is Glyph & { path: { commands: unknown[] } } {
  return !!(g && g.path && g.path.commands && g.bbox);
}
