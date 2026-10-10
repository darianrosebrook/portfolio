/** Open-counter identity and its localized channel to the exterior. */
import {
  getFilledGeometry,
  occupiedRayIntervals,
} from '@/utils/geometry/filledGeometry';
import type { FeatureInstance, GeometryCache, Point2D } from '../types';

import {
  outlineRecesses,
  sourceTerminalCaps as terminalCaps,
  clipCounterPolygon as clip,
  counterPolygonModel as polygonModel,
  counterWallAt as wallAt,
} from '../evidence/counterSpaces';
function cross(a: Point2D, b: Point2D, c: Point2D): number {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

export function detectOpenCounterPockets(
  geo: GeometryCache
): FeatureInstance[] {
  if (!geo.glyph?.path?.commands?.length || !geo.glyph.bbox) return [];
  const filled = geo.filled ?? getFilledGeometry(geo.glyph);
  const instances: FeatureInstance[] = [];
  for (const recess of outlineRecesses(filled)) {
    const {
      points: pocket,
      mouthStart: a,
      mouthEnd: b,
      width,
      height,
    } = recess;
    if (pocket.length < 6) continue;
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
        bodyIndex: recess.bodyIndex,
        depth,
        mouthLength,
        side:
          (a.x + b.x) / 2 >
          (filled.bodies[recess.bodyIndex].bbox.minX +
            filled.bodies[recess.bodyIndex].bbox.maxX) /
            2
            ? 'right'
            : 'left',
        boundary: 'occupied-outline',
      },
    });
  }
  return instances;
}

/** Aperture highlights the mouth channel, while the whole open-counter pocket
 * remains available separately for enclosure and composition identity.
 */
export function detectAperture(geo: GeometryCache): FeatureInstance[] {
  if (!geo.glyph?.path?.commands?.length || !geo.glyph.bbox) return [];
  const caps = terminalCaps(geo);
  return detectOpenCounterPockets(geo).flatMap((pocket) => {
    const points = pocket.region!.points;
    const a = pocket.anchors!.mouthBottom,
      b = pocket.anchors!.mouthTop;
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    const along = { x: (b.x - a.x) / length, y: (b.y - a.y) / length };
    const deepest = points.reduce(
      (best, p) =>
        Math.abs(cross(a, b, p)) > Math.abs(cross(a, b, best)) ? p : best,
      points[0]
    );
    const sign = Math.sign(cross(a, b, deepest));
    const inward = { x: -along.y * sign, y: along.x * sign };
    const depth = Math.abs(cross(a, b, deepest)) / length;
    const widths = visibleCapWidths(geo, points, a, b, inward);
    const localWidth = widths.length
      ? Math.max(...widths)
      : geo.scale.stemWidth;
    // A large stroke must still stop before the deep counter wall. This
    // bounds a mouth channel when a heavy face leaves only a shallow pocket.
    const channelDepth = Math.min(localWidth, depth / 2);
    if (channelDepth <= geo.scale.eps) return [];
    // Probe behind the visible terminal projections. Actual counter walls
    // there separate its mouth branches: an e bar's underside supplies the
    // wall beneath it, and a middle E arm separates two counter mouths.
    const capDepths = caps
      .filter((cap) =>
        [cap.capStart, cap.capEnd].every((endpoint) =>
          points.some(
            (point) =>
              Math.hypot(point.x - endpoint.x, point.y - endpoint.y) < 0.5
          )
        )
      )
      .map(
        (cap) => Math.abs(cross(a, b, cap.position)) / length + geo.scale.eps
      );
    const referenceDepth = Math.min(
      depth / 2,
      Math.max(channelDepth / 2, ...capDepths)
    );
    const reference = {
      x: a.x + inward.x * referenceDepth,
      y: a.y + inward.y * referenceDepth,
    };
    const offset = geo.scale.overshoot / 2;
    const model = polygonModel(points, geo.filled?.tolerance ?? 0.2);
    const intervals = occupiedRayIntervals(
      model,
      { x: reference.x - along.x * offset, y: reference.y - along.y * offset },
      Math.atan2(along.y, along.x),
      geo.scale.overshoot
    );
    return intervals.flatMap((interval) => {
      let mouthChannel = points;
      const interior = {
        x: (interval.near.x + interval.far.x) / 2,
        y: (interval.near.y + interval.far.y) / 2,
      };
      const walls = [
        wallAt(points, interval.near),
        wallAt(points, interval.far),
      ] as const;
      const fronts = walls.map((wall, index) => {
        const outward =
          cross(a, b, wall[0]) * sign < cross(a, b, wall[1]) * sign
            ? wall[0]
            : wall[1];
        let start = points.indexOf(outward);
        const target = index === 0 ? a : b;
        const direction = points[0] === target ? -1 : 1;
        while (start >= 0 && start < points.length) {
          const point = points[start];
          if (
            caps.some((cap) =>
              [cap.capStart, cap.capEnd].some(
                (endpoint) =>
                  Math.hypot(point.x - endpoint.x, point.y - endpoint.y) < 0.5
              )
            )
          )
            return point;
          start += direction;
        }
        return target;
      });
      const frontLength = Math.hypot(
        fronts[1].x - fronts[0].x,
        fronts[1].y - fronts[0].y
      );
      if (frontLength <= geo.scale.eps) return [];
      const frontSide = Math.sign(cross(fronts[0], fronts[1], interior));
      const distance = (point: Point2D) =>
        (cross(fronts[0], fronts[1], point) * frontSide) / frontLength;
      mouthChannel = clip(mouthChannel, (point) => distance(point));
      mouthChannel = clip(
        mouthChannel,
        (point) => channelDepth - distance(point)
      );
      const alongFront = (point: Point2D) =>
        ((point.x - fronts[0].x) * (fronts[1].x - fronts[0].x) +
          (point.y - fronts[0].y) * (fronts[1].y - fronts[0].y)) /
        frontLength;
      mouthChannel = clip(mouthChannel, (point) => alongFront(point));
      mouthChannel = clip(
        mouthChannel,
        (point) => frontLength - alongFront(point)
      );
      if (mouthChannel.length < 3) return [];
      return [
        {
          ...pocket,
          anchors: {
            ...pocket.anchors,
            mouthBottom: fronts[0],
            mouthTop: fronts[1],
          },
          shape: { type: 'polyline' as const, points: mouthChannel },
          region: { kind: 'enclosed' as const, points: mouthChannel },
          debug: {
            ...(pocket.debug as object),
            channelDepth,
            mouthLength: frontLength,
            localStrokeWidth: localWidth,
            boundary: 'occupied-mouth-walls',
          },
        },
      ];
    });
  });
}

/** Visible source cap edges close to the mouth supply the adjacent stroke
 * thickness. Long bar walls remain walls; buried seams and short curve chords
 * do not become cap-width evidence.
 */
function visibleCapWidths(
  geo: GeometryCache,
  points: Point2D[],
  a: Point2D,
  b: Point2D,
  inward: Point2D
): number[] {
  const result: number[] = [];
  for (const segment of geo.segments) {
    if (segment.type !== 'lineTo' || segment.params.length !== 2) continue;
    const [u, v] = segment.params,
      width = Math.hypot(v.x - u.x, v.y - u.y);
    if (width < geo.scale.stemWidth * 0.2 || width > geo.scale.stemWidth * 1.8)
      continue;
    const direction = { x: (v.x - u.x) / width, y: (v.y - u.y) / width };
    if (Math.abs(direction.x * inward.x + direction.y * inward.y) < 0.6)
      continue;
    const midpoint = { x: (u.x + v.x) / 2, y: (u.y + v.y) / 2 };
    if (
      Math.min(
        Math.hypot(midpoint.x - a.x, midpoint.y - a.y),
        Math.hypot(midpoint.x - b.x, midpoint.y - b.y)
      ) >
      geo.scale.stemWidth * 2
    )
      continue;
    const visible = points.some((p, index) => {
      const q = points[(index + 1) % points.length];
      return (
        Math.hypot(q.x - p.x, q.y - p.y) >= width * 0.8 &&
        Math.abs(cross(u, v, p)) / width <= 0.4 &&
        Math.abs(cross(u, v, q)) / width <= 0.4 &&
        (p.x - u.x) * direction.x + (p.y - u.y) * direction.y >= -0.4 &&
        (q.x - u.x) * direction.x + (q.y - u.y) * direction.y <= width + 0.4
      );
    });
    if (visible) result.push(width);
  }
  return result;
}
