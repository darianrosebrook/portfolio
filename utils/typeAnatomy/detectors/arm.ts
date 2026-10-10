/**
 * Arm feature detector.
 *
 * An arm is a horizontal or angled stroke that is free at one or both ends
 * (e.g., in 'E', 'F', 'K', 'L', 'T', 'Y').
 *
 * Current backbone sections establish attachment edges; occupied free bands
 * establish stroke regions. Inclined shafts remain inclined through each band.
 */

import { detectStem } from './stem';
import { rayHits } from '@/utils/geometry/geometryCore';
import {
  getFilledGeometry,
  occupiedRayIntervals,
} from '@/utils/geometry/filledGeometry';
import { detectEar } from './ear';
import type { FeatureInstance, GeometryCache, Point2D } from '../types';
import { rectToPolygon } from '../evidence/regionFromShape';
import { measureOrthogonalThickness } from '../evidence/measureOrthogonalThickness';

/** A current backbone contributes its actual horizontal section, including
 * inclined boundaries. A rectangle enclosing the entire shaft is not evidence
 * of the attachment edge at any particular height. */
function backboneAtY(stem: FeatureInstance, y: number, eps: number) {
  const points =
    stem.region?.points ??
    (stem.shape.type === 'rect' ? rectToPolygon(stem.shape) : []);
  if (points.length < 3) return undefined;
  const minY = Math.min(...points.map((point) => point.y));
  const maxY = Math.max(...points.map((point) => point.y));
  if (y < minY - eps * 1e-6 || y > maxY + eps * 1e-6) return undefined;
  const rowY = Math.max(minY, Math.min(maxY, y));
  const intersections: number[] = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[i],
      b = points[(i + 1) % points.length];
    if (a.y === b.y || rowY < Math.min(a.y, b.y) || rowY > Math.max(a.y, b.y))
      continue;
    intersections.push(a.x + ((b.x - a.x) * (rowY - a.y)) / (b.y - a.y));
  }
  intersections.sort((a, b) => a - b);
  const coordinates = intersections.filter(
    (x, i) => i === 0 || Math.abs(x - intersections[i - 1]) > eps * 1e-6
  );
  if (coordinates.length !== 2 || coordinates[1] <= coordinates[0])
    return undefined;
  return {
    x1: coordinates[0],
    x2: coordinates[1],
    width: coordinates[1] - coordinates[0],
  };
}

interface BranchRow {
  y: number;
  left: number;
  right: number;
  attached: boolean;
}
interface BranchTrack {
  rows: BranchRow[];
  side: 'left' | 'right';
  stem: FeatureInstance;
}

/** Occupied walls outside an actual shaft. Beyond its evidenced endpoint its
 * center divides a fork; it does not supply an invented shaft rectangle. */
function freeTracks(
  geo: GeometryCache,
  stems: FeatureInstance[]
): BranchTrack[] {
  const filled = geo.filled ?? getFilledGeometry(geo.glyph);
  const bbox = geo.glyph.bbox,
    step = geo.scale.bboxH / 160;
  const levels = new Set<number>();
  for (let row = 0; row <= 160; row++) levels.add(bbox.minY + row * step);
  for (const segment of geo.segments)
    for (const point of segment.params) {
      if (point.y >= bbox.minY && point.y <= bbox.maxY) {
        levels.add(point.y - geo.scale.eps * 0.01);
        levels.add(point.y + geo.scale.eps * 0.01);
      }
    }
  const ys = [...levels]
    .filter((y) => y >= bbox.minY && y <= bbox.maxY)
    .sort((a, b) => a - b);
  const tracks: BranchTrack[] = [];
  for (const stem of stems) {
    const points = stem.region!.points;
    const bottom = Math.min(...points.map((p) => p.y)),
      top = Math.max(...points.map((p) => p.y));
    const lower = backboneAtY(stem, bottom, geo.scale.eps)!,
      upper = backboneAtY(stem, top, geo.scale.eps)!;
    const centerSlope =
      (upper.x1 + upper.x2 - lower.x1 - lower.x2) / (2 * (top - bottom));
    let previous: BranchTrack[] = [];
    for (const y of ys) {
      const incoming = previous.map((track) => ({
        track,
        last: track.rows.at(-1)!,
      }));
      const shaft = backboneAtY(stem, y, geo.scale.eps);
      const reference =
        shaft ??
        backboneAtY(stem, Math.max(bottom, Math.min(top, y)), geo.scale.eps)!;
      const shift = shaft
        ? 0
        : centerSlope * (y - Math.max(bottom, Math.min(top, y)));
      const center = (reference.x1 + reference.x2) / 2 + shift;
      const spans = occupiedRayIntervals(
        filled,
        { x: bbox.minX - geo.scale.eps, y },
        0,
        geo.scale.overshoot
      );
      const current: BranchTrack[] = [];
      for (const span of spans)
        for (const side of ['left', 'right'] as const) {
          const left =
            side === 'right'
              ? Math.max(span.near.x, shaft ? reference.x2 : center)
              : span.near.x;
          const right =
            side === 'left'
              ? Math.min(span.far.x, shaft ? reference.x1 : center)
              : span.far.x;
          if (right - left <= geo.scale.eps) continue;
          const gap =
            side === 'right'
              ? Math.max(0, left - reference.x2)
              : Math.max(0, reference.x1 - right);
          const attached =
            gap <= geo.scale.eps * 2 &&
            y >= bottom - step * 1.5 &&
            y <= top + step * 1.5;
          const row: BranchRow = { y, left, right, attached };
          const linked = incoming
            .filter(({ track }) => track.side === side)
            .filter(({ last }) => {
              return (
                y - last.y <= step * 1.6 &&
                Math.max(left, last.left) <=
                  Math.min(right, last.right) + (y - last.y) * 2
              );
            })
            .sort(
              (a, b) =>
                Math.min(right, b.last.right) -
                Math.max(left, b.last.left) -
                (Math.min(right, a.last.right) - Math.max(left, a.last.left))
            );
          const predecessor = linked[0]?.track;
          if (predecessor) {
            const rooted = linked.some(({ track }) =>
              track.rows.some((r) => r.attached)
            );
            if (rooted && linked.length > 1) {
              row.attached = true;
              for (const { track, last } of linked)
                if (
                  track !== predecessor &&
                  !track.rows.some((r) => r.attached)
                ) {
                  last.attached = true;
                  track.rows.push({ ...row });
                }
            }
            if (current.includes(predecessor)) {
              const track = {
                rows: [...predecessor.rows.filter((r) => r.y < y), row],
                side,
                stem,
              };
              tracks.push(track);
              current.push(track);
            } else {
              predecessor.rows.push(row);
              current.push(predecessor);
            }
          } else {
            const track = { rows: [row], side, stem };
            tracks.push(track);
            current.push(track);
          }
        }
      previous = current;
    }
  }
  return tracks;
}
function branchRegion(rows: BranchRow[]): Point2D[] {
  return [
    ...rows.map((row) => ({ x: row.left, y: row.y })),
    ...rows
      .slice()
      .reverse()
      .map((row) => ({ x: row.right, y: row.y })),
  ];
}
function branchInstance(
  track: BranchTrack,
  rows: BranchRow[],
  source: string
): FeatureInstance {
  const points = branchRegion(rows),
    attach = rows.find((row) => row.attached) ?? rows[0],
    free = rows.at(-1)!;
  return {
    id: 'arm',
    shape: { type: 'polyline', points },
    region: { kind: 'stroke', points },
    confidence: 0.85,
    anchors: {
      attached: {
        x: track.side === 'right' ? attach.left : attach.right,
        y: attach.y,
      },
      free: { x: (free.left + free.right) / 2, y: free.y },
    },
    debug: { source, side: track.side },
  };
}
function traceFreeBranches(
  geo: GeometryCache,
  stems: FeatureInstance[]
): FeatureInstance[] {
  const filled = geo.filled ?? getFilledGeometry(geo.glyph);
  if (filled.enclosedRegions.length) return [];
  const slope = -Math.tan((geo.italicAngle * Math.PI) / 180);
  const diagonalWalls = geo.segments.filter((segment) => {
    if (segment.type !== 'lineTo' || segment.params.length !== 2) return false;
    const [a, b] = segment.params,
      dy = b.y - a.y,
      dx = b.x - a.x;
    return (
      Math.abs(dy) > geo.scale.bboxH * 0.18 &&
      Math.abs(dx - slope * dy) > Math.abs(dy) * 0.15
    );
  });
  const code = geo.glyph.codePoints?.[0];
  const role = code === undefined ? undefined : String.fromCodePoint(code);
  const hasDiagonalRole = role === undefined || ['K', 'k', 'Y'].includes(role);
  const ear = detectEar(geo)[0],
    tip = ear?.anchors?.position;
  if ((diagonalWalls.length < 2 || !hasDiagonalRole) && !tip) return [];
  const tracks = freeTracks(geo, stems);
  const diagonal: FeatureInstance[] = [];
  const caps = [...geo.segments];
  let contourStart: Point2D | undefined;
  for (const segment of geo.segments) {
    if (segment.type === 'moveTo') contourStart = segment.params[0];
    if (segment.type === 'closePath' && contourStart && segment.params[0])
      caps.push({ type: 'lineTo', params: [segment.params[0], contourStart] });
  }
  const hasSourceCap = (row: BranchRow) =>
    caps.some((segment) => {
      if (segment.type !== 'lineTo' || segment.params.length !== 2)
        return false;
      const [a, b] = segment.params;
      return (
        Math.abs(a.y - b.y) <= geo.scale.eps &&
        Math.abs(row.y - (a.y + b.y) / 2) <= geo.scale.eps * 2 &&
        (row.left + row.right) / 2 >= Math.min(a.x, b.x) - geo.scale.eps &&
        (row.left + row.right) / 2 <= Math.max(a.x, b.x) + geo.scale.eps
      );
    });
  if (diagonalWalls.length >= 2 && hasDiagonalRole)
    for (const track of tracks) {
      const attached = track.rows.filter(
        (row) =>
          row.attached &&
          row.y > geo.glyph.bbox.minY + geo.scale.stemWidth * 0.3
      );
      if (!attached.length) continue;
      const first = attached[0].y,
        last = attached.at(-1)!.y,
        pivot = (first + last) / 2;
      const threshold = Math.max(
        geo.scale.stemWidth * 0.8,
        geo.scale.bboxH * 0.15
      );
      if (first - track.rows[0].y > threshold && hasSourceCap(track.rows[0])) {
        const rows = track.rows.filter((row) => row.y <= pivot);
        if (rows.length > 2)
          diagonal.push(
            branchInstance(track, rows.reverse(), 'source-diagonal-free-walls')
          );
      }
      if (
        track.rows.at(-1)!.y - last > threshold &&
        hasSourceCap(track.rows.at(-1)!)
      ) {
        const rows = track.rows.filter((row) => row.y >= pivot);
        if (rows.length > 2)
          diagonal.push(
            branchInstance(track, rows, 'source-diagonal-free-walls')
          );
      }
    }
  if (diagonal.length) return diagonal;
  if (!tip) return [];
  const candidates = tracks.filter(
    (track) =>
      track.side === 'right' &&
      track.rows.some((row) => row.attached) &&
      track.rows.some(
        (row) =>
          Math.abs(row.y - tip.y) <= geo.scale.bboxH / 80 &&
          row.right >= tip.x - geo.scale.eps * 2
      )
  );
  candidates.sort((a, b) => b.rows.length - a.rows.length);
  return candidates[0]
    ? [
        branchInstance(
          candidates[0],
          candidates[0].rows,
          'source-free-head-walls'
        ),
      ]
    : [];
}

/** Isolate a free occupied band outside its current backbone attachment. */
export function detectArm(geo: GeometryCache): FeatureInstance[] {
  if (!geo.glyph?.path?.commands?.length || !geo.glyph.bbox) return [];
  const body = (geo.filled ?? getFilledGeometry(geo.glyph)).bodies[0];
  if (!body) return [];
  const bilateral = detectBilateralTopArms(geo);
  if (bilateral.length) return bilateral;
  const writingSlope = -Math.tan((geo.italicAngle * Math.PI) / 180);
  const stems = detectStem(geo).filter((stem) => {
    const points =
      stem.region?.points ??
      (stem.shape.type === 'rect' ? rectToPolygon(stem.shape) : []);
    if (points.length < 3) return false;
    const bottom = Math.min(...points.map((point) => point.y)),
      top = Math.max(...points.map((point) => point.y));
    const lower = backboneAtY(stem, bottom, geo.scale.eps),
      upper = backboneAtY(stem, top, geo.scale.eps);
    if (!lower || !upper || top <= bottom) return false;
    const displacement = (upper.x1 + upper.x2 - lower.x1 - lower.x2) / 2;
    // A diagonal leg can support a connector, but does not establish a writing
    // backbone. Retain the actual sheared shaft, not every tilted Stem region.
    return (
      Math.abs(displacement - writingSlope * (top - bottom)) <=
      Math.max(geo.scale.eps * 2, Math.min(lower.width, upper.width) * 0.1)
    );
  });
  const freeBranches = traceFreeBranches(geo, stems);
  if (freeBranches.length) return freeBranches;
  const instances: FeatureInstance[] = [];
  const { bbox } = geo.glyph;
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
  const spansAt = (y: number) => {
    const points = rayHits(
      geo.svgShape,
      { x: bbox.minX - geo.scale.eps, y },
      0,
      geo.scale.overshoot
    ).points;
    const spans: Array<{ x1: number; x2: number }> = [];
    for (let i = 0; i + 1 < points.length; i += 2)
      spans.push({ x1: points[i].x, x2: points[i + 1].x });
    return spans;
  };
  for (const stem of stems)
    for (const y of levels) {
      const shaft = backboneAtY(stem, y, geo.scale.eps);
      if (!shaft) continue;
      for (const span of spansAt(y)) {
        if (
          span.x1 > shaft.x1 + geo.scale.eps ||
          span.x2 < shaft.x2 - geo.scale.eps
        )
          continue;
        for (const side of ['left', 'right'] as const) {
          const x1 = side === 'right' ? shaft.x2 : span.x1;
          const x2 = side === 'right' ? span.x2 : shaft.x1;
          const width = x2 - x1;
          if (width < Math.max(shaft.width * 0.65, geo.scale.bboxH * 0.18))
            continue;
          // A connector reaching another current backbone is a bar.
          if (
            stems.some((other) => {
              if (other === stem) return false;
              const otherShaft = backboneAtY(other, y, geo.scale.eps);
              return (
                otherShaft &&
                otherShaft.x1 < x2 - geo.scale.eps &&
                otherShaft.x2 > x1 + geo.scale.eps
              );
            })
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
          const lowerY = centerY - measurement.thickness / 2;
          const leftExtension = shaft.x1 - span.x1;
          const rightExtension = span.x2 - shaft.x2;
          // Bilateral terminal slabs at the baseline are feet. An L's long
          // free branch remains distinct from its small opposite serif.
          if (
            (geo.glyph.codePoints?.[0] === undefined ||
              String.fromCodePoint(geo.glyph.codePoints[0]).toLowerCase() ===
                String.fromCodePoint(geo.glyph.codePoints[0])) &&
            lowerY <=
              Math.max(geo.metrics.baseline, body.bbox.minY) + geo.scale.eps &&
            Math.min(leftExtension, rightExtension) > geo.scale.eps &&
            Math.min(leftExtension, rightExtension) >=
              Math.max(leftExtension, rightExtension) * 0.25
          )
            continue;
          if (
            instances.some((instance) => {
              const attached = instance.anchors?.attached;
              const free = instance.anchors?.free;
              return (
                attached &&
                free &&
                free.x > attached.x === (side === 'right') &&
                Math.abs(attached.y - centerY) < geo.scale.eps * 2
              );
            })
          )
            continue;
          const upperY = centerY + measurement.thickness / 2;
          const lowerShaft = backboneAtY(stem, lowerY, geo.scale.eps);
          const upperShaft = backboneAtY(stem, upperY, geo.scale.eps);
          const centerShaft = backboneAtY(stem, centerY, geo.scale.eps);
          if (!lowerShaft || !upperShaft || !centerShaft) continue;
          // Source fill determines the free edge near both band boundaries. The
          // enclosing free-side extent is clipped to ink by the renderer; the
          // attached side follows the backbone exactly through this whole band.
          const freeEdges = [
            lowerY + geo.scale.eps * 0.01,
            centerY,
            upperY - geo.scale.eps * 0.01,
          ].flatMap((row) => {
            const localShaft = backboneAtY(stem, row, geo.scale.eps);
            if (!localShaft) return [];
            const occupied = spansAt(row).find(
              (candidate) =>
                candidate.x1 <= localShaft.x1 + geo.scale.eps &&
                candidate.x2 >= localShaft.x2 - geo.scale.eps
            );
            return occupied
              ? [side === 'right' ? occupied.x2 : occupied.x1]
              : [];
          });
          if (!freeEdges.length) continue;
          const freeX =
            side === 'right' ? Math.max(...freeEdges) : Math.min(...freeEdges);
          const points: Point2D[] =
            side === 'right'
              ? [
                  { x: lowerShaft.x2, y: lowerY },
                  { x: freeX, y: lowerY },
                  { x: freeX, y: upperY },
                  { x: upperShaft.x2, y: upperY },
                ]
              : [
                  { x: freeX, y: lowerY },
                  { x: lowerShaft.x1, y: lowerY },
                  { x: upperShaft.x1, y: upperY },
                  { x: freeX, y: upperY },
                ];
          instances.push({
            id: 'arm',
            shape: { type: 'polyline', points },
            region: { kind: 'stroke', points },
            confidence: 0.85,
            anchors: {
              attached: {
                x: side === 'right' ? centerShaft.x2 : centerShaft.x1,
                y: centerY,
              },
              free: { x: freeX, y: centerY },
            },
            debug: { source: 'attached-free-band', side },
          });
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
