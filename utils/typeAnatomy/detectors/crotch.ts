/**
 * Crotch feature detector.
 *
 * A crotch is the interior junction where two strokes meet sharply:
 * - On `A`, the underside of the `^` (an upper interior crotch).
 * - On `V`, the bottom-center where the two diagonals meet (a lower
 *   interior crotch — the same geometric event reported by detectVertex,
 *   re-classified under crotch vocabulary).
 *
 * Replaces the previous Y-band / X-sampling / baseline-fallback chain
 * which returned zero crotches on Nohemi `A` and `V` because the
 * sampling grid never aligned with the V tip and because vertical rays
 * cast upward from below cannot reach the inside of an `A`'s upper
 * angle.
 *
 * Pipeline:
 *   1. Walk every base contour and extract corner samples.
 *   2. Filter to sharp exterior corners that sit in either the top or
 *      bottom band, with their interior direction pointing into the
 *      glyph body (top-band corners with interior down; bottom-band
 *      corners with interior up).
 *   3. Coalesce near-coincident candidates.
 *
 * Per TYPEANATOMY-003's vocabulary-divergence invariant, crotch may
 * report the same geometric event already covered by detectApex (top
 * crotch on `A`) or detectVertex (bottom crotch on `V`). That is
 * intentional — crotch is the typographic frame for "interior junction,"
 * which on stroke-meeting glyphs coincides with the sharp turn already
 * surfaced as apex/vertex.
 */

import type { FeatureInstance, GeometryCache } from '../types';
import {
  dedupeNearbyCorners,
  extractContourCorners,
  inJunctionCluster,
  interiorPointsDown,
  interiorPointsUp,
  isInBottomBand,
  isInTopBand,
  isSharpExteriorCorner,
} from '../evidence/corners';

export function detectCrotch(geo: GeometryCache): FeatureInstance[] {
  const { glyph, segments, contours, scale } = geo;
  if (!glyph?.path?.commands || !glyph.bbox) {
    return [];
  }

  // Junction filter: a crotch is where two strokes converge into a sharp
  // pair of adjacent corners. Isolated sharp corners (e.g., A's outer
  // feet, V's outer top corners) are stroke terminations, not junctions,
  // and must be rejected. inJunctionCluster keeps only sharp corners whose
  // walk-adjacent predecessor or successor is also sharp — done per-contour
  // so adjacency is meaningful.
  const junctionMembers = contours
    .filter((c) => c.type === 'base')
    .flatMap((c) => {
      const corners = extractContourCorners(c, segments);
      return inJunctionCluster(corners);
    });

  const candidates = junctionMembers.filter((c) => {
    if (!isSharpExteriorCorner(c)) return false;
    const upperCrotch = isInTopBand(c, glyph.bbox) && interiorPointsDown(c);
    const lowerCrotch = isInBottomBand(c, glyph.bbox) && interiorPointsUp(c);
    return upperCrotch || lowerCrotch;
  });

  const dedupeThreshold = Math.max(scale.stemWidth, scale.bboxW * 0.05);
  const crotches = dedupeNearbyCorners(candidates, dedupeThreshold);

  return crotches.map((c) => ({
    id: 'crotch',
    shape: {
      type: 'point',
      x: c.point.x,
      y: c.point.y,
      label: 'Crotch',
    },
    confidence: 0.85,
    anchors: {
      position: { x: c.point.x, y: c.point.y },
    },
    debug: {
      source: 'corner-evidence',
      turnAngleDeg: (c.signedTurnAngle * 180) / Math.PI,
      band:
        c.point.y > (glyph.bbox.maxY + glyph.bbox.minY) / 2 ? 'top' : 'bottom',
    },
  }));
}
