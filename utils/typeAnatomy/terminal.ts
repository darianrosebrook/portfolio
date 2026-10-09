/**
 * Terminal feature detection for typographic glyphs.
 * Detects stroke endings that don't finish with a serif.
 * Includes ball terminals and teardrop terminals.
 */

import {
  containsFilledPoint,
  getFilledGeometry,
} from '@/utils/geometry/filledGeometry';
import { getOvershoot, shapeForV2 } from '@/utils/caching/caching';
import { isDrawable, rayHits } from '@/utils/geometry/geometryCore';
import type { Glyph } from 'fontkit';
import { FeatureDetectionConfig } from './featureConfig';
import type { FeatureResult, Metrics } from './index';

/**
 * Detects if a glyph contains a terminal (non-serif stroke ending).
 * Can be straight, flared, rounded (ball), or teardrop-shaped.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns FeatureResult (may include shape for ball terminals)
 */
export function getTerminal(g: Glyph, m: Metrics): FeatureResult {
  if (!isDrawable(g)) return { found: false };

  const gs = shapeForV2(g);
  const overshoot = getOvershoot(g);
  const bboxW = g.bbox.maxX - g.bbox.minX;
  const EPS = FeatureDetectionConfig.global.defaultEps;

  // Terminals appear at stroke endings
  // Check multiple locations: top, bottom, left, right edges

  // Check for ball terminal (rounded end)
  const ballTerminal = detectBallTerminal(g, m, gs, overshoot, bboxW, EPS);
  if (ballTerminal) {
    return { found: true, shape: ballTerminal };
  }

  // Check for teardrop terminal
  if (detectTeardropTerminal(g, m, gs, overshoot, bboxW)) {
    return { found: true };
  }

  // Check for straight or flared terminals (non-serif endings)
  if (detectStraightTerminal(g, m, gs, overshoot, bboxW, EPS)) {
    return { found: true };
  }

  return { found: false };
}

/**
 * Detects ball terminal (rounded circular ending).
 */
function detectBallTerminal(
  g: Glyph,
  m: Metrics,
  gs: ReturnType<typeof shapeForV2>,
  overshoot: number,
  bboxW: number,
  EPS: number
): { type: 'circle'; cx: number; cy: number; r: number } | null {
  // Ball terminals are typically at stroke ends (a, c, r, f)
  const scanRegions = [
    { x: g.bbox.maxX - bboxW * 0.15, y: m.xHeight * 0.7 }, // Top right
    { x: g.bbox.minX + bboxW * 0.15, y: m.xHeight * 0.7 }, // Top left
    { x: g.bbox.maxX - bboxW * 0.15, y: m.baseline }, // Bottom right
  ];

  for (const region of scanRegions) {
    // Cast rays from potential ball position
    const angles = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
    const radii: number[] = [];

    for (const angle of angles) {
      const { points } = rayHits(gs, region, angle, bboxW * 0.1);
      if (points.length > 0) {
        const dist = Math.sqrt(
          Math.pow(points[0].x - region.x, 2) +
            Math.pow(points[0].y - region.y, 2)
        );
        radii.push(dist);
      }
    }

    if (radii.length >= 3) {
      const avgRadius = radii.reduce((a, b) => a + b, 0) / radii.length;
      const radiusVariance =
        radii.reduce((sum, r) => sum + Math.pow(r - avgRadius, 2), 0) /
        radii.length;

      // Ball terminal should be roughly circular (low variance)
      if (
        avgRadius > 0 &&
        avgRadius < bboxW * 0.15 &&
        radiusVariance < EPS * 10
      ) {
        return {
          type: 'circle',
          cx: region.x,
          cy: region.y,
          r: avgRadius,
        };
      }
    }
  }

  return null;
}

/**
 * Detects teardrop terminal (droplet-shaped ending).
 */
function detectTeardropTerminal(
  g: Glyph,
  m: Metrics,
  gs: ReturnType<typeof shapeForV2>,
  overshoot: number,
  bboxW: number
): boolean {
  // Teardrops are typically at stroke ends (a, c, r)
  const teardropRegions = [
    { x: g.bbox.maxX - bboxW * 0.2, y: m.xHeight * 0.6 },
    { x: g.bbox.minX + bboxW * 0.2, y: m.xHeight * 0.6 },
  ];

  for (const region of teardropRegions) {
    // Teardrop has asymmetric shape (wider at top, narrow at bottom)
    const { points: down } = rayHits(
      gs,
      region,
      Math.PI / 2, // Down
      bboxW * 0.15
    );
    const { points: up } = rayHits(
      gs,
      region,
      -Math.PI / 2, // Up
      bboxW * 0.15
    );

    if (down.length > 0 && up.length > 0) {
      const downWidth = down[down.length - 1].y - region.y;
      const upWidth = region.y - up[0].y;

      // Teardrop is wider at top
      if (upWidth > downWidth && upWidth < bboxW * 0.2) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Detects straight or flared terminals (non-serif endings).
 */
function detectStraightTerminal(
  g: Glyph,
  _m: Metrics,
  _gs: ReturnType<typeof shapeForV2>,
  _overshoot: number,
  _bboxW: number,
  _EPS: number
): boolean {
  const model = getFilledGeometry(g);
  for (const body of model.bodies) {
    const points = body.points;
    for (let i = 0; i < points.length; i++) {
      const before = points[(i - 1 + points.length) % points.length],
        a = points[i],
        b = points[(i + 1) % points.length],
        after = points[(i + 2) % points.length];
      const width = Math.hypot(b.x - a.x, b.y - a.y);
      const beforeLength = Math.hypot(a.x - before.x, a.y - before.y),
        afterLength = Math.hypot(after.x - b.x, after.y - b.y);
      if (
        width <= model.tolerance ||
        beforeLength < width * 1.5 ||
        afterLength < width * 1.5
      )
        continue;
      const incoming = {
          x: (a.x - before.x) / beforeLength,
          y: (a.y - before.y) / beforeLength,
        },
        outgoing = {
          x: (after.x - b.x) / afterLength,
          y: (after.y - b.y) / afterLength,
        },
        along = { x: (b.x - a.x) / width, y: (b.y - a.y) / width };
      if (
        incoming.x * outgoing.x + incoming.y * outgoing.y > -0.9 ||
        Math.abs(incoming.x * along.x + incoming.y * along.y) > 0.3 ||
        Math.abs(outgoing.x * along.x + outgoing.y * along.y) > 0.3
      )
        continue;
      const normal = { x: -along.y, y: along.x },
        anchor = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const positive = containsFilledPoint(model, {
          x: anchor.x + normal.x * width * 0.15,
          y: anchor.y + normal.y * width * 0.15,
        }),
        negative = containsFilledPoint(model, {
          x: anchor.x - normal.x * width * 0.15,
          y: anchor.y - normal.y * width * 0.15,
        });
      if (positive !== negative) return true;
    }
  }
  return false;
}

/**
 * Simple boolean check for terminal.
 */
export function hasTerminal(g: Glyph, m: Metrics): boolean {
  return getTerminal(g, m).found;
}
