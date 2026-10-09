/** Open counter regions bounded by the occupied outline and their mouth. */
import { getFilledGeometry } from '@/utils/geometry/filledGeometry';
import type { FeatureInstance, GeometryCache, Point2D } from '../types';

function cross(a: Point2D, b: Point2D, c: Point2D): number {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

/** Hull vertices retain outline indices so the recess follows the real wall. */
function hullIndices(points: Point2D[]): number[] {
  const sorted = points
    .map((_, i) => i)
    .sort((a, b) => points[a].x - points[b].x || points[a].y - points[b].y);
  const half = (indices: number[]) => {
    const result: number[] = [];
    for (const i of indices) {
      while (
        result.length > 1 &&
        cross(
          points[result[result.length - 2]],
          points[result[result.length - 1]],
          points[i]
        ) <= 0
      )
        result.pop();
      result.push(i);
    }
    return result;
  };
  return [
    ...half(sorted).slice(0, -1),
    ...half([...sorted].reverse()).slice(0, -1),
  ];
}

export function detectAperture(geo: GeometryCache): FeatureInstance[] {
  if (!geo.glyph?.path?.commands?.length || !geo.glyph.bbox) return [];
  const filled = geo.filled ?? getFilledGeometry(geo.glyph);
  const instances: FeatureInstance[] = [];
  for (const body of filled.bodies) {
    const points = body.points;
    const hull = hullIndices(points);
    const hullSet = new Set(hull);
    const width = body.bbox.maxX - body.bbox.minX;
    const height = body.bbox.maxY - body.bbox.minY;
    for (let h = 0; h < hull.length; h++) {
      const start = hull[h],
        end = hull[(h + 1) % hull.length];
      let pocket: Point2D[] = [];
      for (const direction of [1, -1]) {
        const arc = [points[start]];
        let i = (start + direction + points.length) % points.length;
        while (i !== end && !hullSet.has(i) && arc.length <= points.length) {
          arc.push(points[i]);
          i = (i + direction + points.length) % points.length;
        }
        if (i === end) {
          arc.push(points[end]);
          if (arc.length > pocket.length) pocket = arc;
        }
      }
      if (pocket.length < 6) continue;
      const a = points[start],
        b = points[end];
      if (Math.min(a.y, b.y) < geo.metrics.baseline - geo.scale.eps) continue;
      const mouthLength = Math.hypot(b.x - a.x, b.y - a.y);
      // Counter mouths open sideways. Recesses at the crown, baseline,
      // and shallow serif notches do not have an enclosing counter wall.
      if (
        Math.abs(b.y - a.y) < Math.abs(b.x - a.x) * 0.8 ||
        mouthLength < height * 0.01
      )
        continue;
      const depth = Math.max(
        ...pocket.map((p) => Math.abs(cross(a, b, p)) / mouthLength)
      );
      // Counter-like recesses sit in the body. A descender hook or the
      // whitespace beside p/q reaches its deepest point below the body.
      if (
        !pocket.some(
          (p) =>
            p.y >= geo.metrics.baseline + height * 0.08 &&
            Math.abs(cross(a, b, p)) / mouthLength >= depth * 0.8
        ) ||
        mouthLength > depth * 3
      )
        continue;
      let area = 0;
      for (let i = 0; i < pocket.length; i++) {
        const p = pocket[i],
          q = pocket[(i + 1) % pocket.length];
        area += p.x * q.y - q.x * p.y;
      }
      if (depth < width * 0.2 || Math.abs(area) / 2 < width * height * 0.005)
        continue;
      instances.push({
        id: 'aperture',
        shape: { type: 'polyline', points: pocket },
        region: { kind: 'enclosed', points: pocket },
        confidence: 0.9,
        anchors: {
          mouthTop: a.y > b.y ? a : b,
          mouthBottom: a.y > b.y ? b : a,
        },
        debug: {
          depth,
          mouthLength,
          side:
            (a.x + b.x) / 2 > (body.bbox.minX + body.bbox.maxX) / 2
              ? 'right'
              : 'left',
          boundary: 'occupied-outline',
        },
      });
    }
  }
  return instances;
}
