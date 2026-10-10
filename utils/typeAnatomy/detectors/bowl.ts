/** Curved occupied strokes enclosing a cavity, localized to their own part. */
import {
  getFilledGeometry,
  occupiedRayIntervals,
  contourWinding,
  containsFilledPoint,
  type FilledBoundary,
  type FilledGeometry,
} from '@/utils/geometry/filledGeometry';
import { eyeFloor } from './eye';
import { detectStem } from './stem';
import { detectCrossbar } from './crossbar';
import {
  counterSpaces,
  clipCounterPolygon,
  type CounterSpace,
} from '../evidence/counterSpaces';
import type {
  FeatureInstance,
  GeometryCache,
  Point2D,
  SegmentWithMeta,
} from '../types';

export function detectBowl(geo: GeometryCache): FeatureInstance[] {
  if (!geo.glyph?.path?.commands || !geo.glyph.bbox) return [];
  const filled = geo.filled ?? getFilledGeometry(geo.glyph);
  const stems = detectStem(geo);
  const bars = detectCrossbar(geo);
  const closed = filled.enclosedRegions.flatMap((hole, index) => {
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
      const extent = outerCurveExtent(geo, hole, body);
      if (extent)
        outline = clipBelow(clipAbove(outline, extent.minY), extent.maxY);
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
  return [...closed, ...openBowls(geo, filled, closed, stems, bars)];
}

/** A nearly enclosed bowl has curved counter-facing walls above and below
 * its empty seed, with a sideways mouth. A shoulder supplies only the upper
 * curve; opposite-side pockets identify an alternating spine instead.
 */
function openBowls(
  geo: GeometryCache,
  filled: FilledGeometry,
  closed: FeatureInstance[],
  stems: FeatureInstance[],
  bars: FeatureInstance[]
): FeatureInstance[] {
  const closedBodies = new Set(
    closed.map(
      (instance) => (instance.debug as { bodyIndex: number }).bodyIndex
    )
  );
  const spaces = counterSpaces(geo.glyph, geo.metrics, geo).filter(
    (space) => space.closure === 'open' && space.bodyIndex !== undefined
  );
  const emitted = new Set<number>();
  return spaces.flatMap((space) => {
    const index = space.bodyIndex!;
    const body = filled.bodies[index];
    if (closedBodies.has(index) || emitted.has(index)) return [];
    const mouthSide = (other: CounterSpace) =>
      Math.sign(
        (other.mouthStart!.x + other.mouthEnd!.x) / 2 -
          (body.bbox.minX + body.bbox.maxX) / 2
      );
    if (!mouthSide(space)) return [];
    if (
      spaces.some(
        (other) =>
          other.bodyIndex === index && mouthSide(other) === -mouthSide(space)
      )
    )
      return [];
    if (!hasCurvedBoundary(space.points)) return [];
    let above = 0,
      below = 0;
    const ownVertices = new Set(body.points.map((p) => `${p.x}:${p.y}`));
    for (let i = 1; i + 1 < space.points.length; i++) {
      const a = space.points[i - 1],
        b = space.points[i],
        c = space.points[i + 1];
      // Opposite-winding island loops are exclusions, not this body's walls.
      if (!ownVertices.has(`${b.x}:${b.y}`)) continue;
      const ux = b.x - a.x,
        uy = b.y - a.y,
        vx = c.x - b.x,
        vy = c.y - b.y;
      const turn = Math.abs(Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy));
      if (turn <= 0.001 || turn >= Math.PI / 4) continue;
      if (b.y > space.seed.y) above += turn;
      else below += turn;
    }
    if (above < Math.PI / 4 || below < Math.PI / 4 || above + below < Math.PI)
      return [];
    // At least three quarters of directions must meet the occupied enclosure.
    // Unlike a closed hole, a real mouth leaves a contiguous exterior channel.
    const supported = Array.from({ length: 180 }, (_, i) =>
      occupiedRayIntervals(
        filled,
        space.seed,
        (i * Math.PI) / 90,
        geo.scale.overshoot
      ).some(
        (span) =>
          contourWinding(body.points, {
            x: (span.near.x + span.far.x) / 2,
            y: (span.near.y + span.far.y) / 2,
          }) !== 0
      )
    ).filter(Boolean).length;
    if (supported < 135) return [];
    let pieces = [body.points];
    const attachments = [...stems, ...bars].flatMap((part) =>
      part.region?.points.length === 4 ? [part.region.points] : []
    );
    attachments.push(...straightAttachments(geo, filled, body));
    for (const part of attachments) {
      pieces = pieces.flatMap((piece) => subtractConvexPart(piece, part));
    }
    if (!pieces.length) return [];
    const points = joinLoops(pieces);
    emitted.add(index);
    return [
      {
        id: 'bowl' as const,
        shape: {
          type: 'rect' as const,
          x: body.bbox.minX,
          y: body.bbox.minY,
          width: body.bbox.maxX - body.bbox.minX,
          height: body.bbox.maxY - body.bbox.minY,
        },
        region: { kind: 'stroke' as const, points },
        anchors: { center: space.seed, holeCenter: space.seed },
        confidence: 0.9,
        debug: {
          source: 'open-counter-curved-body',
          bodyIndex: index,
          supportedDirections: supported,
          sampleCount: 180,
        },
      },
    ];
  });
}

/** An occupied radial interval can continue into an attached leg. The native
 * outer curve run adjacent to this cavity bounds its own vertical extent;
 * shorter shoulder/foot curves and inner counter contours do not supply it.
 */
function outerCurveExtent(
  geo: GeometryCache,
  hole: FilledBoundary,
  body: FilledBoundary
): { minY: number; maxY: number } | undefined {
  const vertices = new Set(body.points.map((p) => `${p.x}:${p.y}`));
  const ranges: Array<{ minY: number; maxY: number }> = [];
  let run: SegmentWithMeta[] = [];
  const finish = () => {
    if (!run.length) return;
    const current = run;
    run = [];
    if (
      !current.some((segment) =>
        [segment.params[0], segment.params[segment.params.length - 1]].some(
          (p) => vertices.has(`${p.x}:${p.y}`)
        )
      )
    )
      return;
    const points = current.flatMap((segment) => segment.params);
    const minY = Math.min(...points.map((p) => p.y)),
      maxY = Math.max(...points.map((p) => p.y));
    if (maxY < hole.bbox.minY || minY > hole.bbox.maxY) return;
    const tangents = current.flatMap((segment) =>
      Array.from({ length: 17 }, (_, i) => {
        const t = i / 16,
          [a, b, c, d] = segment.params;
        return segment.params.length === 3
          ? {
              x: (1 - t) * (b.x - a.x) + t * (c.x - b.x),
              y: (1 - t) * (b.y - a.y) + t * (c.y - b.y),
            }
          : {
              x:
                (1 - t) ** 2 * (b.x - a.x) +
                2 * (1 - t) * t * (c.x - b.x) +
                t * t * (d.x - c.x),
              y:
                (1 - t) ** 2 * (b.y - a.y) +
                2 * (1 - t) * t * (c.y - b.y) +
                t * t * (d.y - c.y),
            };
      })
    );
    let turn = 0;
    for (let i = 1; i < tangents.length; i++) {
      const a = tangents[i - 1],
        b = tangents[i];
      turn += Math.abs(
        Math.atan2(a.x * b.y - a.y * b.x, a.x * b.x + a.y * b.y)
      );
    }
    if (turn >= Math.PI / 2) ranges.push({ minY, maxY });
  };
  for (const segment of geo.segments) {
    if (segment.type === 'quadraticCurveTo' || segment.type === 'bezierCurveTo')
      run.push(segment);
    else finish();
  }
  finish();
  return ranges.length
    ? {
        minY: Math.min(hole.bbox.minY, ...ranges.map((r) => r.minY)),
        maxY: Math.max(hole.bbox.maxY, ...ranges.map((r) => r.maxY)),
      }
    : undefined;
}

/** A secondary straight post need not be a main Stem. Its actual parallel
 * walls and the exterior void beside both walls still distinguish that ink
 * from the curved enclosure. Source rays bound its exposed extent at joins.
 */
function straightAttachments(
  geo: GeometryCache,
  filled: FilledGeometry,
  body: FilledBoundary
): Point2D[][] {
  const basis = -Math.tan((geo.italicAngle * Math.PI) / 180);
  const edges = [...geo.segments];
  let start: Point2D | undefined;
  for (const segment of geo.segments) {
    if (segment.type === 'moveTo') start = segment.params[0];
    if (segment.type === 'closePath' && start && segment.params[0])
      edges.push({ type: 'lineTo', params: [segment.params[0], start] });
  }
  const walls = edges.flatMap((edge) => {
    if (edge.type !== 'lineTo' || edge.params.length !== 2) return [];
    const [a, b] = edge.params,
      dy = b.y - a.y;
    if (
      Math.abs(dy) <= geo.scale.eps ||
      Math.abs(b.x - a.x - basis * dy) > geo.scale.eps
    )
      return [];
    return [
      {
        bottom: Math.min(a.y, b.y),
        top: Math.max(a.y, b.y),
        slope: (b.x - a.x) / dy,
        x: (y: number) => a.x + ((b.x - a.x) * (y - a.y)) / dy,
      },
    ];
  });
  const result: Point2D[][] = [];
  for (let i = 0; i < walls.length; i++)
    for (let j = i + 1; j < walls.length; j++) {
      const bottom = Math.max(walls[i].bottom, walls[j].bottom),
        top = Math.min(walls[i].top, walls[j].top);
      if (top - bottom <= geo.scale.eps) continue;
      const [left, right] = [walls[i], walls[j]].sort(
        (a, b) => a.x((bottom + top) / 2) - b.x((bottom + top) / 2)
      );
      if (
        right.x((bottom + top) / 2) - left.x((bottom + top) / 2) <=
        geo.scale.eps * 2
      )
        continue;
      const covered = [
        [left, -1],
        [right, 1],
      ] as const;
      const joins = covered
        .flatMap(([wall, side]) =>
          occupiedRayIntervals(
            filled,
            { x: wall.x(bottom) + side * geo.scale.eps, y: bottom },
            Math.atan2(1, wall.slope),
            (top - bottom) * Math.hypot(1, wall.slope)
          ).map((span) => ({
            bottom: Math.max(bottom, span.near.y),
            top: Math.min(top, span.far.y),
          }))
        )
        .sort((a, b) => a.bottom - b.bottom);
      const exposed: Array<{ bottom: number; top: number }> = [];
      let cursor = bottom;
      for (const join of joins) {
        if (join.bottom > cursor)
          exposed.push({ bottom: cursor, top: join.bottom });
        cursor = Math.max(cursor, join.top);
      }
      if (cursor < top) exposed.push({ bottom: cursor, top });
      for (const band of exposed) {
        if (band.top - band.bottom <= geo.scale.eps * 2) continue;
        const supported = [0.25, 0.5, 0.75].every((fraction) => {
          const y = band.bottom + (band.top - band.bottom) * fraction;
          return [0.01, 0.5, 0.99].every((depth) => {
            const point = {
              x: left.x(y) + (right.x(y) - left.x(y)) * depth,
              y,
            };
            return (
              contourWinding(body.points, point) !== 0 &&
              containsFilledPoint(filled, point)
            );
          });
        });
        if (!supported) continue;
        result.push([
          { x: left.x(band.bottom), y: band.bottom },
          { x: right.x(band.bottom), y: band.bottom },
          { x: right.x(band.top), y: band.top },
          { x: left.x(band.top), y: band.top },
        ]);
      }
    }
  return result;
}

/** Partition the actual occupied polygon at each wall of a convex part.
 * Retaining only outside pieces avoids creating an exclusion loop in exterior
 * whitespace when a registered part extends beyond this particular body.
 */
function subtractConvexPart(points: Point2D[], part: Point2D[]): Point2D[][] {
  const sign = Math.sign(signedArea(part));
  if (!sign) return [points];
  const result: Point2D[][] = [];
  let remaining = points;
  for (let i = 0; i < part.length && remaining.length >= 3; i++) {
    const a = part[i],
      b = part[(i + 1) % part.length];
    const inside = (p: Point2D) =>
      sign * ((b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x));
    const outside = clipCounterPolygon(remaining, (p) => -inside(p));
    if (outside.length >= 3 && Math.abs(signedArea(outside)) > 1e-6)
      result.push(outside);
    remaining = clipCounterPolygon(remaining, inside);
  }
  return result;
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
