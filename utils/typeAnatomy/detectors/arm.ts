/**
 * Arm feature detector.
 *
 * An arm is a horizontal or angled stroke that is free on one end
 * (e.g., in 'E', 'F', 'K', 'L', 'T', 'Y').
 *
 * v2 improvements:
 * - Detects horizontal extensions from the stem, not the stem itself
 * - Returns rect shapes for consistent closed-shape rendering
 * - Filters out spans that are part of the main vertical stem
 * - Scale-aware thresholds
 */

import { rayHits } from '@/utils/geometry/geometryCore';
import type { FeatureInstance, GeometryCache } from '../types';

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
 * Represents a detected stem region to filter out.
 */
interface StemRegion {
  x1: number;
  x2: number;
  midX: number;
}

/**
 * Detects arm features on a glyph.
 * Returns rect shapes at detected arm locations.
 */
export function detectArm(geo: GeometryCache): FeatureInstance[] {
  const { glyph, metrics, svgShape, scale } = geo;

  if (!glyph?.path?.commands || !glyph.bbox) {
    return [];
  }

  const instances: FeatureInstance[] = [];
  const { bboxW, bboxH, stemWidth, overshoot } = scale;

  // First, identify stem regions to exclude
  // Stems are consistent vertical strokes - scan multiple Y bands
  const stemRegions = detectStemRegions(geo);

  // PRIMARY METHOD: Horizontal band scan
  // Check multiple Y levels for free-ended horizontal strokes
  const armZones = generateArmZones(metrics, bboxH, glyph.bbox);
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

      // Skip spans that are too thin or too wide
      if (width < stemWidth * 0.3 || width > bboxW * 0.85) continue;

      // Check if span overlaps with any stem region
      const overlappingStem = stemRegions.find((stem) => {
        // Check if span overlaps with stem X range
        return x1 < stem.x2 && x2 > stem.x1;
      });

      // Distance from span edges to glyph edges
      const distToRightEdge = glyph.bbox.maxX - x2;
      const distToLeftEdge = x1 - glyph.bbox.minX;

      // An arm is a horizontal stroke that:
      // 1. Extends FROM a stem TO a free edge
      // 2. The free end is near the glyph edge
      // 3. The attached end is near (but not at) the stem

      // Right-extending arm (like top/middle bars in F, E):
      // - Free end (x2) near right edge of glyph
      // - Attached end (x1) should be near/at stem right edge, not at glyph left edge
      if (distToRightEdge < bboxW * 0.15) {
        // Check that this isn't just the stem itself
        // The arm should start AFTER the stem (x1 > stem.x1)
        // OR the arm should be wider than the stem (extends beyond stem)
        const isArmNotStem = overlappingStem
          ? x1 >= overlappingStem.x1 - stemWidth * 0.3 && 
            x2 > overlappingStem.x2 + stemWidth * 0.5
          : distToLeftEdge > bboxW * 0.1; // No stem found, use distance check

        if (isArmNotStem) {
          // Adjust x1 to start at stem edge if overlapping
          const armX1 = overlappingStem 
            ? Math.max(x1, overlappingStem.x2)
            : x1;
          
          candidates.push({
            y,
            x1: armX1,
            x2,
            width: x2 - armX1,
            side: 'right',
            distToEdge: distToRightEdge,
          });
        }
      }

      // Left-extending arm (less common, like in some decorative letters):
      // - Free end (x1) near left edge of glyph
      // - Attached end (x2) should be near stem left edge
      if (distToLeftEdge < bboxW * 0.15) {
        // Check that this isn't just the stem itself
        const isArmNotStem = overlappingStem
          ? x2 <= overlappingStem.x2 + stemWidth * 0.3 &&
            x1 < overlappingStem.x1 - stemWidth * 0.5
          : distToRightEdge > bboxW * 0.1;

        if (isArmNotStem) {
          // Adjust x2 to end at stem edge if overlapping
          const armX2 = overlappingStem 
            ? Math.min(x2, overlappingStem.x1)
            : x2;
          
          candidates.push({
            y,
            x1,
            x2: armX2,
            width: armX2 - x1,
            side: 'left',
            distToEdge: distToLeftEdge,
          });
        }
      }
    }
  }

  // Group candidates by similar Y position
  const yTolerance = bboxH * 0.08;
  const groups = groupCandidatesByY(candidates, yTolerance);

  // Emit arm instances from groups
  for (const group of groups) {
    if (group.length === 0) continue;

    // Average the arm position
    const avgY = group.reduce((s, c) => s + c.y, 0) / group.length;
    const avgX1 = group.reduce((s, c) => s + c.x1, 0) / group.length;
    const avgX2 = group.reduce((s, c) => s + c.x2, 0) / group.length;
    const side = group[0].side;
    const avgWidth = avgX2 - avgX1;

    // Estimate arm height from stroke width
    const armHeight = Math.max(stemWidth * 0.8, avgWidth * 0.3);

    // Check for duplicates at this Y
    const isDuplicate = instances.some((inst) => {
      if (inst.shape.type === 'rect') {
        return Math.abs(inst.shape.y + inst.shape.height / 2 - avgY) < yTolerance;
      }
      return false;
    });

    if (!isDuplicate) {
      instances.push({
        id: 'arm',
        shape: {
          type: 'rect',
          x: avgX1,
          y: avgY - armHeight / 2,
          width: avgWidth,
          height: armHeight,
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
          avgWidth,
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
 * Detects stem regions to filter out from arm detection.
 * Stems are vertical strokes that appear consistently across many Y bands.
 */
function detectStemRegions(geo: GeometryCache): StemRegion[] {
  const { glyph, metrics, svgShape, scale } = geo;
  const { bboxH, stemWidth, overshoot } = scale;

  const stemBottom = Math.max(glyph.bbox.minY, metrics.baseline);
  const stemTop = Math.min(glyph.bbox.maxY, metrics.capHeight);

  const bands = 5;
  const spansByMidX = new Map<number, number[]>();
  const tolerance = stemWidth * 0.5;

  for (let i = 1; i < bands; i++) {
    const y = stemBottom + (i * (stemTop - stemBottom)) / bands;
    const origin = { x: glyph.bbox.minX - overshoot * 0.1, y };
    const { points } = rayHits(svgShape, origin, 0, overshoot);

    for (let j = 0; j < points.length - 1; j += 2) {
      const x1 = points[j].x;
      const x2 = points[j + 1].x;
      const midX = (x1 + x2) / 2;
      const width = x2 - x1;

      // Only consider thick vertical strokes
      if (width < stemWidth * 0.5) continue;

      // Find or create a group for this midX
      let foundKey: number | null = null;
      for (const [key] of spansByMidX) {
        if (Math.abs(key - midX) < tolerance) {
          foundKey = key;
          break;
        }
      }

      if (foundKey !== null) {
        spansByMidX.get(foundKey)!.push(midX);
      } else {
        spansByMidX.set(midX, [midX]);
      }
    }
  }

  // Stems appear in multiple bands (at least 3)
  const stemRegions: StemRegion[] = [];
  for (const [key, midXs] of spansByMidX) {
    if (midXs.length >= 3) {
      const avgMidX = midXs.reduce((s, x) => s + x, 0) / midXs.length;
      stemRegions.push({
        x1: avgMidX - stemWidth / 2,
        x2: avgMidX + stemWidth / 2,
        midX: avgMidX,
      });
    }
  }

  return stemRegions;
}

/**
 * Generates Y positions to check for arms.
 * Focuses on zones where arms typically appear in letters like E, F, T, L.
 */
function generateArmZones(
  metrics: { baseline: number; xHeight: number; capHeight: number },
  bboxH: number,
  bbox: { minY: number; maxY: number }
): number[] {
  const zones: number[] = [];

  // Top arm zone (near cap height for E, F, T)
  zones.push(metrics.capHeight - bboxH * 0.05);
  zones.push(metrics.capHeight - bboxH * 0.1);
  zones.push(metrics.capHeight - bboxH * 0.15);

  // Middle arm zone (for E middle bar, around 50% of cap height)
  const midCapHeight = metrics.baseline + (metrics.capHeight - metrics.baseline) * 0.5;
  zones.push(midCapHeight - bboxH * 0.05);
  zones.push(midCapHeight);
  zones.push(midCapHeight + bboxH * 0.05);

  // Bottom arm zone (for L, E bottom)
  zones.push(metrics.baseline + bboxH * 0.05);
  zones.push(metrics.baseline + bboxH * 0.1);
  zones.push(metrics.baseline + bboxH * 0.15);

  // Lowercase zone (for letters like k, r)
  zones.push(metrics.xHeight - bboxH * 0.05);
  zones.push(metrics.xHeight * 0.5);

  return zones.filter(y => y >= bbox.minY && y <= bbox.maxY);
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
  const { bboxW, stemWidth, overshoot } = scale;

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
    const armHeight = Math.abs(y2 - y1);

    // Check if in arm zone (between baseline and cap-height)
    if (y1 > metrics.baseline && y2 < metrics.capHeight) {
      const armY = Math.min(y1, y2);
      const armWidth = probeX - (glyph.bbox.minX + bboxW * 0.3);

      return {
        id: 'arm',
        shape: {
          type: 'rect',
          x: glyph.bbox.minX + bboxW * 0.3,
          y: armY,
          width: armWidth,
          height: armHeight,
        },
        confidence: 0.5,
        anchors: {
          free: { x: probeX, y: armY + armHeight / 2 },
          attached: { x: glyph.bbox.minX + bboxW * 0.3, y: armY + armHeight / 2 },
        },
        debug: { source: 'slide-fallback' },
      };
    }
  }

  return null;
}
