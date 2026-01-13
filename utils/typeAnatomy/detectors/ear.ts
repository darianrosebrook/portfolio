/**
 * Ear feature detector.
 *
 * An ear is a small projection extending from the body of a letter
 * (e.g., on 'g', 'r', 'a').
 *
 * Fixed in v1:
 * - Detects local extremum projections, not just "wedge hits"
 * - Focuses on top-right region where ears typically occur
 * - Uses scale-aware thresholds
 */

import { rayHits } from '@/utils/geometry/geometryCore';
import type { FeatureInstance, GeometryCache, Point2D } from '../types';

/**
 * Detects ear features on a glyph.
 * Returns point shapes at detected ear locations.
 */
export function detectEar(geo: GeometryCache): FeatureInstance[] {
  const { glyph, metrics, svgShape, scale } = geo;

  if (!glyph?.path?.commands || !glyph.bbox) {
    return [];
  }

  const instances: FeatureInstance[] = [];
  const { eps, bboxW, bboxH, stemWidth, overshoot } = scale;

  // Ears are typically found at the top of the bowl, projecting right
  // Check in the x-height zone

  // Scan at levels near x-height (top of lowercase letters)
  const levels = [
    metrics.xHeight * 0.8,
    metrics.xHeight * 0.9,
    metrics.xHeight,
  ];

  // Track rightmost extensions at each level
  const rightExtensions: Array<{ y: number; x: number }> = [];

  for (const y of levels) {
    if (y < glyph.bbox.minY || y > glyph.bbox.maxY) continue;

    const origin = { x: glyph.bbox.minX - overshoot * 0.1, y };
    const { points } = rayHits(svgShape, origin, 0, overshoot);

    if (points.length < 2) continue;

    // Find rightmost point
    const rightmost = points[points.length - 1];
    rightExtensions.push({ y, x: rightmost.x });
  }

  if (rightExtensions.length < 2) {
    return instances;
  }

  // Look for a local maximum in x (ear sticks out more than neighbors)
  for (let i = 1; i < rightExtensions.length - 1; i++) {
    const prev = rightExtensions[i - 1];
    const curr = rightExtensions[i];
    const next = rightExtensions[i + 1];

    // Local maximum: current x > neighbors
    const isPeak = curr.x > prev.x + eps * 5 && curr.x > next.x + eps * 5;

    if (isPeak) {
      // Check if this is near the top-right (typical ear location)
      const nearTopRight =
        curr.y > metrics.xHeight * 0.6 &&
        curr.x > glyph.bbox.minX + bboxW * 0.5;

      if (nearTopRight) {
        instances.push({
          id: 'ear',
          shape: {
            type: 'point',
            x: curr.x,
            y: curr.y,
            label: 'Ear',
          },
          confidence: 0.7,
          anchors: {
            position: { x: curr.x, y: curr.y },
          },
          debug: {
            peakHeight: curr.x - Math.min(prev.x, next.x),
          },
        });
      }
    }
  }

  // If no local maxima found, check if the entire top-right is an ear
  // (some glyphs have ears that don't form a peak)
  if (instances.length === 0 && rightExtensions.length >= 2) {
    const topExtension = rightExtensions[rightExtensions.length - 1];

    // Verify it's separated from main body by checking below
    const lowerY = metrics.xHeight * 0.5;
    const lowerOrigin = { x: glyph.bbox.minX - overshoot * 0.1, y: lowerY };
    const { points: lowerPoints } = rayHits(
      svgShape,
      lowerOrigin,
      0,
      overshoot
    );

    if (lowerPoints.length >= 2) {
      const lowerRight = lowerPoints[lowerPoints.length - 1].x;

      // Ear extends further right than the body
      if (topExtension.x > lowerRight + stemWidth * 0.3) {
        instances.push({
          id: 'ear',
          shape: {
            type: 'point',
            x: topExtension.x,
            y: topExtension.y,
            label: 'Ear',
          },
          confidence: 0.55,
          anchors: {
            position: { x: topExtension.x, y: topExtension.y },
          },
          debug: {
            extension: topExtension.x - lowerRight,
          },
        });
      }
    }
  }

  return instances;
}
