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
  if (upper && !lower) return [];
  if (
    !upper &&
    (!detectStem(geo).length ||
      glyph.bbox.minY < metrics.baseline - scale.bboxH * 0.1)
  )
    return [];
  const bodyReference = upper
    ? upper.bbox.maxX
    : (() => {
        const spans = occupiedRayIntervals(
          filled,
          { x: glyph.bbox.minX - scale.eps, y: metrics.xHeight * 0.5 },
          0,
          scale.overshoot
        );
        return spans.at(-1)?.far.x;
      })();
  if (bodyReference === undefined) return [];
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
    if (spans.length) samples.push(spans.at(-1)!.far);
  }
  const tip = samples.sort((a, b) => b.x - a.x)[0];
  if (!tip || tip.x < bodyReference + scale.bboxW * 0.08) return [];
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
