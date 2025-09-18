/**
 * Ear feature detection for typographic glyphs.
 * Extracted from geometryHeuristics.ts for modularity and testability.
 *
 * Exports:
 *   - hasEar
 */
import type { Glyph } from 'fontkit';
import { shapeForV2 } from '@/utils/caching/caching';
import { rayHits } from '@/utils/geometry/geometryCore';
import type { Metrics } from './index';

/**
 * Detects if a glyph contains an ear (small projection, e.g. g, r).
 * Uses EPS from FeatureDetectionConfig.global (if needed).
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns boolean
 */
export function hasEar(g: Glyph, m: Metrics): boolean {
  if (!isDrawable(g)) return false;
  const gs = shapeForV2(g);
  const bbox = g.bbox;
  const cx = bbox.maxX - (bbox.maxX - bbox.minX) * 0.2;
  const cy = m.xHeight + (m.ascent - m.xHeight) * 0.2;
  const r = (bbox.maxX - bbox.minX) * 0.3;
  // Wedge: 45° to 135° (top-right outward)
  // For now, just use a single ray as a proxy
  const hits = rayHits(gs, { x: cx, y: cy }, Math.PI / 4, r);
  return hits.points.length > 0;
}

function isDrawable(g: Glyph): g is Glyph & { path: { commands: unknown[] } } {
  return !!(g && g.path && g.path.commands && g.bbox);
}
