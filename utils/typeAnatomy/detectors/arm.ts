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

import { detectStem } from './stem';
import { rayHits } from '@/utils/geometry/geometryCore';
import type { FeatureInstance, GeometryCache } from '../types';
import { rectToPolygon } from '../evidence/regionFromShape';
import { measureOrthogonalThickness } from '../evidence/measureOrthogonalThickness';

/**
 * Detects arm features on a glyph.
 * Returns rect shapes at detected arm locations.
 */
export function detectArm(geo: GeometryCache): FeatureInstance[] {
  if (!geo.glyph?.path?.commands?.length || !geo.glyph.bbox) return [];
  const bilateral = detectBilateralTopArms(geo);
  if (bilateral.length) return bilateral;
  const stems = detectStem(geo).filter((stem) => stem.shape.type === 'rect');
  const instances: FeatureInstance[] = [];
  const { bbox } = geo.glyph;
  for (const stem of stems) {
    if (stem.shape.type !== 'rect') continue;
    const shaft = stem.shape;
    const levels = new Set<number>();
    for (let i = 1; i < 96; i++)
      levels.add(bbox.minY + (geo.scale.bboxH * i) / 96);
    for (const segment of geo.segments) {
      if (segment.type !== 'lineTo' || segment.params.length !== 2) continue;
      const [a, b] = segment.params;
      if (Math.abs(a.y - b.y) <= geo.scale.eps) {
        levels.add(a.y + geo.scale.eps);
        levels.add(a.y - geo.scale.eps);
      }
    }
    for (const y of levels) {
      if (y < shaft.y || y > shaft.y + shaft.height) continue;
      const spans = rayHits(
        geo.svgShape,
        { x: bbox.minX - geo.scale.eps, y },
        0,
        geo.scale.overshoot
      ).points;
      for (let i = 0; i + 1 < spans.length; i += 2) {
        if (
          spans[i].x > shaft.x + geo.scale.eps ||
          spans[i + 1].x < shaft.x + shaft.width - geo.scale.eps
        )
          continue;
        for (const side of ['left', 'right'] as const) {
          const x1 = side === 'right' ? shaft.x + shaft.width : spans[i].x;
          const x2 = side === 'right' ? spans[i + 1].x : shaft.x;
          const width = x2 - x1;
          if (width < Math.max(shaft.width * 0.65, geo.scale.bboxH * 0.18))
            continue;
          // A horizontal connector reaching a second backbone is a bar.
          if (
            stems.some(
              (other) =>
                other !== stem &&
                other.shape.type === 'rect' &&
                other.shape.x < x2 - geo.scale.eps &&
                other.shape.x + other.shape.width > x1 + geo.scale.eps
            )
          )
            continue;
          const measurement = measureOrthogonalThickness(geo, {
            midpoint: { x: x1 + width * 0.5, y },
            dominantAxis: 'horizontal',
          });
          if (
            !measurement.selectedPairContainsMidpoint ||
            measurement.selectedPairCenterOnProbeAxis === undefined ||
            measurement.thickness >= width
          )
            continue;
          const centerY = measurement.selectedPairCenterOnProbeAxis;
          if (
            instances.some(
              (instance) =>
                instance.shape.type === 'rect' &&
                Math.abs(
                  instance.shape.y + instance.shape.height / 2 - centerY
                ) <
                  geo.scale.eps * 2
            )
          )
            continue;
          const rect = {
            type: 'rect' as const,
            x: x1,
            y: centerY - measurement.thickness / 2,
            width,
            height: measurement.thickness,
          };
          instances.push({
            id: 'arm',
            shape: rect,
            region: { kind: 'stroke', points: rectToPolygon(rect) },
            confidence: 0.85,
            anchors: {
              attached: { x: side === 'right' ? x1 : x2, y: centerY },
              free: { x: side === 'right' ? x2 : x1, y: centerY },
            },
            debug: { source: 'attached-free-band', side },
          });
        }
      }
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

  // A top and bottom slab of comparable width belongs to a serif I.
  const bottomHits = rayHits(
    svgShape,
    { x: bbox.minX - scale.eps, y: bbox.minY + scale.eps },
    0,
    overshoot
  ).points;
  if (
    geo.context.isSerif &&
    bottomHits.length === 2 &&
    bottomHits[1].x - bottomHits[0].x > bboxW * 0.8
  )
    return [];

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
