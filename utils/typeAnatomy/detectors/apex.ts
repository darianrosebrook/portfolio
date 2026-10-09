/** Junctions are points on occupied boundaries, including flat or rounded tips. */
import {
  getFilledGeometry,
  occupiedRayIntervals,
  type FilledBoundary,
} from '@/utils/geometry/filledGeometry';
import type { Glyph } from 'fontkit';
import type {
  FeatureInstance,
  GeometryCache,
  Metrics,
  Point2D,
} from '../types';

export type JunctionKind = 'apex' | 'vertex' | 'crotch';

function walk(
  points: Point2D[],
  index: number,
  direction: 1 | -1,
  budget: number
): Point2D {
  let point = points[index];
  for (let step = 1; step < points.length; step++) {
    const next =
      points[(index + direction * step + points.length) % points.length];
    const length = Math.hypot(next.x - point.x, next.y - point.y);
    if (length >= budget && length > 0)
      return {
        x: point.x + ((next.x - point.x) * budget) / length,
        y: point.y + ((next.y - point.y) * budget) / length,
      };
    budget -= length;
    point = next;
  }
  return point;
}

/** Raw glyph evidence shared by the registered and legacy junction APIs. */
export function junctionPoints(
  glyph: Glyph,
  metrics: Metrics,
  kind: JunctionKind
): Point2D[] {
  if (!glyph?.path?.commands?.length || !glyph.bbox) return [];
  const filled = getFilledGeometry(glyph),
    result: Point2D[] = [];
  const tolerance = Math.max(
    filled.tolerance * 2,
    (glyph.bbox.maxY - glyph.bbox.minY) * 1e-5
  );
  const eligible = (body: FilledBoundary) =>
    body.bbox.minY < metrics.xHeight * 0.5 &&
    body.bbox.maxY - body.bbox.minY > metrics.xHeight * 0.5;
  const boundaries: Array<{ boundary: FilledBoundary; hole: boolean }> =
    filled.bodies
      .filter(eligible)
      .map((boundary) => ({ boundary, hole: false }));
  if (kind === 'crotch')
    boundaries.push(
      ...filled.enclosedRegions
        .filter(
          (hole) =>
            hole.bodyIndex !== undefined &&
            eligible(filled.bodies[hole.bodyIndex])
        )
        .map((boundary) => ({ boundary, hole: true }))
    );
  for (const { boundary, hole } of boundaries) {
    const points = boundary.points,
      height = boundary.bbox.maxY - boundary.bbox.minY;
    const signedArea = points.reduce((sum, a, i) => {
      const b = points[(i + 1) % points.length];
      return sum + a.x * b.y - b.x * a.y;
    }, 0);
    const winding = Math.sign(signedArea);
    for (let i = 0; i < points.length; i++) {
      const a = points[i],
        previous = points[(i - 1 + points.length) % points.length];
      // Process a horizontal plateau once, from its first point in walk order.
      if (Math.abs(previous.y - a.y) < tolerance) continue;
      let end = i;
      while (
        (end + 1) % points.length !== i &&
        Math.abs(points[(end + 1) % points.length].y - a.y) < tolerance
      )
        end = (end + 1) % points.length;
      if (kind === 'crotch' && Math.abs(points[end].x - a.x) > height * 0.1)
        continue;
      const b = points[end],
        before = points[(i - 1 + points.length) % points.length],
        after = points[(end + 1) % points.length];
      const upper = before.y < a.y - tolerance && after.y < b.y - tolerance;
      const lower = before.y > a.y + tolerance && after.y > b.y + tolerance;
      if (!upper && !lower) continue;
      if ((kind === 'apex' && !upper) || (kind === 'vertex' && !lower))
        continue;
      const incoming = { x: a.x - before.x, y: a.y - before.y },
        outgoing = { x: after.x - b.x, y: after.y - b.y };
      const turn = incoming.x * outgoing.y - incoming.y * outgoing.x;
      const convex = turn * winding > 0;
      if (kind === 'crotch' ? (hole ? !convex : convex) : !convex) continue;
      const first = walk(points, i, -1, height * 0.15),
        second = walk(points, end, 1, height * 0.15);
      const left = Math.min(a.x, b.x),
        right = Math.max(a.x, b.x);
      // Free end caps have both walls on the same side, or parallel walls.
      if (!(
        (first.x < left - tolerance && second.x > right + tolerance) ||
        (second.x < left - tolerance && first.x > right + tolerance)
      ))
        continue;
      const dy1 = first.y - a.y,
        dy2 = second.y - b.y;
      if (
        upper
          ? dy1 >= -height * 0.1 || dy2 >= -height * 0.1
          : dy1 <= height * 0.1 || dy2 <= height * 0.1
      )
        continue;
      const dx1 = first.x - a.x,
        dx2 = second.x - b.x;
      const angle = Math.acos(
        Math.max(
          -1,
          Math.min(
            1,
            (dx1 * dx2 + dy1 * dy2) /
              (Math.hypot(dx1, dy1) * Math.hypot(dx2, dy2))
          )
        )
      );
      if (angle > Math.PI * 0.48) continue;
      const point = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const supported = [0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85].some(
        (fraction) => {
          const y = point.y + (upper ? -1 : 1) * height * fraction;
          const spans = occupiedRayIntervals(
            filled,
            { x: boundary.bbox.minX - tolerance, y },
            0,
            boundary.bbox.maxX - boundary.bbox.minX + tolerance * 2
          );
          return spans.slice(0, -1).some((left, index) => {
            const right = spans[index + 1],
              gap = right.near.x - left.far.x;
            const center = (right.near.x + left.far.x) / 2;
            return (
              gap > tolerance &&
              Math.abs(center - point.x) <=
                Math.max(Math.abs(b.x - a.x) / 2, height * 0.15) &&
              Math.abs(point.x - left.far.x) < height * 0.4 &&
              Math.abs(right.near.x - point.x) < height * 0.4
            );
          });
        }
      );
      if (!supported) continue;
      if (
        !result.some(
          (existing) =>
            Math.hypot(existing.x - point.x, existing.y - point.y) <
            tolerance * 2
        )
      )
        result.push(point);
    }
  }
  return result;
}

export function detectApex(geo: GeometryCache): FeatureInstance[] {
  return junctionPoints(geo.glyph, geo.metrics, 'apex').map((point) => ({
    id: 'apex',
    shape: { type: 'point', ...point, label: 'Apex' },
    confidence: 0.9,
    anchors: { tip: point },
    debug: { source: 'occupied-diagonal-junction' },
  }));
}
