/**
 * Nonzero glyph fill in design units. Contour orientation is source data, not
 * anatomy: only a transition between zero and nonzero winding is a boundary.
 * Curves are adaptively flattened (maximum control-point/chord deviation 0.2
 * units). A planar arrangement splits crossings and shared edges before its
 * occupied-left boundary cycles are traced; a single self-touching source
 * contour can therefore own several enclosed spaces.
 */
import type { Glyph } from 'fontkit';
import type { Point2D } from './geometry';

export interface FilledBBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}
export interface FilledContour {
  index: number;
  points: Point2D[];
  bbox: FilledBBox;
  /** Signed source area; its absolute sign does not identify a hole. */
  signedArea: number;
  startIndex: number;
  endIndex: number;
}
export interface FilledBoundary {
  points: Point2D[];
  bbox: FilledBBox;
  /** Unsigned area inside this boundary. */
  area: number;
  /** Index in bodies of the smallest enclosing occupied outer boundary. */
  bodyIndex?: number;
}
export interface FilledGeometry {
  contours: FilledContour[];
  bodies: FilledBoundary[];
  enclosedRegions: FilledBoundary[];
  /** Adaptive curve approximation tolerance in design units. */
  tolerance: number;
  /** Source Bezier power coefficients for exact fill queries; polygons own
   * topology/rendering only. Absent on legacy hand-built polygon models. */
  sourceCurves?: SourceCurve[];
}
interface SourceCurve {
  coefficients: Point2D[];
  verticalStops: number[];
}
export interface OccupiedRayInterval {
  near: Point2D;
  far: Point2D;
  /** Distances from ray origin, clipped to [0, length]. */
  start: number;
  end: number;
}
interface SegmentInput {
  type: string;
  params: Point2D[];
}
interface Edge {
  a: Point2D;
  b: Point2D;
  cuts: number[];
}
const CURVE_TOLERANCE = 0.2;
const glyphModels = new WeakMap<Glyph, FilledGeometry>();
const shapeModels = new WeakMap<object, FilledGeometry>();

export function registerFilledShape(
  shape: object,
  model: FilledGeometry
): void {
  shapeModels.set(shape, model);
}
export function getFilledShape(shape: object): FilledGeometry | undefined {
  return shapeModels.get(shape);
}
export function getFilledGeometry(glyph: Glyph): FilledGeometry {
  let model = glyphModels.get(glyph);
  if (!model) {
    model = buildFilledGeometry(glyph);
    glyphModels.set(glyph, model);
  }
  return model;
}
const cross = (a: Point2D, b: Point2D): number => a.x * b.y - a.y * b.x;
const sub = (a: Point2D, b: Point2D): Point2D => ({
  x: a.x - b.x,
  y: a.y - b.y,
});
const lerp = (a: Point2D, b: Point2D, t: number): Point2D => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});
function bbox(points: Point2D[]): FilledBBox {
  return points.reduce(
    (b, p) => ({
      minX: Math.min(b.minX, p.x),
      minY: Math.min(b.minY, p.y),
      maxX: Math.max(b.maxX, p.x),
      maxY: Math.max(b.maxY, p.y),
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  );
}
function area(points: Point2D[]): number {
  return (
    points.reduce(
      (sum, p, i) => sum + cross(p, points[(i + 1) % points.length]),
      0
    ) / 2
  );
}
/** Half-open crossings prevent double-counting a shared vertex. */
export function contourWinding(points: Point2D[], p: Point2D): number {
  let winding = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i],
      b = points[(i + 1) % points.length];
    const side = cross(sub(b, a), sub(p, a));
    if (a.y <= p.y && b.y > p.y && side > 0) winding++;
    else if (a.y > p.y && b.y <= p.y && side < 0) winding--;
  }
  return winding;
}
export function containsFilledPoint(
  model: FilledGeometry,
  point: Point2D
): boolean {
  if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return false;
  if (strictFilledPoint(model, point)) return true;
  // Half-open winding crossings describe interiors. A rendered occupied
  // boundary also belongs to the fill, provided an adjacent side has ink;
  // cancelled contours and degenerate source edges cannot create ink.
  const normals: Point2D[] = [];
  const epsilon =
    Number.EPSILON * Math.max(1, Math.abs(point.x), Math.abs(point.y)) * 256;
  if (model.sourceCurves) {
    for (const curve of model.sourceCurves) {
      const xs = curve.coefficients.map((p) => p.x),
        ys = curve.coefficients.map((p) => p.y);
      const xRange = xs
        .slice(1)
        .reduce((sum, value) => sum + Math.abs(value), 0);
      const yRange = ys
        .slice(1)
        .reduce((sum, value) => sum + Math.abs(value), 0);
      const equation = (xRange >= yRange ? xs : ys).slice();
      equation[0] -= xRange >= yRange ? point.x : point.y;
      for (const t of polynomialRoots(equation)) {
        if (
          Math.abs(evaluate(xs, t) - point.x) > epsilon ||
          Math.abs(evaluate(ys, t) - point.y) > epsilon
        )
          continue;
        const dx = evaluate(
          xs.slice(1).map((v, i) => v * (i + 1)),
          t
        );
        const dy = evaluate(
          ys.slice(1).map((v, i) => v * (i + 1)),
          t
        );
        const length = Math.hypot(dx, dy);
        if (length > 0) normals.push({ x: -dy / length, y: dx / length });
      }
    }
  } else {
    for (const contour of model.contours)
      for (let i = 0; i < contour.points.length; i++) {
        const a = contour.points[i],
          b = contour.points[(i + 1) % contour.points.length];
        const dx = b.x - a.x,
          dy = b.y - a.y,
          length = Math.hypot(dx, dy);
        if (!length) continue;
        const t =
          ((point.x - a.x) * dx + (point.y - a.y) * dy) / (length * length);
        if (
          t < 0 ||
          t > 1 ||
          Math.hypot(a.x + t * dx - point.x, a.y + t * dy - point.y) > epsilon
        )
          continue;
        normals.push({ x: -dy / length, y: dx / length });
      }
  }
  const probe = epsilon * 32;
  return normals.some((normal) =>
    [-1, 1].some((side) =>
      strictFilledPoint(model, {
        x: point.x + normal.x * probe * side,
        y: point.y + normal.y * probe * side,
      })
    )
  );
}
function strictFilledPoint(model: FilledGeometry, point: Point2D): boolean {
  if (model.sourceCurves) {
    let winding = 0;
    for (const curve of model.sourceCurves) {
      const ys = curve.coefficients.map((p) => p.y);
      for (let i = 0; i + 1 < curve.verticalStops.length; i++) {
        const lo = curve.verticalStops[i],
          hi = curve.verticalStops[i + 1];
        const a = evaluate(ys, lo),
          b = evaluate(ys, hi);
        const sign =
          a <= point.y && b > point.y
            ? 1
            : a > point.y && b <= point.y
              ? -1
              : 0;
        if (!sign) continue;
        const coefficients = ys.slice();
        coefficients[0] -= point.y;
        const t = bracketedRoot(coefficients, lo, hi);
        if (
          evaluate(
            curve.coefficients.map((p) => p.x),
            t
          ) > point.x
        )
          winding += sign;
      }
    }
    return winding !== 0;
  }
  return containsPolygonPoint(model, point);
}
function containsPolygonPoint(model: FilledGeometry, point: Point2D): boolean {
  return (
    model.contours.reduce(
      (sum, c) => sum + contourWinding(c.points, point),
      0
    ) !== 0
  );
}
function evaluate(coefficients: number[], t: number): number {
  return coefficients.reduceRight(
    (sum, coefficient) => sum * t + coefficient,
    0
  );
}
function bracketedRoot(coefficients: number[], lo: number, hi: number): number {
  let lowValue = evaluate(coefficients, lo);
  if (lowValue === 0) return lo;
  if (evaluate(coefficients, hi) === 0) return hi;
  for (let iteration = 0; iteration < 56; iteration++) {
    const mid = (lo + hi) / 2,
      value = evaluate(coefficients, mid);
    if (value === 0 || mid === lo || mid === hi) return mid;
    if (value < 0 === lowValue < 0) {
      lo = mid;
      lowValue = value;
    } else hi = mid;
  }
  return (lo + hi) / 2;
}
/** Roots isolated between derivative critical points; tangencies are retained
 * as stops, and midpoint fill decides whether they change occupied space. */
function polynomialRoots(coefficients: number[]): number[] {
  const values = coefficients.slice();
  const epsilon = Number.EPSILON * Math.max(1, ...values.map(Math.abs)) * 32;
  while (values.length > 1 && Math.abs(values[values.length - 1]) <= epsilon)
    values.pop();
  if (values.length <= 1) return [];
  if (values.length === 2) {
    const root = -values[0] / values[1];
    return root >= 0 && root <= 1 ? [root] : [];
  }
  const derivative = values.slice(1).map((value, index) => value * (index + 1));
  const stops = [
    0,
    ...polynomialRoots(derivative).filter((t) => t > 0 && t < 1),
    1,
  ];
  const roots: number[] = [];
  for (const t of stops)
    if (Math.abs(evaluate(values, t)) <= epsilon) roots.push(t);
  for (let i = 0; i + 1 < stops.length; i++) {
    const lo = stops[i],
      hi = stops[i + 1],
      a = evaluate(values, lo),
      b = evaluate(values, hi);
    if (a * b < 0) roots.push(bracketedRoot(values, lo, hi));
  }
  roots.sort((a, b) => a - b);
  return roots.filter(
    (t, i) => i === 0 || t - roots[i - 1] > Number.EPSILON * 16
  );
}
function sourceCurve(points: Point2D[]): SourceCurve {
  const coefficients = ['x', 'y'].map((axis) => {
    const p = points.map((point) => point[axis as 'x' | 'y']);
    if (p.length === 2) return [p[0], p[1] - p[0]];
    if (p.length === 3)
      return [p[0], 2 * (p[1] - p[0]), p[0] - 2 * p[1] + p[2]];
    return [
      p[0],
      3 * (p[1] - p[0]),
      3 * (p[0] - 2 * p[1] + p[2]),
      -p[0] + 3 * p[1] - 3 * p[2] + p[3],
    ];
  });
  return {
    coefficients: coefficients[0].map((x, i) => ({ x, y: coefficients[1][i] })),
    verticalStops: [
      0,
      ...polynomialRoots(
        coefficients[1].slice(1).map((value, i) => value * (i + 1))
      ).filter((t) => t > 0 && t < 1),
      1,
    ],
  };
}
function flattenCurve(points: Point2D[], output: Point2D[], depth = 0): void {
  const a = points[0],
    b = points[points.length - 1];
  const d = sub(b, a),
    length = Math.hypot(d.x, d.y);
  // Distance to the finite chord also catches collinear curves that double back.
  const deviation = Math.max(
    ...points.slice(1, -1).map((p) => {
      const t = length
        ? Math.max(
            0,
            Math.min(
              1,
              ((p.x - a.x) * d.x + (p.y - a.y) * d.y) / (length * length)
            )
          )
        : 0;
      const q = lerp(a, b, t);
      return Math.hypot(p.x - q.x, p.y - q.y);
    })
  );
  if (deviation <= CURVE_TOLERANCE || depth >= 20) {
    output.push({ ...b });
    return;
  }
  const left = [a],
    right = [b];
  let level = points;
  while (level.length > 1) {
    level = level.slice(0, -1).map((p, i) => lerp(p, level[i + 1], 0.5));
    left.push(level[0]);
    right.unshift(level[level.length - 1]);
  }
  flattenCurve(left, output, depth + 1);
  flattenCurve(right, output, depth + 1);
}
function contourInputs(glyph: Glyph): SegmentInput[] {
  let current: Point2D | undefined;
  return (glyph.path?.commands ?? []).map((command) => {
    const args = command.args;
    const points: Point2D[] = [];
    for (let i = 0; i + 1 < args.length; i += 2)
      points.push({ x: args[i], y: args[i + 1] });
    if (command.command !== 'moveTo' && current && points.length)
      points.unshift(current);
    if (points.length) current = points[points.length - 1];
    return { type: command.command, params: points };
  });
}
export function buildFilledGeometry(
  glyph: Glyph,
  segments?: SegmentInput[]
): FilledGeometry {
  const contours: FilledContour[] = [];
  const sourceCurves: SourceCurve[] = [];
  let points: Point2D[] = [],
    startIndex = 0;
  let sourceStart: Point2D | undefined, sourceEnd: Point2D | undefined;
  const input = segments ?? contourInputs(glyph);
  const finish = (endIndex: number): void => {
    if (
      sourceStart &&
      sourceEnd &&
      (sourceStart.x !== sourceEnd.x || sourceStart.y !== sourceEnd.y)
    )
      sourceCurves.push(sourceCurve([sourceEnd, sourceStart]));
    if (
      points.length > 1 &&
      points[0].x === points[points.length - 1].x &&
      points[0].y === points[points.length - 1].y
    )
      points.pop();
    if (points.length >= 3)
      contours.push({
        index: contours.length,
        points,
        bbox: bbox(points),
        signedArea: area(points),
        startIndex,
        endIndex,
      });
    points = [];
    sourceStart = sourceEnd = undefined;
  };
  input.forEach((segment, index) => {
    if (segment.type === 'moveTo') {
      if (points.length) finish(index - 1);
      startIndex = index;
      if (segment.params[0]) {
        points.push({ ...segment.params[0] });
        sourceStart = sourceEnd = segment.params[0];
      }
    } else if (segment.type === 'lineTo') {
      if (segment.params[1]) {
        points.push({ ...segment.params[1] });
        sourceCurves.push(sourceCurve(segment.params));
        sourceEnd = segment.params[1];
      }
    } else if (
      segment.type === 'quadraticCurveTo' ||
      segment.type === 'bezierCurveTo'
    ) {
      if (segment.params.length >= 3) {
        flattenCurve(segment.params, points);
        sourceCurves.push(sourceCurve(segment.params));
        sourceEnd = segment.params[segment.params.length - 1];
      }
    } else if (segment.type === 'closePath') finish(index);
  });
  if (points.length) finish(input.length - 1);
  const model: FilledGeometry = {
    contours,
    bodies: [],
    enclosedRegions: [],
    sourceCurves,
    tolerance: CURVE_TOLERANCE,
  };
  deriveBoundaries(model);
  return model;
}
function deriveBoundaries(model: FilledGeometry): void {
  const edges: Edge[] = model.contours
    .flatMap((c) =>
      c.points.map((a, i) => ({
        a,
        b: c.points[(i + 1) % c.points.length],
        cuts: [0, 1],
      }))
    )
    .filter((e) => e.a.x !== e.b.x || e.a.y !== e.b.y);
  const extent = Math.max(
    1,
    ...edges.flatMap((e) => [Math.abs(e.a.x), Math.abs(e.a.y)])
  );
  const precision = extent * Number.EPSILON * 64;
  // Split every proper intersection and collinear overlap. Retaining source
  // vertices allows tangent/self-touch junctions to be traced as separate faces.
  for (let i = 0; i < edges.length; i++)
    for (let j = i + 1; j < edges.length; j++) {
      const e = edges[i],
        f = edges[j];
      if (
        Math.max(e.a.x, e.b.x) < Math.min(f.a.x, f.b.x) - precision ||
        Math.max(f.a.x, f.b.x) < Math.min(e.a.x, e.b.x) - precision ||
        Math.max(e.a.y, e.b.y) < Math.min(f.a.y, f.b.y) - precision ||
        Math.max(f.a.y, f.b.y) < Math.min(e.a.y, e.b.y) - precision
      )
        continue;
      const r = sub(e.b, e.a),
        s = sub(f.b, f.a),
        q = sub(f.a, e.a);
      const denominator = cross(r, s);
      if (
        Math.abs(denominator) >
        precision * Math.max(Math.hypot(r.x, r.y), Math.hypot(s.x, s.y))
      ) {
        const t = cross(q, s) / denominator,
          u = cross(q, r) / denominator;
        if (t >= -1e-12 && t <= 1 + 1e-12 && u >= -1e-12 && u <= 1 + 1e-12) {
          e.cuts.push(Math.max(0, Math.min(1, t)));
          f.cuts.push(Math.max(0, Math.min(1, u)));
        }
      } else if (Math.abs(cross(q, r)) <= precision * Math.hypot(r.x, r.y)) {
        const project = (p: Point2D, edge: Edge): number => {
          const d = sub(edge.b, edge.a);
          return (
            ((p.x - edge.a.x) * d.x + (p.y - edge.a.y) * d.y) /
            (d.x * d.x + d.y * d.y)
          );
        };
        for (const t of [project(f.a, e), project(f.b, e)])
          if (t > 0 && t < 1) e.cuts.push(t);
        for (const t of [project(e.a, f), project(e.b, f)])
          if (t > 0 && t < 1) f.cuts.push(t);
      }
    }
  const key = (p: Point2D): string =>
    `${Math.round(p.x / precision)},${Math.round(p.y / precision)}`;
  const vertices = new Map<string, Point2D>();
  const vertex = (p: Point2D): string => {
    const k = key(p);
    if (!vertices.has(k)) vertices.set(k, p);
    return k;
  };
  const boundary = new Map<string, { from: string; to: string }>();
  for (const edge of edges) {
    const cuts = [...new Set(edge.cuts)].sort((a, b) => a - b);
    for (let i = 0; i + 1 < cuts.length; i++) {
      const a = lerp(edge.a, edge.b, cuts[i]),
        b = lerp(edge.a, edge.b, cuts[i + 1]);
      const d = sub(b, a),
        length = Math.hypot(d.x, d.y);
      if (length <= precision) continue;
      const midpoint = lerp(a, b, 0.5);
      // Pick an offset smaller than the distance to every unrelated edge. A
      // fixed design-unit epsilon would erase arbitrarily thin occupied spans.
      let clearance = length / 4;
      for (const other of edges) {
        const v = sub(other.b, other.a),
          n = v.x * v.x + v.y * v.y;
        const t = Math.max(
          0,
          Math.min(
            1,
            ((midpoint.x - other.a.x) * v.x + (midpoint.y - other.a.y) * v.y) /
              n
          )
        );
        const p = lerp(other.a, other.b, t);
        const distance = Math.hypot(midpoint.x - p.x, midpoint.y - p.y);
        if (distance > precision * 8)
          clearance = Math.min(clearance, distance / 4);
      }
      const offset = Math.min(
        clearance,
        Math.max(precision * 16, extent * 1e-7)
      );
      const normal = {
        x: (-d.y / length) * offset,
        y: (d.x / length) * offset,
      };
      const left = containsPolygonPoint(model, {
        x: midpoint.x + normal.x,
        y: midpoint.y + normal.y,
      });
      const right = containsPolygonPoint(model, {
        x: midpoint.x - normal.x,
        y: midpoint.y - normal.y,
      });
      if (left === right) continue;
      const from = vertex(left ? a : b),
        to = vertex(left ? b : a);
      if (from !== to) boundary.set(`${from}|${to}`, { from, to });
    }
  }
  const links = [...boundary.values()];
  const outgoing = new Map<string, number[]>();
  links.forEach((edge, i) => {
    const list = outgoing.get(edge.from) ?? [];
    list.push(i);
    outgoing.set(edge.from, list);
  });
  const visited = new Set<number>();
  for (let initial = 0; initial < links.length; initial++) {
    if (visited.has(initial)) continue;
    const polygon: Point2D[] = [];
    let current = initial;
    let closed = false;
    for (let steps = 0; steps <= links.length; steps++) {
      if (visited.has(current)) {
        closed = current === initial;
        break;
      }
      visited.add(current);
      const edge = links[current],
        a = vertices.get(edge.from)!,
        b = vertices.get(edge.to)!;
      polygon.push({ ...a });
      const reverse = Math.atan2(a.y - b.y, a.x - b.x);
      const candidates = outgoing.get(edge.to) ?? [];
      if (!candidates.length) break;
      const clockwise = (index: number): number => {
        const target = vertices.get(links[index].to)!;
        const angle = Math.atan2(target.y - b.y, target.x - b.x);
        return (reverse - angle + Math.PI * 2) % (Math.PI * 2);
      };
      current = candidates.reduce((best, candidate) =>
        clockwise(candidate) < clockwise(best) ? candidate : best
      );
    }
    if (!closed || polygon.length < 3) continue;
    const signed = area(polygon);
    if (Math.abs(signed) <= precision * precision) continue;
    const region = {
      points: polygon,
      bbox: bbox(polygon),
      area: Math.abs(signed),
    };
    (signed > 0 ? model.bodies : model.enclosedRegions).push(region);
  }
  model.bodies.sort((a, b) => b.area - a.area);
  model.enclosedRegions.sort(
    (a, b) => a.bbox.minY - b.bbox.minY || a.bbox.minX - b.bbox.minX
  );
  for (const region of model.enclosedRegions) {
    const owners = model.bodies
      .map((body, index) => ({ body, index }))
      .filter(
        ({ body }) => contourWinding(body.points, region.points[0]) !== 0
      );
    owners.sort((a, b) => a.body.area - b.body.area);
    region.bodyIndex = owners[0]?.index;
  }
}
/** Occupied spans, including a clipped first/last span when the ray begins/ends in ink. */
export function occupiedRayIntervals(
  model: FilledGeometry,
  origin: Point2D,
  angle: number,
  length: number
): OccupiedRayInterval[] {
  if (!Number.isFinite(length) || length <= 0) return [];
  const direction = { x: Math.cos(angle), y: Math.sin(angle) };
  const at = (distance: number): Point2D => ({
    x: origin.x + direction.x * distance,
    y: origin.y + direction.y * distance,
  });
  const distances = [0, length];
  if (model.sourceCurves) {
    for (const curve of model.sourceCurves) {
      const equation = curve.coefficients.map((p) => cross(p, direction));
      equation[0] -= cross(origin, direction);
      for (const t of polynomialRoots(equation)) {
        const delta = {
          x:
            evaluate(
              curve.coefficients.map((p) => p.x),
              t
            ) - origin.x,
          y:
            evaluate(
              curve.coefficients.map((p) => p.y),
              t
            ) - origin.y,
        };
        const distance = delta.x * direction.x + delta.y * direction.y;
        if (distance > 0 && distance < length) distances.push(distance);
      }
    }
  } else
    for (const contour of model.contours)
      for (let i = 0; i < contour.points.length; i++) {
        const a = contour.points[i],
          b = contour.points[(i + 1) % contour.points.length];
        const edge = sub(b, a),
          delta = sub(a, origin),
          denominator = cross(direction, edge);
        if (
          Math.abs(denominator) <=
          Number.EPSILON * Math.max(1, Math.hypot(edge.x, edge.y)) * 8
        )
          continue;
        const distance = cross(delta, edge) / denominator,
          t = cross(delta, direction) / denominator;
        if (distance > 0 && distance < length && t >= 0 && t < 1)
          distances.push(distance);
      }
  distances.sort((a, b) => a - b);
  const stops = distances.filter(
    (d, i) =>
      i === 0 ||
      d - distances[i - 1] >
        Number.EPSILON *
          Math.max(1, Math.abs(d), Math.abs(distances[i - 1])) *
          16
  );
  const result: OccupiedRayInterval[] = [];
  for (let i = 0; i + 1 < stops.length; i++) {
    const start = stops[i],
      end = stops[i + 1];
    if (!containsFilledPoint(model, at(start + (end - start) / 2))) continue;
    const previous = result[result.length - 1];
    if (previous && previous.end === start) {
      previous.end = end;
      previous.far = at(end);
    } else result.push({ near: at(start), far: at(end), start, end });
  }
  return result;
}
