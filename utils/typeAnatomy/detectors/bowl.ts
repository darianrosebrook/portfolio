/** Curved occupied strokes enclosing a cavity, localized to their own part. */
import {
  getFilledGeometry,
  occupiedRayIntervals,
  contourWinding,
  type FilledBoundary,
  type FilledGeometry,
} from '@/utils/geometry/filledGeometry';
import { eyeFloor } from './eye';
import { detectStem } from './stem';
import { detectCrossbar } from './crossbar';
import type { FeatureInstance, GeometryCache, Point2D } from '../types';

export function detectBowl(geo: GeometryCache): FeatureInstance[] {
  if (!geo.glyph?.path?.commands || !geo.glyph.bbox) return [];
  const filled = geo.filled ?? getFilledGeometry(geo.glyph);
  const stems = detectStem(geo);
  const bars = detectCrossbar(geo);
  return filled.enclosedRegions.flatMap((hole, index) => {
    // Distributed turning distinguishes a curved enclosure from a straight
    // counter, independent of how many vertices represent a straight edge.
    if (!hasCurvedBoundary(hole.points) || hole.bodyIndex === undefined)
      return [];
    const body = filled.bodies[hole.bodyIndex];
    const center = interiorCenter(hole);
    if (!center) return [];
    const floor = eyeFloor(hole, geo);
    let outline: Point2D[];
    if (floor) {
      // The rounded body continues below an eye's horizontal floor. A radial
      // probe there ends at the bar, so use the owning outer boundary instead.
      // A neighboring same-body cavity identifies the compound's partition.
      const neighbor = filled.enclosedRegions.find(
        (other) =>
          other !== hole &&
          other.bodyIndex === hole.bodyIndex &&
          other.bbox.maxX < hole.bbox.minX
      );
      outline = neighbor
        ? clipRight(body.points, (neighbor.bbox.maxX + hole.bbox.minX) / 2)
        : body.points;
    } else {
      outline = adjacentOutline(filled, hole, center, geo.scale.overshoot);
    }
    if (outline.length < 12) return [];
    let cavity = hole.points;
    for (const stem of stems) {
      if (!stem.region) continue;
      const stemXs = stem.region.points.map((p) => p.x);
      const minX = Math.min(...stemXs),
        maxX = Math.max(...stemXs);
      // An attachment bounds this bowl on the cavity-facing stem edge.
      if (maxX < center.x && minX < hole.bbox.minX) {
        outline = clipRight(outline, maxX);
        cavity = clipRight(cavity, maxX);
      } else if (minX > center.x && maxX > hole.bbox.maxX) {
        cavity = clipRight(
          cavity.map((p) => ({ x: -p.x, y: p.y })),
          -minX
        ).map((p) => ({ x: -p.x, y: p.y }));
        outline = clipRight(
          outline.map((p) => ({ x: -p.x, y: p.y })),
          -minX
        ).map((p) => ({ x: -p.x, y: p.y }));
      }
    }
    let points = subtractLoop(outline, cavity);
    if (floor) {
      const bar = bars.find(
        (bar) =>
          bar.shape.type === 'rect' &&
          Math.abs(
            bar.shape.y + bar.shape.height - (floor[0].y + floor[1].y) / 2
          ) <= geo.scale.eps
      );
      if (bar?.shape.type === 'rect') {
        const above = clipAbove(outline, bar.shape.y + bar.shape.height);
        const below = clipBelow(outline, bar.shape.y);
        const left = clipRight(
          outline.map((p) => ({ x: -p.x, y: p.y })),
          -bar.shape.x
        ).map((p) => ({ x: -p.x, y: p.y }));
        points = joinLoops([
          subtractLoop(
            above,
            clipAbove(cavity, bar.shape.y + bar.shape.height)
          ),
          below,
          clipBelow(
            clipAbove(left, bar.shape.y),
            bar.shape.y + bar.shape.height
          ),
        ]);
      }
    }
    const xs = outline.map((p) => p.x),
      ys = outline.map((p) => p.y);
    const rect = {
      type: 'rect' as const,
      x: Math.min(...xs),
      y: Math.min(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys),
    };
    return [
      {
        id: 'bowl' as const,
        shape: rect,
        region: { kind: 'stroke' as const, points },
        confidence: 0.9,
        anchors: { center, holeCenter: center },
        debug: {
          source: floor
            ? 'eye-owning-curved-body'
            : 'cavity-adjacent-occupied-boundary',
          holeIndex: index,
          bodyIndex: hole.bodyIndex,
        },
      },
    ];
  });
}

function interiorCenter(hole: FilledBoundary): Point2D | undefined {
  const cx = (hole.bbox.minX + hole.bbox.maxX) / 2;
  for (const fraction of [0.5, 0.4, 0.6]) {
    const point = {
      x: cx,
      y: hole.bbox.minY + (hole.bbox.maxY - hole.bbox.minY) * fraction,
    };
    if (contourWinding(hole.points, point)) return point;
  }
}

/** First ink adjacent to this cavity supplies its outer edge. Long joined
 * strokes are bounded by the surrounding measured stroke thickness rather
 * than followed into an ascender, another part, or a disconnected accent.
 */
function adjacentOutline(
  filled: FilledGeometry,
  hole: FilledBoundary,
  center: Point2D,
  length: number
): Point2D[] {
  const cavity: FilledGeometry = {
    contours: [
      {
        index: 0,
        points: hole.points,
        bbox: hole.bbox,
        signedArea: signedArea(hole.points),
        startIndex: 0,
        endIndex: hole.points.length - 1,
      },
    ],
    bodies: [],
    enclosedRegions: [],
    tolerance: filled.tolerance,
  };
  const probes = Array.from({ length: 180 }, (_, index) => {
    const angle = (index * Math.PI * 2) / 180;
    const cavityEdge = occupiedRayIntervals(cavity, center, angle, length)[0]
      ?.end;
    if (cavityEdge === undefined) return undefined;
    const interval = occupiedRayIntervals(filled, center, angle, length).find(
      (span) =>
        span.start >= cavityEdge - filled.tolerance * 2 && span.end > cavityEdge
    );
    return interval
      ? { angle, interval, width: interval.end - interval.start }
      : undefined;
  }).filter((probe): probe is NonNullable<typeof probe> => probe !== undefined);
  if (probes.length < 170) return [];
  const widths = probes.map((probe) => probe.width).sort((a, b) => a - b);
  const typical = widths[Math.floor(widths.length / 2)];
  // Near a stem attachment the cavity-facing straight wall belongs to the
  // backbone. Bounding the local ring also bounds its marker/selection box.
  return probes.map(({ angle, interval }) => {
    const distance = Math.min(interval.end, interval.start + typical * 1.8);
    return {
      x: center.x + Math.cos(angle) * distance,
      y: center.y + Math.sin(angle) * distance,
    };
  });
}

/** Sutherland-Hodgman clipping preserves the exact outer curve vertices. */
function clipRight(points: Point2D[], x: number): Point2D[] {
  const result: Point2D[] = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[i],
      b = points[(i + 1) % points.length];
    if (a.x >= x) result.push(a);
    if (a.x < x !== b.x < x)
      result.push({ x, y: a.y + ((b.y - a.y) * (x - a.x)) / (b.x - a.x) });
  }
  return result;
}

function signedArea(points: Point2D[]): number {
  return (
    points.reduce((sum, a, index) => {
      const b = points[(index + 1) % points.length];
      return sum + a.x * b.y - a.y * b.x;
    }, 0) / 2
  );
}
/** A doubled bridge preserves winding for the enclosed cavity. */
function subtractLoop(outer: Point2D[], excluded: Point2D[]): Point2D[] {
  if (outer.length < 3) return [];
  if (excluded.length < 3) return outer;
  let loop = excluded;
  if (Math.sign(signedArea(loop)) === Math.sign(signedArea(outer)))
    loop = loop.slice().reverse();
  return [...outer, outer[0], loop[0], ...loop.slice(1), loop[0], outer[0]];
}

function clipAbove(points: Point2D[], y: number): Point2D[] {
  return clipRight(
    points.map((p) => ({ x: p.y, y: p.x })),
    y
  ).map((p) => ({ x: p.y, y: p.x }));
}
function clipBelow(points: Point2D[], y: number): Point2D[] {
  return clipRight(
    points.map((p) => ({ x: -p.y, y: p.x })),
    -y
  ).map((p) => ({ x: p.y, y: -p.x }));
}
function joinLoops(loops: Point2D[][]): Point2D[] {
  const valid = loops.filter(
    (loop) => loop.length >= 3 && Math.abs(signedArea(loop)) > 1e-6
  );
  if (!valid.length) return [];
  const first = valid[0][0];
  return valid.flatMap((loop) => [
    first,
    loop[0],
    ...loop.slice(1),
    loop[0],
    first,
  ]);
}

/** Rounded boundaries distribute turning over their perimeter. A subdivided
 * polygon supplies long runs of zero turning and isolated angular corners.
 */
function hasCurvedBoundary(points: Point2D[]): boolean {
  if (points.length < 12) return false;
  let curved = 0,
    perimeter = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[(i + points.length - 1) % points.length],
      b = points[i],
      c = points[(i + 1) % points.length];
    const u = { x: b.x - a.x, y: b.y - a.y },
      v = { x: c.x - b.x, y: c.y - b.y };
    const length = Math.hypot(v.x, v.y);
    const turn = Math.abs(
      Math.atan2(u.x * v.y - u.y * v.x, u.x * v.x + u.y * v.y)
    );
    perimeter += length;
    if (turn > 0.001 && turn < Math.PI / 4) curved += length;
  }
  return curved > perimeter * 0.25;
}
