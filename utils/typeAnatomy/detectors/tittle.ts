/**
 * Tittle feature detector.
 *
 * A tittle is the dot above letters like 'i' and 'j'.
 *
 * Fixed in v1:
 * - Added vertical gating: mark.bbox.minY > metrics.xHeight + eps
 * - Uses scale-aware thresholds
 * - Filters marks by area
 */

import { rayHits } from '@/utils/geometry/geometryCore';
import { getMarkContours } from '../geometryCache';
import type { FeatureInstance, GeometryCache } from '../types';

/**
 * Detects tittle features on a glyph.
 * Returns circle shapes at detected tittle locations.
 */
export function detectTittle(geo: GeometryCache): FeatureInstance[] {
  const { glyph, metrics, scale } = geo;

  if (!glyph?.path?.commands || !glyph.bbox) {
    return [];
  }

  const instances: FeatureInstance[] = [];
  const { eps, bboxW, bboxH, stemWidth, overshoot } = scale;

  // Minimum height above x-height for tittle
  const minHeightAboveXHeight = Math.max(eps * 10, stemWidth * 0.2);

  // First, check mark contours (pre-classified as diacritics)
  const markContours = getMarkContours(geo);

  for (const mark of markContours) {
    // CRITICAL: Vertical gating - tittle must be ABOVE x-height
    if (mark.bbox.minY <= metrics.xHeight + minHeightAboveXHeight) {
      continue;
    }

    const width = mark.bbox.maxX - mark.bbox.minX;
    const height = mark.bbox.maxY - mark.bbox.minY;
    const aspectRatio = width / height;
    const area = Math.abs(mark.area);

    // Check if it's roughly circular (aspect ratio near 1)
    const isRoughlyCircular = aspectRatio > 0.6 && aspectRatio < 1.6;

    // Tittle should be small relative to glyph
    const isSmall = width < bboxW * 0.4 && height < bboxH * 0.25;

    // Area check: tittle shouldn't be too tiny or too large
    const areaOK =
      area > stemWidth * stemWidth * 0.2 && area < bboxW * bboxH * 0.15;

    if (isRoughlyCircular && isSmall && areaOK) {
      const cx = (mark.bbox.minX + mark.bbox.maxX) / 2;
      const cy = (mark.bbox.minY + mark.bbox.maxY) / 2;
      const r = Math.max(width, height) / 2;

      instances.push({
        id: 'tittle',
        shape: { type: 'circle', cx, cy, r },
        confidence: 0.9,
        anchors: {
          center: { x: cx, y: cy },
        },
        debug: {
          source: 'mark-contour',
          contourIndex: mark.index,
          aspectRatio,
          area,
        },
      });
    }
  }

  // If no mark contours found tittle, try ray-based detection
  if (instances.length === 0) {
    const tittleResult = findTittleByRay(geo);
    if (tittleResult) {
      instances.push(tittleResult);
    }
  }

  return instances;
}

/**
 * Finds tittle by casting rays above x-height.
 * Fallback when mark contour detection fails.
 */
function findTittleByRay(geo: GeometryCache): FeatureInstance | null {
  const { glyph, metrics, svgShape, scale } = geo;
  const { eps, bboxW, bboxH, stemWidth, overshoot } = scale;

  // Minimum height above x-height
  const minHeightAboveXHeight = Math.max(eps * 10, stemWidth * 0.2);

  // Scan horizontal bands above x-height
  const bands = 4;
  let best: { x1: number; x2: number; y: number; width: number } | null = null;

  for (let i = 1; i <= bands; i++) {
    const y =
      metrics.xHeight +
      minHeightAboveXHeight +
      (i * (metrics.ascent - metrics.xHeight - minHeightAboveXHeight)) /
        (bands + 1);

    // Skip if y is above glyph
    if (y > glyph.bbox.maxY) continue;

    const origin = { x: glyph.bbox.minX - overshoot * 0.1, y };
    const { points } = rayHits(svgShape, origin, 0, overshoot);

    for (let j = 0; j < points.length - 1; j += 2) {
      const x1 = points[j].x;
      const x2 = points[j + 1].x;
      const w = x2 - x1;

      // Small, near-circular shape
      if (w > 0 && w < bboxW * 0.35) {
        if (!best || w < best.width) {
          best = { x1, x2, y, width: w };
        }
      }
    }
  }

  if (!best) return null;

  // Estimate height by vertical probe
  const cx = (best.x1 + best.x2) / 2;
  const probeRadius = stemWidth * 2;
  const vProbe = rayHits(
    svgShape,
    { x: cx, y: best.y - probeRadius },
    Math.PI / 2,
    probeRadius * 2
  );

  let estimatedHeight = best.width; // Default to width for circle
  if (vProbe.points.length >= 2) {
    for (let k = 0; k < vProbe.points.length - 1; k += 2) {
      const y1 = vProbe.points[k].y;
      const y2 = vProbe.points[k + 1].y;
      if (y1 <= best.y && best.y <= y2) {
        estimatedHeight = y2 - y1;
        break;
      }
    }
  }

  const r = Math.max(1, Math.min(best.width / 2, estimatedHeight / 2));

  return {
    id: 'tittle',
    shape: { type: 'circle', cx, cy: best.y, r },
    confidence: 0.65,
    anchors: {
      center: { x: cx, y: best.y },
    },
    debug: {
      source: 'ray-fallback',
      width: best.width,
      estimatedHeight,
    },
  };
}
