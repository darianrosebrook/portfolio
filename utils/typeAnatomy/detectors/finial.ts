/** Non-serif, non-ball endings identified by their cap and opposing walls. */
import {
  containsFilledPoint,
  getFilledGeometry,
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

export function detectFinial(geo: GeometryCache): FeatureInstance[] {
  if (!geo.glyph?.path?.commands?.length || !geo.glyph.bbox) return [];
  const filled = geo.filled ?? getFilledGeometry(geo.glyph);
  const result: FeatureInstance[] = [];
  const stem = geo.scale.stemWidth;
  for (let i = 1; i < geo.segments.length - 1; i++) {
    const segment = geo.segments[i];
    if (segment.type !== 'lineTo' || segment.params.length !== 2) continue;
    const [a, b] = segment.params;
    const width = Math.hypot(b.x - a.x, b.y - a.y);
    if (width < filled.tolerance * 2 || width > stem * 1.8) continue;
    const previous = geo.segments[i - 1],
      next = geo.segments[i + 1];
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
    // A straight stem foot has parallel straight walls. Curved walls or
    // a measurable taper establish the shaped ending after cap identity.
    const adjoiningCurve = [-1, 1].some((direction) => {
      let distance = 0;
      for (
        let j = i + direction;
        j > 0 && j < geo.segments.length;
        j += direction
      ) {
        const wall = geo.segments[j];
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
    const tapered = incoming.x * outgoing.x + incoming.y * outgoing.y > -0.98;
    if (!adjoiningCurve && !tapered) continue;
    const normal = { x: -along.y, y: along.x };
    const anchor = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    // Straight tapered projections on a serif face at a stem's metric
    // extremity are serif feet. Identity came from opposing walls first;
    // metric proximity only disambiguates that terminal classification.
    if (
      !adjoiningCurve &&
      geo.context.isSerif &&
      [geo.metrics.baseline, geo.metrics.capHeight, geo.metrics.xHeight].some(
        (y) => Math.abs(anchor.y - y) < width * 2
      )
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
          ending: 'flat-or-tapered',
          boundary: 'occupied-outline',
        },
      });
      break;
    }
  }
  return result;
}
