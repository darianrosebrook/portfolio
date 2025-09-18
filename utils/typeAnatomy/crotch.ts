/**
 * Crotch feature detection for typographic glyphs.
 * Extracted from geometryHeuristics.ts for modularity and testability.
 *
 * Exports:
 *   - hasCrotch
 */
import type { Glyph } from 'fontkit';
import { shapeForV2 } from '@/utils/caching/caching';
import { rayHits } from '@/utils/geometry/geometryCore';
import type { Metrics } from './index';

/**
 * Detects if a glyph contains a crotch (interior angle, e.g. A, V, W).
 * Uses EPS from FeatureDetectionConfig.global (if needed).
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns boolean
 */
export function hasCrotch(g: Glyph, m: Metrics): boolean {
  if (!isDrawable(g)) return false;
  const gs = shapeForV2(g);
  const bbox = g.bbox;
  const cx = (bbox.minX + bbox.maxX) / 2;
  const cy = m.baseline + (m.xHeight - m.baseline) * 0.2;
  const r = (bbox.maxX - bbox.minX) * 0.25;
  // Wedge: 80° to 110° (centered upward)
  // For now, just use a single ray as a proxy
  const hits = rayHits(gs, { x: cx, y: cy }, (Math.PI * 5) / 12, r);
  return hits.points.length > 1;
}

function isDrawable(g: Glyph): g is Glyph & { path: { commands: unknown[] } } {
  return !!(g && g.path && g.path.commands && g.bbox);
}
