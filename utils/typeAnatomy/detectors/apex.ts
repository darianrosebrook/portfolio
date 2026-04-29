/**
 * Apex feature detector.
 *
 * An apex is the topmost meeting point of two strokes (e.g., A, M, N, W).
 * Replaces the previous ray-cast-from-interior implementation, which
 * confused stroke-extreme separation with apex-tip separation and
 * misclassified Nohemi `A`'s sharp apex as a flat ridge (emitting two
 * `line` shapes near the top instead of one `point`).
 *
 * Implementation consumes the corner evidence family
 * (utils/typeAnatomy/evidence/corners). Pipeline:
 *
 *   1. Walk every base contour and extract corner samples.
 *   2. Filter to sharp exterior corners in the top band whose interior
 *      direction points downward (apex's polygon interior is below the
 *      sharp tip).
 *   3. Coalesce near-coincident candidates so a corner that registers
 *      on multiple endpoint pairs (rare but possible on outline-quirky
 *      glyphs) collapses to one apex.
 *
 * Italic angle compensation is intentionally absent: corner extraction
 * is geometry-based, not ray-based, so slanted glyphs do not mis-aim
 * probes. Whether the polygon is upright or italic, a sharp turn at the
 * top is still a sharp turn.
 */

import type { FeatureInstance, GeometryCache } from '../types';
import {
  dedupeNearbyCorners,
  extractContourCorners,
  interiorPointsDown,
  isInTopBand,
  isSharpExteriorCorner,
} from '../evidence/corners';

export function detectApex(geo: GeometryCache): FeatureInstance[] {
  const { glyph, segments, contours, scale } = geo;
  if (!glyph?.path?.commands || !glyph.bbox) {
    return [];
  }

  const candidates = contours
    .filter((c) => c.type === 'base')
    .flatMap((c) => extractContourCorners(c, segments))
    .filter(
      (c) =>
        isSharpExteriorCorner(c) &&
        isInTopBand(c, glyph.bbox) &&
        interiorPointsDown(c)
    );

  // Coalesce clusters within a stem-width or 5% of glyph width — whichever
  // is larger. Two candidates closer than this are almost certainly the
  // same apex registered twice (e.g., an apex with a tiny chamfered tip
  // produces two adjacent sharp corners that should merge to one).
  const dedupeThreshold = Math.max(scale.stemWidth, scale.bboxW * 0.05);
  const apexes = dedupeNearbyCorners(candidates, dedupeThreshold);

  return apexes.map((c) => ({
    id: 'apex',
    shape: {
      type: 'point',
      x: c.point.x,
      y: c.point.y,
      label: 'Apex',
    },
    confidence: 0.9,
    anchors: {
      tip: { x: c.point.x, y: c.point.y },
    },
    debug: {
      source: 'corner-evidence',
      turnAngleDeg: (c.signedTurnAngle * 180) / Math.PI,
      contourWinding: c.contourWinding,
    },
  }));
}
