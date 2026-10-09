/** Descender loops follow the filled boundary, including their inner wall. */
import {
  getFilledGeometry,
  occupiedRayIntervals,
} from '@/utils/geometry/filledGeometry';
import type { FeatureInstance, GeometryCache, Point2D } from '../types';

function below(points: Point2D[], y: number): Point2D[] {
  const result: Point2D[] = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[i],
      b = points[(i + 1) % points.length];
    if (a.y <= y) result.push(a);
    if (a.y <= y !== b.y <= y) {
      const t = (y - a.y) / (b.y - a.y);
      result.push({ x: a.x + (b.x - a.x) * t, y });
    }
  }
  return result;
}

export function detectLoop(geo: GeometryCache): FeatureInstance[] {
  if (!geo.glyph?.path?.commands?.length || !geo.glyph.bbox) return [];
  const filled = geo.filled ?? getFilledGeometry(geo.glyph);
  const baseline = geo.metrics.baseline;
  const depth = baseline - geo.glyph.bbox.minY;
  if (depth < geo.scale.bboxH * 0.1) return [];
  let pairedLevels = 0;
  // A loop has separated walls below the baseline and a bottom joining
  // stroke. A descender stem alone cannot supply this signature.
  for (let i = 1; i < 12; i++) {
    const y = baseline - (depth * i) / 12;
    const spans = occupiedRayIntervals(
      filled,
      { x: geo.glyph.bbox.minX - 1, y },
      0,
      geo.scale.bboxW + 2
    );
    if (
      spans.some(
        (span, j) =>
          j > 0 && span.near.x - spans[j - 1].far.x > geo.scale.bboxW * 0.12
      )
    )
      pairedLevels++;
  }
  if (pairedLevels < 2) return [];
  return filled.bodies
    .map((body, bodyIndex) => ({ body, bodyIndex }))
    .filter(({ body }) => body.bbox.minY < baseline - depth * 0.5)
    .map(({ body, bodyIndex }) => {
      let points = below(body.points, baseline);
      for (const hole of filled.enclosedRegions.filter(
        (region) =>
          region.bodyIndex === bodyIndex && region.bbox.maxY <= baseline
      )) {
        let outer = 0,
          inner = 0,
          distance = Infinity;
        for (let i = 0; i < points.length; i++)
          for (let j = 0; j < hole.points.length; j++) {
            const d = Math.hypot(
              points[i].x - hole.points[j].x,
              points[i].y - hole.points[j].y
            );
            if (d < distance) {
              distance = d;
              outer = i;
              inner = j;
            }
          }
        const cycle = [
          ...hole.points.slice(inner),
          ...hole.points.slice(0, inner),
          hole.points[inner],
        ];
        points = [
          ...points.slice(0, outer + 1),
          ...cycle,
          points[outer],
          ...points.slice(outer + 1),
        ];
      }
      return points;
    })
    .filter((points) => points.length >= 3)
    .map((points) => ({
      id: 'loop',
      shape: { type: 'polyline', points },
      region: { kind: 'stroke', points },
      confidence: 0.9,
      debug: { pairedLevels, boundary: 'occupied-descender' },
    }));
}
