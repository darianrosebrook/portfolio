/**
 * Crossbar feature detector.
 *
 * A crossbar is a horizontal stroke that connects two stems or parts
 * of a letter (e.g., in 'A', 'H', 'e', 'f', 't').
 *
 * v2 improvements:
 * - Returns rect shapes for consistent closed-shape rendering
 * - Uses filled spans (intersection pairs) for candidate discovery
 * - Measures bar height by perpendicular raycast through the candidate
 *   midpoint via the orthogonal-thickness evidence predicate, NOT by the
 *   Y-spread of detection sampling bands. (The previous Y-spread heuristic
 *   inflated bar height proportional to how many sampling bands hit the
 *   bar, which produced over-tall rects on glyphs whose crossbar stayed
 *   within the y-band window — see Nohemi A and H.)
 */

import { eyeFloor } from './eye';
import { detectStem } from './stem';
import {
  getFilledGeometry,
  occupiedRayIntervals,
} from '@/utils/geometry/filledGeometry';
import { rayHits } from '@/utils/geometry/geometryCore';
import {
  measureOrthogonalThickness,
  type OrthogonalThicknessMeasurement,
} from '../evidence/measureOrthogonalThickness';
import { rectToPolygon } from '../evidence/regionFromShape';
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

  const eyeBars = traceEyeBars(geo);
  if (eyeBars.length) return eyeBars;

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

  // For each group, compute the consensus span and measure thickness
  // perpendicular to the bar's dominant (horizontal) axis.
  for (const group of groups) {
    // Consensus midpoint: average of per-span midX and per-band y. This is
    // more robust than the bbox center of the grouped candidate because the
    // y-band sampling is uniform but spans may shift slightly between bands.
    const avgY = group.reduce((s, sp) => s + sp.y, 0) / group.length;
    const avgX1 = group.reduce((s, sp) => s + sp.x1, 0) / group.length;
    const avgX2 = group.reduce((s, sp) => s + sp.x2, 0) / group.length;
    const midX =
      group.reduce((s, sp) => s + (sp.x1 + sp.x2) / 2, 0) / group.length;

    // Measure bar thickness by casting a vertical ray through the midpoint.
    // The predicate picks the entry/exit pair containing (or nearest) the
    // midpoint, which prevents bowl/counter geometry from contaminating the
    // measurement on glyphs like 'e'.
    const thicknessMeasurement = measureOrthogonalThickness(geo, {
      midpoint: { x: midX, y: avgY },
      dominantAxis: 'horizontal',
    });

    // Reject candidates where the perpendicular probe could not produce a
    // measurement at all.
    if (
      thicknessMeasurement.failureReason === 'no_hits' ||
      thicknessMeasurement.failureReason === 'insufficient_pairs'
    ) {
      continue;
    }

    // Reject candidates where the probe found ink but at a y far from where
    // the candidate said it was looking. This catches the case where a
    // sampling band lies above/below the bar (e.g., on Nohemi A, an
    // uppercase mid-zone band at y=1859 intersects the diagonal legs near
    // the apex) — the probe finds a real pair but its centerline jumps to
    // the apex region (~y=2634) far from the band y. Threshold is one
    // measured thickness: a probe whose pair center is within one bar's
    // thickness of the sampling band is plausibly the same stroke; farther
    // than that and the probe locked onto a different stroke entirely.
    //
    // This is intentionally distinct from rejecting on
    // `!selectedPairContainsMidpoint`, which would also reject A's
    // legitimate constituents. A's bar is tilted (diagonals converge
    // upward), so the consensus midX may sit slightly outside the bar at
    // some constituent y values — the probe's pair won't bracket the
    // midpoint in y, even though the result is the same physical bar.
    // Distance-from-band keeps those constituents and only rejects probes
    // that found wholly different strokes.
    const measuredCenterY = thicknessMeasurement.selectedPairCenterOnProbeAxis;
    if (measuredCenterY !== undefined) {
      const distance = Math.abs(measuredCenterY - avgY);
      if (distance > thicknessMeasurement.thickness) {
        continue;
      }
    }

    // Single-band groups carry less internal evidence (no width-consistency
    // check across multiple bands), so require strict probe unambiguity:
    // exactly one pair, containing the midpoint.
    if (
      group.length < 2 &&
      !(
        thicknessMeasurement.selectedPairContainsMidpoint &&
        thicknessMeasurement.pairCount === 1
      )
    ) {
      continue;
    }

    const measuredHeight = thicknessMeasurement.thickness;

    // Width and one flat cap do not establish a transverse stroke: a
    // perpendicular ray may continue through a curved bowl or its foot.
    const wallExtent = opposedTransverseWallExtent(geo, thicknessMeasurement);
    if (!wallExtent) continue;

    // A vertical probe can measure the full height of a vertical stem.
    // A thick connector's exposed mask can also be taller than it is wide;
    // distinct side-stem support establishes that case independently.
    if (
      measuredHeight <= 0 ||
      (measuredHeight >= avgX2 - avgX1 &&
        !supportsBoundedConnector(geo, avgX1, avgX2, thicknessMeasurement))
    ) {
      continue;
    }

    // Check for consistent width across samples
    const widths = group.map((sp) => sp.width);
    const avgWidth = widths.reduce((a, b) => a + b, 0) / widths.length;
    const widthVariance =
      widths.reduce((s, w) => s + (w - avgWidth) ** 2, 0) / widths.length;
    const widthStdDev = Math.sqrt(widthVariance);

    // Feature confidence combines width consistency (the existing signal)
    // with the local thickness-measurement confidence from the predicate.
    // An ambiguous probe (e.g., the probe also hit a counter wall) lowers
    // the final confidence even when the bar's width is consistent.
    const isConsistent = widthStdDev < avgWidth * 0.3;
    const baseConfidence = isConsistent
      ? Math.min(0.9, 0.5 + group.length * 0.1)
      : 0.5;
    const confidence = baseConfidence * thicknessMeasurement.confidence;

    // Anchor the rect's vertical center on the measured pair's centerline,
    // not the sampling-band y. The sampling band is where we *looked* for
    // the bar; the predicate's pair center is where the bar's edges
    // actually were. They differ when the sampling band lands off-center
    // within the bar (e.g., Nohemi H: only the y=1573 band passes the
    // interior filter, but the bar's actual edges are at 1232 and 1622, so
    // its centerline is 1427 — anchoring at 1573 would push the rect 146
    // design units high). Falls back to avgY when the predicate did not
    // produce a measurement (defensive — the failure-reason guards above
    // already short-circuit the no-pair cases).
    const centerY = thicknessMeasurement.selectedPairCenterOnProbeAxis ?? avgY;

    const rect = {
      type: 'rect' as const,
      x: wallExtent.x1,
      y: centerY - measuredHeight / 2,
      width: wallExtent.x2 - wallExtent.x1,
      height: measuredHeight,
    };
    instances.push({
      id: 'crossbar',
      shape: rect,
      region: { kind: 'stroke', points: rectToPolygon(rect) },
      confidence,
      anchors: {
        left: { x: wallExtent.x1, y: centerY },
        right: { x: wallExtent.x2, y: centerY },
      },
      debug: {
        sampleCount: group.length,
        avgWidth,
        widthStdDev,
        measuredHeight,
        thicknessConfidence: thicknessMeasurement.confidence,
        samplingBandY: avgY,
        measuredCenterY: centerY,
      },
    });
  }

  // Fallback: check path segments for horizontal lines
  if (instances.length === 0) {
    const segmentBars = findHorizontalSegments(geo);
    for (const seg of segmentBars) {
      // Outline edges establish the horizontal extent, but their Y is an
      // edge rather than the centerline. Probe away from any attached stem
      // and retain a containing pair with horizontal proportions or bounded
      // support from two distinct side stems.
      const measurements = [0.05, 0.1, 0.25, 0.5, 0.75, 0.9, 0.95]
        .map((fraction) =>
          measureOrthogonalThickness(geo, {
            midpoint: { x: seg.x1 + (seg.x2 - seg.x1) * fraction, y: seg.y },
            dominantAxis: 'horizontal',
          })
        )
        .filter(
          (measurement) =>
            measurement.selectedPairContainsMidpoint &&
            measurement.selectedPairCenterOnProbeAxis !== undefined &&
            measurement.thickness > 0 &&
            opposedTransverseWallExtent(geo, measurement) &&
            (measurement.thickness < seg.x2 - seg.x1 ||
              supportsBoundedConnector(geo, seg.x1, seg.x2, measurement))
        )
        .sort((a, b) => a.thickness - b.thickness);
      const measurement = measurements[0];
      if (!measurement) continue;
      const barHeight = measurement.thickness;
      const centerY = measurement.selectedPairCenterOnProbeAxis!;
      if (
        seg.requiresAscender &&
        !(geo.filled ?? getFilledGeometry(glyph)).bodies.some(
          (body) =>
            body.bbox.minX <= seg.x1 + scale.eps &&
            body.bbox.maxX >= seg.x2 - scale.eps &&
            body.bbox.minY < centerY - barHeight / 2 - scale.eps &&
            body.bbox.maxY > centerY + barHeight / 2 + scale.eps
        )
      )
        continue;
      const rect = {
        type: 'rect' as const,
        x: seg.x1,
        y: centerY - barHeight / 2,
        width: seg.x2 - seg.x1,
        height: barHeight,
      };
      instances.push({
        id: 'crossbar',
        shape: rect,
        region: { kind: 'stroke', points: rectToPolygon(rect) },
        confidence: 0.5,
        anchors: {
          left: { x: seg.x1, y: centerY },
          right: { x: seg.x2, y: centerY },
        },
        debug: { source: 'segment-fallback', measuredHeight: barHeight },
      });
    }
  }

  // Merge overlapping/adjacent crossbar instances at similar Y positions
  const mergedInstances = mergeCrossbarInstances(instances, bboxH * 0.12);

  return trimDiagonalJoins(geo, mergedInstances);
}

/** Both occupied boundaries must be actual transverse source walls. The
 * exposed wing of a cap can have an inclined underside; the shaft underneath
 * its junction cannot supply a fabricated bar thickness. */
function opposedTransverseWallExtent(
  geo: GeometryCache,
  measurement: OrthogonalThicknessMeasurement
): { x1: number; x2: number } | undefined {
  const center = measurement.selectedPairCenterOnProbeAxis;
  if (center === undefined || !measurement.hits.length) return undefined;
  const lower = center - measurement.thickness / 2,
    upper = center + measurement.thickness / 2,
    x = measurement.hits[0].x,
    tolerance = geo.scale.eps * 0.001;
  const walls = [...geo.segments];
  let start;
  for (const segment of geo.segments) {
    if (segment.type === 'moveTo') start = segment.params[0];
    if (segment.type === 'closePath' && start && segment.params[0])
      walls.push({ type: 'lineTo', params: [segment.params[0], start] });
  }
  const owns = (y: number) =>
    walls.filter((wall) => {
      if (wall.type !== 'lineTo' || wall.params.length !== 2) return false;
      const [a, b] = wall.params,
        dx = b.x - a.x,
        dy = b.y - a.y;
      if (
        Math.abs(dx) <= Math.max(geo.scale.eps, Math.abs(dy) * 1.5) ||
        x < Math.min(a.x, b.x) - tolerance ||
        x > Math.max(a.x, b.x) + tolerance
      )
        return false;
      return Math.abs(a.y + ((x - a.x) * dy) / dx - y) <= tolerance;
    });
  const lowerWalls = owns(lower),
    upperWalls = owns(upper);
  if (!lowerWalls.length || !upperWalls.length) return undefined;
  const points = [...lowerWalls, ...upperWalls].flatMap((wall) => wall.params);
  return {
    x1: Math.min(...points.map((point) => point.x)),
    x2: Math.max(...points.map((point) => point.x)),
  };
}

/**
 * A connector can have a narrow exposed span between heavy stems. Require
 * its measured Y interval to be bounded, with separate strokes attached to
 * both ends above and below it. A vertical backbone supplies neither this
 * bounded interval nor two independent side supports.
 */
function supportsBoundedConnector(
  geo: GeometryCache,
  x1: number,
  x2: number,
  measurement: OrthogonalThicknessMeasurement
): boolean {
  const { glyph, svgShape, scale } = geo;
  const centerY = measurement.selectedPairCenterOnProbeAxis;
  if (centerY === undefined || measurement.thickness <= 0 || x2 <= x1)
    return false;
  const lowerY = centerY - measurement.thickness / 2;
  const upperY = centerY + measurement.thickness / 2;
  if (
    lowerY <= glyph.bbox.minY + scale.eps ||
    upperY >= glyph.bbox.maxY - scale.eps
  ) {
    return false;
  }

  const midX = (x1 + x2) / 2;
  for (const y of [
    (glyph.bbox.minY + lowerY) / 2,
    (upperY + glyph.bbox.maxY) / 2,
  ]) {
    const { points } = rayHits(
      svgShape,
      { x: glyph.bbox.minX - scale.overshoot * 0.1, y },
      0,
      scale.overshoot
    );
    const spans: Array<{ x1: number; x2: number }> = [];
    for (let i = 0; i + 1 < points.length; i += 2) {
      spans.push({ x1: points[i].x, x2: points[i + 1].x });
    }
    const leftSupport = spans.find(
      (span) =>
        span.x1 <= x1 + scale.eps && span.x2 >= x1 - scale.eps && span.x2 < midX
    );
    const rightSupport = spans.find(
      (span) =>
        span.x1 <= x2 + scale.eps && span.x2 >= x2 - scale.eps && span.x1 > midX
    );
    if (
      !leftSupport ||
      !rightSupport ||
      leftSupport.x2 >= rightSupport.x1 - scale.eps
    ) {
      return false;
    }
  }
  return true;
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

    const currentShape = current.shape as Extract<
      FeatureShape,
      { type: 'rect' }
    >;
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
 *
 * Width comes from the union of constituent x-bounds (wider is more
 * representative of the actual bar extent). Height does NOT come from the
 * union of y-bounds — taking min/max of y-extents over candidates at
 * slightly different centerlines re-introduces the spread-as-height bug
 * the orthogonal-thickness predicate was supposed to fix. Instead, the
 * merged height is the median of the per-instance perpendicular
 * measurements (the bar has a single thickness; spread across constituent
 * centers reflects sampling jitter, not real geometry). The merged center
 * Y is the average of constituent centers.
 */
function mergeGroup(group: FeatureInstance[]): FeatureInstance {
  if (group.length === 1) return group[0];

  const shapes = group.map(
    (inst) => inst.shape as Extract<FeatureShape, { type: 'rect' }>
  );

  // Width: union of x-bounds.
  const minX = Math.min(...shapes.map((s) => s.x));
  const maxX = Math.max(...shapes.map((s) => s.x + s.width));

  // Height: median of constituent heights. Each constituent's height was
  // measured by perpendicular raycast at its own midpoint, so they should
  // all reflect the same physical bar thickness. Median is robust to a
  // single outlier (e.g., a probe that grazed an edge).
  const heights = shapes.map((s) => s.height).sort((a, b) => a - b);
  const medianHeight =
    heights.length % 2 === 1
      ? heights[(heights.length - 1) / 2]
      : (heights[heights.length / 2 - 1] + heights[heights.length / 2]) / 2;

  // Center Y: average of constituent center Ys.
  const avgCenterY =
    shapes.reduce((s, sh) => s + (sh.y + sh.height / 2), 0) / shapes.length;

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

  const rect = {
    type: 'rect' as const,
    x: minX,
    y: avgCenterY - medianHeight / 2,
    width: maxX - minX,
    height: medianHeight,
  };
  return {
    id: 'crossbar',
    shape: rect,
    region: { kind: 'stroke', points: rectToPolygon(rect) },
    confidence: Math.min(0.95, weightedConfidence + 0.1), // Boost for merged detection
    anchors: {
      left: { x: minX, y: avgCenterY },
      right: { x: maxX, y: avgCenterY },
    },
    debug: {
      mergedFrom: group.length,
      totalSamples,
      medianHeight,
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
): Array<{ x1: number; x2: number; y: number; requiresAscender: boolean }> {
  const { segments, metrics, scale } = geo;
  const results: Array<{
    x1: number;
    x2: number;
    y: number;
    requiresAscender: boolean;
  }> = [];
  const tolerance = scale.bboxH * 0.15;

  // Target Y positions
  const lowercaseMidY =
    metrics.baseline + (metrics.xHeight - metrics.baseline) * 0.5;
  const uppercaseMidY =
    metrics.baseline + (metrics.capHeight - metrics.baseline) * 0.5;
  const lowercaseTopY =
    metrics.baseline + (metrics.xHeight - metrics.baseline) * 0.9;

  for (const seg of segments) {
    if (seg.type !== 'lineTo' || seg.params.length < 2) continue;

    const [p0, p1] = seg.params;
    const width = Math.abs(p1.x - p0.x);
    const height = Math.abs(p1.y - p0.y);

    // Horizontal if width >> height
    if (width > height * 3) {
      const midY = (p0.y + p1.y) / 2;

      // Check if near expected crossbar position
      const inMidZone =
        Math.abs(midY - lowercaseMidY) < tolerance ||
        Math.abs(midY - uppercaseMidY) < tolerance;
      if (
        inMidZone ||
        // Ascenders can carry a cross-stroke near x-height. Its actual
        // opposed walls establish identity, independently of the hook's top.
        Math.abs(midY - lowercaseTopY) < tolerance
      ) {
        results.push({
          x1: Math.min(p0.x, p1.x),
          x2: Math.max(p0.x, p1.x),
          y: midY,
          // A body's top slab is an Arm. An ascender cross-stroke has
          // connected body both above and below its actual occupied walls.
          requiresAscender: !inMidZone,
        });
      }
    }
  }

  return results;
}

/** An eye's floor identifies the bar even when another compound stroke joins
 * its scanline. Its occupied lower boundary supplies the complete free extent.
 */
function traceEyeBars(geo: GeometryCache): FeatureInstance[] {
  const filled = geo.filled ?? getFilledGeometry(geo.glyph);
  return filled.enclosedRegions.flatMap((hole) => {
    const floor = eyeFloor(hole, geo);
    if (!floor) return [];
    const midpoint = {
      x: (floor[0].x + floor[1].x) / 2,
      y: (floor[0].y + floor[1].y) / 2,
    };
    const measurement = measureOrthogonalThickness(geo, {
      midpoint,
      dominantAxis: 'horizontal',
    });
    if (
      !measurement.selectedPairContainsMidpoint ||
      measurement.thickness <= 0 ||
      measurement.selectedPairCenterOnProbeAxis === undefined
    )
      return [];
    const centerY = measurement.selectedPairCenterOnProbeAxis;
    const bottomY = centerY - measurement.thickness / 2;
    const topY = centerY + measurement.thickness / 2;
    // Source edges on the same bar floor/bottom establish terminal extensions.
    // Their y coordinate must agree with the measured boundaries; unrelated
    // horizontals elsewhere in the compound cannot extend this bar.
    const edges = geo.segments
      .filter(
        (segment) => segment.type === 'lineTo' && segment.params.length === 2
      )
      .map((segment) => segment.params)
      .filter(
        ([a, b]) =>
          Math.abs(a.y - b.y) <= geo.scale.eps &&
          (Math.abs(a.y - bottomY) <= geo.scale.eps ||
            Math.abs(a.y - topY) <= geo.scale.eps) &&
          Math.max(a.x, b.x) >= floor[0].x &&
          Math.min(a.x, b.x) <= floor[1].x
      );
    const occupied = occupiedRayIntervals(
      filled,
      { x: midpoint.x, y: centerY },
      0,
      geo.scale.overshoot
    )[0];
    if (!occupied || occupied.start > geo.scale.eps) return [];
    const endX = Math.max(
      floor[1].x,
      occupied.far.x,
      ...edges.flatMap((edge) => edge.map((p) => p.x))
    );
    const rect = {
      type: 'rect' as const,
      x: floor[0].x,
      y: bottomY,
      width: endX - floor[0].x,
      height: measurement.thickness,
    };
    if (rect.width <= rect.height) return [];
    return [
      {
        id: 'crossbar' as const,
        shape: rect,
        region: { kind: 'stroke' as const, points: rectToPolygon(rect) },
        confidence: 0.95,
        anchors: {
          left: { x: rect.x, y: centerY },
          right: { x: endX, y: centerY },
        },
        debug: {
          source: 'eye-floor-occupied-bar',
          measuredHeight: rect.height,
        },
      },
    ];
  });
}

/** A slanted backbone's join occupies part of a horizontal scanline. Keep the
 * free connector between its two measured corridors instead of assigning that
 * leg ink to the crossbar through averaged scanline endpoints.
 */
function trimDiagonalJoins(
  geo: GeometryCache,
  bars: FeatureInstance[]
): FeatureInstance[] {
  const stems = detectStem(geo);
  if (
    stems.length !== 2 ||
    stems.some(
      (stem) =>
        stem.shape.type !== 'polyline' ||
        (stem.debug as { source?: string })?.source === 'shared-cavity-backbone'
    )
  )
    return bars;
  return bars.map((bar) => {
    if (bar.shape.type !== 'rect') return bar;
    const y = bar.shape.y + bar.shape.height / 2;
    const rangesAt = (sampleY: number) =>
      stems
        .map((stem) => {
          const points = stem.region!.points;
          const xs: number[] = [];
          for (let i = 0; i < points.length; i++) {
            const a = points[i],
              b = points[(i + 1) % points.length];
            if (
              (a.y <= sampleY && b.y > sampleY) ||
              (b.y <= sampleY && a.y > sampleY)
            )
              xs.push(a.x + ((b.x - a.x) * (sampleY - a.y)) / (b.y - a.y));
          }
          return xs.sort((a, b) => a - b);
        })
        .sort((a, b) => a[0] - b[0]);
    const ranges = rangesAt(y);
    if (ranges.some((range) => range.length !== 2)) return bar;
    const minX = Math.max(bar.shape.x, ranges[0][1]);
    const maxX = Math.min(bar.shape.x + bar.shape.width, ranges[1][0]);
    if (maxX <= minX) return bar;
    const rect = { ...bar.shape, x: minX, width: maxX - minX };
    const bottom = rangesAt(rect.y),
      top = rangesAt(rect.y + rect.height);
    if ([...bottom, ...top].some((range) => range.length !== 2)) return bar;
    const points = [
      { x: Math.max(bar.shape.x, bottom[0][1]), y: rect.y },
      { x: Math.min(bar.shape.x + bar.shape.width, bottom[1][0]), y: rect.y },
      {
        x: Math.min(bar.shape.x + bar.shape.width, top[1][0]),
        y: rect.y + rect.height,
      },
      { x: Math.max(bar.shape.x, top[0][1]), y: rect.y + rect.height },
    ];
    return {
      ...bar,
      shape: rect,
      region: { kind: 'stroke', points },
    };
  });
}
