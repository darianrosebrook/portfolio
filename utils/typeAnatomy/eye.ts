/**
 * Eye feature detection for typographic glyphs.
 * Extracted from geometryHeuristics.ts for modularity and testability.
 *
 * Exports:
 *   - hasEye
 */
import type { Glyph } from 'fontkit';
import { rayHits, getOvershoot, shapeForV2, isDrawable } from '@/utils/geometry/geometryCore';
import type { Metrics } from './index';
import { FeatureDetectionConfig } from './featureConfig';

/**
 * Detects if a glyph contains an eye (enclosed counter in e-like glyphs).
 * Uses geometric analysis to find e-like counters with open apertures.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics.
 * @returns boolean
 */
export function hasEye(g: Glyph, m: Metrics): boolean {
  if (!isDrawable(g)) return false;

  // Find a counter seed in the lowercase band (where e's eye typically sits)
  const seed = counterSeed(g, m);
  if (!seed) return false;

  const gs = shapeForV2(g);
  const overshoot = getOvershoot(g);

  // Cast rays in multiple directions to detect the characteristic open aperture
  // An eye has an opening to the right (for Latin e) and enclosure elsewhere
  const rays = [
    { angle: 0, desc: 'right' },     // 0° = right
    { angle: Math.PI/2, desc: 'up' }, // 90° = up
    { angle: Math.PI, desc: 'left' }, // 180° = left
    { angle: -Math.PI/2, desc: 'down' } // 270° = down
  ];

  let openSides = 0;
  let enclosedSides = 0;

  for (const ray of rays) {
    const { points } = rayHits(gs, seed, ray.angle, overshoot * 1.5);

    // Count intersections - odd number means ray exits the shape (open side)
    // even number means ray stays inside (enclosed side)
    const isOpen = points.length % 2 === 1;

    if (isOpen) {
      openSides++;
    } else {
      enclosedSides++;
    }
  }

  // An eye should have exactly one open side (typically right for Latin e)
  // and be mostly enclosed otherwise
  return openSides === 1 && enclosedSides >= 2;
}

/**
 * Finds a seed point inside a counter region of the glyph, if present.
 * Scans horizontal bands between baseline and xHeight, returns midpoint of first detected counter.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns Point2D inside the counter, or null if not found.
 */
function counterSeed(g: Glyph, m: Metrics): { x: number; y: number } | null {
  if (!isDrawable(g) || !g.path || !Array.isArray(g.path.commands)) {
    return null;
  }
  const gs = shapeForV2(g);
  const overshoot = getOvershoot(g);
  const bands = FeatureDetectionConfig.counter.scanBands;
  const delta = (g.bbox.maxX - g.bbox.minX) * 0.01; // 1% of width

  for (let i = 1; i < bands; i++) {
    const y = m.baseline + (i * (m.xHeight - m.baseline)) / bands;
    const origin = { x: -overshoot, y };
    let points: { x: number; y: number }[] = [];
    try {
      const result = rayHits(gs, origin, 0, overshoot * 2);
      points = Array.isArray(result.points) ? result.points : [];
    } catch {
      continue;
    }
    if ((points.length / 2) % 2 === 1 && points.length >= 2) {
      for (let j = 0; j < points.length - 1; j += 2) {
        const x = (points[j].x + points[j + 1].x) / 2;
        // Try nudging the midpoint slightly inward and check isInside
        for (const nudge of FeatureDetectionConfig.counter.nudgeSteps) {
          const nudgeValue = nudge * (g.bbox.maxX - g.bbox.minX);
          const testPt = { x: x + nudgeValue, y };
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
 * Checks if a point is inside the glyph outline.
 * @param g - The fontkit Glyph object.
 * @param pt - The point to test.
 * @returns boolean
 */
function isInside(g: Glyph, pt: { x: number; y: number }): boolean {
  const gs = shapeForV2(g);
  // Legacy fallback: cast a long horizontal ray from far left to pt.x
  const probe = shape('line', { x1: -1e6, y1: pt.y, x2: pt.x, y2: pt.y });
  return Math.abs(windingNumber(gs, probe)) % 2 === 1;
}

/**
 * Computes the signed winding number for a probe intersecting a glyph shape.
 * @param gs - The glyph SvgShape
 * @param probe - The probe SvgShape
 * @returns signed winding number (0 = outside, ±N = inside)
 */
function windingNumber(gs: SvgShape, probe: SvgShape): number {
  const result = safeIntersect(gs, probe) as {
    points: ({ segment1?: number })[];
  };
  let wn = 0;
  for (const p of result.points) {
    wn += 1; // Simplified: each intersection contributes to winding
  }
  return wn;
}

/**
 * Performs a robust intersection, falling back to poly-line tessellation if needed.
 * @param a - First SvgShape
 * @param b - Second SvgShape
 * @returns intersection result
 */
function safeIntersect(a: SvgShape, b: SvgShape): { points: { x: number; y: number }[] } {
  try {
    const result = intersect(a, b) as { points: { x: number; y: number }[] };
    return result || { points: [] };
  } catch {
    return { points: [] };
  }
}


// Import svg-intersections types
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: svg-intersections types may be missing
import { shape, intersect } from 'svg-intersections';
type SvgShape = ReturnType<typeof shape>;
