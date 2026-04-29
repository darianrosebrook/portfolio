/**
 * Predicates over `CornerSample` for sharpness, convexity, position-band, and
 * interior-direction queries. All predicates are pure data — given a sample
 * they return a boolean, never mutate, never call into other modules.
 *
 * Sharpness threshold default is 100° turn angle, chosen so that:
 * - Right-angle (90°) corners of a regular rectangle are NOT classified
 *   as sharp (avoids flagging stem ends and crossbar terminals).
 * - The interior tip of an `^` (turn ≈ 109°+) IS classified as sharp.
 * - Apex tips of letters like `A` (typical turn ≈ 130°+) are well above
 *   the threshold.
 *
 * Per-detector tuning is supported via the `minTurnAngleRad` option.
 */

import type { BBox } from '../../types';
import type { CornerSample } from './findOutlineCorners';

/** Default sharpness threshold: 100° in radians. */
export const DEFAULT_SHARPNESS_RAD = (100 * Math.PI) / 180;

/** Default band thickness: 15% of the bbox dimension. */
export const DEFAULT_BAND_RATIO = 0.15;

export interface SharpnessOptions {
  /** Minimum |turnAngle| in radians. Default: 100° = ~1.745 rad. */
  minTurnAngleRad?: number;
}

export interface BandOptions {
  /** Band thickness as a fraction of the relevant bbox dimension. Default 0.15. */
  ratio?: number;
}

/**
 * Returns true when the corner's turn-angle magnitude meets the sharpness
 * threshold. Convex/concave is not checked here — both contribute.
 */
export function isSharpCorner(
  corner: CornerSample,
  options: SharpnessOptions = {}
): boolean {
  const { minTurnAngleRad = DEFAULT_SHARPNESS_RAD } = options;
  return Math.abs(corner.signedTurnAngle) >= minTurnAngleRad;
}

/**
 * Returns true when the corner is a convex vertex of its polygon.
 *
 * Convex = the polygon's interior is on the same side as the corner bisector.
 * Operationally: for a CCW polygon (winding=+1), convex corners have positive
 * signed turn angles (left turn into the interior); for a CW polygon
 * (winding=-1), convex corners have negative signed turn angles. The product
 * `signedTurnAngle * contourWinding` is positive for convex corners regardless
 * of orientation.
 */
export function isConvexCorner(corner: CornerSample): boolean {
  return corner.signedTurnAngle * corner.contourWinding > 0;
}

/** Returns true when the corner is a concave vertex of its polygon. */
export function isConcaveCorner(corner: CornerSample): boolean {
  return corner.signedTurnAngle * corner.contourWinding < 0;
}

/** Convenience: sharp AND convex (e.g., A apex, V vertex). */
export function isSharpExteriorCorner(
  corner: CornerSample,
  options?: SharpnessOptions
): boolean {
  return isSharpCorner(corner, options) && isConvexCorner(corner);
}

/** Convenience: sharp AND concave (e.g., A interior crotch, M valleys). */
export function isSharpInteriorCorner(
  corner: CornerSample,
  options?: SharpnessOptions
): boolean {
  return isSharpCorner(corner, options) && isConcaveCorner(corner);
}

/**
 * Returns true when the corner's interior-direction y-component points
 * upward (positive y in font coords / math coords). Useful for asking
 * "does this corner open upward into the polygon interior?" — which is
 * the geometric signature of a vertex (V tip) or A's interior crotch.
 *
 * `eps` is the minimum positive y-component to count as "up"; defaults
 * to a small positive value to ignore floating-point noise.
 */
export function interiorPointsUp(
  corner: CornerSample,
  eps: number = 0.05
): boolean {
  return corner.interiorDirection.y > eps;
}

/**
 * Returns true when the corner's interior-direction y-component points
 * downward. Geometric signature of an apex tip (A apex points up; its
 * interior — i.e. the polygon body below — points down).
 */
export function interiorPointsDown(
  corner: CornerSample,
  eps: number = 0.05
): boolean {
  return corner.interiorDirection.y < -eps;
}

/**
 * Returns true when the corner sits in the top band of `bbox`. Band height
 * is `bbox.height * ratio` measured downward from `bbox.maxY`.
 */
export function isInTopBand(
  corner: CornerSample,
  bbox: BBox,
  options: BandOptions = {}
): boolean {
  const { ratio = DEFAULT_BAND_RATIO } = options;
  const height = bbox.maxY - bbox.minY;
  if (height <= 0) return false;
  return corner.point.y >= bbox.maxY - height * ratio;
}

/**
 * Returns true when the corner sits in the bottom band of `bbox`. Band
 * height is `bbox.height * ratio` measured upward from `bbox.minY`.
 */
export function isInBottomBand(
  corner: CornerSample,
  bbox: BBox,
  options: BandOptions = {}
): boolean {
  const { ratio = DEFAULT_BAND_RATIO } = options;
  const height = bbox.maxY - bbox.minY;
  if (height <= 0) return false;
  return corner.point.y <= bbox.minY + height * ratio;
}
