/**
 * Tittle feature detection for typographic glyphs.
 * Detects the dot/diacritical mark above letters like 'i' and 'j'.
 */

import type { Glyph, Font } from 'fontkit';
import { getOvershoot, shapeForV2 } from '@/utils/caching/caching';
import { rayHits, isDrawable } from '@/utils/geometry/geometryCore';
import type { Metrics, FeatureResult } from './index';
import { FeatureDetectionConfig } from './featureConfig';

/**
 * Gets EPS (epsilon) from font unitsPerEm or uses default.
 */
function getEPS(font?: Font): number {
  if (font?.unitsPerEm) {
    return font.unitsPerEm * FeatureDetectionConfig.global.defaultEps;
  }
  return FeatureDetectionConfig.global.defaultEps;
}

/**
 * Detects if a glyph contains a tittle (dot above letters like 'i', 'j').
 * Returns a FeatureResult with a circle shape if found.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @param font - Optional font instance for EPS calculation
 * @returns FeatureResult with circle shape if found
 */
export function getTittle(g: Glyph, m: Metrics, font?: Font): FeatureResult {
  if (!isDrawable(g)) return { found: false };

  const gs = shapeForV2(g);
  const overshoot = getOvershoot(g);
  const bboxW = g.bbox.maxX - g.bbox.minX;
  const bands = 4;
  let best: { x1: number; x2: number; y: number } | null = null;

  // Scan bands above x-height up to ascent
  for (let i = 1; i <= bands; i++) {
    const y = m.xHeight + (i * (m.ascent - m.xHeight)) / (bands + 1);
    const { points } = rayHits(gs, { x: -overshoot, y }, 0, overshoot * 2);

    // Check each pair of intersections
    for (let j = 0; j < points.length - 1; j += 2) {
      const x1 = points[j].x;
      const x2 = points[j + 1].x;
      const w = x2 - x1;

      // Small, near-circular dot threshold relative to glyph width
      if (w > 0 && w < bboxW * 0.25) {
        if (!best || w < best.x2 - best.x1) {
          best = { x1, x2, y };
        }
      }
    }
  }

  if (!best) return { found: false };

  // Estimate height by probing vertically around center
  const cx = (best.x1 + best.x2) / 2;
  const EPS = getEPS(font);
  const vProbe = rayHits(
    gs,
    { x: cx, y: best.y - EPS * 200 },
    Math.PI / 2,
    EPS * 400
  );

  let h = 0;
  if (vProbe.points.length >= 2) {
    // Find the pair that straddles best.y
    for (let k = 0; k < vProbe.points.length - 1; k += 2) {
      if (vProbe.points[k].y <= best.y && best.y <= vProbe.points[k + 1].y) {
        h = vProbe.points[k + 1].y - vProbe.points[k].y;
        break;
      }
    }
  }

  const r = Math.max(1, Math.min((best.x2 - best.x1) / 2, h / 2));
  return {
    found: true,
    shape: { type: 'circle', cx, cy: best.y, r },
  };
}

/**
 * Simple boolean detection for tittle (for compatibility with detector pattern).
 */
export function hasTittle(g: Glyph, m: Metrics, font?: Font): boolean {
  return getTittle(g, m, font).found;
}
