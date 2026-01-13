/**
 * Spine feature detector.
 *
 * A spine is the main curved stroke of letters like 'S' and 's'.
 *
 * Fixed in v1:
 * - Uses largest filled span midpoint instead of outer bbox midpoint
 * - Fixed indexing bug in direction change detection
 * - Scale-aware thresholds
 */

import { rayHits } from '@/utils/geometry/geometryCore';
import type { FeatureInstance, GeometryCache, Point2D } from '../types';

/**
 * Represents a filled span at a Y level.
 */
interface FilledSpan {
  x1: number;
  x2: number;
  width: number;
  midX: number;
}

/**
 * Detects spine features on a glyph.
 * Returns polyline shapes tracing the spine centerline.
 */
export function detectSpine(geo: GeometryCache): FeatureInstance[] {
  const { glyph, metrics, svgShape, scale } = geo;

  if (!glyph?.path?.commands || !glyph.bbox) {
    return [];
  }

  const instances: FeatureInstance[] = [];
  const { eps, bboxW, bboxH, overshoot } = scale;

  // Determine height zone (uppercase S uses capHeight, lowercase s uses xHeight)
  const glyphTop = glyph.bbox.maxY;
  const isUppercase = glyphTop > metrics.xHeight + bboxH * 0.1;
  const topMetric = isUppercase ? metrics.capHeight : metrics.xHeight;

  // Scan at multiple Y levels to detect S-curve
  const levels = 7;
  const midpoints: Point2D[] = [];
  const directions: number[] = [];

  for (let i = 0; i <= levels; i++) {
    const y = metrics.baseline + (i * (topMetric - metrics.baseline)) / levels;
    const origin = { x: glyph.bbox.minX - overshoot * 0.1, y };
    const { points } = rayHits(svgShape, origin, 0, overshoot);

    if (points.length < 2) continue;

    // Convert to filled spans
    const spans: FilledSpan[] = [];
    for (let j = 0; j < points.length - 1; j += 2) {
      const x1 = points[j].x;
      const x2 = points[j + 1].x;
      const width = x2 - x1;
      spans.push({ x1, x2, width, midX: (x1 + x2) / 2 });
    }

    if (spans.length === 0) continue;

    // Pick the largest filled span (the main stroke)
    const largestSpan = spans.reduce((best, span) =>
      span.width > best.width ? span : best
    );

    midpoints.push({ x: largestSpan.midX, y });
  }

  if (midpoints.length < 3) {
    return instances;
  }

  // Calculate direction changes
  for (let i = 1; i < midpoints.length; i++) {
    const dx = midpoints[i].x - midpoints[i - 1].x;
    directions.push(Math.sign(dx));
  }

  // Count direction changes (sign flips)
  let curveDirectionChanges = 0;
  for (let i = 1; i < directions.length; i++) {
    if (directions[i] !== 0 && directions[i - 1] !== 0) {
      if (directions[i] !== directions[i - 1]) {
        curveDirectionChanges++;
      }
    }
  }

  // S-curve should have at least one direction change
  // Typically 1 for S/s (curves left then right, or vice versa)
  if (curveDirectionChanges >= 1) {
    instances.push({
      id: 'spine',
      shape: { type: 'polyline', points: midpoints },
      confidence: Math.min(0.9, 0.5 + curveDirectionChanges * 0.2),
      anchors: {
        top: midpoints[midpoints.length - 1],
        bottom: midpoints[0],
        center: midpoints[Math.floor(midpoints.length / 2)],
      },
      debug: {
        curveDirectionChanges,
        levelCount: midpoints.length,
        directions,
      },
    });
  }

  return instances;
}
