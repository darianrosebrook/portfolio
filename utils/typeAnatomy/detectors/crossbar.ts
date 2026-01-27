/**
 * Crossbar feature detector.
 *
 * A crossbar is a horizontal stroke that connects two stems or parts
 * of a letter (e.g., in 'A', 'H', 'e', 'f', 't').
 *
 * v2 improvements:
 * - Returns rect shapes for consistent closed-shape rendering
 * - Estimates crossbar height from nearby scanlines
 * - Uses filled spans (intersection pairs)
 */

import { rayHits } from '@/utils/geometry/geometryCore';
import type { FeatureInstance, FeatureShape, GeometryCache } from '../types';

/**
 * Represents a filled span (stroke region) on a scanline.
 */
interface FilledSpan {
  x1: number;
  x2: number;
  y: number;
  width: number;
  midX: number;
}

/**
 * Detects crossbar features on a glyph.
 * Returns rect shapes at detected crossbar locations.
 */
export function detectCrossbar(geo: GeometryCache): FeatureInstance[] {
  const { glyph, metrics, svgShape, scale } = geo;

  if (!glyph?.path?.commands || !glyph.bbox) {
    return [];
  }

  const instances: FeatureInstance[] = [];
  const { bboxW, bboxH, stemWidth, overshoot } = scale;

  // Target Y bands for crossbar detection
  // For uppercase (A, H, E, F): around 40-60% of cap height
  // For lowercase (e, f, t): around 40-60% of x-height
  const targetBands = [
    // Uppercase mid-zone
    metrics.baseline + (metrics.capHeight - metrics.baseline) * 0.35,
    metrics.baseline + (metrics.capHeight - metrics.baseline) * 0.4,
    metrics.baseline + (metrics.capHeight - metrics.baseline) * 0.45,
    metrics.baseline + (metrics.capHeight - metrics.baseline) * 0.5,
    metrics.baseline + (metrics.capHeight - metrics.baseline) * 0.55,
    metrics.baseline + (metrics.capHeight - metrics.baseline) * 0.6,
    metrics.baseline + (metrics.capHeight - metrics.baseline) * 0.65,
    // Lowercase mid-zone
    metrics.baseline + (metrics.xHeight - metrics.baseline) * 0.4,
    metrics.baseline + (metrics.xHeight - metrics.baseline) * 0.5,
    metrics.baseline + (metrics.xHeight - metrics.baseline) * 0.6,
  ];

  // Collect all filled spans from target bands
  const allSpans: FilledSpan[] = [];

  for (const y of targetBands) {
    const origin = { x: glyph.bbox.minX - overshoot * 0.1, y };
    const { points } = rayHits(svgShape, origin, 0, overshoot);

    // Points are sorted left-to-right by rayHits
    // Pairs (0,1), (2,3), etc. are filled spans
    for (let i = 0; i < points.length - 1; i += 2) {
      const x1 = points[i].x;
      const x2 = points[i + 1].x;
      const width = x2 - x1;

      // Filter: crossbar span should be:
      // - Not too thin (at least stemWidth * 0.5)
      // - Not too wide (less than bboxW * 0.9 to exclude full width)
      // - Interior (not at glyph edges)
      const isInterior =
        x1 > glyph.bbox.minX + bboxW * 0.1 &&
        x2 < glyph.bbox.maxX - bboxW * 0.1;

      const isReasonableWidth =
        width >= stemWidth * 0.3 && width <= bboxW * 0.85;

      if (isInterior && isReasonableWidth) {
        allSpans.push({
          x1,
          x2,
          y,
          width,
          midX: (x1 + x2) / 2,
        });
      }
    }
  }

  // Group spans by similar Y position
  const yTolerance = bboxH * 0.08;
  const groups = groupSpansByY(allSpans, yTolerance);

  // For each group, compute the most consistent span and estimate height
  for (const group of groups) {
    if (group.length < 2) continue; // Need multiple samples for confidence

    // Average position
    const avgY = group.reduce((s, sp) => s + sp.y, 0) / group.length;
    const avgX1 = group.reduce((s, sp) => s + sp.x1, 0) / group.length;
    const avgX2 = group.reduce((s, sp) => s + sp.x2, 0) / group.length;

    // Estimate crossbar height from the Y spread of the group
    const yPositions = group.map((sp) => sp.y);
    const minY = Math.min(...yPositions);
    const maxY = Math.max(...yPositions);
    // Use the Y spread as a proxy for height, with a minimum based on stemWidth
    const estimatedHeight = Math.max(maxY - minY, stemWidth * 0.6);

    // Check for consistent width across samples
    const widths = group.map((sp) => sp.width);
    const avgWidth = widths.reduce((a, b) => a + b, 0) / widths.length;
    const widthVariance =
      widths.reduce((s, w) => s + (w - avgWidth) ** 2, 0) / widths.length;
    const widthStdDev = Math.sqrt(widthVariance);

    // High confidence if width is consistent
    const isConsistent = widthStdDev < avgWidth * 0.3;
    const confidence = isConsistent
      ? Math.min(0.9, 0.5 + group.length * 0.1)
      : 0.5;

    instances.push({
      id: 'crossbar',
      shape: {
        type: 'rect',
        x: avgX1,
        y: avgY - estimatedHeight / 2,
        width: avgX2 - avgX1,
        height: estimatedHeight,
      },
      confidence,
      anchors: {
        left: { x: avgX1, y: avgY },
        right: { x: avgX2, y: avgY },
      },
      debug: {
        sampleCount: group.length,
        avgWidth,
        widthStdDev,
        estimatedHeight,
      },
    });
  }

  // Fallback: check path segments for horizontal lines
  if (instances.length === 0) {
    const segmentBars = findHorizontalSegments(geo);
    for (const seg of segmentBars) {
      // For fallback, use stemWidth as height estimate
      const barHeight = stemWidth * 0.6;
      instances.push({
        id: 'crossbar',
        shape: {
          type: 'rect',
          x: seg.x1,
          y: seg.y - barHeight / 2,
          width: seg.x2 - seg.x1,
          height: barHeight,
        },
        confidence: 0.5,
        anchors: {
          left: { x: seg.x1, y: seg.y },
          right: { x: seg.x2, y: seg.y },
        },
        debug: { source: 'segment-fallback' },
      });
    }
  }

  // Merge overlapping/adjacent crossbar instances at similar Y positions
  const mergedInstances = mergeCrossbarInstances(instances, bboxH * 0.12);

  return mergedInstances;
}

/**
 * Merges crossbar instances that are at similar Y positions.
 * This handles cases where the same crossbar is detected multiple times
 * (e.g., in 'H' where scanlines above and below the bar both detect it).
 */
function mergeCrossbarInstances(
  instances: FeatureInstance[],
  yTolerance: number
): FeatureInstance[] {
  if (instances.length <= 1) return instances;

  // Sort by Y position (center of rect)
  const sorted = [...instances].sort((a, b) => {
    const aShape = a.shape as Extract<FeatureShape, { type: 'rect' }>;
    const bShape = b.shape as Extract<FeatureShape, { type: 'rect' }>;
    const aCenterY = aShape.y + aShape.height / 2;
    const bCenterY = bShape.y + bShape.height / 2;
    return aCenterY - bCenterY;
  });

  const merged: FeatureInstance[] = [];
  let currentGroup: FeatureInstance[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const prev = currentGroup[currentGroup.length - 1];

    const currentShape = current.shape as Extract<FeatureShape, { type: 'rect' }>;
    const prevShape = prev.shape as Extract<FeatureShape, { type: 'rect' }>;

    const currentCenterY = currentShape.y + currentShape.height / 2;
    const prevCenterY = prevShape.y + prevShape.height / 2;

    if (Math.abs(currentCenterY - prevCenterY) < yTolerance) {
      // Same crossbar - add to group
      currentGroup.push(current);
    } else {
      // Different crossbar - merge current group and start new
      merged.push(mergeGroup(currentGroup));
      currentGroup = [current];
    }
  }

  // Merge the last group
  if (currentGroup.length > 0) {
    merged.push(mergeGroup(currentGroup));
  }

  return merged;
}

/**
 * Merges a group of crossbar instances into a single instance.
 * Uses the average position and maximum extents.
 */
function mergeGroup(group: FeatureInstance[]): FeatureInstance {
  if (group.length === 1) return group[0];

  const shapes = group.map(
    (inst) => inst.shape as Extract<FeatureShape, { type: 'rect' }>
  );

  // Compute merged bounds
  const minX = Math.min(...shapes.map((s) => s.x));
  const maxX = Math.max(...shapes.map((s) => s.x + s.width));
  const minY = Math.min(...shapes.map((s) => s.y));
  const maxY = Math.max(...shapes.map((s) => s.y + s.height));

  // Average confidence, weighted by sample count
  const getSampleCount = (inst: FeatureInstance): number => {
    const debug = inst.debug as { sampleCount?: number } | undefined;
    return debug?.sampleCount ?? 1;
  };
  const totalSamples = group.reduce(
    (sum, inst) => sum + getSampleCount(inst),
    0
  );
  const weightedConfidence =
    group.reduce(
      (sum, inst) => sum + inst.confidence * getSampleCount(inst),
      0
    ) / totalSamples;

  const avgY = (minY + maxY) / 2;

  return {
    id: 'crossbar',
    shape: {
      type: 'rect',
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    },
    confidence: Math.min(0.95, weightedConfidence + 0.1), // Boost for merged detection
    anchors: {
      left: { x: minX, y: avgY },
      right: { x: maxX, y: avgY },
    },
    debug: {
      mergedFrom: group.length,
      totalSamples,
    },
  };
}

/**
 * Groups spans by similar Y position.
 */
function groupSpansByY(spans: FilledSpan[], tolerance: number): FilledSpan[][] {
  const groups: FilledSpan[][] = [];

  for (const span of spans) {
    let foundGroup = false;
    for (const group of groups) {
      if (Math.abs(group[0].y - span.y) < tolerance) {
        group.push(span);
        foundGroup = true;
        break;
      }
    }
    if (!foundGroup) {
      groups.push([span]);
    }
  }

  return groups;
}

/**
 * Finds horizontal segments in the glyph path.
 * Fallback for when ray-based detection fails.
 */
function findHorizontalSegments(
  geo: GeometryCache
): Array<{ x1: number; x2: number; y: number }> {
  const { segments, metrics, scale } = geo;
  const results: Array<{ x1: number; x2: number; y: number }> = [];
  const tolerance = scale.bboxH * 0.15;

  // Target Y positions
  const lowercaseMidY =
    metrics.baseline + (metrics.xHeight - metrics.baseline) * 0.5;
  const uppercaseMidY =
    metrics.baseline + (metrics.capHeight - metrics.baseline) * 0.5;

  for (const seg of segments) {
    if (seg.type !== 'lineTo' || seg.params.length < 2) continue;

    const [p0, p1] = seg.params;
    const width = Math.abs(p1.x - p0.x);
    const height = Math.abs(p1.y - p0.y);

    // Horizontal if width >> height
    if (width > height * 3) {
      const midY = (p0.y + p1.y) / 2;

      // Check if near expected crossbar position
      if (
        Math.abs(midY - lowercaseMidY) < tolerance ||
        Math.abs(midY - uppercaseMidY) < tolerance
      ) {
        results.push({
          x1: Math.min(p0.x, p1.x),
          x2: Math.max(p0.x, p1.x),
          y: midY,
        });
      }
    }
  }

  return results;
}
