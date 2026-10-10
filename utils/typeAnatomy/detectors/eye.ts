import {
  getFilledGeometry,
  type FilledBoundary,
} from '@/utils/geometry/filledGeometry';
import type { FeatureInstance, Point2D } from '../types';
import { counterSpaces, type CounterSource } from '../evidence/counterSpaces';

/** The long lower boundary of an eye is supplied by its horizontal bar. */
export function eyeFloor(
  hole: FilledBoundary,
  geo: CounterSource
): [Point2D, Point2D] | null {
  const width = hole.bbox.maxX - hole.bbox.minX;
  const height = hole.bbox.maxY - hole.bbox.minY;
  if (width <= 0 || height <= 0 || hole.points.length < 12) return null;
  for (let i = 0; i < hole.points.length; i++) {
    const a = hole.points[i];
    const b = hole.points[(i + 1) % hole.points.length];
    const dx = Math.abs(b.x - a.x);
    if (
      dx >= width * 0.35 &&
      Math.abs(b.y - a.y) <=
        Math.max(geo.filled?.tolerance ?? 0.2, dx * 0.12) &&
      Math.max(a.y, b.y) <= hole.bbox.minY + height * 0.1
    ) {
      const floor = a.x < b.x ? ([a, b] as const) : ([b, a] as const);
      const centerX = (floor[0].x + floor[1].x) / 2;
      const lowerOpening = counterSpaces(geo.glyph, geo.metrics, geo).some(
        (space) => {
          const points = space.points;
          if (space.closure !== 'open' || space.bodyIndex !== hole.bodyIndex)
            return false;
          if (!space.mouthStart || !space.mouthEnd) return false;
          // The lower e has opposed lips at a side opening, or a wall that
          // wraps below both lips when a heavy face narrows that opening.
          // The baseline mouth between an R leg and backbone has neither.
          const bottom = Math.min(...points.map((point) => point.y));
          const frontDx = Math.abs(space.mouthEnd.x - space.mouthStart.x);
          const frontDy = Math.abs(space.mouthEnd.y - space.mouthStart.y);
          const wrapsBelow =
            Math.min(space.mouthStart.y, space.mouthEnd.y) >
            bottom + (geo.filled?.tolerance ?? 0.2);
          if (frontDy <= frontDx && !wrapsBelow) return false;
          // The lower counter lies below this bar and spans its center. A B
          // waist, serif recess, or another body's opening cannot support it.
          const intersections = points.flatMap((point, index) => {
            const next = points[(index + 1) % points.length];
            if (point.x > centerX === next.x > centerX) return [];
            return [
              point.y +
                ((next.y - point.y) * (centerX - point.x)) / (next.x - point.x),
            ];
          });
          if (intersections.length < 2) return false;
          return (
            Math.max(...intersections) <=
              (a.y + b.y) / 2 + (geo.filled?.tolerance ?? 0.2) &&
            Math.min(...intersections) <
              (a.y + b.y) / 2 - geo.scale.stemWidth * 0.2
          );
        }
      );
      if (lowerOpening) return [floor[0], floor[1]];
    }
  }
  return null;
}

/** A curved enclosure above a bar, rather than any gap found on a scanline. */
export function detectEye(geo: CounterSource): FeatureInstance[] {
  if (!geo.glyph?.path?.commands || !geo.glyph.bbox) return [];
  const filled = geo.filled ?? getFilledGeometry(geo.glyph);
  const spaces = counterSpaces(geo.glyph, geo.metrics, geo);
  return filled.enclosedRegions.flatMap((hole, index) => {
    const floor = eyeFloor(hole, geo);
    if (!floor) return [];
    const space = spaces.find(
      (space) => space.closure === 'closed' && space.holeIndex === index
    );
    if (!space) return [];
    const points = space.points;
    return [
      {
        id: 'eye' as const,
        shape: { type: 'polyline' as const, points },
        region: { kind: 'enclosed' as const, points },
        confidence: 0.95,
        anchors: {
          center: space.seed,
          barLeft: floor[0],
          barRight: floor[1],
        },
        debug: { source: 'bar-bounded-enclosure', holeIndex: index },
      },
    ];
  });
}
