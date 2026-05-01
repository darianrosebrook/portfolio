/**
 * Serif feature detector.
 *
 * A serif is a small terminal projection at the end of a stroke.
 *
 * Fixed in v1:
 * - Uses scale.stemWidth for nudge distances instead of huge EPS multipliers
 * - Focus on terminal positions (baseline, cap height) not mid-body
 * - Horizontal outward probe is more diagnostic than vertical
 *
 * TODO(serif/Newsreader detection gap):
 * Per Track 1 preflight (2026-04-30) at the inspector's default axis values
 * (wght=400, opsz=32), this detector misses most of Newsreader's
 * canonically-serifed glyphs:
 *   working:  E (3), B (1), P (1), R (1), b (1), p (1)
 *   empty:    I, T, H, L, D, F, M, N, l, d, h
 * Notably, results are AXIS-DEPENDENT: at opsz=6 the working set differs
 * (L/D/P fire instead of E/B/P/R) — the contour topology changes with
 * optical-size variant.
 *
 * Hypothesis: at metrics.baseline / capHeight, the horizontal scan returns a
 * single wide span covering the full serif foot. detectSerifAtEdge() then
 * probes outward from the foot's outermost extent and finds nothing because
 * the serif IS the outermost extent at that Y. Glyphs that fire have
 * asymmetric / multi-stem feet so the inward probe lands inside the body
 * and trips the distance filter at line 127.
 *
 * Likely fixes (defer to PR 4):
 *   1. Probe at metrics.baseline + stemWidth*0.5 (slightly above the foot,
 *      where the stem narrows). The foot serif then appears as a wider
 *      span at baseline than the span at baseline + stemWidth*0.5.
 *   2. Compare adjacent Y levels to detect stem→foot widening directly.
 *   3. Use the projection polygon contour walk (already used for region
 *      output) as primary detection instead of a horizontal-probe gate.
 *
 * Tuning here is open-ended; the E Playwright baseline added in Track 1.4
 * documents the working case so a future tuning pass can compare diffs.
 */

import { rayHits } from '@/utils/geometry/geometryCore';
import { buildProjectionPolygon } from '../evidence/projectionRegion';
import type { FeatureInstance, GeometryCache, Point2D } from '../types';

// Arc-length budget per side, as a fraction of capHeight. 0.10 covers
// roughly one full Bézier endpoint hop on Newsreader's serif contours
// (median segment ≈ 0.05 × capHeight); a smaller budget produces empty
// polygons and the renderer drops back to the point marker.
const SERIF_ARC_BUDGET_FRACTION = 0.1;

/**
 * Detects serif features on a glyph.
 * Focuses on terminal projections at baseline and cap/x-height.
 */
export function detectSerif(geo: GeometryCache): FeatureInstance[] {
  const { glyph, metrics, svgShape, scale } = geo;

  if (!glyph?.path?.commands || !glyph.bbox) {
    return [];
  }

  const instances: FeatureInstance[] = [];
  const { eps, bboxW, bboxH, stemWidth, overshoot } = scale;

  // Serifs are terminal features - check at baseline and top
  // Use stemWidth-based nudge, not UPEM*0.01
  const nudge = stemWidth * 0.25;

  // Terminal Y positions to check
  const terminals = [
    { y: metrics.baseline, type: 'foot' as const },
    { y: metrics.xHeight, type: 'top' as const },
    { y: metrics.capHeight, type: 'cap' as const },
  ];

  for (const terminal of terminals) {
    // Skip if terminal is outside glyph bbox
    if (
      terminal.y < glyph.bbox.minY - bboxH * 0.1 ||
      terminal.y > glyph.bbox.maxY + bboxH * 0.1
    ) {
      continue;
    }

    // Scan at terminal level
    const origin = { x: glyph.bbox.minX - overshoot * 0.1, y: terminal.y };
    const { points } = rayHits(svgShape, origin, 0, overshoot);

    if (points.length < 2) continue;

    // For each stem edge, check for horizontal widening (serif)
    for (let j = 0; j < points.length - 1; j += 2) {
      const leftEdge = points[j].x;
      const rightEdge = points[j + 1].x;
      const spanWidth = rightEdge - leftEdge;

      // Skip if span is too thin (not a stem)
      if (spanWidth < stemWidth * 0.5) continue;

      // Check for left serif: horizontal probe outward from left edge
      const leftSerif = detectSerifAtEdge(
        geo,
        { x: leftEdge, y: terminal.y },
        'left',
        terminal.type
      );
      if (leftSerif) {
        instances.push(leftSerif);
      }

      // Check for right serif: horizontal probe outward from right edge
      const rightSerif = detectSerifAtEdge(
        geo,
        { x: rightEdge, y: terminal.y },
        'right',
        terminal.type
      );
      if (rightSerif) {
        instances.push(rightSerif);
      }
    }
  }

  // Deduplicate nearby serifs
  return deduplicateSerifs(instances, stemWidth * 0.5);
}

/**
 * Detects a serif at a specific edge position by probing horizontally.
 */
function detectSerifAtEdge(
  geo: GeometryCache,
  edge: Point2D,
  side: 'left' | 'right',
  type: 'foot' | 'top' | 'cap'
): FeatureInstance | null {
  const { svgShape, scale } = geo;
  const { stemWidth, bboxH } = scale;

  // Probe direction: outward from edge
  const angle = side === 'left' ? Math.PI : 0; // Left = 180°, Right = 0°
  const probeLen = stemWidth * 2;

  // Probe at terminal level
  const { points } = rayHits(svgShape, edge, angle, probeLen);

  // For a serif, we should hit geometry close to the edge
  // (the serif bracket/extension)
  if (points.length === 0) return null;

  const firstHit = points[0];
  const distance = Math.abs(firstHit.x - edge.x);

  // Serif should be close to the edge (within stemWidth)
  // but not at zero (that would just be the edge itself)
  if (distance < stemWidth * 0.1 || distance > stemWidth * 1.5) {
    return null;
  }

  // Verify with vertical probe: serif extends vertically too
  const verticalAngle = type === 'foot' ? -Math.PI / 2 : Math.PI / 2;
  const vertProbe = rayHits(svgShape, edge, verticalAngle, bboxH * 0.1);

  if (vertProbe.points.length === 0) return null;

  const budget = geo.metrics.capHeight * SERIF_ARC_BUDGET_FRACTION;
  const polygon = buildProjectionPolygon({
    glyph: geo.glyph,
    anchor: edge,
    arcLengthBudget: budget,
  });

  return {
    id: 'serif',
    shape: {
      type: 'point',
      x: edge.x,
      y: edge.y,
      label: `${type} serif`,
    },
    region:
      polygon.length >= 3 ? { kind: 'stroke', points: polygon } : undefined,
    confidence: 0.7,
    anchors: {
      position: edge,
      extension: firstHit,
    },
    debug: {
      side,
      type,
      extensionDistance: distance,
    },
  };
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
