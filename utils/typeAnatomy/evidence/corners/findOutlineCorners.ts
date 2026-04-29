/**
 * Outline-corner extraction.
 *
 * Walks a closed polygon's vertices and emits a `CornerSample` per vertex,
 * carrying the geometric data downstream predicates and detectors need:
 * the corner point, the unit tangent of the segment ending at it, the unit
 * tangent of the segment leaving it, the signed turn angle, and the unit
 * vector pointing into the polygon's interior at that corner.
 *
 * The extractor is anatomy-neutral. It does not classify a corner as
 * apex / vertex / crotch — that mapping happens in detectors. It also
 * does not filter by sharpness; every vertex becomes a sample. Filtering
 * lives in `cornerPredicates.ts`.
 *
 * Winding is auto-detected from the points using the standard shoelace
 * formula (positive area = CCW in math coords / Y-up font coords). Note:
 * `geometryCache.calculateSignedArea` uses an inverted convention where
 * positive = CW; the corner library deliberately uses the standard
 * convention so synthetic test fixtures can be reasoned about without
 * reference to fontkit semantics.
 */

import type { Point2D } from '../../types';

/**
 * One corner sample per polygon vertex.
 *
 * Sign conventions:
 * - `signedTurnAngle`: radians in (-π, π]. Positive = CCW turn (left turn).
 *   A value of 0 means the path continues straight; ±π means a 180° about-face.
 * - `interiorDirection`: a unit vector pointing into the polygon's interior
 *   from the corner point. Computed from the inward normals of the incoming
 *   and outgoing edges, so it is correct for both convex and concave vertices.
 * - `contourWinding`: the parent contour's winding under the standard shoelace
 *   convention. +1 = CCW, -1 = CW. Used by predicates that need to distinguish
 *   convex (turn-sign matches winding) from concave (turn-sign opposes winding).
 */
export interface CornerSample {
  point: Point2D;
  pointIndex: number;
  incomingTangent: Point2D;
  outgoingTangent: Point2D;
  signedTurnAngle: number;
  interiorDirection: Point2D;
  contourWinding: 1 | -1;
}

/**
 * Extract one CornerSample per vertex of a closed polygon.
 *
 * - `points` must be the polygon's vertex list in walk order, with NO
 *   duplicate closing vertex at the end (the closing edge from the last
 *   point back to the first is implicit).
 * - Polygons with fewer than 3 vertices return [].
 * - Degenerate consecutive points (zero-length incoming or outgoing edge)
 *   are skipped — the corresponding vertex produces no sample.
 */
export function findOutlineCorners(points: Point2D[]): CornerSample[] {
  if (points.length < 3) return [];

  const winding = computeWinding(points);
  const samples: CornerSample[] = [];
  const n = points.length;

  for (let i = 0; i < n; i++) {
    const prev = points[(i - 1 + n) % n];
    const curr = points[i];
    const next = points[(i + 1) % n];

    const incoming = unitVec(curr.x - prev.x, curr.y - prev.y);
    const outgoing = unitVec(next.x - curr.x, next.y - curr.y);
    if (!incoming || !outgoing) continue;

    const incomingAngle = Math.atan2(incoming.y, incoming.x);
    const outgoingAngle = Math.atan2(outgoing.y, outgoing.x);
    let turn = outgoingAngle - incomingAngle;
    while (turn > Math.PI) turn -= 2 * Math.PI;
    while (turn <= -Math.PI) turn += 2 * Math.PI;

    // Inward normal of an edge: rotate tangent 90° toward the polygon
    // interior. For CCW (winding=+1), interior is on the left, so rotate
    // CCW: (x,y) → (-y,x). For CW (winding=-1), rotate CW: (x,y) → (y,-x).
    const inwardIn = inwardNormal(incoming, winding);
    const inwardOut = inwardNormal(outgoing, winding);
    const interiorRaw = {
      x: inwardIn.x + inwardOut.x,
      y: inwardIn.y + inwardOut.y,
    };
    const interiorDirection = unitVec(interiorRaw.x, interiorRaw.y) ?? {
      x: 0,
      y: 0,
    };

    samples.push({
      point: { x: curr.x, y: curr.y },
      pointIndex: i,
      incomingTangent: incoming,
      outgoingTangent: outgoing,
      signedTurnAngle: turn,
      interiorDirection,
      contourWinding: winding,
    });
  }

  return samples;
}

/**
 * Compute the polygon's winding via the standard shoelace formula.
 *
 * Returns +1 for CCW (positive signed area in math coords / Y-up font coords)
 * and -1 for CW. Degenerate (zero-area) polygons are reported as +1 to
 * avoid throwing — callers that care should validate input upstream.
 */
function computeWinding(points: Point2D[]): 1 | -1 {
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return sum >= 0 ? 1 : -1;
}

function unitVec(x: number, y: number): Point2D | null {
  const mag = Math.sqrt(x * x + y * y);
  if (mag < 1e-10) return null;
  return { x: x / mag, y: y / mag };
}

function inwardNormal(t: Point2D, winding: 1 | -1): Point2D {
  // CCW polygon: interior on left of walk direction → rotate +90° (CCW).
  // CW polygon: interior on right of walk direction → rotate -90° (CW).
  return winding === 1 ? { x: -t.y, y: t.x } : { x: t.y, y: -t.x };
}
