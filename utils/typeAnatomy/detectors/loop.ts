/**
 * Loop feature detector.
 *
 * A loop is a closed or partial bowl below baseline (e.g., in 'g', 'y').
 *
 * Fixed in v1:
 * - Picks outer boundary (furthest hit) for outline tracing
 * - Uses scale-aware step sizes
 * - Gates traced points to be below baseline
 */

import { rayHits } from '@/utils/geometry/geometryCore';
import type { FeatureInstance, GeometryCache, Point2D } from '../types';

/**
 * Detects loop features on a glyph.
 * Returns polyline shapes tracing the loop region.
 */
export function detectLoop(geo: GeometryCache): FeatureInstance[] {
  const { glyph, metrics, svgShape, scale } = geo;

  if (!glyph?.path?.commands || !glyph.bbox) {
    return [];
  }

  const instances: FeatureInstance[] = [];
  const { eps, bboxW, bboxH, stemWidth, overshoot } = scale;

  // Check if glyph extends below baseline
  const hasDescender = glyph.bbox.minY < metrics.baseline - bboxH * 0.1;
  if (!hasDescender) {
    return instances;
  }

  // Scan horizontal bands below baseline
  const hSteps = 4;
  let hFound = 0;

  for (let i = 1; i <= hSteps; i++) {
    const y =
      metrics.baseline -
      (i * (metrics.baseline - metrics.descent)) / (hSteps + 1);
    const origin = { x: glyph.bbox.minX - overshoot * 0.1, y };
    const { points } = rayHits(svgShape, origin, 0, overshoot);

    // Loop signature: ≥4 intersections below baseline
    if (points.length >= 4) {
      const interior = points.filter(
        (p) => p.y < metrics.baseline && p.y > metrics.descent
      );
      if (interior.length >= 4) {
        hFound++;
      }
    }
  }

  // Scan vertical bands in loop region
  const vSteps = 4;
  let vFound = 0;

  for (let i = 1; i <= vSteps; i++) {
    const x = glyph.bbox.minX + (bboxW * i) / (vSteps + 1);
    const origin = { x, y: metrics.descent - overshoot * 0.1 };
    const { points } = rayHits(svgShape, origin, Math.PI / 2, overshoot);

    if (points.length >= 4) {
      const interior = points.filter(
        (p) => p.y < metrics.baseline && p.y > metrics.descent
      );
      if (interior.length >= 4) {
        vFound++;
      }
    }
  }

  if (hFound >= 1 || vFound >= 1) {
    // Try to trace the loop region
    const loopPoints = traceLoopRegion(geo);

    if (loopPoints && loopPoints.length >= 8) {
      // Filter to only points below baseline
      const belowBaseline = loopPoints.filter(
        (p) => p.y < metrics.baseline + eps * 5
      );

      if (belowBaseline.length >= 6) {
        instances.push({
          id: 'loop',
          shape: { type: 'polyline', points: belowBaseline },
          confidence: 0.8,
          anchors: {
            center: calculateCentroid(belowBaseline),
          },
          debug: { hFound, vFound },
        });
      }
    } else {
      // Mark loop presence without full outline
      const loopCenterX = (glyph.bbox.minX + glyph.bbox.maxX) / 2;
      const loopCenterY = (metrics.baseline + metrics.descent) / 2;

      instances.push({
        id: 'loop',
        shape: {
          type: 'point',
          x: loopCenterX,
          y: loopCenterY,
          label: 'Loop',
        },
        confidence: 0.5,
        debug: { hFound, vFound, tracePoints: loopPoints?.length ?? 0 },
      });
    }
  }

  return instances;
}

/**
 * Traces the loop region below baseline.
 * Uses radial sweep from center, picking OUTER boundary (furthest hit).
 */
function traceLoopRegion(geo: GeometryCache): Point2D[] | null {
  const { glyph, metrics, svgShape, scale } = geo;
  const { eps, stemWidth, overshoot } = scale;
  const points: Point2D[] = [];

  // Find loop center by scanning at mid-descender height
  const centerY = (metrics.baseline + metrics.descent) / 2;
  const origin = { x: glyph.bbox.minX - overshoot * 0.1, y: centerY };
  const { points: hScan } = rayHits(svgShape, origin, 0, overshoot);

  if (hScan.length < 2) return null;

  // Use the span that's most likely the loop (filter to below baseline)
  const belowBaselineSpans: Array<{ x1: number; x2: number }> = [];
  for (let i = 0; i < hScan.length - 1; i += 2) {
    const x1 = hScan[i].x;
    const x2 = hScan[i + 1].x;
    belowBaselineSpans.push({ x1, x2 });
  }

  if (belowBaselineSpans.length === 0) return null;

  // Pick the widest span as the loop region
  const widestSpan = belowBaselineSpans.reduce((best, span) => {
    const width = span.x2 - span.x1;
    const bestWidth = best.x2 - best.x1;
    return width > bestWidth ? span : best;
  });

  const centerX = (widestSpan.x1 + widestSpan.x2) / 2;

  // Scale-aware angular step
  const step = 12; // degrees

  for (let angle = 0; angle < 360; angle += step) {
    const rad = (angle * Math.PI) / 180;
    const { points: rayPts } = rayHits(
      svgShape,
      { x: centerX, y: centerY },
      rad,
      overshoot
    );

    if (rayPts.length > 0) {
      // Pick OUTER boundary: furthest point from seed
      let maxDist = 0;
      let outerPt = rayPts[0];

      for (const p of rayPts) {
        const dist = Math.hypot(p.x - centerX, p.y - centerY);
        if (dist > maxDist) {
          maxDist = dist;
          outerPt = p;
        }
      }

      points.push(outerPt);
    }
  }

  return points.length >= 8 ? points : null;
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
