/**
 * Stem feature detector.
 *
 * A stem is the main vertical stroke of a letter (e.g., in 'l', 'b', 'd', 'h', 'I').
 *
 * v2 improvements:
 * - Uses scale.stemWidth instead of raw UPM multipliers
 * - Determines stem extent based on glyph class (cap vs x-height)
 * - Requires consistency across multiple bands
 * - Italic angle compensation for slanted fonts
 */

import { rayHits } from '@/utils/geometry/geometryCore';
import type { FeatureInstance, GeometryCache, Point2D } from '../types';

/**
 * Represents a stem candidate from scanline analysis.
 */
interface StemCandidate {
  x1: number;
  x2: number;
  midX: number;
  y: number;
  width: number;
}

/**
 * Detects stem features on a glyph.
 * Returns rectangle or line shapes at detected stem locations.
 */
export function detectStem(geo: GeometryCache): FeatureInstance[] {
  const { glyph, metrics, svgShape, scale, italicAngle } = geo;

  if (!glyph?.path?.commands || !glyph.bbox) {
    return [];
  }

  const instances: FeatureInstance[] = [];
  const { eps, bboxW, bboxH, stemWidth, overshoot } = scale;

  // Italic angle compensation (convert degrees to radians)
  const italicRad = (italicAngle * Math.PI) / 180;
  const italicTan = Math.tan(italicRad);

  // Determine stem vertical extent based on glyph class
  const isUppercase = glyph.bbox.maxY > metrics.xHeight + bboxH * 0.1;
  const stemTop = isUppercase
    ? Math.min(glyph.bbox.maxY, metrics.capHeight)
    : Math.min(glyph.bbox.maxY, metrics.xHeight);
  const stemBottom = Math.max(glyph.bbox.minY, metrics.baseline);

  // Minimum thickness threshold: use stemWidth estimate or 3% of bbox
  const THICK = Math.max(stemWidth * 0.6, bboxW * 0.03);

  // Scan multiple bands between stem extent
  const bands = 5;
  const candidates: StemCandidate[] = [];

  for (let i = 1; i < bands; i++) {
    const y = stemBottom + (i * (stemTop - stemBottom)) / bands;
    const origin = { x: glyph.bbox.minX - overshoot * 0.1, y };
    const { points } = rayHits(svgShape, origin, 0, overshoot);

    // Points are sorted left-to-right; pairs are filled spans
    for (let j = 0; j < points.length - 1; j += 2) {
      const x1 = points[j].x;
      const x2 = points[j + 1].x;
      const width = x2 - x1;

      if (width >= THICK) {
        // For italic fonts, compensate midX position based on y
        // This accounts for the slant when checking vertical alignment
        const adjustedMidX = (x1 + x2) / 2 - (y - stemBottom) * italicTan;

        candidates.push({
          x1,
          x2,
          midX: adjustedMidX,
          y,
          width,
        });
      }
    }
  }

  // Group candidates by (slant-adjusted) midX position
  const xTolerance = stemWidth * 0.5;
  const groups = groupByMidX(candidates, xTolerance);

  // For each group with enough samples, emit a stem
  for (const group of groups) {
    if (group.length < 2) continue;

    // Calculate average position and dimensions
    const avgX1 = group.reduce((s, c) => s + c.x1, 0) / group.length;
    const avgX2 = group.reduce((s, c) => s + c.x2, 0) / group.length;
    const avgMidX = group.reduce((s, c) => s + c.midX, 0) / group.length;
    const avgWidth = avgX2 - avgX1;

    // Check midX drift (stem should be aligned along slant axis)
    const midXs = group.map((c) => c.midX);
    const midXVariance =
      midXs.reduce((s, x) => s + (x - avgMidX) ** 2, 0) / midXs.length;
    const midXStdDev = Math.sqrt(midXVariance);

    // Reject if midX drifts too much (not a true stem)
    if (midXStdDev > stemWidth * 0.3) {
      continue;
    }

    // Check width consistency
    const widths = group.map((c) => c.width);
    const avgWidthActual = widths.reduce((s, w) => s + w, 0) / widths.length;
    const widthVariance =
      widths.reduce((s, w) => s + (w - avgWidthActual) ** 2, 0) / widths.length;
    const widthStdDev = Math.sqrt(widthVariance);

    const isConsistent = widthStdDev < avgWidthActual * 0.4;
    const confidence = isConsistent
      ? Math.min(0.9, 0.5 + group.length * 0.1)
      : 0.5;

    // For italic fonts, emit a parallelogram-like shape
    // For now, still use rect but note the slant in debug
    const bottomMidX = avgMidX + (stemBottom - stemBottom) * italicTan;
    const topMidX = avgMidX + (stemTop - stemBottom) * italicTan;

    instances.push({
      id: 'stem',
      shape: {
        type: 'rect',
        x: avgX1,
        y: stemBottom,
        width: avgWidth,
        height: stemTop - stemBottom,
      },
      confidence,
      anchors: {
        top: { x: topMidX + avgWidth / 2, y: stemTop },
        bottom: { x: bottomMidX + avgWidth / 2, y: stemBottom },
        center: {
          x: (bottomMidX + topMidX) / 2 + avgWidth / 2,
          y: (stemTop + stemBottom) / 2,
        },
      },
      debug: {
        sampleCount: group.length,
        thickness: avgWidth,
        midXStdDev,
        widthStdDev,
        italicCompensation: italicRad,
      },
    });
  }

  return instances;
}

/**
 * Groups candidates by similar midX position.
 */
function groupByMidX(
  candidates: StemCandidate[],
  tolerance: number
): StemCandidate[][] {
  const groups: StemCandidate[][] = [];

  for (const candidate of candidates) {
    let foundGroup = false;
    for (const group of groups) {
      const groupMidX = group.reduce((s, c) => s + c.midX, 0) / group.length;
      if (Math.abs(groupMidX - candidate.midX) < tolerance) {
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
