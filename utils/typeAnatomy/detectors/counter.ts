/**
 * Counter feature detector.
 *
 * A counter is an enclosed or partially enclosed space within a letter
 * (e.g., the hole in 'o', 'e', 'd', 'p', 'a').
 *
 * Fixed in v1:
 * - Uses contour classification (hole contours) as primary detection
 * - Scanline fallback only if no hole contours found
 * - Scale-aware step sizes for radial sweep
 */

import { isInside, rayHits } from '@/utils/geometry/geometryCore';
import { getHoleContours } from '../geometryCache';
import type { FeatureInstance, GeometryCache, Point2D } from '../types';

/**
 * Detects counter features on a glyph.
 * Returns polyline shapes tracing the counter regions.
 */
export function detectCounter(geo: GeometryCache): FeatureInstance[] {
  const { glyph } = geo;

  if (!glyph?.path?.commands || !glyph.bbox) {
    return [];
  }

  const instances: FeatureInstance[] = [];

  // Primary method: use classified hole contours
  const holeContours = getHoleContours(geo);

  if (holeContours.length > 0) {
    for (const hole of holeContours) {
      // Convert hole bbox to a point at center
      const cx = (hole.bbox.minX + hole.bbox.maxX) / 2;
      const cy = (hole.bbox.minY + hole.bbox.maxY) / 2;
      const width = hole.bbox.maxX - hole.bbox.minX;
      const height = hole.bbox.maxY - hole.bbox.minY;

      // Create a simple representation of the counter
      instances.push({
        id: 'counter',
        shape: {
          type: 'circle',
          cx,
          cy,
          r: Math.min(width, height) / 2,
        },
        confidence: 0.85,
        anchors: {
          center: { x: cx, y: cy },
        },
        debug: {
          source: 'hole-contour',
          contourIndex: hole.index,
          area: hole.area,
        },
      });
    }
    return instances;
  }

  // Fallback: scanline-based seed finding + radial sweep
  const seed = findCounterSeed(geo);
  if (!seed) return instances;

  // Trace the counter region with scale-aware step sizes
  const outline = traceCounterRegion(geo, seed);
  if (!outline || outline.length < 6) {
    // Return point if we found seed but can't trace
    instances.push({
      id: 'counter',
      shape: { type: 'point', x: seed.x, y: seed.y, label: 'Counter' },
      confidence: 0.4,
      anchors: { seed },
      debug: { source: 'seed-only' },
    });
    return instances;
  }

  instances.push({
    id: 'counter',
    shape: { type: 'polyline', points: outline },
    confidence: 0.7,
    anchors: {
      seed,
      center: calculateCentroid(outline),
    },
    debug: { source: 'radial-sweep' },
  });

  return instances;
}

/**
 * Finds a seed point inside a counter region.
 * Uses parity-based detection on horizontal scanlines.
 */
function findCounterSeed(geo: GeometryCache): Point2D | null {
  const { glyph, metrics, svgShape, scale } = geo;
  const { bboxW, overshoot } = scale;

  const bands = 5;
  const delta = bboxW * 0.01;

  for (let i = 1; i < bands; i++) {
    const y =
      metrics.baseline + (i * (metrics.xHeight - metrics.baseline)) / bands;
    const origin = { x: glyph.bbox.minX - overshoot * 0.1, y };
    const { points } = rayHits(svgShape, origin, 0, overshoot);

    // Odd number of pairs indicates potential counter
    // (ray entered and exited odd number of times)
    if (points.length >= 4 && (points.length / 2) % 2 === 0) {
      // Look for gaps between pairs (interior regions)
      for (let j = 1; j < points.length - 1; j += 2) {
        const gapStart = points[j].x;
        const gapEnd = points[j + 1].x;
        const gapWidth = gapEnd - gapStart;

        // Gap should be significant
        if (gapWidth > bboxW * 0.05) {
          const testX = (gapStart + gapEnd) / 2;

          // Nudge to find valid interior point
          for (const nudge of [0, -delta, delta, -2 * delta, 2 * delta]) {
            const testPt = { x: testX + nudge, y };
            try {
              // For counter, we want point that is NOT inside the filled path
              // (i.e., inside the hole)
              if (!isInside(glyph, testPt)) {
                // Verify it's within glyph bbox (truly a counter, not outside)
                if (
                  testPt.x > glyph.bbox.minX &&
                  testPt.x < glyph.bbox.maxX &&
                  testPt.y > glyph.bbox.minY &&
                  testPt.y < glyph.bbox.maxY
                ) {
                  return testPt;
                }
              }
            } catch {
              continue;
            }
          }
        }
      }
    }
  }

  return null;
}

/**
 * Traces a counter region by radial sweep from seed point.
 * Uses scale-aware step sizes.
 */
function traceCounterRegion(
  geo: GeometryCache,
  seed: Point2D
): Point2D[] | null {
  const { glyph, scale } = geo;
  const { eps, stemWidth, overshoot } = scale;

  // Scale-aware step sizes
  const angularStep = 10; // degrees
  const radialStep = Math.max(eps * 4, stemWidth * 0.15);
  const maxRadius = overshoot;

  const outline: Point2D[] = [];

  for (let angleDeg = 0; angleDeg < 360; angleDeg += angularStep) {
    const rad = (angleDeg * Math.PI) / 180;
    let len = radialStep;
    let lastValid: Point2D | null = null;

    while (len < maxRadius) {
      const pt = {
        x: seed.x + Math.cos(rad) * len,
        y: seed.y + Math.sin(rad) * len,
      };

      // Check if still in counter (NOT inside filled path)
      try {
        if (isInside(glyph, pt)) {
          // Hit the filled region boundary
          break;
        }
        // Still in counter space
        if (
          pt.x > glyph.bbox.minX &&
          pt.x < glyph.bbox.maxX &&
          pt.y > glyph.bbox.minY &&
          pt.y < glyph.bbox.maxY
        ) {
          lastValid = pt;
        }
        len += radialStep;
      } catch {
        break;
      }
    }

    if (lastValid) {
      outline.push(lastValid);
    }
  }

  return outline.length >= 6 ? outline : null;
}

/**
 * Calculates the centroid of a polygon.
 */
function calculateCentroid(points: Point2D[]): Point2D {
  let sumX = 0;
  let sumY = 0;

  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
  }

  return {
    x: sumX / points.length,
    y: sumY / points.length,
  };
}
