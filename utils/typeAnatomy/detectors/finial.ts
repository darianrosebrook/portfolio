/**
 * Finial feature detector.
 *
 * A finial is a tapered or shaped terminal of a stroke (non-serif).
 * Found at stroke endings that don't have serif projections.
 *
 * v2 improvements:
 * - Uses scale-aware thresholds (geo.scale)
 * - Detects tapered terminals by width reduction at extremes
 * - Curvature analysis for improved confidence scoring
 */

import { rayHits } from '@/utils/geometry/geometryCore';
import { analyzeTerminalCurvature } from '../curvatureAnalysis';
import type { FeatureInstance, GeometryCache, Point2D } from '../types';

/**
 * Detects finial features on a glyph.
 * Returns point shapes at detected finial locations.
 */
export function detectFinial(geo: GeometryCache): FeatureInstance[] {
  const { glyph, metrics, svgShape, scale } = geo;

  if (!glyph?.path?.commands || !glyph.bbox) {
    return [];
  }

  const instances: FeatureInstance[] = [];
  const { eps, bboxW, bboxH, stemWidth, overshoot } = scale;

  // Finials are at terminal positions - check near baseline and cap/x-height
  const terminals = [
    { y: metrics.baseline, zone: 'baseline' },
    { y: metrics.xHeight, zone: 'x-height' },
    { y: metrics.capHeight, zone: 'cap-height' },
  ];

  for (const terminal of terminals) {
    // Skip if outside glyph bounds
    if (
      terminal.y < glyph.bbox.minY - bboxH * 0.1 ||
      terminal.y > glyph.bbox.maxY + bboxH * 0.1
    ) {
      continue;
    }

    const origin = { x: glyph.bbox.minX - overshoot * 0.1, y: terminal.y };
    const { points } = rayHits(svgShape, origin, 0, overshoot);

    if (points.length < 2) continue;

    // For each filled span, check if terminals are finials
    for (let j = 0; j < points.length - 1; j += 2) {
      const leftEdge = points[j];
      const rightEdge = points[j + 1];
      const spanWidth = rightEdge.x - leftEdge.x;

      // Only check thick spans (stems)
      if (spanWidth < stemWidth * 0.5) continue;

      // Check left terminal
      const leftFinial = detectFinialAtEdge(
        geo,
        { x: leftEdge.x, y: terminal.y },
        'left',
        terminal.zone
      );
      if (leftFinial) instances.push(leftFinial);

      // Check right terminal
      const rightFinial = detectFinialAtEdge(
        geo,
        { x: rightEdge.x, y: terminal.y },
        'right',
        terminal.zone
      );
      if (rightFinial) instances.push(rightFinial);
    }
  }

  // Deduplicate nearby finials
  return deduplicateFinials(instances, stemWidth * 0.5);
}

/**
 * Detects a finial at a specific edge by checking for tapering.
 * A finial tapers away without serif projection.
 */
function detectFinialAtEdge(
  geo: GeometryCache,
  edge: Point2D,
  side: 'left' | 'right',
  zone: string
): FeatureInstance | null {
  const { svgShape, scale } = geo;
  const { eps, stemWidth, bboxH } = scale;

  // Check for tapering by probing slightly above/below
  const probeOffsets = [bboxH * 0.03, -bboxH * 0.03];
  const widths: number[] = [];

  for (const offset of probeOffsets) {
    const probeY = edge.y + offset;
    const origin = { x: edge.x - stemWidth * 2, y: probeY };
    const { points } = rayHits(svgShape, origin, 0, stemWidth * 4);

    // Find the span containing our edge
    for (let j = 0; j < points.length - 1; j += 2) {
      const x1 = points[j].x;
      const x2 = points[j + 1].x;

      // Check if this span contains our edge position
      if (x1 <= edge.x + stemWidth * 0.5 && x2 >= edge.x - stemWidth * 0.5) {
        widths.push(x2 - x1);
        break;
      }
    }
  }

  // Not enough data to determine finial
  if (widths.length < 1) return null;

  // Check for serif: probe horizontally outward
  const serifAngle = side === 'left' ? Math.PI : 0;
  const serifProbe = rayHits(svgShape, edge, serifAngle, stemWidth * 1.5);

  // If we hit something close, it's likely a serif, not a finial
  const hasSerif =
    serifProbe.points.length > 0 &&
    Math.abs(serifProbe.points[0].x - edge.x) < stemWidth * 0.8;

  if (hasSerif) return null;

  // Analyze curvature at this terminal for improved confidence
  const curvatureResult = analyzeTerminalCurvature(geo, edge);

  // Base confidence from probe-based detection
  let confidence = 0.6;

  // Boost confidence if curvature analysis confirms finial characteristics
  if (curvatureResult) {
    if (curvatureResult.classification === 'sharp') {
      confidence = 0.85; // Ball terminal or teardrop finial
    } else if (curvatureResult.classification === 'moderate') {
      confidence = 0.75; // Tapered finial
    } else if (curvatureResult.classification === 'gentle') {
      confidence = 0.65; // Subtle finial
    }
    // Straight terminals are less likely to be true finials
    if (curvatureResult.classification === 'straight') {
      confidence = 0.5;
    }
  }

  // Finial: terminal without serif projection
  return {
    id: 'finial',
    shape: {
      type: 'point',
      x: edge.x,
      y: edge.y,
      label: 'Finial',
    },
    confidence,
    anchors: {
      position: edge,
    },
    debug: {
      side,
      zone,
      curvature: curvatureResult?.classification,
      curvatureValue: curvatureResult?.curvature,
    },
  };
}

/**
 * Removes duplicate finials that are too close together.
 */
function deduplicateFinials(
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
