/**
 * Tail feature detector.
 *
 * A tail is a descending stroke, often curved (e.g., in 'Q', 'y', 'j', 'g').
 *
 * Fixed in v1:
 * - Gates by vertical extent (must extend below baseline)
 * - Uses extremum-from-center-of-mass instead of "rightmost"
 * - Scale-aware thresholds
 */

import { rayHits } from '@/utils/geometry/geometryCore';
import type { FeatureInstance, GeometryCache, Point2D } from '../types';

/**
 * Detects tail features on a glyph.
 * Returns polyline or line shapes at detected tail locations.
 */
export function detectTail(geo: GeometryCache): FeatureInstance[] {
  const { glyph, metrics, svgShape, scale } = geo;

  if (!glyph?.path?.commands || !glyph.bbox) {
    return [];
  }

  const instances: FeatureInstance[] = [];
  const { eps, bboxW, bboxH, stemWidth, overshoot } = scale;

  // Gate: glyph must extend below baseline
  const minDescentThreshold = (metrics.baseline - metrics.descent) * 0.15;
  const hasDescender = glyph.bbox.minY < metrics.baseline - minDescentThreshold;

  if (!hasDescender) {
    return instances;
  }

  // Calculate glyph center of mass (approximation using bbox center)
  const glyphCenterX = (glyph.bbox.minX + glyph.bbox.maxX) / 2;
  const glyphCenterY = (glyph.bbox.minY + glyph.bbox.maxY) / 2;

  // Collect tail points using extremum-from-center approach
  const tailPoints = collectTailPointsFromCenter(geo, glyphCenterX);

  if (tailPoints.length >= 3) {
    instances.push({
      id: 'tail',
      shape: { type: 'polyline', points: tailPoints },
      confidence: 0.8,
      anchors: {
        start: tailPoints[0],
        end: tailPoints[tailPoints.length - 1],
      },
      debug: {
        centerX: glyphCenterX,
        pointCount: tailPoints.length,
      },
    });
  } else if (tailPoints.length >= 1) {
    // Simple tail marker
    const tailEnd = tailPoints[tailPoints.length - 1] || tailPoints[0];
    instances.push({
      id: 'tail',
      shape: {
        type: 'line',
        x1: tailEnd.x,
        y1: metrics.baseline,
        x2: tailEnd.x,
        y2: tailEnd.y,
      },
      confidence: 0.55,
      anchors: {
        start: { x: tailEnd.x, y: metrics.baseline },
        end: tailEnd,
      },
    });
  }

  // Also check for Q-style diagonal tail
  const qTail = detectQStyleTail(geo);
  if (qTail && !hasOverlappingTail(instances, qTail)) {
    instances.push(qTail);
  }

  return instances;
}

/**
 * Collects points along the tail using extremum-from-center approach.
 * At each Y level, picks the intersection point furthest from center.
 */
function collectTailPointsFromCenter(
  geo: GeometryCache,
  centerX: number
): Point2D[] {
  const { glyph, metrics, svgShape, scale } = geo;
  const { overshoot } = scale;

  const points: Point2D[] = [];
  const steps = 6;

  for (let i = 0; i <= steps; i++) {
    const y =
      metrics.baseline - (i * (metrics.baseline - glyph.bbox.minY)) / steps;

    // Skip if above baseline (except first point)
    if (i > 0 && y >= metrics.baseline) continue;

    const origin = { x: glyph.bbox.minX - overshoot * 0.1, y };
    const { points: intersections } = rayHits(svgShape, origin, 0, overshoot);

    if (intersections.length === 0) continue;

    // Find extremum point (furthest from center in x)
    let extremum: Point2D | null = null;
    let maxDistance = 0;

    for (const pt of intersections) {
      const dist = Math.abs(pt.x - centerX);
      if (dist > maxDistance) {
        maxDistance = dist;
        extremum = { x: pt.x, y };
      }
    }

    if (extremum) {
      points.push(extremum);
    }
  }

  return points;
}

/**
 * Detects Q-style diagonal tail.
 * Uses scale-aware thresholds.
 */
function detectQStyleTail(geo: GeometryCache): FeatureInstance | null {
  const { glyph, metrics, svgShape, scale } = geo;
  const { bboxW, bboxH, overshoot } = scale;

  // Q tails typically extend diagonally from bottom-right
  const probeX = glyph.bbox.maxX - bboxW * 0.3;
  const probeY = metrics.baseline;

  // Check if there's geometry below and to the right of baseline
  // Cast diagonal ray (down-right at ~315 degrees)
  const angle = -Math.PI / 4;
  const { points } = rayHits(
    svgShape,
    { x: probeX, y: probeY },
    angle,
    overshoot
  );

  if (points.length < 2) return null;

  const start = points[0];
  const end = points[points.length - 1];

  // Verify tail characteristics:
  // - Extends below baseline
  // - End is lower than start
  // - End is to the right of start (diagonal direction)
  const extendsBelow = end.y < metrics.baseline - bboxH * 0.05;
  const isDownward = end.y < start.y;
  const isDiagonal = end.x > start.x;

  if (extendsBelow && isDownward && isDiagonal) {
    return {
      id: 'tail',
      shape: {
        type: 'line',
        x1: start.x,
        y1: start.y,
        x2: end.x,
        y2: end.y,
      },
      confidence: 0.7,
      anchors: {
        start,
        end,
      },
      debug: { type: 'Q-style' },
    };
  }

  return null;
}

/**
 * Checks if a new tail overlaps with existing tails.
 */
function hasOverlappingTail(
  existing: FeatureInstance[],
  newTail: FeatureInstance
): boolean {
  if (newTail.shape.type !== 'line') return false;

  const newShape = newTail.shape;
  const newMidX = (newShape.x1 + newShape.x2) / 2;
  const newMidY = (newShape.y1 + newShape.y2) / 2;

  for (const inst of existing) {
    if (inst.shape.type === 'polyline') {
      const center = calculateCentroid(inst.shape.points);
      const dist = Math.hypot(center.x - newMidX, center.y - newMidY);
      if (dist < 50) return true;
    } else if (inst.shape.type === 'line') {
      const existingMidX = (inst.shape.x1 + inst.shape.x2) / 2;
      const existingMidY = (inst.shape.y1 + inst.shape.y2) / 2;
      const dist = Math.hypot(existingMidX - newMidX, existingMidY - newMidY);
      if (dist < 50) return true;
    }
  }

  return false;
}

/**
 * Calculates centroid of points.
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
