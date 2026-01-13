/**
 * Aperture feature detector.
 *
 * An aperture is the opening between counter and outside space
 * (e.g., in 'c', 'e', 's', 'a').
 *
 * Fixed in v1:
 * - Uses filled spans (intersection pairs) instead of "last two points"
 * - Detects gaps between filled spans and glyph edge
 * - Tracks consistency across Y levels
 */

import { rayHits } from '@/utils/geometry/geometryCore';
import type { FeatureInstance, GeometryCache, Point2D } from '../types';

/**
 * Represents a filled span on a scanline.
 */
interface FilledSpan {
  x1: number;
  x2: number;
  width: number;
}

/**
 * Represents an aperture candidate at a Y level.
 */
interface ApertureCandidate {
  y: number;
  side: 'left' | 'right';
  gapStart: number;
  gapEnd: number;
  gapWidth: number;
}

/**
 * Detects aperture features on a glyph.
 * Returns line or polyline shapes at detected aperture locations.
 */
export function detectAperture(geo: GeometryCache): FeatureInstance[] {
  const { glyph, metrics, svgShape, scale } = geo;

  if (!glyph?.path?.commands || !glyph.bbox) {
    return [];
  }

  const instances: FeatureInstance[] = [];
  const { eps, bboxW, bboxH, stemWidth, overshoot } = scale;

  // Minimum gap width to be considered an aperture
  const minGapWidth = Math.max(stemWidth * 0.3, bboxW * 0.05);

  // Scan Y levels between baseline and x-height
  const levels = 7;
  const candidates: ApertureCandidate[] = [];

  for (let i = 1; i < levels; i++) {
    const y =
      metrics.baseline + (i * (metrics.xHeight - metrics.baseline)) / levels;
    const origin = { x: glyph.bbox.minX - overshoot * 0.1, y };
    const { points } = rayHits(svgShape, origin, 0, overshoot);

    if (points.length < 2) continue;

    // Convert to filled spans (pairs of intersections)
    const spans: FilledSpan[] = [];
    for (let j = 0; j < points.length - 1; j += 2) {
      const x1 = points[j].x;
      const x2 = points[j + 1].x;
      spans.push({ x1, x2, width: x2 - x1 });
    }

    if (spans.length === 0) continue;

    // Check for right-side aperture: gap between rightmost span and bbox edge
    const rightmostSpan = spans[spans.length - 1];
    const rightGapWidth = glyph.bbox.maxX - rightmostSpan.x2;

    if (rightGapWidth > minGapWidth && rightGapWidth < bboxW * 0.5) {
      candidates.push({
        y,
        side: 'right',
        gapStart: rightmostSpan.x2,
        gapEnd: glyph.bbox.maxX,
        gapWidth: rightGapWidth,
      });
    }

    // Check for left-side aperture: gap between leftmost span and bbox edge
    const leftmostSpan = spans[0];
    const leftGapWidth = leftmostSpan.x1 - glyph.bbox.minX;

    if (leftGapWidth > minGapWidth && leftGapWidth < bboxW * 0.5) {
      candidates.push({
        y,
        side: 'left',
        gapStart: glyph.bbox.minX,
        gapEnd: leftmostSpan.x1,
        gapWidth: leftGapWidth,
      });
    }

    // Check for interior apertures: gaps between spans
    for (let j = 0; j < spans.length - 1; j++) {
      const gapStart = spans[j].x2;
      const gapEnd = spans[j + 1].x1;
      const gapWidth = gapEnd - gapStart;

      // Interior gap that's open to outside (near edge)
      if (gapWidth > minGapWidth) {
        const nearRightEdge = gapEnd > glyph.bbox.maxX - bboxW * 0.2;
        const nearLeftEdge = gapStart < glyph.bbox.minX + bboxW * 0.2;

        if (nearRightEdge) {
          candidates.push({
            y,
            side: 'right',
            gapStart,
            gapEnd,
            gapWidth,
          });
        } else if (nearLeftEdge) {
          candidates.push({
            y,
            side: 'left',
            gapStart,
            gapEnd,
            gapWidth,
          });
        }
      }
    }
  }

  // Group candidates by side and consistent position
  const rightCandidates = candidates.filter((c) => c.side === 'right');
  const leftCandidates = candidates.filter((c) => c.side === 'left');

  // Emit right aperture if consistent across levels
  if (rightCandidates.length >= 2) {
    const avgGapStart =
      rightCandidates.reduce((s, c) => s + c.gapStart, 0) /
      rightCandidates.length;
    const sortedByY = rightCandidates.sort((a, b) => a.y - b.y);

    instances.push({
      id: 'aperture',
      shape: {
        type: 'line',
        x1: avgGapStart,
        y1: sortedByY[0].y,
        x2: avgGapStart,
        y2: sortedByY[sortedByY.length - 1].y,
      },
      confidence: Math.min(0.9, 0.4 + rightCandidates.length * 0.1),
      anchors: {
        top: { x: avgGapStart, y: sortedByY[0].y },
        bottom: { x: avgGapStart, y: sortedByY[sortedByY.length - 1].y },
      },
      debug: {
        side: 'right',
        sampleCount: rightCandidates.length,
        avgGapWidth:
          rightCandidates.reduce((s, c) => s + c.gapWidth, 0) /
          rightCandidates.length,
      },
    });
  }

  // Emit left aperture if consistent across levels
  if (leftCandidates.length >= 2) {
    const avgGapEnd =
      leftCandidates.reduce((s, c) => s + c.gapEnd, 0) / leftCandidates.length;
    const sortedByY = leftCandidates.sort((a, b) => a.y - b.y);

    instances.push({
      id: 'aperture',
      shape: {
        type: 'line',
        x1: avgGapEnd,
        y1: sortedByY[0].y,
        x2: avgGapEnd,
        y2: sortedByY[sortedByY.length - 1].y,
      },
      confidence: Math.min(0.85, 0.4 + leftCandidates.length * 0.1),
      anchors: {
        top: { x: avgGapEnd, y: sortedByY[0].y },
        bottom: { x: avgGapEnd, y: sortedByY[sortedByY.length - 1].y },
      },
      debug: {
        side: 'left',
        sampleCount: leftCandidates.length,
        avgGapWidth:
          leftCandidates.reduce((s, c) => s + c.gapWidth, 0) /
          leftCandidates.length,
      },
    });
  }

  return instances;
}
