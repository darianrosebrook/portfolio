/**
 * Curvature analysis utilities for terminal feature enhancement.
 *
 * Provides curvature computation for Bezier segments at terminal positions.
 * Used to improve confidence scoring for serif, spur, ear, and finial detectors.
 */

import type { SegmentWithMeta, Point2D, GeometryCache } from './types';

/**
 * Curvature result for a terminal point.
 */
export interface CurvatureResult {
  /** Curvature value (1/radius). Higher = more curved */
  curvature: number;
  /** Direction of curvature: -1 = concave, +1 = convex, 0 = straight */
  direction: number;
  /** Tangent angle at the point (radians) */
  tangentAngle: number;
  /** Normal angle at the point (radians) */
  normalAngle: number;
  /** Classification based on curvature magnitude */
  classification: 'sharp' | 'moderate' | 'gentle' | 'straight';
}

/**
 * Computes curvature at a point along a cubic Bezier curve.
 * Uses the curvature formula: k = (x'y'' - y'x'') / (x'^2 + y'^2)^(3/2)
 *
 * @param p0 Start point
 * @param p1 Control point 1
 * @param p2 Control point 2
 * @param p3 End point
 * @param t Parameter along curve (0-1)
 */
export function computeBezierCurvature(
  p0: Point2D,
  p1: Point2D,
  p2: Point2D,
  p3: Point2D,
  t: number
): CurvatureResult {
  // First derivative (velocity)
  const dx =
    3 * (1 - t) ** 2 * (p1.x - p0.x) +
    6 * (1 - t) * t * (p2.x - p1.x) +
    3 * t ** 2 * (p3.x - p2.x);

  const dy =
    3 * (1 - t) ** 2 * (p1.y - p0.y) +
    6 * (1 - t) * t * (p2.y - p1.y) +
    3 * t ** 2 * (p3.y - p2.y);

  // Second derivative (acceleration)
  const ddx =
    6 * (1 - t) * (p2.x - 2 * p1.x + p0.x) + 6 * t * (p3.x - 2 * p2.x + p1.x);

  const ddy =
    6 * (1 - t) * (p2.y - 2 * p1.y + p0.y) + 6 * t * (p3.y - 2 * p2.y + p1.y);

  // Curvature formula
  const speedSquared = dx * dx + dy * dy;
  const speed = Math.sqrt(speedSquared);
  const numerator = dx * ddy - dy * ddx;
  const denominator = speedSquared * speed;

  // Handle near-zero speed (stationary point)
  if (Math.abs(denominator) < 1e-10) {
    return {
      curvature: 0,
      direction: 0,
      tangentAngle: 0,
      normalAngle: Math.PI / 2,
      classification: 'straight',
    };
  }

  const curvature = numerator / denominator;
  const tangentAngle = Math.atan2(dy, dx);
  const normalAngle = tangentAngle + Math.PI / 2;
  const direction = Math.sign(curvature);

  // Classify curvature magnitude
  const absCurvature = Math.abs(curvature);
  let classification: CurvatureResult['classification'];

  if (absCurvature < 0.001) {
    classification = 'straight';
  } else if (absCurvature < 0.01) {
    classification = 'gentle';
  } else if (absCurvature < 0.05) {
    classification = 'moderate';
  } else {
    classification = 'sharp';
  }

  return {
    curvature,
    direction,
    tangentAngle,
    normalAngle,
    classification,
  };
}

/**
 * Computes curvature at the start (t=0) of a quadratic Bezier curve.
 */
export function computeQuadraticCurvature(
  p0: Point2D,
  p1: Point2D,
  p2: Point2D,
  t: number
): CurvatureResult {
  // First derivative
  const dx = 2 * (1 - t) * (p1.x - p0.x) + 2 * t * (p2.x - p1.x);
  const dy = 2 * (1 - t) * (p1.y - p0.y) + 2 * t * (p2.y - p1.y);

  // Second derivative (constant for quadratic)
  const ddx = 2 * (p2.x - 2 * p1.x + p0.x);
  const ddy = 2 * (p2.y - 2 * p1.y + p0.y);

  const speedSquared = dx * dx + dy * dy;
  const speed = Math.sqrt(speedSquared);
  const numerator = dx * ddy - dy * ddx;
  const denominator = speedSquared * speed;

  if (Math.abs(denominator) < 1e-10) {
    return {
      curvature: 0,
      direction: 0,
      tangentAngle: 0,
      normalAngle: Math.PI / 2,
      classification: 'straight',
    };
  }

  const curvature = numerator / denominator;
  const tangentAngle = Math.atan2(dy, dx);
  const normalAngle = tangentAngle + Math.PI / 2;
  const direction = Math.sign(curvature);

  const absCurvature = Math.abs(curvature);
  let classification: CurvatureResult['classification'];

  if (absCurvature < 0.001) {
    classification = 'straight';
  } else if (absCurvature < 0.01) {
    classification = 'gentle';
  } else if (absCurvature < 0.05) {
    classification = 'moderate';
  } else {
    classification = 'sharp';
  }

  return {
    curvature,
    direction,
    tangentAngle,
    normalAngle,
    classification,
  };
}

/**
 * Finds segments near a terminal position.
 */
export function findTerminalSegments(
  geo: GeometryCache,
  position: Point2D,
  tolerance: number
): SegmentWithMeta[] {
  const nearbySegments: SegmentWithMeta[] = [];

  for (const seg of geo.segments) {
    if (!seg.params || seg.params.length === 0) continue;

    // Check if any control point is near the position
    for (const pt of seg.params) {
      if (!pt || typeof pt.x !== 'number' || typeof pt.y !== 'number') continue;

      const dist = Math.hypot(pt.x - position.x, pt.y - position.y);
      if (dist < tolerance) {
        nearbySegments.push(seg);
        break;
      }
    }
  }

  return nearbySegments;
}

/**
 * Analyzes terminal curvature for a feature detector.
 * Returns curvature info for the nearest terminal segment.
 */
export function analyzeTerminalCurvature(
  geo: GeometryCache,
  position: Point2D
): CurvatureResult | null {
  const tolerance = geo.scale.stemWidth * 0.5;
  const segments = findTerminalSegments(geo, position, tolerance);

  if (segments.length === 0) return null;

  // Use the first nearby segment
  const seg = segments[0];

  if (seg.type === 'bezierCurveTo' && seg.params.length >= 4) {
    // Cubic Bezier
    const [p0, p1, p2, p3] = seg.params;
    if (!p0 || !p1 || !p2 || !p3) return null;

    // Check which end is closer to position
    const distToStart = Math.hypot(p0.x - position.x, p0.y - position.y);
    const distToEnd = Math.hypot(p3.x - position.x, p3.y - position.y);
    const t = distToStart < distToEnd ? 0.05 : 0.95;

    return computeBezierCurvature(p0, p1, p2, p3, t);
  }

  if (seg.type === 'quadraticCurveTo' && seg.params.length >= 3) {
    // Quadratic Bezier
    const [p0, p1, p2] = seg.params;
    if (!p0 || !p1 || !p2) return null;

    const distToStart = Math.hypot(p0.x - position.x, p0.y - position.y);
    const distToEnd = Math.hypot(p2.x - position.x, p2.y - position.y);
    const t = distToStart < distToEnd ? 0.05 : 0.95;

    return computeQuadraticCurvature(p0, p1, p2, t);
  }

  // Line segment - straight
  return {
    curvature: 0,
    direction: 0,
    tangentAngle: 0,
    normalAngle: Math.PI / 2,
    classification: 'straight',
  };
}

/**
 * Classifies a terminal based on its curvature characteristics.
 * Used to distinguish between finials, serifs, spurs, and ears.
 */
export function classifyTerminal(
  curvature: CurvatureResult,
  hasHorizontalProjection: boolean
): 'finial' | 'serif' | 'spur' | 'plain' {
  // Serifs have horizontal projections
  if (hasHorizontalProjection) {
    return 'serif';
  }

  // Sharp curvature at terminal = finial (ball terminal, teardrop, etc.)
  if (curvature.classification === 'sharp') {
    return 'finial';
  }

  // Moderate curvature = possible spur
  if (curvature.classification === 'moderate') {
    return 'spur';
  }

  // Gentle or straight = plain terminal
  return 'plain';
}
