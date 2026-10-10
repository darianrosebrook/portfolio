/** Closed and partly enclosed negative space from the current occupied walls. */
import type { Font, Glyph } from 'fontkit';
import {
  getFilledGeometry,
  containsFilledPoint,
  occupiedRayIntervals,
  contourWinding,
  type FilledGeometry,
} from '@/utils/geometry/filledGeometry';
import { findOutlineCorners, isSharpExteriorCorner } from './corners';
import { flattenToSegments } from '../geometryCache';
import type {
  Metrics,
  Point2D,
  ScalePrimitives,
  SegmentWithMeta,
} from '../types';
export interface CounterSource {
  glyph: Glyph;
  metrics: Metrics;
  filled?: FilledGeometry;
  segments: SegmentWithMeta[];
  scale: ScalePrimitives;
}
export interface CounterSpace {
  points: Point2D[];
  closure: 'closed' | 'open';
  seed: Point2D;
  area: number;
  bodyIndex?: number;
  holeIndex?: number;
  mouthStart?: Point2D;
  mouthEnd?: Point2D;
}
export interface OutlineRecess {
  points: Point2D[];
  mouthStart: Point2D;
  mouthEnd: Point2D;
  width: number;
  height: number;
  depth: number;
  area: number;
  bodyIndex: number;
}
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

export function outlineRecesses(filled: FilledGeometry): OutlineRecess[] {
  const result: OutlineRecess[] = [];
  for (const [bodyIndex, body] of filled.bodies.entries()) {
    const points = body.points,
      hull = hullIndices(points),
      hullSet = new Set(hull);
    const width = body.bbox.maxX - body.bbox.minX,
      height = body.bbox.maxY - body.bbox.minY;
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
      if (pocket.length < 3) continue;
      const a = points[start],
        b = points[end],
        length = Math.hypot(b.x - a.x, b.y - a.y);
      if (!length) continue;
      const depth = Math.max(
        ...pocket.map((p) => Math.abs(cross(a, b, p)) / length)
      );
      const area =
        Math.abs(
          pocket.reduce((sum, p, i) => {
            const q = pocket[(i + 1) % pocket.length];
            return sum + p.x * q.y - q.x * p.y;
          }, 0)
        ) / 2;
      result.push({
        points: pocket,
        mouthStart: a,
        mouthEnd: b,
        width,
        height,
        depth,
        area,
        bodyIndex,
      });
    }
  }
  return result;
}

/** Raw callers need only the real glyph, metrics and optional measured evidence. */
export function counterSource(
  glyph: Glyph,
  metrics?: Metrics,
  evidence?: {
    filled?: FilledGeometry;
    segments?: SegmentWithMeta[];
    scale?: ScalePrimitives;
  }
): CounterSource {
  const filled = evidence?.filled ?? getFilledGeometry(glyph);
  const owner = (glyph as Glyph & { _font?: Font })._font;
  const height = glyph.bbox.maxY - glyph.bbox.minY,
    width = glyph.bbox.maxX - glyph.bbox.minX;
  const effective = metrics ?? {
    baseline: 0,
    xHeight: owner?.xHeight ?? glyph.bbox.maxY,
    capHeight: owner?.capHeight ?? glyph.bbox.maxY,
    ascent: owner?.ascent ?? glyph.bbox.maxY,
    descent: owner?.descent ?? glyph.bbox.minY,
  };
  const eps = Math.max(filled.tolerance, height * 0.001),
    overshoot = Math.max(height, width) * 2;
  const widths = [0.3, 0.5, 0.7]
    .flatMap((fraction) =>
      occupiedRayIntervals(
        filled,
        { x: glyph.bbox.minX - eps, y: glyph.bbox.minY + height * fraction },
        0,
        overshoot
      ).map((span) => span.far.x - span.near.x)
    )
    .filter((w) => w > eps)
    .sort((a, b) => a - b);
  return {
    glyph,
    metrics: effective,
    filled,
    segments: evidence?.segments ?? flattenToSegments(glyph),
    scale: evidence?.scale ?? {
      eps,
      bboxW: width,
      bboxH: height,
      stemWidth: widths[Math.floor(widths.length / 2)] ?? width * 0.1,
      overshoot,
    },
  };
}
export function clipCounterPolygon(
  points: Point2D[],
  inside: (p: Point2D) => number
): Point2D[] {
  const result: Point2D[] = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[i],
      b = points[(i + 1) % points.length],
      da = inside(a),
      db = inside(b);
    if (da >= 0) result.push(a);
    if (da < 0 !== db < 0) {
      const t = da / (da - db);
      result.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    }
  }
  return result;
}
export function counterPolygonModel(
  points: Point2D[],
  tolerance: number
): FilledGeometry {
  const bbox = {
    minX: Math.min(...points.map((p) => p.x)),
    maxX: Math.max(...points.map((p) => p.x)),
    minY: Math.min(...points.map((p) => p.y)),
    maxY: Math.max(...points.map((p) => p.y)),
  };
  return {
    contours: [
      {
        index: 0,
        points,
        bbox,
        signedArea: 0,
        startIndex: 0,
        endIndex: points.length - 1,
      },
    ],
    bodies: [],
    enclosedRegions: [],
    tolerance,
  };
}

export function counterWallAt(
  points: Point2D[],
  intersection: Point2D
): [Point2D, Point2D] {
  let best: [Point2D, Point2D] = [points[0], points[1]],
    distance = Infinity;
  for (let i = 0; i < points.length; i++) {
    const a = points[i],
      b = points[(i + 1) % points.length];
    const dx = b.x - a.x,
      dy = b.y - a.y,
      length = dx * dx + dy * dy;
    if (!length) continue;
    const t = Math.max(
      0,
      Math.min(
        1,
        ((intersection.x - a.x) * dx + (intersection.y - a.y) * dy) / length
      )
    );
    const measured = Math.hypot(
      intersection.x - a.x - dx * t,
      intersection.y - a.y - dy * t
    );
    if (measured < distance) {
      best = [a, b];
      distance = measured;
    }
  }
  return best;
}

export function sourceTerminalCaps(
  geo: CounterSource
): Array<{ capStart: Point2D; capEnd: Point2D; position: Point2D }> {
  const result: Array<{
    capStart: Point2D;
    capEnd: Point2D;
    position: Point2D;
  }> = [];
  const filled = geo.filled ?? getFilledGeometry(geo.glyph);
  const contours: (typeof geo.segments)[] = [];
  let edges: typeof geo.segments = [],
    start: Point2D | undefined;
  for (const segment of geo.segments) {
    if (segment.type === 'moveTo') {
      edges = [];
      start = segment.params[0];
    } else if (segment.type === 'closePath') {
      const end = edges.at(-1)?.params.at(-1);
      if (start && end && (start.x !== end.x || start.y !== end.y))
        edges.push({ type: 'lineTo', params: [end, start] });
      if (edges.length >= 3) contours.push(edges);
      edges = [];
      start = undefined;
    } else if (start) edges.push(segment);
  }
  const unit = (a: Point2D, b: Point2D) => {
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    if (!length) return { x: 0, y: 0 };
    return { x: (b.x - a.x) / length, y: (b.y - a.y) / length };
  };
  for (const contour of contours)
    for (let i = 0; i < contour.length; i++) {
      const segment = contour[i];
      if (segment.type !== 'lineTo' || segment.params.length !== 2) continue;
      const [a, b] = segment.params,
        width = Math.hypot(b.x - a.x, b.y - a.y);
      if (width < filled.tolerance * 2 || width > geo.scale.stemWidth * 1.8)
        continue;
      const previous =
          contour[(i - 1 + contour.length) % contour.length].params,
        next = contour[(i + 1) % contour.length].params;
      if (previous.length < 2 || next.length < 2) continue;
      const incoming = unit(
          previous[previous.length - 2],
          previous[previous.length - 1]
        ),
        outgoing = unit(next[0], next[1]),
        along = unit(a, b);
      if (
        incoming.x * outgoing.x + incoming.y * outgoing.y > -0.6 ||
        Math.abs(incoming.x * along.x + incoming.y * along.y) > 0.5 ||
        Math.abs(outgoing.x * along.x + outgoing.y * along.y) > 0.5
      )
        continue;
      const position = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const normal = { x: -along.y, y: along.x },
        probe = Math.min(width, geo.scale.stemWidth) * 0.15;
      const positive = containsFilledPoint(filled, {
          x: position.x + normal.x * probe,
          y: position.y + normal.y * probe,
        }),
        negative = containsFilledPoint(filled, {
          x: position.x - normal.x * probe,
          y: position.y - normal.y * probe,
        });
      if (positive === negative) continue;
      const inward = {
          x: position.x + normal.x * probe * (positive ? 1 : -1),
          y: position.y + normal.y * probe * (positive ? 1 : -1),
        },
        offset = geo.scale.overshoot / 2;
      const occupied = occupiedRayIntervals(
        filled,
        { x: inward.x - along.x * offset, y: inward.y - along.y * offset },
        Math.atan2(along.y, along.x),
        geo.scale.overshoot
      ).find((span) => span.start <= offset && span.end >= offset);
      if (!occupied || occupied.end - occupied.start > width * 1.8) continue;
      result.push({ capStart: a, capEnd: b, position });
    }
  return result;
}

/** A balanced terminal flare around one continuing upright is a foot serif,
 * rather than the second enclosing arm of a counter. All spans are measured
 * on the current fill; long asymmetric E arms retain their counter boundary.
 */
function footProjection(
  source: CounterSource,
  x: number,
  near: number,
  far: number
): boolean {
  if (Math.abs(near - source.metrics.baseline) > source.scale.eps * 2)
    return false;
  const scan = (y: number) =>
    occupiedRayIntervals(
      source.filled!,
      { x: source.glyph.bbox.minX - source.scale.eps, y },
      0,
      source.scale.overshoot
    );
  const foot = scan((near + far) / 2).find(
    (span) => span.near.x <= x && span.far.x >= x
  );
  if (!foot) return false;
  const inner = scan(
    far + Math.max(source.scale.stemWidth * 0.5, source.scale.bboxH * 0.08)
  ).filter((span) => span.near.x >= foot.near.x && span.far.x <= foot.far.x);
  return inner.some((stem) => {
    const width = stem.far.x - stem.near.x,
      left = stem.near.x - foot.near.x,
      right = foot.far.x - stem.far.x;
    return (
      width > source.scale.eps &&
      Math.min(left, right) > width * 0.15 &&
      Math.max(left, right) < Math.min(left, right) * 2
    );
  });
}

/** Facing occupied walls must overlap over a counter-sized interval. A short
 * serif foot beneath a T/r head, or a single L corner, supplies no such pair.
 */
function opposedEnclosure(
  source: CounterSource,
  polygon: Point2D[],
  sideways: boolean
): boolean {
  const filled = source.filled!,
    bounds = {
      minX: Math.min(...polygon.map((p) => p.x)),
      maxX: Math.max(...polygon.map((p) => p.x)),
      minY: Math.min(...polygon.map((p) => p.y)),
      maxY: Math.max(...polygon.map((p) => p.y)),
    };
  const first = sideways ? bounds.minX : bounds.minY,
    last = sideways ? bounds.maxX : bounds.maxY;
  const samples: Array<{ position: number; width: number }> = [];
  for (let band = 1; band < 48; band++) {
    const position = first + ((last - first) * band) / 48;
    const origin = sideways
      ? { x: position, y: source.glyph.bbox.minY - source.scale.eps }
      : { x: source.glyph.bbox.minX - source.scale.eps, y: position };
    const spans = occupiedRayIntervals(
      filled,
      origin,
      sideways ? Math.PI / 2 : 0,
      source.scale.overshoot
    );
    for (let i = 0; i + 1 < spans.length; i++) {
      if (
        sideways &&
        footProjection(source, position, spans[i].near.y, spans[i].far.y)
      )
        continue;
      const a = spans[i].far,
        b = spans[i + 1].near;
      const center = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const gap = sideways ? b.y - a.y : b.x - a.x;
      if (gap <= source.scale.eps || contourWinding(polygon, center) === 0)
        continue;
      const inset = filled.tolerance * 2;
      const near = sideways
          ? { x: a.x, y: a.y + inset }
          : { x: a.x + inset, y: a.y },
        far = sideways
          ? { x: b.x, y: b.y - inset }
          : { x: b.x - inset, y: b.y };
      if (
        contourWinding(polygon, near) !== 0 &&
        contourWinding(polygon, far) !== 0
      )
        samples.push({ position, width: gap });
    }
  }
  if (samples.length < 3) return false;
  const support =
    Math.max(...samples.map((p) => p.position)) -
    Math.min(...samples.map((p) => p.position));
  return support >= Math.max(...samples.map((p) => p.width)) * 0.5;
}

/** Partly enclosed spaces stop at the exposed ends of their own facing walls. */
function computeCounterSpaces(
  source: CounterSource
): Omit<CounterSpace, 'seed'>[] {
  const filled = source.filled!;
  const major = [...filled.bodies].sort((a, b) => b.area - a.area)[0];
  if (!major) return [];
  const eligible = (index: number) => {
    const body = filled.bodies[index];
    return (
      body !== undefined &&
      (body === major ||
        (body.bbox.minY < major.bbox.maxY && body.area >= major.area * 0.05))
    );
  };
  const result: Omit<CounterSpace, 'seed'>[] = filled.enclosedRegions.flatMap(
    (hole, holeIndex) =>
      hole.bodyIndex !== undefined && eligible(hole.bodyIndex)
        ? [
            {
              points: hole.points,
              closure: 'closed',
              area: hole.area,
              bodyIndex: hole.bodyIndex,
              holeIndex,
            },
          ]
        : []
  );
  const caps = sourceTerminalCaps(source);
  for (const recess of outlineRecesses(filled)) {
    const { points, mouthStart: a, mouthEnd: b, depth, width, height } = recess;
    const mouthLength = Math.hypot(b.x - a.x, b.y - a.y);
    if (
      !eligible(recess.bodyIndex) ||
      points.length < 4 ||
      depth < width * 0.2 ||
      mouthLength > depth * 3 ||
      recess.area < width * height * 0.005
    )
      continue;
    const deepest = points.reduce(
      (best, p) =>
        Math.abs(cross(a, b, p)) > Math.abs(cross(a, b, best)) ? p : best,
      points[0]
    );
    const sign = Math.sign(cross(a, b, deepest));
    const along = {
        x: (b.x - a.x) / mouthLength,
        y: (b.y - a.y) / mouthLength,
      },
      inward = { x: -along.y * sign, y: along.x * sign };
    const sideways = Math.abs(b.y - a.y) > Math.abs(b.x - a.x) * 0.8;
    const relevantCaps = caps.filter((cap) =>
      [cap.capStart, cap.capEnd].every((endpoint) =>
        points.some((p) => Math.hypot(p.x - endpoint.x, p.y - endpoint.y) < 0.5)
      )
    );
    const capVertices = new Set<number>();
    for (const cap of relevantCaps)
      for (const endpoint of [cap.capStart, cap.capEnd]) {
        const index = points.findIndex(
          (p) => Math.hypot(p.x - endpoint.x, p.y - endpoint.y) < 0.5
        );
        if (index >= 0) capVertices.add(index);
      }
    const capDepth = Math.max(
      0,
      ...relevantCaps.flatMap((cap) =>
        [cap.capStart, cap.capEnd].map(
          (point) =>
            Math.abs(cross(a, b, point)) / mouthLength + source.scale.eps
        )
      )
    );
    const seen = new Set<string>();
    for (const fraction of [0.15, 0.3, 0.45, 0.6]) {
      const referenceDepth = Math.min(
        depth * 0.75,
        Math.max(depth * fraction, capDepth)
      );
      const reference = {
          x: a.x + inward.x * referenceDepth,
          y: a.y + inward.y * referenceDepth,
        },
        offset = source.scale.overshoot / 2;
      const intervals = occupiedRayIntervals(
        counterPolygonModel(points, filled.tolerance),
        {
          x: reference.x - along.x * offset,
          y: reference.y - along.y * offset,
        },
        Math.atan2(along.y, along.x),
        source.scale.overshoot
      );
      for (const interval of intervals) {
        const nearWall = counterWallAt(points, interval.near),
          farWall = counterWallAt(points, interval.far);
        let first = points.indexOf(nearWall[0]),
          last = points.indexOf(farWall[0]);
        if (
          first < 0 ||
          last < 0 ||
          first === points.length - 1 ||
          last === points.length - 1
        )
          continue;
        if (first > last) [first, last] = [last, first];
        const interior = {
          x: (interval.near.x + interval.far.x) / 2,
          y: (interval.near.y + interval.far.y) / 2,
        };
        if (containsFilledPoint(filled, interior)) continue;
        const outwardIndex = (index: number) =>
          cross(a, b, points[index]) * sign <=
          cross(a, b, points[index + 1]) * sign
            ? index
            : index + 1;
        let start = outwardIndex(first),
          end = outwardIndex(last);
        while (start > 0 && !capVertices.has(start)) start--;
        while (end < points.length - 1 && !capVertices.has(end)) end++;
        const isCap = (first: number, last: number) =>
          relevantCaps.some((cap) =>
            [cap.capStart, cap.capEnd].every((endpoint) =>
              [points[first], points[last]].some(
                (point) =>
                  Math.hypot(point.x - endpoint.x, point.y - endpoint.y) < 0.5
              )
            )
          );
        // Choose the real cap endpoints whose mouth traverses empty space.
        // G's lower bar corner would otherwise close diagonally through ink.
        const starts = [start],
          ends = [end];
        if (start > 0 && isCap(start - 1, start)) starts.push(start - 1);
        if (start + 1 < end && isCap(start, start + 1)) starts.push(start + 1);
        if (end + 1 < points.length && isCap(end, end + 1)) ends.push(end + 1);
        if (end - 1 > start && isCap(end - 1, end)) ends.push(end - 1);
        const choices = starts
          .flatMap((first) => ends.map((last) => ({ first, last })))
          .filter(({ first, last }) => {
            const p = points[first],
              q = points[last];
            return !occupiedRayIntervals(
              counterPolygonModel(
                filled.bodies[recess.bodyIndex].points,
                filled.tolerance
              ),
              p,
              Math.atan2(q.y - p.y, q.x - p.x),
              Math.hypot(q.x - p.x, q.y - p.y)
            ).some((span) => span.end - span.start > filled.tolerance * 2);
          })
          .sort(
            (a, b) =>
              Math.abs(signedArea(points.slice(a.first, a.last + 1))) -
              Math.abs(signedArea(points.slice(b.first, b.last + 1)))
          );
        if (!choices.length) continue;
        start = choices[0].first;
        end = choices[0].last;
        if (end - start < 2) continue;
        const polygon = points.slice(start, end + 1);
        // A deep acute pinch supplies two meeting walls (a crotch), not the
        // third enclosing wall of a counter. Rounded arches and right-angle
        // rear walls remain supported, including a slanted E's corners.
        const corners = findOutlineCorners(polygon);
        const pinched = corners.some((corner, index) => {
          if (
            corner.pointIndex === 0 ||
            corner.pointIndex === polygon.length - 1 ||
            Math.abs(cross(a, b, corner.point)) / mouthLength < depth * 0.8
          )
            return false;
          let turn = 0,
            distance = 0;
          for (let offset = 0; index + offset < corners.length; offset++) {
            const current = corners[index + offset];
            if (
              current.pointIndex === polygon.length - 1 ||
              Math.abs(cross(a, b, current.point)) / mouthLength < depth * 0.8
            )
              break;
            if (offset)
              distance += Math.hypot(
                current.point.x - corners[index + offset - 1].point.x,
                current.point.y - corners[index + offset - 1].point.y
              );
            if (
              distance >
              Math.max(filled.tolerance * 2, source.scale.stemWidth * 0.15)
            )
              break;
            if (isSharpExteriorCorner(current, { minTurnAngleRad: 0 }))
              turn += Math.abs(current.signedTurnAngle);
          }
          return turn >= (Math.PI * 2) / 3;
        });
        if (pinched) continue;
        const key = `${start}:${end}`;
        const curvedRearTurn = corners.reduce(
          (sum, corner) =>
            corner.pointIndex > 0 &&
            corner.pointIndex < polygon.length - 1 &&
            Math.abs(cross(a, b, corner.point)) / mouthLength >= depth * 0.5 &&
            Math.abs(corner.signedTurnAngle) < Math.PI / 6
              ? sum + Math.abs(corner.signedTurnAngle)
              : sum,
          0
        );
        // A curved rear wall can establish enclosure in the orthogonal
        // direction for a tall narrow C/G. Serif projections on L/I/r lack
        // this distributed turn around the space.
        if (
          seen.has(key) ||
          !(
            opposedEnclosure(source, polygon, sideways) ||
            (curvedRearTurn >= Math.PI * 0.75 &&
              opposedEnclosure(source, polygon, !sideways))
          )
        )
          continue;
        seen.add(key);
        const area =
          Math.abs(
            polygon.reduce((sum, p, i) => {
              const q = polygon[(i + 1) % polygon.length];
              return sum + p.x * q.y - q.x * p.y;
            }, 0)
          ) / 2;
        if (
          area <= source.scale.eps ** 2 ||
          contourWinding(polygon, interior) === 0
        )
          continue;
        result.push({
          points: polygon,
          closure: 'open',
          area,
          bodyIndex: recess.bodyIndex,
          mouthStart: points[start],
          mouthEnd: points[end],
        });
      }
    }
  }
  return result;
}

function signedArea(points: Point2D[]): number {
  return (
    points.reduce((sum, p, index) => {
      const q = points[(index + 1) % points.length];
      return sum + p.x * q.y - q.x * p.y;
    }, 0) / 2
  );
}

/** Opposite winding and a twice-traced empty bridge encode an occupied
 * island's exclusion for both native and SVG nonzero fill. */
function maskIslands(
  space: Omit<CounterSpace, 'seed'>,
  filled: FilledGeometry
): Omit<CounterSpace, 'seed'> | undefined {
  let points = [...space.points],
    area = space.area;
  for (const [bodyIndex, body] of filled.bodies.entries()) {
    if (bodyIndex === space.bodyIndex) continue;
    let island = body.points;
    const contained = island.every(
      (point) => contourWinding(space.points, point) !== 0
    );
    let mouthJoin: Point2D | undefined;
    if (!contained) {
      if (!space.mouthStart || !space.mouthEnd) continue;
      const a = space.mouthStart,
        b = space.mouthEnd,
        deepest = space.points.reduce((best, p) =>
          Math.abs(cross(a, b, p)) > Math.abs(cross(a, b, best)) ? p : best
        ),
        sign = Math.sign(cross(a, b, deepest)),
        length = Math.hypot(b.x - a.x, b.y - a.y);
      island = clipCounterPolygon(island, (p) => cross(a, b, p) * sign);
      if (
        island.length < 3 ||
        Math.abs(signedArea(island)) <= filled.tolerance ** 2
      )
        continue;
      const onMouth = (p: Point2D) => {
        const t =
          ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / length ** 2;
        return (
          Math.abs(cross(a, b, p)) / length <= filled.tolerance &&
          t >= 0 &&
          t <= 1
        );
      };
      if (
        !island.every(
          (p) => onMouth(p) || contourWinding(space.points, p) !== 0
        )
      )
        continue;
      mouthJoin = island.find(onMouth);
      if (!mouthJoin) continue;
      // A body crossing only the artificial mouth contributes its actual
      // inward boundary as a notch, joined at the mouth intersection.
      const index = points.findIndex((p, i) => {
        const q = points[(i + 1) % points.length];
        return (
          onMouth(p) &&
          onMouth(q) &&
          Math.hypot(p.x - mouthJoin!.x, p.y - mouthJoin!.y) +
            Math.hypot(q.x - mouthJoin!.x, q.y - mouthJoin!.y) <=
            Math.hypot(q.x - p.x, q.y - p.y) + filled.tolerance
        );
      });
      if (index < 0) return undefined;
      points.splice(index + 1, 0, mouthJoin);
    }
    const pairs = points
      .flatMap((a, outer) =>
        island.map((b, inner) => ({
          outer,
          inner,
          distance: Math.hypot(b.x - a.x, b.y - a.y),
        }))
      )
      .sort((a, b) => a.distance - b.distance);
    const region = counterPolygonModel(points, filled.tolerance);
    const bridge = mouthJoin
      ? {
          outer: points.indexOf(mouthJoin),
          inner: island.indexOf(mouthJoin),
          distance: 0,
        }
      : pairs.find((pair) => {
          const a = points[pair.outer],
            b = island[pair.inner],
            angle = Math.atan2(b.y - a.y, b.x - a.x);
          const ink = occupiedRayIntervals(filled, a, angle, pair.distance);
          if (ink.some((span) => span.end - span.start > filled.tolerance * 2))
            return false;
          return occupiedRayIntervals(region, a, angle, pair.distance).some(
            (span) =>
              span.start <= filled.tolerance &&
              span.end >= pair.distance - filled.tolerance
          );
        });
    if (!bridge) return undefined;
    const boundary =
      Math.sign(signedArea(island)) === Math.sign(signedArea(points))
        ? [...island].reverse()
        : [...island];
    const start = boundary.indexOf(island[bridge.inner]);
    const loop = [...boundary.slice(start), ...boundary.slice(0, start)];
    points = [
      ...points.slice(0, bridge.outer + 1),
      ...loop,
      loop[0],
      points[bridge.outer],
      ...points.slice(bridge.outer + 1),
    ];
    area -= Math.abs(signedArea(island));
  }
  return { ...space, points, area };
}

/** A seed witnesses actual empty space away from its occupied or mouth walls. */
export function counterSpaceSeed(
  points: Point2D[],
  filled: FilledGeometry
): Point2D | undefined {
  const minX = Math.min(...points.map((p) => p.x)),
    maxX = Math.max(...points.map((p) => p.x)),
    minY = Math.min(...points.map((p) => p.y)),
    maxY = Math.max(...points.map((p) => p.y));
  const center = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
  const valid = (point: Point2D) => {
    if (
      contourWinding(points, point) === 0 ||
      containsFilledPoint(filled, point)
    )
      return false;
    return points.every((a, index) => {
      const b = points[(index + 1) % points.length],
        dx = b.x - a.x,
        dy = b.y - a.y,
        length = dx * dx + dy * dy;
      const t = length
        ? Math.max(
            0,
            Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / length)
          )
        : 0;
      return (
        Math.hypot(point.x - a.x - dx * t, point.y - a.y - dy * t) >
        filled.tolerance * 2
      );
    });
  };
  if (valid(center)) return center;
  const model = counterPolygonModel(points, filled.tolerance);
  for (const y of [center.y, ...points.map((p) => (p.y + center.y) / 2)]) {
    for (const interval of occupiedRayIntervals(
      model,
      { x: minX - filled.tolerance, y },
      0,
      maxX - minX + filled.tolerance * 2
    )) {
      const point = { x: (interval.near.x + interval.far.x) / 2, y };
      if (valid(point)) return point;
    }
  }
  return undefined;
}

const counterSpaceCache = new WeakMap<
  Glyph,
  WeakMap<FilledGeometry, Map<string, CounterSpace[]>>
>();

/** Cache only an actual glyph/fill identity and the measured values consumed
 * by identity checks. Caller arrays/points are copied; selection cannot mutate
 * either cached evidence or the canonical occupied boundary.
 */
export function counterSpaces(
  glyph: Glyph,
  metrics?: Metrics,
  evidence?: {
    filled?: FilledGeometry;
    segments?: SegmentWithMeta[];
    scale?: ScalePrimitives;
  }
): CounterSpace[] {
  if (!glyph?.path?.commands?.length || !glyph.bbox) return [];
  const source = counterSource(glyph, metrics, evidence),
    filled = source.filled!;
  let models = counterSpaceCache.get(glyph);
  if (!models) {
    models = new WeakMap();
    counterSpaceCache.set(glyph, models);
  }
  let contexts = models.get(filled);
  if (!contexts) {
    contexts = new Map();
    models.set(filled, contexts);
  }
  const key = [
    source.metrics.baseline,
    source.scale.eps,
    source.scale.stemWidth,
    source.scale.overshoot,
  ].join(':');
  let spaces = contexts.get(key);
  if (!spaces) {
    spaces = computeCounterSpaces(source).flatMap((space) => {
      const masked = maskIslands(space, filled);
      if (!masked) return [];
      const seed = counterSpaceSeed(masked.points, filled);
      return seed ? [{ ...masked, seed }] : [];
    });
    contexts.set(key, spaces);
  }
  return spaces.map((space) => ({
    ...space,
    points: space.points.map((point) => ({ ...point })),
    seed: { ...space.seed },
    mouthStart: space.mouthStart ? { ...space.mouthStart } : undefined,
    mouthEnd: space.mouthEnd ? { ...space.mouthEnd } : undefined,
  }));
}
