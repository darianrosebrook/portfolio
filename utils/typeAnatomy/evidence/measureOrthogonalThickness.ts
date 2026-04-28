/**
 * Orthogonal thickness evidence predicate.
 *
 * Measures the thickness of a stroke-like region by casting a ray
 * perpendicular to the candidate's *dominant axis* through a midpoint, then
 * picking the entry/exit pair that contains (or is closest to) that midpoint.
 *
 * Naming contract: `dominantAxis` describes the orientation of the candidate
 * feature, NOT the ray direction. A horizontal crossbar has `dominantAxis:
 * 'horizontal'`, so this function casts a *vertical* ray. A vertical stem has
 * `dominantAxis: 'vertical'`, so this casts a *horizontal* ray. This avoids
 * the otherwise-easy mistake of confusing "axis I want to measure along" with
 * "axis of the thing being measured."
 *
 * The returned `confidence` is a *local measurement* confidence — it answers
 * "did this perpendicular probe produce a reliable thickness reading?" — and
 * is intentionally NOT a feature-level score. It is a building block for the
 * future evidence model, not the model itself.
 */

import { rayHits } from '@/utils/geometry/geometryCore';
import type { Point2D } from '@/utils/geometry/geometry';
import type { GeometryCache } from '../types';

export type DominantAxis = 'horizontal' | 'vertical';

export type ThicknessFailureReason =
  | 'no_hits'
  | 'insufficient_pairs'
  | 'ambiguous_pairs';

export interface OrthogonalThicknessOptions {
  /** Point inside the candidate feature where thickness should be measured. */
  midpoint: Point2D;
  /** Axis the candidate feature runs along. The probe is cast perpendicular to this. */
  dominantAxis: DominantAxis;
  /**
   * Half-length of the probe in design units. The probe extends this far on
   * both sides of `midpoint`. Defaults to the larger of the glyph bbox
   * dimensions, with a small safety margin, so a probe always crosses the
   * full glyph.
   */
  maxProbeDistance?: number;
  /**
   * Minimum number of entry/exit pairs the probe must produce before a
   * thickness can be reported. Defaults to 1.
   */
  minHitPairs?: number;
}

export interface OrthogonalThicknessMeasurement {
  /** Distance between the chosen entry/exit pair, in design units. 0 on failure. */
  thickness: number;
  /** All ray-glyph intersection points, sorted along the ray direction. */
  hits: Point2D[];
  /**
   * Local measurement confidence in [0, 1]. 0 on failure. ~1 when a single
   * pair contains the midpoint. Lower when multiple pairs are present
   * (ambiguous geometry — the probe likely passed through extra strokes).
   */
  confidence: number;
  /** Set when the measurement could not be produced. */
  failureReason?: ThicknessFailureReason;
}

interface HitPair {
  near: Point2D;
  far: Point2D;
  thickness: number;
  /** Coordinate of the pair's midpoint along the probe axis. */
  midOnProbe: number;
  containsMidpoint: boolean;
}

const HALF_PI = Math.PI / 2;

export function measureOrthogonalThickness(
  geo: GeometryCache,
  options: OrthogonalThicknessOptions
): OrthogonalThicknessMeasurement {
  const { midpoint, dominantAxis } = options;
  const minHitPairs = Math.max(1, options.minHitPairs ?? 1);
  const probeDistance =
    options.maxProbeDistance ??
    Math.max(geo.scale.bboxW, geo.scale.bboxH) + geo.scale.overshoot;

  // Probe is perpendicular to the candidate's dominant axis.
  // Horizontal candidate (e.g., crossbar) → vertical ray.
  // Vertical candidate (e.g., stem) → horizontal ray.
  const angle = dominantAxis === 'horizontal' ? HALF_PI : 0;

  const origin: Point2D =
    dominantAxis === 'horizontal'
      ? { x: midpoint.x, y: midpoint.y - probeDistance }
      : { x: midpoint.x - probeDistance, y: midpoint.y };

  const { points } = rayHits(geo.svgShape, origin, angle, probeDistance * 2);

  if (points.length === 0) {
    return {
      thickness: 0,
      hits: [],
      confidence: 0,
      failureReason: 'no_hits',
    };
  }

  // Pair points along the probe axis. rayHits returns them already sorted along
  // the ray direction, so consecutive pairs (0,1), (2,3), … are filled spans.
  const probeAxisOf = (p: Point2D): number =>
    dominantAxis === 'horizontal' ? p.y : p.x;

  const targetCoord = probeAxisOf(midpoint);

  const pairs: HitPair[] = [];
  for (let i = 0; i + 1 < points.length; i += 2) {
    const a = points[i];
    const b = points[i + 1];
    const aCoord = probeAxisOf(a);
    const bCoord = probeAxisOf(b);
    const lo = Math.min(aCoord, bCoord);
    const hi = Math.max(aCoord, bCoord);
    pairs.push({
      near: aCoord <= bCoord ? a : b,
      far: aCoord <= bCoord ? b : a,
      thickness: hi - lo,
      midOnProbe: (lo + hi) / 2,
      containsMidpoint: targetCoord >= lo && targetCoord <= hi,
    });
  }

  if (pairs.length < minHitPairs) {
    return {
      thickness: 0,
      hits: points,
      confidence: 0,
      failureReason: 'insufficient_pairs',
    };
  }

  // Prefer the pair containing the midpoint. If multiple contain it (nested
  // contours), prefer the one whose midpoint is closest. If none contain it,
  // pick the pair whose midpoint is closest to the target coordinate — but
  // flag that as ambiguous.
  const containing = pairs.filter((p) => p.containsMidpoint);
  const distance = (p: HitPair): number => Math.abs(p.midOnProbe - targetCoord);

  let chosen: HitPair;
  let containsMidpoint: boolean;
  if (containing.length > 0) {
    chosen = containing.reduce((best, p) =>
      distance(p) < distance(best) ? p : best
    );
    containsMidpoint = true;
  } else {
    chosen = pairs.reduce((best, p) =>
      distance(p) < distance(best) ? p : best
    );
    containsMidpoint = false;
  }

  // Confidence model:
  //   - 1.0 when a single pair contains the midpoint (clean stroke crossing)
  //   - 0.85 when 2 pairs and one contains midpoint (mild ambiguity, e.g., a
  //     stroke and a counter wall both crossed)
  //   - 0.6 when 3+ pairs and one contains midpoint (significant ambiguity)
  //   - 0.4 when no pair contains midpoint but the nearest is within the
  //     chosen pair's thickness (probe glanced past — usable but uncertain)
  //   - 0.2 otherwise (probe missed the candidate region entirely)
  // This is intentionally coarse — finer tuning belongs in the future
  // feature-level scoring layer, not in the local measurement primitive.
  let confidence: number;
  let failureReason: ThicknessFailureReason | undefined;
  if (containsMidpoint) {
    if (pairs.length === 1) confidence = 1;
    else if (pairs.length === 2) confidence = 0.85;
    else confidence = 0.6;
  } else {
    failureReason = 'ambiguous_pairs';
    confidence = distance(chosen) <= chosen.thickness ? 0.4 : 0.2;
  }

  return {
    thickness: chosen.thickness,
    hits: points,
    confidence,
    failureReason,
  };
}
