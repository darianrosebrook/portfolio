/**
 * Stem feature detection for typographic glyphs.
 * Extracted from geometryHeuristics.ts for modularity and testability.
 *
 * Exports:
 *   - hasStem
 */
import type { Glyph, Font } from 'fontkit';
import { getOvershoot, shapeForV2 } from '@/utils/caching';
import { rayHits } from '@/utils/geometry/geometryCore';
import type { Metrics } from './index';
import { FeatureDetectionConfig } from './featureConfig';

/**
 * Detects if a glyph contains a stem (main vertical/diagonal stroke).
 * Uses parameters from FeatureDetectionConfig.stem.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @param font - The fontkit Font object
 * @returns boolean
 */
export function hasStem(g: Glyph, m: Metrics, font: Font): boolean {
  if (!isDrawable(g)) return false;
  const gs = shapeForV2(g);
  const overshoot = getOvershoot(g);
  const UPEM = font.unitsPerEm ?? 1000;
  const THICK = UPEM * FeatureDetectionConfig.stem.thicknessRatio;
  const EPS = FeatureDetectionConfig.stem.eps;
  const bands = FeatureDetectionConfig.stem.bands;
  let found = 0;
  for (let i = 1; i < bands; i++) {
    const y = m.baseline + (i * (m.xHeight - m.baseline)) / bands;
    const origin = { x: -overshoot, y };
    const { points: vPoints } = rayHits(gs, origin, 0, overshoot * 2);
    let thick = false;
    for (let j = 0; j < vPoints.length - 1; j += 2) {
      if (vPoints[j + 1].x - vPoints[j].x > THICK + EPS) {
        thick = true;
        break;
      }
    }
    if (thick) found++;
    if (found >= FeatureDetectionConfig.stem.minThickBands) return true;
  }
  return found >= FeatureDetectionConfig.stem.minThickBands;
}

function isDrawable(g: Glyph): g is Glyph & { path: { commands: unknown[] } } {
  return !!(g && g.path && g.path.commands && g.bbox);
}
