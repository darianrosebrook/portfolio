/** Descending stroke bands follow occupied ink, rather than outer boundaries. */
import {
  getFilledGeometry,
  occupiedRayIntervals,
} from '@/utils/geometry/filledGeometry';
import type { FeatureInstance, GeometryCache, Point2D } from '../types';

export function detectTail(geo: GeometryCache): FeatureInstance[] {
  const { glyph, metrics, scale } = geo;
  if (!glyph?.path?.commands?.length || !glyph.bbox) return [];
  const filled = geo.filled ?? getFilledGeometry(glyph);
  const body = [...filled.bodies].sort((a, b) => b.area - a.area)[0];
  if (
    !body ||
    body.bbox.minY >=
      metrics.baseline - (metrics.baseline - metrics.descent) * 0.15
  )
    return [];
  // A closed descending enclosure is a loop, not a tail.
  const cavities = filled.enclosedRegions.filter(
    (hole) => hole.bodyIndex === filled.bodies.indexOf(body)
  );
  if (
    cavities.some(
      (hole) =>
        hole.bbox.minY < metrics.baseline &&
        hole.bbox.maxY < metrics.xHeight * 0.5
    )
  )
    return [];
  const upperCavity = cavities.find(
    (hole) => hole.bbox.minY >= metrics.baseline
  );
  const top = upperCavity
    ? Math.min(
        upperCavity.bbox.minY +
          (upperCavity.bbox.maxY - upperCavity.bbox.minY) * 0.25,
        metrics.baseline + scale.bboxH * 0.2
      )
    : metrics.baseline;
  const height = top - body.bbox.minY;
  const left: Point2D[] = [],
    right: Point2D[] = [],
    midpoints: Point2D[] = [];
  let previous: Point2D | undefined;
  for (let i = 0; i <= 64; i++) {
    const y = body.bbox.minY + scale.eps + ((height - scale.eps * 2) * i) / 64;
    const spans = occupiedRayIntervals(
      filled,
      { x: body.bbox.minX - scale.eps, y },
      0,
      scale.overshoot
    );
    const span = [...spans].sort((a, b) => {
      const ax = (a.near.x + a.far.x) / 2,
        bx = (b.near.x + b.far.x) / 2;
      return previous
        ? Math.abs(ax - previous.x) - Math.abs(bx - previous.x)
        : bx - ax;
    })[0];
    if (!span) continue;
    const point = { x: (span.near.x + span.far.x) / 2, y };
    // A sudden widening means the descending branch has reached the bowl.
    const width = span.far.x - span.near.x;
    const lastWidth = left.length
      ? right[right.length - 1].x - left[left.length - 1].x
      : width;
    if (
      upperCavity &&
      left.length > 8 &&
      width > Math.max(lastWidth * 1.6, scale.bboxW * 0.5)
    )
      break;
    left.push(upperCavity ? span.near : spans[0].near);
    right.push(upperCavity ? span.far : spans[spans.length - 1].far);
    midpoints.push(point);
    previous = point;
  }
  if (midpoints.length < 8) return [];
  // A straight vertical descender is a stem. Curvature or diagonal motion
  // establishes the tail's descending stroke identity.
  const horizontalTravel =
    Math.max(...midpoints.map((p) => p.x)) -
    Math.min(...midpoints.map((p) => p.x));
  if (horizontalTravel < scale.eps * 3) return [];
  return [
    {
      id: 'tail',
      shape: { type: 'polyline', points: midpoints },
      region: { kind: 'stroke', points: [...left, ...right.reverse()] },
      confidence: 0.85,
      anchors: { start: midpoints[midpoints.length - 1], end: midpoints[0] },
      debug: { source: 'descending-occupied-band' },
    },
  ];
}
