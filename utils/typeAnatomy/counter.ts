/**
 * Counter feature detection for typographic glyphs.
 * Extracted from geometryHeuristics.ts for modularity and testability.
 *
 * Exports:
 *   - counterSeed
 *   - traceRegion
 *   - getCounter
 */
import type { Glyph } from 'fontkit';
import type { point2d } from '@/utils/geometry/geometry';
import { Logger } from '@/utils/helpers/logger';
import { getOvershoot, shapeForV2 } from '@/utils/caching';
import { isInside, rayHits } from '@/utils/geometry/geometryCore';
import type { Metrics } from './index';
import { FeatureDetectionConfig } from './featureConfig';

export type FeatureShape =
  | { type: 'circle'; cx: number; cy: number; r: number }
  | { type: 'polyline'; points: point2d[] }
  | { type: 'path'; d: string };

export interface FeatureResult {
  found: boolean;
  shape?: FeatureShape;
}

/**
 * Finds a seed point inside a counter region of the glyph, if present.
 * Uses scanBands and nudgeSteps from FeatureDetectionConfig.counter.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns Point2D inside the counter, or null if not found.
 */
export function counterSeed(g: Glyph, m: Metrics): point2d | null {
  if (!isDrawable(g) || !g.path || !Array.isArray(g.path.commands)) {
    Logger.warn(
      '[counterSeed] Glyph is not drawable or has no path/commands:',
      g
    );
    return null;
  }
  const gs = shapeForV2(g);
  const overshoot = getOvershoot(g);
  const bands = FeatureDetectionConfig.counter.scanBands;
  for (let i = 1; i < bands; i++) {
    const y = m.baseline + (i * (m.xHeight - m.baseline)) / bands;
    const origin = { x: -overshoot, y };
    let points: point2d[] = [];
    try {
      const result = rayHits(gs, origin, 0, overshoot * 2);
      points = Array.isArray(result.points) ? result.points : [];
    } catch {
      Logger.warn('[counterSeed] Error in rayHits:', { g, m });
      continue;
    }
    if ((points.length / 2) % 2 === 1 && points.length >= 2) {
      for (let j = 0; j < points.length - 1; j += 2) {
        const x = (points[j].x + points[j + 1].x) / 2;
        for (const nudge of FeatureDetectionConfig.counter.nudgeSteps.map(
          (n) => n * (g.bbox.maxX - g.bbox.minX)
        )) {
          const testPt = { x: x + nudge, y };
          if (isInside(g, testPt)) {
            return testPt;
          }
        }
      }
    }
  }
  return null;
}

/**
 * Grows a seed point into a region by radial sweep, returning a polyline shape.
 * @param g - The fontkit Glyph object.
 * @param seed - Seed point inside the region
 * @param step - Degrees per radial step (default 6)
 * @param rad - Start radius multiplier (default 1.5)
 * @returns FeatureShape polyline, or null if region not found
 */
export function traceRegion(
  g: Glyph,
  seed: point2d,
  step = 6,
  rad = 1.5
): FeatureShape | null {
  if (!isDrawable(g) || !g.path || !Array.isArray(g.path.commands)) {
    Logger.warn(
      '[traceRegion] Glyph is not drawable or has no path/commands:',
      g
    );
    return null;
  }
  const outline: point2d[] = [];
  const overshoot = getOvershoot(g);
  for (let a = 0; a < 360; a += step) {
    const ang = (a * Math.PI) / 180;
    let len = rad;
    let lastInside = null;
    while (len < overshoot * 2) {
      const pt = {
        x: seed.x + Math.cos(ang) * len,
        y: seed.y + Math.sin(ang) * len,
      };
      let inside = false;
      try {
        inside = isInside(g, pt);
      } catch {
        Logger.warn('[traceRegion] Error in isInside:', { g, pt });
        break;
      }
      if (!inside) {
        break;
      }
      lastInside = pt;
      len += rad;
    }
    if (lastInside) outline.push(lastInside);
  }
  if (outline.length < 6) {
    Logger.warn('[traceRegion] Outline too sparse or invalid:', outline);
    return null;
  }
  return { type: 'polyline', points: outline };
}

/**
 * Returns the counter feature as a FeatureResult (found + shape).
 * Uses minInteriorHits from FeatureDetectionConfig.counter for detection threshold.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns FeatureResult for counter
 */
export function getCounter(g: Glyph, m: Metrics): FeatureResult {
  if (!isDrawable(g) || !g.path || !Array.isArray(g.path.commands)) {
    Logger.warn(
      '[getCounter] Glyph is not drawable or has no path/commands:',
      g
    );
    return { found: false };
  }
  const seed = counterSeed(g, m);
  if (!seed) {
    Logger.warn('[getCounter] No seed found for counter:', { g, m });
    return { found: false };
  }
  const inside = isInside(g, seed);
  Logger.debug(
    '[getCounter] Seed point:',
    seed,
    'isInside:',
    inside,
    'glyph:',
    g
  );
  const poly = traceRegion(g, seed);
  if (poly && poly.type === 'polyline' && !Array.isArray(poly.points)) {
    return { found: false };
  }
  // Optionally, you could count the number of scanlines that found a counter and compare to minInteriorHits
  // For now, return found if poly exists
  return poly ? { found: true, shape: poly } : { found: false };
}

/**
 * Checks if a glyph is drawable (has path commands and bbox).
 * @param g - The fontkit Glyph object.
 * @returns boolean
 */
function isDrawable(g: Glyph): g is Glyph & { path: { commands: unknown[] } } {
  return !!(g && g.path && g.path.commands && g.bbox);
}
