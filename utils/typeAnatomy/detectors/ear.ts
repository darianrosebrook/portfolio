/** A small upper projection belongs to a double-storey g or an r head. */
import {
  getFilledGeometry,
  occupiedRayIntervals,
} from '@/utils/geometry/filledGeometry';
import { buildProjectionPolygon } from '../evidence/projectionRegion';
import { detectStem } from './stem';
import type { FeatureInstance, GeometryCache } from '../types';

export function detectEar(geo: GeometryCache): FeatureInstance[] {
  const { glyph, metrics, scale } = geo;
  if (
    !glyph?.path?.commands?.length ||
    !glyph.bbox ||
    glyph.bbox.maxY > metrics.xHeight + scale.bboxH * 0.08
  )
    return [];
  const filled = geo.filled ?? getFilledGeometry(glyph);
  const upper = filled.enclosedRegions.find(
    (hole) => hole.bbox.minY > metrics.baseline
  );
  const lower = filled.enclosedRegions.find(
    (hole) => hole.bbox.minY < metrics.baseline
  );
  const stems = upper ? [] : detectStem(geo);
  if (upper && !lower) return [];
  if (
    !upper &&
    (!stems.length || glyph.bbox.minY < metrics.baseline - scale.bboxH * 0.1)
  )
    return [];
  const referenceAtY = (y: number): number | undefined => {
    if (upper) return upper.bbox.maxX;
    const edges = stems.flatMap((stem) => {
      const points = stem.region?.points;
      if (!points?.length) return [];
      // Above a short shaft's actual supported top, its top attachment is the
      // reference. Do not project a slanted bounding box or invent shaft ink.
      const row = Math.max(
        Math.min(...points.map((p) => p.y)),
        Math.min(Math.max(...points.map((p) => p.y)), y)
      );
      const intersections: number[] = [];
      for (let i = 0; i < points.length; i++) {
        const a = points[i],
          b = points[(i + 1) % points.length];
        if (a.y === b.y || row < Math.min(a.y, b.y) || row > Math.max(a.y, b.y))
          continue;
        intersections.push(a.x + ((b.x - a.x) * (row - a.y)) / (b.y - a.y));
      }
      return intersections;
    });
    return edges.length ? Math.max(...edges) : undefined;
  };
  const samples = [];
  for (let i = 0; i < 48; i++) {
    const y =
      metrics.xHeight * 0.7 +
      ((glyph.bbox.maxY - metrics.xHeight * 0.7) * (i + 0.5)) / 48;
    const spans = occupiedRayIntervals(
      filled,
      { x: glyph.bbox.minX - scale.eps, y },
      0,
      scale.overshoot
    );
    if (spans.length) {
      const tip = spans.at(-1)!.far;
      const reference = referenceAtY(tip.y);
      if (reference !== undefined)
        samples.push({ tip, reference, projection: tip.x - reference });
    }
  }
  const projected = samples.sort((a, b) => b.projection - a.projection)[0];
  if (!projected || projected.projection < scale.bboxW * 0.08) return [];
  const { tip, reference: bodyReference } = projected;
  const polygon = buildProjectionPolygon({
    glyph,
    anchor: tip,
    arcLengthBudget: Math.max(scale.bboxW * 0.18, metrics.capHeight * 0.12),
  });
  if (polygon.length < 3) return [];
  return [
    {
      id: 'ear',
      shape: { type: 'point', ...tip, label: 'Ear' },
      region: { kind: 'stroke', points: polygon },
      confidence: 0.85,
      anchors: { position: tip },
      debug: { source: 'upper-projecting-outline', bodyReference },
    },
  ];
}
