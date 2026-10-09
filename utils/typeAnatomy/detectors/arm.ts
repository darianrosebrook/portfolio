/**
 * Arm feature detector.
 *
 * An arm is a horizontal or angled stroke that is free at one or both ends
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
import { rectToPolygon } from '../evidence/regionFromShape';
import { measureOrthogonalThickness } from '../evidence/measureOrthogonalThickness';

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

  if (bboxW <= 0 || bboxH <= 0) return [];

  // A top stroke can be free on both ends. Discover it separately from
  // one-sided extensions, whose width/attachment rules exclude a full-width
  // stroke crossing a central stem.
  const topArms = detectBilateralTopArms(geo);
  if (topArms.length > 0) return topArms;

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
          const armX1 = overlappingStem ? Math.max(x1, overlappingStem.x2) : x1;

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
          const armX2 = overlappingStem ? Math.min(x2, overlappingStem.x1) : x2;

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
        return (
          Math.abs(inst.shape.y + inst.shape.height / 2 - avgY) < yTolerance
        );
      }
      return false;
    });

    if (!isDuplicate) {
      const rect = {
        type: 'rect' as const,
        x: avgX1,
        y: avgY - armHeight / 2,
        width: avgWidth,
        height: armHeight,
      };
      instances.push({
        id: 'arm',
        shape: rect,
        region: { kind: 'stroke', points: rectToPolygon(rect) },
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
 * Detects two free top extensions attached to one persistent central stem.
 * Body scanlines establish the stem's actual edges; perpendicular probes
 * through the extensions establish their thickness away from the junction.
 */
function detectBilateralTopArms(geo: GeometryCache): FeatureInstance[] {
  const { glyph, svgShape, scale } = geo;
  const { bboxW, bboxH, overshoot } = scale;
  const { bbox } = glyph;
  const bodySpans: Array<{ x1: number; x2: number }> = [];

  // Stay below the top quarter, where long cap serifs can add side spans.
  for (const fraction of [0.2, 0.4, 0.6]) {
    const y = bbox.minY + bboxH * fraction;
    const { points } = rayHits(
      svgShape,
      { x: bbox.minX - overshoot * 0.1, y },
      0,
      overshoot
    );
    // Multiple body strokes or counters do not establish one central stem.
    if (points.length !== 2) return [];
    bodySpans.push({ x1: points[0].x, x2: points[1].x });
  }

  const median = (values: number[]) => [...values].sort((a, b) => a - b)[1];
  const stemX1 = median(bodySpans.map((span) => span.x1));
  const stemX2 = median(bodySpans.map((span) => span.x2));
  const stemWidth = stemX2 - stemX1;
  const stemMidX = (stemX1 + stemX2) / 2;
  if (
    stemWidth <= 0 ||
    // The body scan establishes a vertically dominant stroke, including
    // heavy designs whose stem occupies a large fraction of glyph width.
    stemWidth >= bboxH * 0.4 ||
    Math.abs(stemMidX - (bbox.minX + bboxW / 2)) > bboxW * 0.15 ||
    bodySpans.some(
      (span) =>
        Math.abs(span.x1 - stemX1) > stemWidth * 0.25 ||
        Math.abs(span.x2 - stemX2) > stemWidth * 0.25
    )
  ) {
    return [];
  }

  // Probe just inside outline boundaries so a thin top stroke cannot fall
  // between the regular scan bands. Serif caps can sit above the stroke;
  // their internal horizontal edges also supply candidate scanlines.
  const topZones = new Set<number>([bbox.maxY - scale.eps]);
  for (const segment of geo.segments) {
    if (segment.type !== 'lineTo' || segment.params.length < 2) continue;
    const [start, end] = segment.params;
    if (Math.abs(end.x - start.x) <= Math.abs(end.y - start.y) * 3) continue;
    const edgeY = (start.y + end.y) / 2;
    if (edgeY <= bbox.minY + bboxH * 0.6) continue;
    topZones.add(edgeY - scale.eps);
    topZones.add(edgeY + scale.eps);
  }
  for (let band = 1; band <= 8; band++) {
    topZones.add(bbox.maxY - bboxH * band * 0.025);
  }

  for (const y of [...topZones].sort((a, b) => b - a)) {
    if (y >= bbox.maxY || y <= bbox.minY + bboxH * 0.6) continue;
    const { points } = rayHits(
      svgShape,
      { x: bbox.minX - overshoot * 0.1, y },
      0,
      overshoot
    );
    const spans: Array<{ x1: number; x2: number }> = [];
    for (let i = 0; i + 1 < points.length; i += 2) {
      spans.push({ x1: points[i].x, x2: points[i + 1].x });
    }
    // Overlapping contours can add or split intersections at the central
    // stem. Only bridge these hits when every interior intersection lies
    // inside its independently measured edges; both free extensions must
    // subsequently demonstrate ink through perpendicular probes.
    if (
      points.length > 2 &&
      points
        .slice(1, -1)
        .every(
          (point) =>
            point.x >= stemX1 - scale.eps && point.x <= stemX2 + scale.eps
        )
    ) {
      spans.push({ x1: points[0].x, x2: points[points.length - 1].x });
    }
    for (const span of spans) {
      const leftX = span.x1;
      const rightX = span.x2;
      // Both extensions must be substantial free strokes. Small cap serifs
      // can also cross a central stem, but do not extend this far from it.
      const minimumExtension = Math.max(stemWidth * 0.75, bboxH * 0.15);
      if (
        stemX1 - leftX < minimumExtension ||
        rightX - stemX2 < minimumExtension
      ) {
        continue;
      }

      const extensions = [
        { x1: leftX, x2: stemX1, side: 'left' as const },
        { x1: stemX2, x2: rightX, side: 'right' as const },
      ];
      const arms: FeatureInstance[] = [];
      for (const extension of extensions) {
        const width = extension.x2 - extension.x1;
        // Serif designs can taper the horizontal stroke. Measure across the
        // extension instead of using one local thickness for its full extent.
        // Probe the shaft near its attachment, while staying outside the
        // measured stem. Farther toward the free end, vertical terminal
        // serifs and overlapping contours can split the ray's ink pairs.
        const probeFractions =
          extension.side === 'left' ? [0.6, 0.7, 0.8] : [0.2, 0.3, 0.4];
        const measurements = probeFractions.map((fraction) =>
          measureOrthogonalThickness(geo, {
            midpoint: { x: extension.x1 + width * fraction, y },
            dominantAxis: 'horizontal',
          })
        );
        if (
          measurements.some(
            (measurement) =>
              !measurement.selectedPairContainsMidpoint ||
              measurement.selectedPairCenterOnProbeAxis === undefined ||
              measurement.thickness <= 0 ||
              measurement.thickness >= rightX - leftX
          )
        ) {
          break;
        }
        const lowerY = Math.min(
          ...measurements.map(
            (measurement) =>
              measurement.selectedPairCenterOnProbeAxis! -
              measurement.thickness / 2
          )
        );
        const upperY = Math.max(
          ...measurements.map(
            (measurement) =>
              measurement.selectedPairCenterOnProbeAxis! +
              measurement.thickness / 2
          )
        );
        // The top stroke must lie above the independently sampled body.
        if (lowerY <= bbox.minY + bboxH * 0.6) break;
        const centerY = (lowerY + upperY) / 2;
        const rect = {
          type: 'rect' as const,
          x: extension.x1,
          y: lowerY,
          width,
          height: upperY - lowerY,
        };
        arms.push({
          id: 'arm',
          shape: rect,
          region: { kind: 'stroke', points: rectToPolygon(rect) },
          confidence:
            0.85 *
            Math.min(
              ...measurements.map((measurement) => measurement.confidence)
            ),
          anchors: {
            free: {
              x: extension.side === 'left' ? extension.x1 : extension.x2,
              y: centerY,
            },
            attached: {
              x: extension.side === 'left' ? extension.x2 : extension.x1,
              y: centerY,
            },
          },
          debug: {
            source: 'bilateral-top-stroke',
            side: extension.side,
            measuredHeight: upperY - lowerY,
            stemX1,
            stemX2,
          },
        });
      }
      if (arms.length === 2) {
        const shapes = arms.map(
          (arm) =>
            arm.shape as Extract<FeatureInstance['shape'], { type: 'rect' }>
        );
        const lowerY = Math.min(...shapes.map((rect) => rect.y));
        const upperY = Math.max(...shapes.map((rect) => rect.y + rect.height));
        if (upperY - lowerY >= rightX - leftX) continue;
        // At heavy weights, the free extensions can be shorter than their
        // thickness even though the complete top stroke is horizontal.
        // Represent that stroke as one region, including its junction.
        if (shapes.some((rect) => rect.height >= rect.width)) {
          const rect = {
            type: 'rect' as const,
            x: leftX,
            y: lowerY,
            width: rightX - leftX,
            height: upperY - lowerY,
          };
          return [
            {
              id: 'arm',
              shape: rect,
              region: { kind: 'stroke', points: rectToPolygon(rect) },
              confidence: Math.min(...arms.map((arm) => arm.confidence)),
              anchors: {
                left: { x: leftX, y: (lowerY + upperY) / 2 },
                right: { x: rightX, y: (lowerY + upperY) / 2 },
              },
              debug: {
                source: 'bilateral-top-stroke',
                measuredHeight: rect.height,
                stemX1,
                stemX2,
              },
            },
          ];
        }
        return arms;
      }
    }
  }
  return [];
}

/**
 * Detects stem regions to filter out from arm detection.
 * Stems are vertical strokes that appear consistently across many Y bands.
 */
function detectStemRegions(geo: GeometryCache): StemRegion[] {
  const { glyph, metrics, svgShape, scale } = geo;
  const { stemWidth, overshoot } = scale;

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
  for (const midXs of spansByMidX.values()) {
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
  const midCapHeight =
    metrics.baseline + (metrics.capHeight - metrics.baseline) * 0.5;
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

  return zones.filter((y) => y >= bbox.minY && y <= bbox.maxY);
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
    const armHeight = Math.abs(y2 - y1);

    // Check if in arm zone (between baseline and cap-height)
    if (y1 > metrics.baseline && y2 < metrics.capHeight) {
      const armY = Math.min(y1, y2);
      const armWidth = probeX - (glyph.bbox.minX + bboxW * 0.3);

      const rect = {
        type: 'rect' as const,
        x: glyph.bbox.minX + bboxW * 0.3,
        y: armY,
        width: armWidth,
        height: armHeight,
      };
      return {
        id: 'arm',
        shape: rect,
        region: { kind: 'stroke', points: rectToPolygon(rect) },
        confidence: 0.5,
        anchors: {
          free: { x: probeX, y: armY + armHeight / 2 },
          attached: {
            x: glyph.bbox.minX + bboxW * 0.3,
            y: armY + armHeight / 2,
          },
        },
        debug: { source: 'slide-fallback' },
      };
    }
  }

  return null;
}
