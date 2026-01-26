/**
 * Crossbar feature detector.
 *
 * A crossbar is a horizontal stroke that connects two stems or parts
 * of a letter (e.g., in 'A', 'H', 'e', 'f', 't').
 *
 * Fixed in v1: Uses filled spans (intersection pairs) instead of gaps.
 * Rays are sorted and deduped by geometryCore.rayHits.
 */

import { rayHits } from '@/utils/geometry/geometryCore';
import type { FeatureInstance, GeometryCache, Point2D } from '../types';

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
 * Returns line shapes at detected crossbar locations.
 */
export function detectCrossbar(geo: GeometryCache): FeatureInstance[] {
  const { glyph, metrics, svgShape, scale } = geo;

  if (!glyph?.path?.commands || !glyph.bbox) {
    return [];
  }

  const instances: FeatureInstance[] = [];
  const { eps, bboxW, bboxH, stemWidth, overshoot } = scale;

  // Target Y bands for crossbar detection
  // For uppercase (A, H, E, F): around 40-60% of cap height
  // For lowercase (e, f, t): around 40-60% of x-height
  const targetBands = [
    // Uppercase mid-zone
    metrics.baseline + (metrics.capHeight - metrics.baseline) * 0.4,
    metrics.baseline + (metrics.capHeight - metrics.baseline) * 0.5,
    metrics.baseline + (metrics.capHeight - metrics.baseline) * 0.6,
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

  // For each group, compute the most consistent span
  for (const group of groups) {
    if (group.length < 2) continue; // Need multiple samples for confidence

    // Average position
    const avgY = group.reduce((s, sp) => s + sp.y, 0) / group.length;
    const avgX1 = group.reduce((s, sp) => s + sp.x1, 0) / group.length;
    const avgX2 = group.reduce((s, sp) => s + sp.x2, 0) / group.length;

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
        type: 'line',
        x1: avgX1,
        y1: avgY,
        x2: avgX2,
        y2: avgY,
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
      },
    });
  }

  // Fallback: check path segments for horizontal lines
  if (instances.length === 0) {
    const segmentBars = findHorizontalSegments(geo);
    for (const seg of segmentBars) {
      instances.push({
        id: 'crossbar',
        shape: {
          type: 'line',
          x1: seg.x1,
          y1: seg.y,
          x2: seg.x2,
          y2: seg.y,
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

  // Filter to return only the best crossbar candidate(s)
  // Most letters have only one crossbar (A, H, e, f, t)
  // Letters like E, F might have multiple bars, but they're at different Y positions
  if (instances.length > 1) {
    // Sort by confidence (descending) then by proximity to the mid-height
    const midY = metrics.baseline + (metrics.capHeight - metrics.baseline) * 0.5;

    instances.sort((a, b) => {
      // Primary sort: confidence
      if (b.confidence !== a.confidence) {
        return b.confidence - a.confidence;
      }
      // Secondary sort: proximity to mid-height
      const aY = a.shape.type === 'line' ? a.shape.y1 : 0;
      const bY = b.shape.type === 'line' ? b.shape.y1 : 0;
      return Math.abs(aY - midY) - Math.abs(bY - midY);
    });

    // Keep only the highest confidence instance
    // If there are multiple with same high confidence, they're likely overlapping
    const topConfidence = instances[0].confidence;
    const filtered = instances.filter(
      (inst) => inst.confidence >= topConfidence - 0.05
    );

    // If multiple remain, merge overlapping ones or just keep the best
    if (filtered.length > 1) {
      // Check if they're at similar Y positions (overlapping detections)
      const tolerance = bboxH * 0.1;
      const firstY =
        filtered[0].shape.type === 'line' ? filtered[0].shape.y1 : 0;
      const overlapping = filtered.filter((inst) => {
        const y = inst.shape.type === 'line' ? inst.shape.y1 : 0;
        return Math.abs(y - firstY) < tolerance;
      });

      // Return only the first (best) of overlapping ones
      return overlapping.length > 0 ? [overlapping[0]] : [filtered[0]];
    }

    return filtered;
  }

  return instances;
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
