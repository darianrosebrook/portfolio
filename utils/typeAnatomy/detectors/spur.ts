/**
 * Spur feature detector.
 *
 * A spur is a small terminal projection from a main stroke (e.g., in 'G', 'S').
 *
 * Fixed in v1:
 * - Detects actual terminal projections, not just "wedge hits"
 * - Finds stem edges first, then probes horizontally for projections
 * - Uses scale-aware thresholds
 */

import { rayHits } from '@/utils/geometry/geometryCore';
import type { FeatureInstance, GeometryCache, Point2D } from '../types';

/**
 * Detects spur features on a glyph.
 * Returns point shapes at detected spur locations.
 */
export function detectSpur(geo: GeometryCache): FeatureInstance[] {
  const { glyph, metrics, svgShape, scale } = geo;

  if (!glyph?.path?.commands || !glyph.bbox) {
    return [];
  }

  const instances: FeatureInstance[] = [];
  const { eps, bboxW, bboxH, stemWidth, overshoot } = scale;

  // Spur is a small horizontal projection at terminal positions
  // Check near baseline and at glyph terminations

  // Terminal Y positions to check (baseline and descender zone)
  const terminals = [
    { y: metrics.baseline, zone: 'baseline' },
    { y: metrics.baseline - bboxH * 0.1, zone: 'below-baseline' },
  ];

  for (const terminal of terminals) {
    // Scan at this Y level
    const origin = { x: glyph.bbox.minX - overshoot * 0.1, y: terminal.y };
    const { points } = rayHits(svgShape, origin, 0, overshoot);

    if (points.length < 2) continue;

    // Convert to filled spans
    for (let j = 0; j < points.length - 1; j += 2) {
      const x1 = points[j].x;
      const x2 = points[j + 1].x;
      const spanWidth = x2 - x1;

      // Only consider thick spans (stems)
      if (spanWidth < stemWidth * 0.5) continue;

      // Check for left-side spur: horizontal projection from left edge
      const leftSpur = detectSpurAtEdge(
        geo,
        { x: x1, y: terminal.y },
        'left',
        terminal.zone
      );
      if (leftSpur) instances.push(leftSpur);

      // Check for right-side spur: horizontal projection from right edge
      const rightSpur = detectSpurAtEdge(
        geo,
        { x: x2, y: terminal.y },
        'right',
        terminal.zone
      );
      if (rightSpur) instances.push(rightSpur);
    }
  }

  // Deduplicate
  return deduplicateSpurs(instances, stemWidth * 0.5);
}

/**
 * Detects a spur at a specific edge by probing horizontally.
 */
function detectSpurAtEdge(
  geo: GeometryCache,
  edge: Point2D,
  side: 'left' | 'right',
  zone: string
): FeatureInstance | null {
  const { svgShape, scale } = geo;
  const { stemWidth, bboxH } = scale;

  // Probe outward horizontally
  const angle = side === 'left' ? Math.PI : 0;
  const probeLen = stemWidth * 1.5;

  const { points } = rayHits(svgShape, edge, angle, probeLen);

  if (points.length === 0) return null;

  const firstHit = points[0];
  const distance = Math.abs(firstHit.x - edge.x);

  // Spur should be a small projection (stemWidth * 0.2 to stemWidth * 1.0)
  if (distance < stemWidth * 0.15 || distance > stemWidth * 1.2) {
    return null;
  }

  // Verify it's a short projection (not extending too far vertically)
  // by checking above and below
  const vertProbeUp = rayHits(svgShape, edge, Math.PI / 2, bboxH * 0.15);
  const vertProbeDown = rayHits(svgShape, edge, -Math.PI / 2, bboxH * 0.15);

  const verticalExtent =
    (vertProbeUp.points.length > 0 ? 1 : 0) +
    (vertProbeDown.points.length > 0 ? 1 : 0);

  // Spur should be localized (not extend far vertically)
  if (verticalExtent < 1) return null;

  return {
    id: 'spur',
    shape: {
      type: 'point',
      x: edge.x,
      y: edge.y,
      label: 'Spur',
    },
    confidence: 0.6,
    anchors: {
      position: edge,
      projection: firstHit,
    },
    debug: {
      side,
      zone,
      projectionDistance: distance,
    },
  };
}

/**
 * Removes duplicate spurs that are too close together.
 */
function deduplicateSpurs(
  instances: FeatureInstance[],
  tolerance: number
): FeatureInstance[] {
  const result: FeatureInstance[] = [];

  for (const inst of instances) {
    if (inst.shape.type !== 'point') {
      result.push(inst);
      continue;
    }

    const instShape = inst.shape; // Narrowed to point type

    const isDuplicate = result.some((existing) => {
      if (existing.shape.type !== 'point') return false;
      const existingShape = existing.shape; // Narrowed to point type
      const dist = Math.hypot(
        existingShape.x - instShape.x,
        existingShape.y - instShape.y
      );
      return dist < tolerance;
    });

    if (!isDuplicate) {
      result.push(inst);
    }
  }

  return result;
}
