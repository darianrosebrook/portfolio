/** A short terminal branch must be attached to a larger curved main stroke. */
import {
  getFilledGeometry,
  occupiedRayIntervals,
} from '@/utils/geometry/filledGeometry';
import { detectStem } from './stem';
import { rectToPolygon } from '../evidence/regionFromShape';
import type { FeatureInstance, GeometryCache } from '../types';

export function detectSpur(geo: GeometryCache): FeatureInstance[] {
  const { glyph, metrics, scale } = geo;
  if (!glyph?.path?.commands?.length || !glyph.bbox) return [];
  const filled = geo.filled ?? getFilledGeometry(glyph);
  // A closed bowl's descending branch is not a spur, and serif terminal
  // widening requires its own evidence rather than this branch rule.
  if (filled.enclosedRegions.length) return [];
  const result: FeatureInstance[] = [];
  for (const feature of detectStem(geo)) {
    if (feature.shape.type !== 'rect') continue;
    const stem = feature.shape;
    if (
      stem.y > metrics.baseline + scale.eps ||
      stem.height > scale.bboxH * 0.65 ||
      stem.height < stem.width
    )
      continue;
    if (stem.x < glyph.bbox.minX + scale.bboxW * 0.5) continue;
    let joinY: number | undefined;
    for (let i = 1; i < 64; i++) {
      const y = stem.y + (stem.height * i) / 64;
      const spans = occupiedRayIntervals(
        filled,
        { x: glyph.bbox.minX - scale.eps, y },
        0,
        scale.overshoot
      );
      const branch = spans.find(
        (span) =>
          span.near.x <= stem.x + stem.width / 2 &&
          span.far.x >= stem.x + stem.width / 2
      );
      if (!branch) break;
      if (branch.near.x < stem.x - scale.eps * 2) {
        joinY = y;
        break;
      }
      // There must be a distinct main curved body alongside the terminal.
      if (!spans.some((span) => span !== branch && span.far.x < stem.x)) break;
    }
    if (joinY === undefined || joinY - stem.y < stem.width * 0.4) continue;
    const rect = { ...stem, height: joinY - stem.y };
    const anchor = { x: stem.x + stem.width / 2, y: stem.y };
    result.push({
      id: 'spur',
      shape: { type: 'point', ...anchor, label: 'Spur' },
      region: { kind: 'stroke', points: rectToPolygon(rect) },
      confidence: 0.85,
      anchors: { position: anchor, attachment: { x: anchor.x, y: joinY } },
      debug: { source: 'short-attached-terminal-branch' },
    });
  }
  return result;
}
