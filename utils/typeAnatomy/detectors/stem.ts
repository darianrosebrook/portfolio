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
import {
  getFilledGeometry,
  occupiedRayIntervals,
  containsFilledPoint,
  contourWinding,
} from '@/utils/geometry/filledGeometry';

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
  const { glyph } = geo;

  if (!glyph?.path?.commands || !glyph.bbox) {
    return [];
  }

  // Ascender walls belong to the writing body below x-height. An isolated
  // mark above that body can have the same straight edges as a thin stem.
  const filled = geo.filled ?? getFilledGeometry(glyph);
  const writingBody = (instance: FeatureInstance) => {
    const points = instance.region?.points;
    if (!points?.length) return false;
    const middle = points.reduce(
      (sum, point) => ({
        x: sum.x + point.x / points.length,
        y: sum.y + point.y / points.length,
      }),
      { x: 0, y: 0 }
    );
    return filled.bodies.some(
      (body) =>
        body.bbox.minY < geo.metrics.xHeight - geo.scale.eps &&
        contourWinding(body.points, middle) !== 0
    );
  };
  const forkShafts = traceOpposedBackbones(geo, true).filter(writingBody);
  if (forkShafts.length) return forkShafts;
  const backbones = traceBackbones(geo).filter(writingBody);
  if (backbones.length) return backbones;
  const opposed = traceOpposedBackbones(geo).filter(writingBody);
  return opposed.length
    ? opposed
    : traceSharedBackbones(geo).filter(writingBody);
}

/** Opposed source walls establish a corridor even when attached arms occupy
 * most horizontal sample rows. Independent filled probes through the entire
 * corridor retain its width through joins and reject arm ends or empty gaps.
 */
function traceOpposedBackbones(
  geo: GeometryCache,
  forksOnly = false
): FeatureInstance[] {
  const filled = geo.filled ?? getFilledGeometry(geo.glyph);
  const basisSlope = -Math.tan((geo.italicAngle * Math.PI) / 180);
  const edges = [...geo.segments];
  const owners = new Map<(typeof edges)[number], number>();
  let start: Point2D | undefined,
    contour = -1;
  for (const segment of geo.segments) {
    if (segment.type === 'moveTo') {
      start = segment.params[0];
      contour++;
    }
    owners.set(segment, contour);
    if (segment.type === 'closePath' && start && segment.params[0]) {
      const closing = { type: 'lineTo', params: [segment.params[0], start] };
      edges.push(closing);
      owners.set(closing, contour);
    }
  }
  const walls: Array<{
    x: number;
    bottom: number;
    top: number;
    origin: Point2D;
    slope: number;
    extent: number;
    contours: Set<number>;
    edgeBottom: number;
    edgeTop: number;
  }> = [];
  for (const edge of edges) {
    if (edge.type !== 'lineTo' || edge.params.length !== 2) continue;
    const [a, b] = edge.params,
      dy = b.y - a.y;
    if (
      Math.abs(dy) <= geo.scale.eps ||
      Math.abs(b.x - basisSlope * b.y - (a.x - basisSlope * a.y)) >
        geo.scale.eps
    )
      continue;
    const x = (a.x - basisSlope * a.y + (b.x - basisSlope * b.y)) / 2;
    const existing = walls.find(
      (wall) => Math.abs(wall.x - x) <= geo.scale.eps
    );
    if (existing) {
      existing.contours.add(owners.get(edge)!);
      existing.bottom = Math.min(existing.bottom, a.y, b.y);
      existing.top = Math.max(existing.top, a.y, b.y);
      if (Math.abs(dy) > existing.extent) {
        existing.origin = a;
        existing.slope = (b.x - a.x) / dy;
        existing.extent = Math.abs(dy);
        existing.edgeBottom = Math.min(a.y, b.y);
        existing.edgeTop = Math.max(a.y, b.y);
      }
    } else
      walls.push({
        x,
        bottom: Math.min(a.y, b.y),
        top: Math.max(a.y, b.y),
        origin: a,
        slope: (b.x - a.x) / dy,
        extent: Math.abs(dy),
        contours: new Set([owners.get(edge)!]),
        edgeBottom: Math.min(a.y, b.y),
        edgeTop: Math.max(a.y, b.y),
      });
  }
  const candidates: Array<{
    instance: FeatureInstance;
    left: number;
    right: number;
    bottom: number;
    top: number;
    width: number;
  }> = [];
  walls.sort((a, b) => a.x - b.x);
  for (let i = 0; i < walls.length; i++)
    for (let j = i + 1; j < walls.length; j++) {
      const left = walls[i],
        right = walls[j];
      // An overlapping r head supplies an internal seam, not a shaft wall.
      // Opposed boundaries must retain shared source-contour custody.
      if (![...left.contours].some((contour) => right.contours.has(contour)))
        continue;
      const overlapBottom = Math.max(left.bottom, right.bottom),
        overlapTop = Math.min(left.top, right.top);
      if (overlapTop - overlapBottom <= geo.scale.eps) continue;
      const at = (wall: typeof left, y: number) =>
        wall.origin.x + wall.slope * (y - wall.origin.y);
      const leftAt = (y: number) => at(left, y),
        rightAt = (y: number) => at(right, y);
      // A decorative closing edge can continue at the same x beyond the
      // shaft. The longest source wall bounds the backbone; a union of all
      // collinear fragments must not extend it through the head flare.
      const longer = left.extent >= right.extent ? left : right;
      const bottom = Math.max(geo.metrics.baseline, longer.edgeBottom),
        top = longer.edgeTop;
      const height = top - bottom,
        width = rightAt((bottom + top) / 2) - leftAt((bottom + top) / 2);
      const forkAttachment = supportsFork();
      if (forksOnly && !forkAttachment) continue;
      if (
        (!forkAttachment &&
          (height < geo.scale.bboxH * 0.3 || height < width)) ||
        width <= geo.scale.eps ||
        rightAt(bottom) <= leftAt(bottom) ||
        rightAt(top) <= leftAt(top)
      )
        continue;
      if (!forkAttachment && height < width * 1.5) {
        const attached = [bottom - height * 0.05, top + height * 0.05].some(
          (y) =>
            occupiedRayIntervals(
              filled,
              { x: geo.glyph.bbox.minX - geo.scale.eps, y },
              0,
              geo.scale.overshoot
            ).some(
              (span) =>
                span.near.x < rightAt(y) &&
                span.far.x > leftAt(y) &&
                (span.near.x < leftAt(y) - geo.scale.eps ||
                  span.far.x > rightAt(y) + geo.scale.eps)
            )
        );
        if (!attached) continue;
      }
      const wallY = (overlapBottom + overlapTop) / 2;
      if (
        !containsFilledPoint(filled, {
          x: leftAt(wallY) + geo.scale.eps,
          y: wallY,
        }) ||
        !containsFilledPoint(filled, {
          x: rightAt(wallY) - geo.scale.eps,
          y: wallY,
        })
      )
        continue;
      let occupied = true;
      for (let band = 1; band < 32 && occupied; band++) {
        const y = bottom + (height * band) / 32;
        for (const depth of [0.1, 0.5, 0.9]) {
          if (
            !containsFilledPoint(filled, {
              x: leftAt(y) + (rightAt(y) - leftAt(y)) * depth,
              y,
            })
          )
            occupied = false;
        }
      }
      if (!occupied) continue;
      const points = [
        { x: leftAt(bottom), y: bottom },
        { x: rightAt(bottom), y: bottom },
        { x: rightAt(top), y: top },
        { x: leftAt(top), y: top },
      ];
      const slanted =
        Math.max(
          Math.abs(leftAt(top) - leftAt(bottom)),
          Math.abs(rightAt(top) - rightAt(bottom))
        ) > geo.scale.eps;
      const instance: FeatureInstance = {
        id: 'stem',
        shape: slanted
          ? { type: 'polyline', points }
          : {
              type: 'rect',
              x: leftAt(bottom),
              y: bottom,
              width: rightAt(bottom) - leftAt(bottom),
              height,
            },
        region: { kind: 'stroke', points },
        confidence: 0.9,
        anchors: {
          bottom: { x: (leftAt(bottom) + rightAt(bottom)) / 2, y: bottom },
          top: { x: (leftAt(top) + rightAt(top)) / 2, y: top },
        },
        debug: {
          source: 'opposed-source-walls',
          thickness: width,
          edgeBottom: bottom,
          edgeTop: top,
          basisSlope,
          leftSlope: left.slope,
          rightSlope: right.slope,
          forkAttachment,
          sampleCount: 31,
        },
      };
      candidates.push({
        instance,
        left: left.x,
        right: right.x,
        bottom,
        top,
        width,
      });

      /** A short shaft supports two actual outward branches in the same
       * occupied body. Source directions and separated ink above the junction
       * distinguish a fork from parallel stems over a bar or a serif flare.
       */
      function supportsFork(): boolean {
        if (height <= geo.scale.eps || width <= geo.scale.eps) return false;
        const body = filled.bodies.find(
          (body) =>
            contourWinding(body.points, {
              x: (leftAt((bottom + top) / 2) + rightAt((bottom + top) / 2)) / 2,
              y: (bottom + top) / 2,
            }) !== 0
        );
        if (!body) return false;
        const branches = (side: 'left' | 'right') =>
          edges.flatMap((edge) => {
            if (edge.type !== 'lineTo' || edge.params.length !== 2) return [];
            const [low, high] = [...edge.params].sort((a, b) => a.y - b.y);
            const dy = high.y - low.y;
            if (
              dy < height * 0.2 ||
              low.y > top + geo.scale.eps ||
              low.y < bottom - geo.scale.eps ||
              top - low.y > width ||
              low.x < leftAt(low.y) - geo.scale.eps ||
              low.x > rightAt(low.y) + geo.scale.eps
            )
              return [];
            const drift = high.x - low.x - basisSlope * dy;
            if (
              side === 'left' ? drift >= -width * 0.25 : drift <= width * 0.25
            )
              return [];
            const probe = {
              x: low.x + (side === 'left' ? geo.scale.eps : -geo.scale.eps),
              y: low.y,
            };
            if (contourWinding(body.points, probe) === 0) return [];
            return [
              {
                low,
                high,
                x: (y: number) => low.x + ((high.x - low.x) * (y - low.y)) / dy,
              },
            ];
          });
        for (const first of branches('left'))
          for (const second of branches('right')) {
            const join = Math.max(top, first.low.y, second.low.y),
              limit = Math.min(first.high.y, second.high.y);
            if (limit - join <= geo.scale.eps) continue;
            const supported = [0.6, 0.8].every((fraction) => {
              const y = join + (limit - join) * fraction;
              const spans = occupiedRayIntervals(
                filled,
                { x: geo.glyph.bbox.minX - geo.scale.eps, y },
                0,
                geo.scale.overshoot
              );
              const leftInk = spans.find(
                (span) =>
                  span.near.x <= first.x(y) + geo.scale.eps &&
                  span.far.x >= first.x(y) + geo.scale.eps
              );
              const rightInk = spans.find(
                (span) =>
                  span.near.x <= second.x(y) - geo.scale.eps &&
                  span.far.x >= second.x(y) - geo.scale.eps
              );
              return (
                leftInk &&
                rightInk &&
                leftInk !== rightInk &&
                leftInk.far.x < rightInk.near.x - geo.scale.eps
              );
            });
            if (supported) return true;
          }
        return false;
      }
    }
  // Compare in the same slant basis; a polygon's axis-aligned bounding box can
  // overlap a different stroke merely because both move horizontally with y.
  candidates.sort((a, b) => a.width - b.width);
  const result: typeof candidates = [];
  for (const candidate of candidates) {
    if (
      result.some(
        (other) =>
          Math.min(candidate.right, other.right) >
            Math.max(candidate.left, other.left) &&
          Math.min(candidate.top, other.top) >
            Math.max(candidate.bottom, other.bottom)
      )
    )
      continue;
    result.push(candidate);
  }
  return result.map((candidate) => candidate.instance);
}

/** Facing cavities in the same occupied body support a shared upright.
 * Its height comes from the actual vertical ink interval between the cavities;
 * disconnected marks and moving curved outer walls provide no such attachment.
 */
function traceSharedBackbones(geo: GeometryCache): FeatureInstance[] {
  const filled = geo.filled ?? getFilledGeometry(geo.glyph);
  const result: FeatureInstance[] = [];
  for (let i = 0; i < filled.enclosedRegions.length; i++) {
    for (let j = i + 1; j < filled.enclosedRegions.length; j++) {
      const [left, right] = [
        filled.enclosedRegions[i],
        filled.enclosedRegions[j],
      ].sort((a, b) => a.bbox.minX - b.bbox.minX);
      if (left.bodyIndex === undefined || left.bodyIndex !== right.bodyIndex)
        continue;
      const x1 = left.bbox.maxX,
        x2 = right.bbox.minX;
      const gap = x2 - x1;
      if (
        gap <= geo.scale.eps ||
        filled.enclosedRegions.some(
          (other) =>
            other !== left &&
            other !== right &&
            other.bodyIndex === left.bodyIndex &&
            other.bbox.minX > left.bbox.maxX &&
            other.bbox.maxX < right.bbox.minX
        )
      )
        continue;
      const centerX = (x1 + x2) / 2;
      const body = filled.bodies[left.bodyIndex];
      const intervals = occupiedRayIntervals(
        filled,
        { x: centerX, y: body.bbox.minY - geo.scale.eps },
        Math.PI / 2,
        body.bbox.maxY - body.bbox.minY + geo.scale.eps * 2
      );
      const joinY =
        (Math.max(left.bbox.minY, right.bbox.minY) +
          Math.min(left.bbox.maxY, right.bbox.maxY)) /
        2;
      const interval = intervals.find(
        (span) => span.near.y <= joinY && span.far.y >= joinY
      );
      if (!interval || interval.far.y - interval.near.y < gap * 2) continue;
      const lower: Point2D[] = [],
        upper: Point2D[] = [];
      const bands = 64;
      for (let band = 1; band < bands; band++) {
        const y =
          interval.near.y + ((interval.far.y - interval.near.y) * band) / bands;
        const span = occupiedRayIntervals(
          filled,
          { x: body.bbox.minX - geo.scale.eps, y },
          0,
          body.bbox.maxX - body.bbox.minX + geo.scale.eps * 2
        ).find(
          (candidate) =>
            candidate.near.x <= centerX && candidate.far.x >= centerX
        );
        if (!span) continue;
        lower.push({ x: Math.max(x1, span.near.x), y });
        upper.push({ x: Math.min(x2, span.far.x), y });
      }
      if (lower.length < bands * 0.9) continue;
      const points = [...lower, ...upper.reverse()];
      result.push({
        id: 'stem',
        shape: { type: 'polyline', points },
        region: { kind: 'stroke', points },
        confidence: 0.85,
        anchors: { center: { x: centerX, y: joinY } },
        debug: {
          source: 'shared-cavity-backbone',
          bodyIndex: left.bodyIndex,
          leftCavity: i,
          rightCavity: j,
          sampleCount: lower.length,
        },
      });
    }
  }
  return result;
}

/**
 * Long outline edges establish a stroke direction. Matching fill-span edges
 * then establish its opposite boundary. This keeps a connector's merged span
 * from widening the stem and avoids treating a moving diagonal as several
 * unrelated vertical strokes. Opposed-wall and cavity attachments supply
 * independent fallback support when merged scanlines obscure a track.
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
    const basisSlope = -Math.tan((geo.italicAngle * Math.PI) / 180);
    if (Math.abs(slope - basisSlope) > 0.65) continue;
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
    // A line-backed stroke can taper slightly (heavy Inter b differs four
    // units between foot and ascender). Admit that small measured width drift,
    // while the straight source edge remains the required backbone support.
    stable = stable.filter(
      (s) =>
        Math.max(
          Math.abs(initialLeft(s.y) - s.x1),
          Math.abs(initialRight(s.y) - s.x2)
        ) <= Math.max(scale.eps, medianWidth * 0.02)
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
  const basisSlope = -Math.tan((geo.italicAngle * Math.PI) / 180);
  const upright = tracks.filter(
    (t) => Math.abs(t.slope - basisSlope) * height <= scale.eps
  );
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
