/**
 * Serif feature detector.
 *
 * A serif is a small terminal projection at the end of a stroke.
 *
 * Fixed in v1:
 * - Uses scale.stemWidth for nudge distances instead of huge EPS multipliers
 * - Focus on terminal positions (baseline, cap height) not mid-body
 * - Horizontal outward probe is more diagnostic than vertical
 */

import { rayHits } from '@/utils/geometry/geometryCore';
import type { FeatureInstance, GeometryCache, Point2D } from '../types';

/**
 * Detects serif features on a glyph.
 * Focuses on terminal projections at baseline and cap/x-height.
 */
export function detectSerif(geo: GeometryCache): FeatureInstance[] {
  const { glyph, metrics, svgShape, scale } = geo;

  if (!glyph?.path?.commands || !glyph.bbox) {
    return [];
  }

  const instances: FeatureInstance[] = [];
  const { eps, bboxW, bboxH, stemWidth, overshoot } = scale;

  // Serifs are terminal features - check at baseline and top
  // Use stemWidth-based nudge, not UPEM*0.01
  const nudge = stemWidth * 0.25;

  // Terminal Y positions to check
  const terminals = [
    { y: metrics.baseline, type: 'foot' as const },
    { y: metrics.xHeight, type: 'top' as const },
    { y: metrics.capHeight, type: 'cap' as const },
  ];

  for (const terminal of terminals) {
    // Skip if terminal is outside glyph bbox
    if (
      terminal.y < glyph.bbox.minY - bboxH * 0.1 ||
      terminal.y > glyph.bbox.maxY + bboxH * 0.1
    ) {
      continue;
    }

    // Scan at terminal level
    const origin = { x: glyph.bbox.minX - overshoot * 0.1, y: terminal.y };
    const { points } = rayHits(svgShape, origin, 0, overshoot);

    if (points.length < 2) continue;

    // For each stem edge, check for horizontal widening (serif)
    for (let j = 0; j < points.length - 1; j += 2) {
      const leftEdge = points[j].x;
      const rightEdge = points[j + 1].x;
      const spanWidth = rightEdge - leftEdge;

      // Skip if span is too thin (not a stem)
      if (spanWidth < stemWidth * 0.5) continue;

      // Check for left serif: horizontal probe outward from left edge
      const leftSerif = detectSerifAtEdge(
        geo,
        { x: leftEdge, y: terminal.y },
        'left',
        terminal.type
      );
      if (leftSerif) {
        instances.push(leftSerif);
      }

      // Check for right serif: horizontal probe outward from right edge
      const rightSerif = detectSerifAtEdge(
        geo,
        { x: rightEdge, y: terminal.y },
        'right',
        terminal.type
      );
      if (rightSerif) {
        instances.push(rightSerif);
      }
    }
  }

  // Deduplicate nearby serifs
  return deduplicateSerifs(instances, stemWidth * 0.5);
}

/**
 * Detects a serif at a specific edge position by probing horizontally.
 */
function detectSerifAtEdge(
  geo: GeometryCache,
  edge: Point2D,
  side: 'left' | 'right',
  type: 'foot' | 'top' | 'cap'
): FeatureInstance | null {
  const { svgShape, scale } = geo;
  const { stemWidth, bboxH } = scale;

  // Probe direction: outward from edge
  const angle = side === 'left' ? Math.PI : 0; // Left = 180°, Right = 0°
  const probeLen = stemWidth * 2;

  // Probe at terminal level
  const { points } = rayHits(svgShape, edge, angle, probeLen);

  // For a serif, we should hit geometry close to the edge
  // (the serif bracket/extension)
  if (points.length === 0) return null;

  const firstHit = points[0];
  const distance = Math.abs(firstHit.x - edge.x);

  // Serif should be close to the edge (within stemWidth)
  // but not at zero (that would just be the edge itself)
  if (distance < stemWidth * 0.1 || distance > stemWidth * 1.5) {
    return null;
  }

  // Verify with vertical probe: serif extends vertically too
  const verticalAngle = type === 'foot' ? -Math.PI / 2 : Math.PI / 2;
  const vertProbe = rayHits(svgShape, edge, verticalAngle, bboxH * 0.1);

  if (vertProbe.points.length === 0) return null;

  return {
    id: 'serif',
    shape: {
      type: 'point',
      x: edge.x,
      y: edge.y,
      label: `${type} serif`,
    },
    confidence: 0.7,
    anchors: {
      position: edge,
      extension: firstHit,
    },
    debug: {
      side,
      type,
      extensionDistance: distance,
    },
  };
}

/**
 * Removes duplicate serifs that are too close together.
 */
function deduplicateSerifs(
  instances: FeatureInstance[],
  tolerance: number
): FeatureInstance[] {
  const result: FeatureInstance[] = [];

  for (const inst of instances) {
    if (inst.shape.type !== 'point') {
      result.push(inst);
      continue;
    }

    const instShape = inst.shape;
    const isDuplicate = result.some((existing) => {
      if (existing.shape.type !== 'point') return false;
      const existingShape = existing.shape;
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
