/**
 * Vertex feature detector.
 *
 * A vertex is the bottommost meeting point of two strokes (e.g., V, W, Y).
 * Mirror of the apex detector: same pipeline, opposite band, opposite
 * interior direction. Replaces the previous ray-cast-from-interior
 * implementation which emitted two `line` shapes near the baseline of
 * Nohemi `V` instead of one `point`.
 *
 * Pipeline:
 *   1. Walk every base contour and extract corner samples.
 *   2. Filter to sharp exterior corners in the bottom band whose interior
 *      direction points upward (a vertex's polygon interior is above the
 *      sharp tip).
 *   3. Coalesce near-coincident candidates.
 *
 * Italic angle compensation is intentionally absent for the same reason
 * as in the apex detector: corner extraction is geometry-based.
 */

import type { FeatureInstance, GeometryCache } from '../types';
import {
  dedupeNearbyCorners,
  extractContourCorners,
  interiorPointsUp,
  isInBottomBand,
  isSharpExteriorCorner,
} from '../evidence/corners';

export function detectVertex(geo: GeometryCache): FeatureInstance[] {
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
        isInBottomBand(c, glyph.bbox) &&
        interiorPointsUp(c)
    );

  const dedupeThreshold = Math.max(scale.stemWidth, scale.bboxW * 0.05);
  const vertices = dedupeNearbyCorners(candidates, dedupeThreshold);

  return vertices.map((c) => ({
    id: 'vertex',
    shape: {
      type: 'point',
      x: c.point.x,
      y: c.point.y,
      label: 'Vertex',
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
