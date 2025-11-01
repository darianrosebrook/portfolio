/**
 * Curve direction classification and intersection helpers.
 * Based on techniques from Sebastian Lague's font rendering video:
 * https://www.youtube.com/watch?v=SO83KQuuZvg
 *
 * These helpers improve precision and accuracy in inside/outside detection
 * by classifying curves and handling edge cases better.
 */

import type { Point2D } from './geometry';
import { FeatureDetectionConfig } from '../typeAnatomy/featureConfig';

const EPS = FeatureDetectionConfig.global.curveClassificationEpsilon;
const PRECISION_EPS = FeatureDetectionConfig.global.precisionThreshold;

/**
 * Classifies a quadratic bezier curve's direction based on control point positions.
 * 
 * A curve is "strictly decreasing" if p2.y < p0.y (moving downward).
 * A curve is "strictly increasing" if p2.y > p0.y (moving upward).
 * 
 * This classification helps avoid ambiguity in intersection counting.
 * 
 * @param p0 - Start point of the curve
 * @param p1 - Control point
 * @param p2 - End point of the curve
 * @returns 'decreasing' | 'increasing' | 'ambiguous'
 */
export function classifyCurveDirection(
  p0: Point2D,
  p1: Point2D,
  p2: Point2D
): 'decreasing' | 'increasing' | 'ambiguous' {
  const dy = p2.y - p0.y;
  
  // If the change is negligible, consider it ambiguous
  if (Math.abs(dy) < EPS) {
    return 'ambiguous';
  }
  
  // Check if p1 is outside the p0-p2 range (turning point case)
  const p1MinY = Math.min(p0.y, p2.y);
  const p1MaxY = Math.max(p0.y, p2.y);
  
  // If p1 is outside the range, we have a turning point
  if (p1.y < p1MinY - EPS || p1.y > p1MaxY + EPS) {
    return 'ambiguous';
  }
  
  // Simple classification: if p2 is below p0, curve is decreasing
  return dy < 0 ? 'decreasing' : 'increasing';
}

/**
 * Checks if all points of a curve are above a given y-coordinate.
 * Used for early rejection in ray casting.
 * 
 * @param p0 - Start point
 * @param p1 - Control point
 * @param p2 - End point
 * @param y - Y coordinate to test against
 * @param includeZero - If true, points exactly at y are considered "above"
 * @returns true if all points are above y
 */
export function allPointsAbove(
  p0: Point2D,
  p1: Point2D,
  p2: Point2D,
  y: number,
  includeZero = false
): boolean {
  const threshold = includeZero ? -PRECISION_EPS : PRECISION_EPS;
  return (
    p0.y > y + threshold &&
    p1.y > y + threshold &&
    p2.y > y + threshold
  );
}

/**
 * Checks if all points of a curve are below a given y-coordinate.
 * Used for early rejection in ray casting.
 * 
 * @param p0 - Start point
 * @param p1 - Control point
 * @param p2 - End point
 * @param y - Y coordinate to test against
 * @param includeZero - If true, points exactly at y are considered "below"
 * @returns true if all points are below y
 */
export function allPointsBelow(
  p0: Point2D,
  p1: Point2D,
  p2: Point2D,
  y: number,
  includeZero = false
): boolean {
  const threshold = includeZero ? PRECISION_EPS : -PRECISION_EPS;
  return (
    p0.y < y + threshold &&
    p1.y < y + threshold &&
    p2.y < y + threshold
  );
}

/**
 * Filters duplicate intersection points based on position.
 * Prevents double-counting at curve meeting points due to precision issues.
 * 
 * @param points - Array of intersection points
 * @param threshold - Distance threshold for considering points duplicates (default: intersectionEpsilon)
 * @returns Filtered array with duplicates removed
 */
export function filterDuplicateIntersections(
  points: Point2D[],
  threshold?: number
): Point2D[] {
  const thresh = threshold ?? FeatureDetectionConfig.global.intersectionEpsilon;
  const filtered: Point2D[] = [];
  
  for (const point of points) {
    let isDuplicate = false;
    for (const existing of filtered) {
      const dx = point.x - existing.x;
      const dy = point.y - existing.y;
      const distSq = dx * dx + dy * dy;
      
      if (distSq < thresh * thresh) {
        isDuplicate = true;
        break;
      }
    }
    
    if (!isDuplicate) {
      filtered.push(point);
    }
  }
  
  return filtered;
}

/**
 * Calculates the gradient (derivative) of a quadratic bezier curve at parameter t.
 * For a quadratic bezier: B(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
 * The derivative is: B'(t) = 2(1-t)(P₁ - P₀) + 2t(P₂ - P₁)
 * 
 * @param p0 - Start point
 * @param p1 - Control point
 * @param p2 - End point
 * @param t - Parameter value (0-1)
 * @returns Gradient vector {x, y}
 */
export function bezierGradient(
  p0: Point2D,
  p1: Point2D,
  p2: Point2D,
  t: number
): Point2D {
  // B'(t) = 2(1-t)(P₁ - P₀) + 2t(P₂ - P₁)
  const dx = 2 * (1 - t) * (p1.x - p0.x) + 2 * t * (p2.x - p1.x);
  const dy = 2 * (1 - t) * (p1.y - p0.y) + 2 * t * (p2.y - p1.y);
  return { x: dx, y: dy };
}

/**
 * Determines if a curve crosses a horizontal ray in an upward or downward direction.
 * Uses the gradient at the intersection point.
 * 
 * @param p0 - Start point
 * @param p1 - Control point
 * @param p2 - End point
 * @param t - Parameter value at intersection (0-1)
 * @returns 'upward' | 'downward' | 'tangent'
 */
export function curveCrossingDirection(
  p0: Point2D,
  p1: Point2D,
  p2: Point2D,
  t: number
): 'upward' | 'downward' | 'tangent' {
  const gradient = bezierGradient(p0, p1, p2, t);
  const dy = gradient.y;
  
  if (Math.abs(dy) < EPS) {
    return 'tangent';
  }
  
  return dy > 0 ? 'upward' : 'downward';
}

