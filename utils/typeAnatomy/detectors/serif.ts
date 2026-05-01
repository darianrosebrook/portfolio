/**
 * Serif feature detector.
 *
 * A serif is a small terminal projection at the end of a stroke.
 *
 * Strategy (rewritten in Track 1.3):
 *   For each terminal Y (baseline / xHeight / capHeight), scan a horizontal
 *   ray at the terminal Y AND at an inner Y stepped one stemWidth toward
 *   the glyph center. The inner scan returns the bare stem(s); the
 *   terminal scan returns the stem PLUS any foot/cap serif extensions.
 *
 *   - Center-aligned span pair (inner stem center matches terminal span
 *     center within ±stemWidth): the terminal span's left/right edges
 *     beyond the inner span's edges are foot/cap serifs.
 *   - Non-aligned terminal span (a wide crossbar with no stem directly
 *     above/below its center, e.g. T's top crossbar): inner spans whose
 *     centers fall near the terminal span's left or right end indicate
 *     spur serifs at those ends.
 *
 *   Sans-serif fonts naturally produce no detections because their
 *   terminal spans don't widen relative to the inner stem (no extra
 *   geometry to detect). Earlier versions of this detector probed
 *   horizontally OUTWARD from the terminal span's edges and found
 *   nothing on canonical serif glyphs (I/T/H/L/D/F/M/N) because the
 *   serif IS the outermost extent at that Y — only asymmetric-foot
 *   cases (L/D/P at opsz=6, E/B/P/R at opsz=32) fired by accident.
 */

import { rayHits } from '@/utils/geometry/geometryCore';
import { buildProjectionPolygon } from '../evidence/projectionRegion';
import type { FeatureInstance, GeometryCache, Point2D } from '../types';

// Arc-length budget per side, as a fraction of capHeight. 0.10 covers
// roughly one full Bézier endpoint hop on Newsreader's serif contours
// (median segment ≈ 0.05 × capHeight); a smaller budget produces empty
// polygons and the renderer drops back to the point marker.
const SERIF_ARC_BUDGET_FRACTION = 0.1;

interface Span {
  left: number;
  right: number;
  width: number;
  center: number;
}

function pairsToSpans(points: Point2D[]): Span[] {
  const spans: Span[] = [];
  for (let i = 0; i + 1 < points.length; i += 2) {
    const left = points[i].x;
    const right = points[i + 1].x;
    spans.push({
      left,
      right,
      width: right - left,
      center: (left + right) / 2,
    });
  }
  return spans;
}

function emitSerifAtCorner(
  geo: GeometryCache,
  anchor: Point2D,
  side: 'left' | 'right',
  type: 'foot' | 'top' | 'cap',
  debug: Record<string, unknown>
): FeatureInstance {
  const budget = geo.metrics.capHeight * SERIF_ARC_BUDGET_FRACTION;
  const polygon = buildProjectionPolygon({
    glyph: geo.glyph,
    anchor,
    arcLengthBudget: budget,
  });
  return {
    id: 'serif',
    shape: {
      type: 'point',
      x: anchor.x,
      y: anchor.y,
      label: `${type} serif`,
    },
    region:
      polygon.length >= 3 ? { kind: 'stroke', points: polygon } : undefined,
    confidence: 0.7,
    anchors: { position: anchor },
    debug: { side, type, ...debug },
  };
}

/**
 * Detects serif features on a glyph.
 * Focuses on terminal projections at baseline and cap/x-height.
 */
export function detectSerif(geo: GeometryCache): FeatureInstance[] {
  const { glyph, metrics, svgShape, scale, context } = geo;

  if (!glyph?.path?.commands || !glyph.bbox) {
    return [];
  }
  // The widening-detection algorithm fires on any glyph where a terminal
  // span is wider than the inner stem reference. Sans-serif fonts produce
  // false positives on letters with crossbars (T, F, E) or arms (B, P, R)
  // because the crossbar/arm widens the terminal span just like a real
  // serif foot would. Gate on the font's isSerif flag (computed from
  // geometry by `detectSerifFromFont` in geometryCache.ts) so we only
  // emit serif instances on actual serif typefaces.
  if (!context.isSerif) return [];

  const instances: FeatureInstance[] = [];
  const { stemWidth, overshoot, bboxH } = scale;

  // Step inward from the terminal by ONE stemWidth — far enough that
  // the foot/cap serif (typically thinner than stemWidth) has narrowed
  // to the bare stem, but close enough that we're still on the same
  // vertical structure. The +0.05 floor on widening below filters out
  // sub-pixel noise.
  const innerStep = stemWidth;
  const widenFloor = stemWidth * 0.05;
  const centerTolerance = stemWidth;

  const terminals: Array<{
    y: number;
    type: 'foot' | 'top' | 'cap';
    sign: 1 | -1;
  }> = [
    { y: metrics.baseline, type: 'foot', sign: +1 },
    { y: metrics.xHeight, type: 'top', sign: -1 },
    { y: metrics.capHeight, type: 'cap', sign: -1 },
  ];

  const scanAt = (y: number): Span[] => {
    const origin = { x: glyph.bbox.minX - overshoot * 0.1, y };
    const { points } = rayHits(svgShape, origin, 0, overshoot);
    return pairsToSpans(points);
  };

  for (const terminal of terminals) {
    if (
      terminal.y < glyph.bbox.minY - bboxH * 0.1 ||
      terminal.y > glyph.bbox.maxY + bboxH * 0.1
    ) {
      continue;
    }
    const innerY = terminal.y + terminal.sign * innerStep;
    if (innerY < glyph.bbox.minY || innerY > glyph.bbox.maxY) {
      continue;
    }

    const tSpans = scanAt(terminal.y);
    const iSpans = scanAt(innerY);
    if (tSpans.length === 0 || iSpans.length === 0) continue;

    for (const ts of tSpans) {
      if (ts.width < stemWidth * 0.5) continue;

      let stemAligned: Span | null = null;
      let bestDist = Infinity;
      for (const is of iSpans) {
        const d = Math.abs(is.center - ts.center);
        if (d < bestDist) {
          bestDist = d;
          stemAligned = is;
        }
      }

      const stemLikeInner =
        stemAligned !== null &&
        Math.abs(stemAligned.width - stemWidth) < stemWidth * 0.3;

      if (
        stemAligned === null ||
        bestDist >= centerTolerance ||
        !stemLikeInner
      ) {
        // No stem-like inner reference for this terminal span. Common
        // case: the inner Y cuts through a crossbar / arm / counter that
        // splits the stem ray into narrow phantom spans. Without a real
        // stem to compare against, we can't tell foot widening from
        // unrelated geometry — skip and let other terminals catch the
        // serifs from a different angle.
        continue;
      }

      // Foot/cap serifs are the leftward and rightward extensions of
      // the terminal span beyond the inner stem. T's top crossbar fits
      // this pattern too: at innerY=cap-stemWidth, T narrows to just
      // its stem, and the crossbar's left/right ends widen well past
      // it on both sides.
      const widensLeft = stemAligned.left - ts.left > widenFloor;
      const widensRight = ts.right - stemAligned.right > widenFloor;
      if (widensLeft) {
        instances.push(
          emitSerifAtCorner(
            geo,
            { x: ts.left, y: terminal.y },
            'left',
            terminal.type,
            { extensionDistance: stemAligned.left - ts.left }
          )
        );
      }
      if (widensRight) {
        instances.push(
          emitSerifAtCorner(
            geo,
            { x: ts.right, y: terminal.y },
            'right',
            terminal.type,
            { extensionDistance: ts.right - stemAligned.right }
          )
        );
      }
    }
  }

  return deduplicateSerifs(instances, stemWidth * 0.5);
}

/**
 * Removes duplicate serifs that are too close together.
 */
function deduplicateSerifs(
  instances: FeatureInstance[],
  tolerance: number
): FeatureInstance[] {
  const result: FeatureInstance[] = [];

  for (const inst of instances) {
    if (inst.shape.type !== 'point') {
      result.push(inst);
      continue;
    }

    const instShape = inst.shape;
    const isDuplicate = result.some((existing) => {
      if (existing.shape.type !== 'point') return false;
      const existingShape = existing.shape;
      const dist = Math.hypot(
        existingShape.x - instShape.x,
        existingShape.y - instShape.y
      );
      return dist < tolerance;
    });

    if (!isDuplicate) {
      result.push(inst);
    }
  }

  return result;
}
