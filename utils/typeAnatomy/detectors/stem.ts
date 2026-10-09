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
import type { FeatureInstance, GeometryCache } from '../types';
import { rectToPolygon } from '../evidence/regionFromShape';

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

  const backbones = traceBackbones(geo);
  if (backbones.length > 0) return backbones;

  const instances: FeatureInstance[] = [];
  const { bboxW, bboxH, stemWidth, overshoot } = scale;

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

    const rect = {
      type: 'rect' as const,
      x: avgX1,
      y: stemBottom,
      width: avgWidth,
      height: stemTop - stemBottom,
    };

    instances.push({
      id: 'stem',
      shape: rect,
      region: { kind: 'stroke', points: rectToPolygon(rect) },
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
 * Long outline edges establish a stroke direction. Matching fill-span edges
 * then establish its opposite boundary. This keeps a connector's merged span
 * from widening the stem and avoids treating a moving diagonal as several
 * unrelated vertical strokes. Glyphs without a validated line-backed track
 * use the scanline fallback.
 */
function traceBackbones(geo: GeometryCache): FeatureInstance[] {
  const { glyph, metrics, scale } = geo;
  const bottom = Math.max(glyph.bbox.minY, metrics.baseline);
  const top = Math.min(
    glyph.bbox.maxY,
    glyph.bbox.maxY > metrics.xHeight + scale.bboxH * 0.1
      ? metrics.capHeight
      : metrics.xHeight
  );
  const height = top - bottom;
  if (height <= 0) return [];

  let samples: StemCandidate[] = [];
  const bands = 32;
  for (let i = 1; i < bands; i++) {
    const y = bottom + (i * height) / bands;
    const { points } = rayHits(
      geo.svgShape,
      { x: glyph.bbox.minX - scale.overshoot * 0.1, y },
      0,
      scale.overshoot
    );
    for (let j = 0; j + 1 < points.length; j += 2) {
      const x1 = points[j].x;
      const x2 = points[j + 1].x;
      const width = x2 - x1;
      if (width > scale.eps) {
        samples.push({ x1, x2, midX: (x1 + x2) / 2, width, y });
      }
    }
  }
  if (samples.length === 0) return [];
  // The cache's mid-height stem estimate can be the whole connector span
  // (e.g. a heavy H). Repeated bands supply a stroke-width estimate without
  // letting that one merged scanline reject the actual upright boundaries.
  const spanWidths = samples.map((s) => s.width).sort((a, b) => a - b);
  const typicalWidth = spanWidths[Math.floor(spanWidths.length / 2)];
  samples = samples.filter(
    (s) => s.width >= Math.max(typicalWidth * 0.6, scale.bboxW * 0.03)
  );

  const tracks: Array<{
    instance: FeatureInstance;
    slope: number;
    left: (y: number) => number;
    right: (y: number) => number;
  }> = [];
  // GeometryCache's closePath marker has only its starting endpoint, so
  // materialize closing edges as well (a stem boundary may close a contour).
  const edges = [...geo.segments];
  let contourStart: { x: number; y: number } | undefined;
  for (const segment of geo.segments) {
    if (segment.type === 'moveTo') contourStart = segment.params[0];
    if (segment.type === 'closePath' && contourStart && segment.params[0]) {
      edges.push({ type: 'lineTo', params: [segment.params[0], contourStart] });
    }
  }
  // Validate the longest boundary first so a partial inner edge does not
  // replace an already-supported full-height corridor for the same stroke.
  edges.sort((a, b) => {
    const extent = (s: (typeof edges)[number]) =>
      s.type === 'lineTo' && s.params.length === 2
        ? Math.abs(s.params[1].y - s.params[0].y)
        : 0;
    return extent(b) - extent(a);
  });
  for (const segment of edges) {
    if (segment.type !== 'lineTo' || segment.params.length !== 2) continue;
    const [a, b] = segment.params;
    const dy = b.y - a.y;
    const edgeBottom = Math.max(bottom, Math.min(a.y, b.y));
    const edgeTop = Math.min(top, Math.max(a.y, b.y));
    const edgeHeight = edgeTop - edgeBottom;
    if (edgeHeight <= scale.eps) continue;
    const slope = (b.x - a.x) / dy;
    // Backbones run predominantly along the vertical axis.
    if (Math.abs(slope) > 0.65) continue;
    const edgeX = (y: number) => a.x + slope * (y - a.y);
    const matching = samples.filter(
      (s) =>
        s.y >= edgeBottom &&
        s.y <= edgeTop &&
        Math.min(Math.abs(s.x1 - edgeX(s.y)), Math.abs(s.x2 - edgeX(s.y))) <=
          scale.eps
    );
    const requiredSamples = Math.max(3, (edgeHeight / height) * bands * 0.4);
    if (matching.length < requiredSamples) continue;
    const widths = matching.map((s) => s.width).sort((a, b) => a - b);
    const medianWidth = widths[Math.floor(widths.length / 2)];
    // A backbone is elongated along its measured outline edge. This excludes
    // short serif/join edges without requiring every stem to reach cap height.
    if (edgeHeight < medianWidth * 2) continue;
    // At a join, a scanline includes unrelated ink. It is not evidence for
    // widening this backbone; retain the consistent stroke spans instead.
    let stable = matching.filter(
      (s) => Math.abs(s.width - medianWidth) <= medianWidth * 0.35
    );
    if (
      stable.length < requiredSamples ||
      stable[stable.length - 1].y - stable[0].y < edgeHeight * 0.55
    )
      continue;
    const initialLeft = fitEdge(stable, 'x1');
    const initialRight = fitEdge(stable, 'x2');
    stable = stable.filter(
      (s) =>
        Math.max(
          Math.abs(initialLeft(s.y) - s.x1),
          Math.abs(initialRight(s.y) - s.x2)
        ) <= scale.eps
    );
    if (
      stable.length < requiredSamples ||
      stable[stable.length - 1].y - stable[0].y < edgeHeight * 0.55
    )
      continue;
    const left = fitEdge(stable, 'x1');
    const right = fitEdge(stable, 'x2');
    const residual = Math.max(
      ...stable.map((s) =>
        Math.max(Math.abs(left(s.y) - s.x1), Math.abs(right(s.y) - s.x2))
      )
    );
    if (residual > medianWidth * 0.1) continue;
    // Two outline edges of the same stroke seed the same fitted corridor.
    if (
      tracks.some(
        (t) =>
          Math.abs(t.left(bottom) - left(bottom)) < scale.eps &&
          Math.abs(t.right(top) - right(top)) < scale.eps
      )
    )
      continue;
    if (right(bottom) <= left(bottom) || right(top) <= left(top)) continue;

    // Near-full-height boundaries continue through their terminal join, as
    // before. A genuinely short upright is bounded by its own outline extent;
    // it must not be stretched through the shoulder or upper empty space.
    const trackBottom = edgeHeight >= height * 0.8 ? bottom : edgeBottom;
    const trackTop = edgeHeight >= height * 0.8 ? top : edgeTop;
    const trackHeight = trackTop - trackBottom;
    const points = [
      { x: left(trackBottom), y: trackBottom },
      { x: right(trackBottom), y: trackBottom },
      { x: right(trackTop), y: trackTop },
      { x: left(trackTop), y: trackTop },
    ];
    const straight =
      Math.max(
        Math.abs(left(trackTop) - left(trackBottom)),
        Math.abs(right(trackTop) - right(trackBottom))
      ) <= scale.eps;
    tracks.push({
      slope,
      left,
      right,
      instance: {
        id: 'stem',
        shape: straight
          ? {
              type: 'rect',
              x: left(trackBottom),
              y: trackBottom,
              width: right(trackBottom) - left(trackBottom),
              height: trackHeight,
            }
          : { type: 'polyline', points },
        region: { kind: 'stroke', points },
        confidence: Math.min(0.9, 0.5 + (stable.length / bands) * 0.4),
        anchors: {
          top: { x: (left(trackTop) + right(trackTop)) / 2, y: trackTop },
          bottom: {
            x: (left(trackBottom) + right(trackBottom)) / 2,
            y: trackBottom,
          },
          center: {
            x:
              (left((trackTop + trackBottom) / 2) +
                right((trackTop + trackBottom) / 2)) /
              2,
            y: (trackTop + trackBottom) / 2,
          },
        },
        debug: {
          sampleCount: stable.length,
          slope,
          thickness: medianWidth,
          residual,
          edgeBottom,
          edgeTop,
        },
      },
    });
  }
  // Upright backbones take precedence over subsidiary diagonal joins (such
  // as the interior joins of M).
  const upright = tracks.filter((t) => Math.abs(t.slope) * height <= scale.eps);
  return (upright.length > 0 ? upright : tracks).map((t) => t.instance);
}

function fitEdge(
  samples: StemCandidate[],
  edge: 'x1' | 'x2'
): (y: number) => number {
  // Median pairwise slope resists the occasional joined/apex span. Least
  // squares would tilt the whole mask toward one such outlier.
  const slopes: number[] = [];
  for (let i = 0; i < samples.length; i++) {
    for (let j = i + 1; j < samples.length; j++) {
      if (samples[i].y !== samples[j].y) {
        slopes.push(
          (samples[j][edge] - samples[i][edge]) / (samples[j].y - samples[i].y)
        );
      }
    }
  }
  slopes.sort((a, b) => a - b);
  const slope = slopes[Math.floor(slopes.length / 2)];
  const intercepts = samples
    .map((s) => s[edge] - slope * s.y)
    .sort((a, b) => a - b);
  const intercept = intercepts[Math.floor(intercepts.length / 2)];
  return (y) => intercept + slope * y;
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
