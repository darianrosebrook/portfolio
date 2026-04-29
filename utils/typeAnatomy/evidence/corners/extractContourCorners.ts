/**
 * Cache adapter: walks a `ContourClassification`'s segment range and feeds
 * the resulting endpoint polygon into `findOutlineCorners`.
 *
 * Endpoint extraction matches `geometryCache.classifyContours` pass 1: only
 * the endpoint of each segment is collected; Bezier control points are
 * intentionally skipped so they do not register as vertices. For glyphs
 * built from straight-line segments (Nohemi `A`, `V`), this produces the
 * exact polygon. For glyphs with curve segments, the resulting polygon is
 * a corner approximation of the curve — sharp corners on the actual outline
 * survive (curves between corners flatten to single line segments, but the
 * corners themselves are preserved as endpoint pairs).
 */

import type {
  ContourClassification,
  Point2D,
  SegmentWithMeta,
} from '../../types';
import { findOutlineCorners, type CornerSample } from './findOutlineCorners';

export function extractContourCorners(
  contour: ContourClassification,
  segments: SegmentWithMeta[]
): CornerSample[] {
  const points = collectContourPoints(contour, segments);
  return findOutlineCorners(points);
}

/**
 * Public helper: extract just the polygon vertex sequence from a contour,
 * without computing corners. Useful for tests and for detectors that need
 * the raw polygon for their own analysis.
 */
export function collectContourPoints(
  contour: ContourClassification,
  segments: SegmentWithMeta[]
): Point2D[] {
  const points: Point2D[] = [];
  for (let i = contour.startIndex; i <= contour.endIndex; i++) {
    const seg = segments[i];
    if (!seg) continue;
    if (seg.type === 'moveTo' && seg.params.length > 0) {
      points.push({ x: seg.params[0].x, y: seg.params[0].y });
    } else if (seg.type === 'lineTo' && seg.params.length >= 2) {
      points.push({ x: seg.params[1].x, y: seg.params[1].y });
    } else if (seg.type === 'quadraticCurveTo' && seg.params.length >= 3) {
      points.push({ x: seg.params[2].x, y: seg.params[2].y });
    } else if (seg.type === 'bezierCurveTo' && seg.params.length >= 4) {
      points.push({ x: seg.params[3].x, y: seg.params[3].y });
    }
  }
  return points;
}
