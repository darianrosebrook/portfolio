/**
 * Crotch feature detector.
 *
 * A crotch is the interior concave junction where two strokes meet
 * (e.g., in 'A', 'V', 'W', 'K', 'M').
 *
 * Fixed in v1:
 * - Uses local Y-minimum detection instead of "wedge hits"
 * - Probes multiple X positions to find V-valleys
 * - Scale-aware thresholds
 */

import { rayHits } from '@/utils/geometry/geometryCore';
import type { FeatureInstance, GeometryCache, Point2D } from '../types';

/**
 * Represents a crotch candidate (local minimum).
 */
interface CrotchCandidate {
  x: number;
  y: number;
  depth: number; // How much lower than neighbors
}

/**
 * Detects crotch features on a glyph.
 * Returns point shapes at detected crotch locations.
 */
export function detectCrotch(geo: GeometryCache): FeatureInstance[] {
  const { glyph, metrics, svgShape, scale } = geo;

  if (!glyph?.path?.commands || !glyph.bbox) {
    return [];
  }

  const instances: FeatureInstance[] = [];
  const { eps, bboxW, bboxH, stemWidth, overshoot } = scale;

  // Determine target zone (crotches are in the body, not at extremes)
  // For uppercase letters, check near baseline
  // For letters like A, the crotch is the interior angle where diagonals meet

  // Probe X positions across the glyph
  const xPositions = [0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85].map(
    (t) => glyph.bbox.minX + bboxW * t
  );

  // For each X, cast vertical ray upward and find lowest intersection
  const lowestIntersections: Array<{ x: number; y: number }> = [];

  for (const x of xPositions) {
    const origin = { x, y: glyph.bbox.minY - overshoot * 0.1 };
    const { points } = rayHits(svgShape, origin, Math.PI / 2, overshoot);

    if (points.length > 0) {
      // Lowest intersection is first hit (since we're going up from below)
      const lowest = points[0];

      // Only consider intersections above baseline
      if (lowest.y > metrics.baseline - bboxH * 0.05) {
        lowestIntersections.push({ x, y: lowest.y });
      }
    }
  }

  if (lowestIntersections.length < 3) {
    return instances;
  }

  // Find local Y-minima (V-valleys) in the lowest intersection profile
  const candidates: CrotchCandidate[] = [];

  for (let i = 1; i < lowestIntersections.length - 1; i++) {
    const prev = lowestIntersections[i - 1];
    const curr = lowestIntersections[i];
    const next = lowestIntersections[i + 1];

    // Local minimum: current Y is lower than both neighbors
    // (in glyph coords, lower Y = lower on the page)
    const isValley = curr.y < prev.y && curr.y < next.y;

    if (isValley) {
      const depth = Math.min(prev.y - curr.y, next.y - curr.y);

      // Minimum depth to be considered a crotch
      if (depth > bboxH * 0.03) {
        candidates.push({
          x: curr.x,
          y: curr.y,
          depth,
        });
      }
    }
  }

  // Emit crotch instances
  for (const candidate of candidates) {
    // Verify it's an interior junction (not just the baseline)
    const isAboveBaseline = candidate.y > metrics.baseline + bboxH * 0.05;

    if (isAboveBaseline) {
      instances.push({
        id: 'crotch',
        shape: {
          type: 'point',
          x: candidate.x,
          y: candidate.y,
          label: 'Crotch',
        },
        confidence: Math.min(
          0.85,
          0.5 + (candidate.depth / (bboxH * 0.1)) * 0.2
        ),
        anchors: {
          position: { x: candidate.x, y: candidate.y },
        },
        debug: {
          depth: candidate.depth,
          depthRatio: candidate.depth / bboxH,
        },
      });
    }
  }

  // If no interior crotches found but letter is angular, check baseline zone
  // (for letters like V where the crotch is at the bottom)
  if (instances.length === 0) {
    const baselineCrotch = detectBaselineCrotch(geo, lowestIntersections);
    if (baselineCrotch) {
      instances.push(baselineCrotch);
    }
  }

  return instances;
}

/**
 * Detects crotch at baseline for letters like V where
 * the vertex is also a crotch (interior angle).
 */
function detectBaselineCrotch(
  geo: GeometryCache,
  lowestIntersections: Array<{ x: number; y: number }>
): FeatureInstance | null {
  const { metrics, scale } = geo;
  const { bboxH } = scale;

  // Find the global minimum Y among intersections
  if (lowestIntersections.length === 0) return null;

  const globalMin = lowestIntersections.reduce((min, curr) =>
    curr.y < min.y ? curr : min
  );

  // Check if this minimum is near baseline and forms a V-shape
  const nearBaseline = Math.abs(globalMin.y - metrics.baseline) < bboxH * 0.15;

  if (!nearBaseline) return null;

  // Check for V-shape: neighbors should be higher
  const idx = lowestIntersections.findIndex(
    (p) => p.x === globalMin.x && p.y === globalMin.y
  );

  if (idx <= 0 || idx >= lowestIntersections.length - 1) return null;

  const prev = lowestIntersections[idx - 1];
  const next = lowestIntersections[idx + 1];

  const isVShape =
    prev.y > globalMin.y + bboxH * 0.05 && next.y > globalMin.y + bboxH * 0.05;

  if (!isVShape) return null;

  return {
    id: 'crotch',
    shape: {
      type: 'point',
      x: globalMin.x,
      y: globalMin.y,
      label: 'Crotch',
    },
    confidence: 0.6,
    anchors: {
      position: { x: globalMin.x, y: globalMin.y },
    },
    debug: {
      source: 'baseline-crotch',
      vShapeDepth: Math.min(prev.y - globalMin.y, next.y - globalMin.y),
    },
  };
}
