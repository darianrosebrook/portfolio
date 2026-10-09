import { getFilledGeometry } from '@/utils/geometry/filledGeometry';
import { getMarkContours } from '../geometryCache';
import { isCompactContour } from '../evidence/topology';
import { detectStem } from './stem';
import type { FeatureInstance, GeometryCache, Point2D } from '../types';

/** Structural dots attach to their local i/j backbone, including ligatures. */
export function detectTittle(geo: GeometryCache): FeatureInstance[] {
  const { glyph, metrics, scale } = geo;
  if (!glyph?.path?.commands?.length || !glyph.bbox) return [];
  const characters = (glyph.codePoints ?? []).flatMap((cp) =>
    Array.from(String.fromCodePoint(cp).normalize('NFKD'))
  );
  if (
    characters.length &&
    (characters.some((char) => /\p{Mark}/u.test(char)) ||
      !characters.some((char) => char === 'i' || char === 'j'))
  )
    return [];
  const marks = getMarkContours(geo);
  if (marks.length !== 1) return [];
  const filled = geo.filled ?? getFilledGeometry(glyph);
  const stems = detectStem(geo);
  return marks.flatMap((mark): FeatureInstance[] => {
    if (
      !isCompactContour(mark.bbox, {
        glyphBBox: glyph.bbox,
        metrics,
        stemWidth: scale.stemWidth,
      })
    )
      return [];
    const center = {
      x: (mark.bbox.minX + mark.bbox.maxX) / 2,
      y: (mark.bbox.minY + mark.bbox.maxY) / 2,
    };
    const width = mark.bbox.maxX - mark.bbox.minX;
    const supportingStem = stems.find((stem) => {
      const points = stem.region?.points;
      if (!points?.length) return false;
      const topY = Math.max(...points.map((point) => point.y));
      const topPoints = points.filter(
        (point) => Math.abs(point.y - topY) < scale.eps
      );
      const top: Point2D = stem.anchors?.top ?? {
        x: topPoints.reduce((sum, p) => sum + p.x, 0) / topPoints.length,
        y: topY,
      };
      const stemWidth =
        Math.max(...points.map((point) => point.x)) -
        Math.min(...points.map((point) => point.x));
      return (
        mark.bbox.minY > top.y + scale.eps &&
        Math.abs(center.x - top.x) < (width + stemWidth) / 2
      );
    });
    if (!supportingStem) return [];
    const contour = filled.contours.find(
      (candidate) => candidate.index === mark.index
    );
    if (!contour) return [];
    return [
      {
        id: 'tittle',
        shape: {
          type: 'circle',
          cx: center.x,
          cy: center.y,
          r: Math.max(width, mark.bbox.maxY - mark.bbox.minY) / 2,
        },
        region: { kind: 'stroke', points: contour.points },
        confidence: 0.95,
        anchors: { center },
        debug: {
          source: 'local-backbone-dot',
          contourIndex: mark.index,
          markBBox: mark.bbox,
        },
      },
    ];
  });
}
