/**
 * Eye feature detector.
 *
 * An eye is the enclosed counter in lowercase 'e' with a horizontal crossbar.
 * Treated as a counter specialization - uses hole contours when available.
 *
 * Fixed in v1:
 * - Uses contour-based detection (hole contours) as primary method
 * - Removes odd-intersection "open side" logic
 * - Scale-aware step sizes
 */

import { getHoleContours } from '../geometryCache';
import { rayHits } from '@/utils/geometry/geometryCore';
import type { FeatureInstance, GeometryCache, Point2D } from '../types';

/**
 * Detects eye features on a glyph.
 * Returns circle or polyline shapes for the eye region.
 */
export function detectEye(geo: GeometryCache): FeatureInstance[] {
  const { glyph, metrics, scale } = geo;

  if (!glyph?.path?.commands || !glyph.bbox) {
    return [];
  }

  const instances: FeatureInstance[] = [];
  const { eps, bboxW, bboxH, stemWidth } = scale;

  // Primary method: use hole contours in the lowercase zone
  const holeContours = getHoleContours(geo);

  // Filter to holes within x-height zone (eye is in the body, not descender)
  const eyeCandidates = holeContours.filter((hole) => {
    const holeCenterY = (hole.bbox.minY + hole.bbox.maxY) / 2;
    const holeHeight = hole.bbox.maxY - hole.bbox.minY;

    // Must be within x-height zone
    const inXHeightZone =
      holeCenterY > metrics.baseline &&
      holeCenterY < metrics.xHeight &&
      hole.bbox.maxY < metrics.xHeight + bboxH * 0.1;

    // Must be reasonably sized (not too tiny or too large)
    const reasonableSize = holeHeight > bboxH * 0.1 && holeHeight < bboxH * 0.6;

    return inXHeightZone && reasonableSize;
  });

  if (eyeCandidates.length > 0) {
    for (const hole of eyeCandidates) {
      const cx = (hole.bbox.minX + hole.bbox.maxX) / 2;
      const cy = (hole.bbox.minY + hole.bbox.maxY) / 2;
      const width = hole.bbox.maxX - hole.bbox.minX;
      const height = hole.bbox.maxY - hole.bbox.minY;

      // Eye is typically more horizontal (wider than tall) due to crossbar
      // but we don't require it strictly
      instances.push({
        id: 'eye',
        shape: {
          type: 'circle',
          cx,
          cy,
          r: Math.min(width, height) / 2,
        },
        confidence: 0.85,
        anchors: {
          center: { x: cx, y: cy },
        },
        debug: {
          source: 'hole-contour',
          contourIndex: hole.index,
          area: hole.area,
          aspectRatio: width / height,
        },
      });
    }
    return instances;
  }

  // Fallback: scanline-based detection
  const seed = findEyeSeed(geo);
  if (!seed) return instances;

  // Trace the eye region
  const outline = traceEyeRegion(geo, seed);

  if (outline && outline.length >= 8) {
    instances.push({
      id: 'eye',
      shape: { type: 'polyline', points: outline },
      confidence: 0.65,
      anchors: {
        seed,
        center: calculateCentroid(outline),
      },
      debug: { source: 'scanline-fallback' },
    });
  } else if (seed) {
    // Mark approximate location
    instances.push({
      id: 'eye',
      shape: { type: 'point', x: seed.x, y: seed.y, label: 'Eye' },
      confidence: 0.4,
      anchors: { seed },
      debug: { source: 'seed-only' },
    });
  }

  return instances;
}

/**
 * Finds a seed point inside the eye region using scanlines.
 */
function findEyeSeed(geo: GeometryCache): Point2D | null {
  const { glyph, metrics, svgShape, scale } = geo;
  const { bboxW, overshoot } = scale;

  const bands = 5;
  const delta = bboxW * 0.01;

  for (let i = 2; i < bands; i++) {
    // Focus on upper half of x-height (where eye typically is in 'e')
    const y =
      metrics.baseline + (i * (metrics.xHeight - metrics.baseline)) / bands;
    const origin = { x: glyph.bbox.minX - overshoot * 0.1, y };
    const { points } = rayHits(svgShape, origin, 0, overshoot);

    if (points.length < 4) continue;

    // Look for interior spans (gaps between pairs)
    for (let j = 1; j < points.length - 1; j += 2) {
      const gapStart = points[j].x;
      const gapEnd = points[j + 1].x;
      const gapWidth = gapEnd - gapStart;

      // Interior gap should be moderate size
      if (gapWidth > bboxW * 0.05 && gapWidth < bboxW * 0.6) {
        const seedX = (gapStart + gapEnd) / 2;

        // Verify point is inside bbox
        if (seedX > glyph.bbox.minX && seedX < glyph.bbox.maxX) {
          return { x: seedX, y };
        }
      }
    }
  }

  return null;
}

/**
 * Traces the eye region by radial sweep.
 * Uses scale-aware step sizes and picks inner boundary.
 */
function traceEyeRegion(geo: GeometryCache, seed: Point2D): Point2D[] | null {
  const { glyph, svgShape, scale } = geo;
  const { eps, stemWidth, overshoot } = scale;

  const angularStep = 12; // degrees
  const radialStep = Math.max(eps * 4, stemWidth * 0.1);
  const maxRadius = overshoot;

  const outline: Point2D[] = [];

  for (let angleDeg = 0; angleDeg < 360; angleDeg += angularStep) {
    const rad = (angleDeg * Math.PI) / 180;
    const { points } = rayHits(svgShape, seed, rad, maxRadius);

    if (points.length > 0) {
      // Pick nearest boundary point (inner edge of filled region)
      let minDist = Infinity;
      let nearestPt = points[0];

      for (const p of points) {
        const dist = Math.hypot(p.x - seed.x, p.y - seed.y);
        if (dist < minDist) {
          minDist = dist;
          nearestPt = p;
        }
      }

      outline.push(nearestPt);
    }
  }

  return outline.length >= 8 ? outline : null;
}

/**
 * Calculates centroid of points.
 */
function calculateCentroid(points: Point2D[]): Point2D {
  let sumX = 0;
  let sumY = 0;

  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
  }

  return {
    x: sumX / points.length,
    y: sumY / points.length,
  };
}
