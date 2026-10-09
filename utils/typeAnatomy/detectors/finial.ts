/** Non-serif, non-ball endings identified by their cap and opposing walls. */
import {
  containsFilledPoint,
  getFilledGeometry,
  occupiedRayIntervals,
} from '@/utils/geometry/filledGeometry';
import type {
  FeatureInstance,
  GeometryCache,
  Point2D,
  SegmentWithMeta,
} from '../types';

function unit(a: Point2D, b: Point2D): Point2D {
  const length = Math.hypot(b.x - a.x, b.y - a.y);
  if (!length) return { x: 0, y: 0 };
  return { x: (b.x - a.x) / length, y: (b.y - a.y) / length };
}
function tangent(segment: SegmentWithMeta, end: boolean): Point2D | null {
  const p = segment.params;
  if (p.length < 2) return null;
  return end ? unit(p[p.length - 2], p[p.length - 1]) : unit(p[0], p[1]);
}
function walk(
  points: Point2D[],
  start: number,
  direction: number,
  budget: number
): Point2D[] {
  const result: Point2D[] = [points[start]];
  let distance = 0,
    current = start;
  for (let step = 0; step < points.length - 1; step++) {
    const next = (current + direction + points.length) % points.length;
    const a = points[current],
      b = points[next];
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    if (distance + length > budget) {
      const t = (budget - distance) / length;
      result.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
      break;
    }
    result.push(b);
    distance += length;
    current = next;
  }
  return result;
}

/** Materialize the implicit closing edge and retain cyclic source neighbors.
 * A cap can be the first line or the closing line of a contour; move/close
 * markers are traversal syntax, not walls adjoining that ending.
 */
function closedEdges(segments: SegmentWithMeta[]): SegmentWithMeta[][] {
  const contours: SegmentWithMeta[][] = [];
  let edges: SegmentWithMeta[] = [],
    start: Point2D | undefined;
  for (const segment of segments) {
    if (segment.type === 'moveTo') {
      edges = [];
      start = segment.params[0];
    } else if (segment.type === 'closePath') {
      const end = edges[edges.length - 1]?.params.at(-1);
      if (start && end && (start.x !== end.x || start.y !== end.y))
        edges.push({ type: 'lineTo', params: [end, start] });
      if (edges.length >= 3) contours.push(edges);
      edges = [];
      start = undefined;
    } else if (start) edges.push(segment);
  }
  return contours;
}

export function detectFinial(geo: GeometryCache): FeatureInstance[] {
  if (!geo.glyph?.path?.commands?.length || !geo.glyph.bbox) return [];
  const filled = geo.filled ?? getFilledGeometry(geo.glyph);
  const result: FeatureInstance[] = [];
  const stem = geo.scale.stemWidth;
  for (const edges of closedEdges(geo.segments)) {
    for (let i = 0; i < edges.length; i++) {
      const segment = edges[i];
      if (segment.type !== 'lineTo' || segment.params.length !== 2) continue;
      const [a, b] = segment.params;
      const width = Math.hypot(b.x - a.x, b.y - a.y);
      if (width < filled.tolerance * 2 || width > stem * 1.8) continue;
      const previous = edges[(i - 1 + edges.length) % edges.length],
        next = edges[(i + 1) % edges.length];
      const incoming = tangent(previous, true),
        outgoing = tangent(next, false);
      if (
        !incoming ||
        !outgoing ||
        incoming.x * outgoing.x + incoming.y * outgoing.y > -0.6
      )
        continue;
      const along = unit(a, b);
      if (
        Math.abs(incoming.x * along.x + incoming.y * along.y) > 0.5 ||
        Math.abs(outgoing.x * along.x + outgoing.y * along.y) > 0.5
      )
        continue;
      // Curves and taper can shape a cap, but canonical finials also include
      // flat non-serif endings on straight strokes. Opposed walls establish
      // ending identity independently of those optional shape characteristics.
      const adjoiningCurve = [-1, 1].some((direction) => {
        let distance = 0;
        for (let step = 1; step < edges.length; step++) {
          const wall =
            edges[(i + direction * step + edges.length) % edges.length];
          if (wall.type.includes('Curve')) return true;
          if (wall.type !== 'lineTo' || wall.params.length !== 2) break;
          distance += Math.hypot(
            wall.params[1].x - wall.params[0].x,
            wall.params[1].y - wall.params[0].y
          );
          if (distance > width * 2) break;
        }
        return false;
      });
      const normal = { x: -along.y, y: along.x };
      const anchor = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      // A lateral toe attached to a nearby upright at the baseline is a serif
      // foot even when its brackets are curved. A curved letter ending without
      // that source-wall attachment retains its finial identity.
      const curvedFoot =
        adjoiningCurve &&
        Math.abs(along.y) > 0.8 &&
        Math.abs(anchor.y - geo.metrics.baseline) < width * 2 &&
        edges.some((wall) => {
          if (wall.type !== 'lineTo' || wall.params.length !== 2) return false;
          const [p, q] = wall.params;
          return (
            Math.abs(p.x - q.x) <= geo.scale.eps &&
            Math.abs(p.y - q.y) > width * 2 &&
            Math.abs(p.x - anchor.x) < width * 6 &&
            Math.min(p.y, q.y) >= geo.metrics.baseline - width &&
            Math.min(p.y, q.y) <= anchor.y + width * 6
          );
        });
      if (
        geo.context.isSerif &&
        (curvedFoot ||
          (!adjoiningCurve &&
            [
              geo.metrics.baseline,
              geo.metrics.capHeight,
              geo.metrics.xHeight,
            ].some((y) => Math.abs(anchor.y - y) < width * 2)))
      )
        continue;
      const probe = Math.min(width, stem) * 0.15;
      const positive = containsFilledPoint(filled, {
        x: anchor.x + normal.x * probe,
        y: anchor.y + normal.y * probe,
      });
      const negative = containsFilledPoint(filled, {
        x: anchor.x - normal.x * probe,
        y: anchor.y - normal.y * probe,
      });
      if (positive === negative) continue;
      const inward = {
        x: anchor.x + normal.x * probe * (positive ? 1 : -1),
        y: anchor.y + normal.y * probe * (positive ? 1 : -1),
      };
      // The cap bounds the same occupied stroke immediately behind it. A
      // connector edge can have opposed gap walls from two different stems;
      // its interior scanline continues past both walls into those stems.
      const offset = geo.scale.overshoot / 2;
      const occupied = occupiedRayIntervals(
        filled,
        { x: inward.x - along.x * offset, y: inward.y - along.y * offset },
        Math.atan2(along.y, along.x),
        geo.scale.overshoot
      ).find((span) => span.start <= offset && span.end >= offset);
      if (!occupied || occupied.end - occupied.start > width * 1.8) continue;

      // Locate the cap on the canonical occupied boundary; internal seams
      // from overlapping source contours never become visible terminals.
      for (const body of filled.bodies) {
        const start = body.points.findIndex(
          (p) => Math.hypot(p.x - a.x, p.y - a.y) < 0.5
        );
        const end = body.points.findIndex(
          (p) => Math.hypot(p.x - b.x, p.y - b.y) < 0.5
        );
        if (start < 0 || end < 0) continue;
        const direction =
          (start + 1) % body.points.length === end
            ? 1
            : (start - 1 + body.points.length) % body.points.length === end
              ? -1
              : 0;
        if (!direction) continue;
        const budget = Math.min(stem, width) * 0.65;
        const firstWall = walk(body.points, start, -direction, budget);
        const secondWall = walk(body.points, end, direction, budget);
        const points = [...firstWall.reverse(), ...secondWall];
        result.push({
          id: 'finial',
          shape: { type: 'point', ...anchor, label: 'Finial' },
          region: { kind: 'stroke', points },
          confidence: 0.9,
          anchors: { position: anchor, capStart: a, capEnd: b },
          debug: {
            capWidth: width,
            ending: adjoiningCurve ? 'shaped' : 'flat-or-tapered',
            boundary: 'occupied-outline',
          },
        });
        break;
      }
    }
  }
  return result;
}
