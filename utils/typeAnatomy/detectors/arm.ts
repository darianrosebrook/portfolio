/**
 * Arm feature detector.
 *
 * An arm is a horizontal or angled stroke that is free on one end
 * (e.g., in 'E', 'F', 'K', 'L', 'T', 'Y').
 *
 * Fixed in v1:
 * - Prefers horizontal band scan (primary method)
 * - Slide-inward is now fallback only
 * - Uses filled spans to identify arms
 * - Scale-aware thresholds
 */

import { rayHits } from '@/utils/geometry/geometryCore';
import type { FeatureInstance, GeometryCache, Point2D } from '../types';

/**
 * Represents an arm candidate from scanline analysis.
 */
interface ArmCandidate {
  y: number;
  x1: number;
  x2: number;
  width: number;
  side: 'left' | 'right';
  distToEdge: number;
}

/**
 * Detects arm features on a glyph.
 * Returns line shapes at detected arm locations.
 */
export function detectArm(geo: GeometryCache): FeatureInstance[] {
  const { glyph, metrics, svgShape, scale } = geo;

  if (!glyph?.path?.commands || !glyph.bbox) {
    return [];
  }

  const instances: FeatureInstance[] = [];
  const { eps, bboxW, bboxH, stemWidth, overshoot } = scale;

  // PRIMARY METHOD: Horizontal band scan
  // Check multiple Y levels for free-ended horizontal strokes
  const armZones = generateArmZones(metrics, bboxH);
  const candidates: ArmCandidate[] = [];

  for (const y of armZones) {
    // Skip if outside glyph bounds
    if (y < glyph.bbox.minY || y > glyph.bbox.maxY) continue;

    const origin = { x: glyph.bbox.minX - overshoot * 0.1, y };
    const { points } = rayHits(svgShape, origin, 0, overshoot);

    if (points.length < 2) continue;

    // Convert to filled spans
    for (let j = 0; j < points.length - 1; j += 2) {
      const x1 = points[j].x;
      const x2 = points[j + 1].x;
      const width = x2 - x1;

      // Arms have reasonable width (not too thin, not spanning entire glyph)
      if (width < stemWidth * 0.3 || width > bboxW * 0.7) continue;

      // Check for right-side free end
      const distToRightEdge = glyph.bbox.maxX - x2;
      if (distToRightEdge < bboxW * 0.2) {
        candidates.push({
          y,
          x1,
          x2,
          width,
          side: 'right',
          distToEdge: distToRightEdge,
        });
      }

      // Check for left-side free end
      const distToLeftEdge = x1 - glyph.bbox.minX;
      if (distToLeftEdge < bboxW * 0.2) {
        candidates.push({
          y,
          x1,
          x2,
          width,
          side: 'left',
          distToEdge: distToLeftEdge,
        });
      }
    }
  }

  // Group candidates by similar Y position
  const yTolerance = bboxH * 0.1;
  const groups = groupCandidatesByY(candidates, yTolerance);

  // Emit arm instances from groups
  for (const group of groups) {
    if (group.length === 0) continue;

    // Average the arm position
    const avgY = group.reduce((s, c) => s + c.y, 0) / group.length;
    const avgX1 = group.reduce((s, c) => s + c.x1, 0) / group.length;
    const avgX2 = group.reduce((s, c) => s + c.x2, 0) / group.length;
    const side = group[0].side;

    // Check for duplicates at this Y
    const isDuplicate = instances.some((inst) => {
      if (inst.shape.type !== 'line') return false;
      return Math.abs(inst.shape.y1 - avgY) < yTolerance;
    });

    if (!isDuplicate) {
      instances.push({
        id: 'arm',
        shape: {
          type: 'line',
          x1: avgX1,
          y1: avgY,
          x2: avgX2,
          y2: avgY,
        },
        confidence: Math.min(0.85, 0.5 + group.length * 0.1),
        anchors: {
          free:
            side === 'right' ? { x: avgX2, y: avgY } : { x: avgX1, y: avgY },
          attached:
            side === 'right' ? { x: avgX1, y: avgY } : { x: avgX2, y: avgY },
        },
        debug: {
          side,
          sampleCount: group.length,
          avgWidth: avgX2 - avgX1,
        },
      });
    }
  }

  // FALLBACK: If no arms found, try slide-inward approach
  if (instances.length === 0) {
    const fallbackArm = detectArmBySlide(geo);
    if (fallbackArm) {
      instances.push(fallbackArm);
    }
  }

  return instances;
}

/**
 * Generates Y positions to check for arms.
 */
function generateArmZones(
  metrics: { baseline: number; xHeight: number; capHeight: number },
  bboxH: number
): number[] {
  const zones: number[] = [];

  // Lowercase zone (baseline to x-height)
  for (let i = 1; i <= 4; i++) {
    zones.push(
      metrics.baseline + (i * (metrics.xHeight - metrics.baseline)) / 5
    );
  }

  // Uppercase zone (x-height to cap-height)
  for (let i = 1; i <= 4; i++) {
    zones.push(
      metrics.xHeight + (i * (metrics.capHeight - metrics.xHeight)) / 5
    );
  }

  // Near baseline and cap-height (for E, F top/bottom arms)
  zones.push(metrics.baseline + bboxH * 0.05);
  zones.push(metrics.capHeight - bboxH * 0.05);

  return zones;
}

/**
 * Groups arm candidates by similar Y position.
 */
function groupCandidatesByY(
  candidates: ArmCandidate[],
  tolerance: number
): ArmCandidate[][] {
  const groups: ArmCandidate[][] = [];

  for (const candidate of candidates) {
    let foundGroup = false;
    for (const group of groups) {
      if (Math.abs(group[0].y - candidate.y) < tolerance) {
        group.push(candidate);
        foundGroup = true;
        break;
      }
    }
    if (!foundGroup) {
      groups.push([candidate]);
    }
  }

  return groups;
}

/**
 * Fallback: Detect arm by sliding inward from right edge.
 */
function detectArmBySlide(geo: GeometryCache): FeatureInstance | null {
  const { glyph, metrics, svgShape, scale } = geo;
  const { bboxW, overshoot } = scale;

  // Start from right edge and slide inward
  let probeX = glyph.bbox.maxX - 2;

  while (probeX > glyph.bbox.minX + bboxW * 0.3) {
    const { points } = rayHits(
      svgShape,
      { x: probeX, y: glyph.bbox.minY - overshoot * 0.1 },
      Math.PI / 2,
      overshoot
    );

    if (points.length > 0) break;
    probeX -= 4;
  }

  // Cast vertical ray at found position
  const { points } = rayHits(
    svgShape,
    { x: probeX, y: glyph.bbox.minY - overshoot * 0.1 },
    Math.PI / 2,
    overshoot
  );

  // Arm pattern: single intersection pair in the arm zone
  if (points.length === 2) {
    const y1 = points[0].y;
    const y2 = points[1].y;

    // Check if in arm zone (between baseline and cap-height)
    if (y1 > metrics.baseline && y2 < metrics.capHeight) {
      const armY = (y1 + y2) / 2;

      return {
        id: 'arm',
        shape: {
          type: 'line',
          x1: glyph.bbox.minX + bboxW * 0.3,
          y1: armY,
          x2: probeX,
          y2: armY,
        },
        confidence: 0.5,
        anchors: {
          free: { x: probeX, y: armY },
          attached: { x: glyph.bbox.minX + bboxW * 0.3, y: armY },
        },
        debug: { source: 'slide-fallback' },
      };
    }
  }

  return null;
}
