import { getMarkContours } from '../geometryCache';
import { getFilledGeometry } from '@/utils/geometry/filledGeometry';
import { detectTittle } from './tittle';
import type { FeatureInstance, GeometryCache } from '../types';

/** Detached marks other than the structural dot of i/j. */
export function detectAccent(geo: GeometryCache): FeatureInstance[] {
  if (!geo.glyph?.path?.commands || !geo.glyph.bbox) return [];
  const filled = geo.filled ?? getFilledGeometry(geo.glyph);
  const characters = (geo.glyph.codePoints ?? []).flatMap((cp) =>
    Array.from(String.fromCodePoint(cp).normalize('NFKD'))
  );
  const hasMark = characters.some((char) => /\p{Mark}/u.test(char));
  if (characters.length && !hasMark) return [];
  if (
    hasMark &&
    characters.every((char) => /\p{Mark}/u.test(char) || /\s/u.test(char))
  ) {
    return filled.bodies.map((body) => ({
      id: 'accent',
      shape: { type: 'polyline', points: body.points },
      region: { kind: 'stroke', points: body.points },
      confidence: 0.95,
    }));
  }
  const tittles = new Set(
    detectTittle(geo).map(
      (instance) =>
        (instance.debug as { contourIndex?: number } | undefined)?.contourIndex
    )
  );
  return getMarkContours(geo).flatMap((mark) => {
    if (tittles.has(mark.index)) return [];
    const contour = filled.contours.find(
      (candidate) => candidate.index === mark.index
    );
    if (!contour || contour.points.length < 3) return [];
    return [
      {
        id: 'accent' as const,
        shape: { type: 'polyline' as const, points: contour.points },
        region: { kind: 'stroke' as const, points: contour.points },
        confidence: 0.95,
        anchors: {
          center: {
            x: (mark.bbox.minX + mark.bbox.maxX) / 2,
            y: (mark.bbox.minY + mark.bbox.maxY) / 2,
          },
        },
        debug: { source: 'detached-mark', contourIndex: mark.index },
      },
    ];
  });
}
