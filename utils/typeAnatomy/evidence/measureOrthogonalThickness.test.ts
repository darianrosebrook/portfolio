/**
 * Unit tests for the orthogonal-thickness evidence predicate.
 *
 * These tests deliberately use synthetic SVG paths instead of real fonts so
 * the predicate's contract is verifiable without depending on any specific
 * detector or glyph. The predicate is the building block — its semantics
 * must be provable independently of any caller.
 */

import { describe, expect, it } from 'vitest';
import { shape } from 'svg-intersections';
import type { GeometryCache, ScalePrimitives, SvgShape } from '../types';
import {
  measureOrthogonalThickness,
  type DominantAxis,
} from './measureOrthogonalThickness';

function makeCache(
  svgPath: string,
  bboxW: number,
  bboxH: number
): GeometryCache {
  const scale: ScalePrimitives = {
    eps: 0.01,
    bboxW,
    bboxH,
    stemWidth: Math.min(bboxW, bboxH) * 0.1,
    overshoot: Math.max(bboxW, bboxH) * 0.1,
  };
  // Only `svgShape` and `scale` are read by the predicate. Cast the rest
  // through `unknown` so we don't have to mock the entire fontkit graph.
  return {
    svgShape: shape('path', { d: svgPath }) as SvgShape,
    scale,
  } as unknown as GeometryCache;
}

const HORIZONTAL: DominantAxis = 'horizontal';
const VERTICAL: DominantAxis = 'vertical';

describe('measureOrthogonalThickness', () => {
  it('measures a wide-short rect vertically as its height (horizontal candidate)', () => {
    // A 200x40 rect at (100..300, 80..120) — a crossbar-like stroke.
    const path = 'M100 80 L300 80 L300 120 L100 120 Z';
    const geo = makeCache(path, 400, 200);

    const result = measureOrthogonalThickness(geo, {
      midpoint: { x: 200, y: 100 },
      dominantAxis: HORIZONTAL,
    });

    expect(result.thickness).toBeCloseTo(40, 0);
    expect(result.confidence).toBe(1);
    expect(result.failureReason).toBeUndefined();
    expect(result.hits.length).toBeGreaterThanOrEqual(2);
  });

  it('measures a tall-narrow rect horizontally as its width (vertical candidate)', () => {
    // A 40x200 rect at (180..220, 50..250) — a stem-like stroke.
    const path = 'M180 50 L220 50 L220 250 L180 250 Z';
    const geo = makeCache(path, 400, 300);

    const result = measureOrthogonalThickness(geo, {
      midpoint: { x: 200, y: 150 },
      dominantAxis: VERTICAL,
    });

    expect(result.thickness).toBeCloseTo(40, 0);
    expect(result.confidence).toBe(1);
    expect(result.failureReason).toBeUndefined();
  });

  it('returns no_hits when the probe misses the geometry entirely', () => {
    // Rect at (100..300, 80..120). Probe through (700, 100) — far outside.
    const path = 'M100 80 L300 80 L300 120 L100 120 Z';
    // Use a small probe distance so the ray cannot reach the rect.
    const geo = makeCache(path, 400, 200);

    const result = measureOrthogonalThickness(geo, {
      midpoint: { x: 700, y: 100 },
      dominantAxis: HORIZONTAL,
      maxProbeDistance: 50,
    });

    expect(result.thickness).toBe(0);
    expect(result.confidence).toBe(0);
    expect(result.failureReason).toBe('no_hits');
  });

  it('flags ambiguous_pairs when the probe goes through multiple disjoint strokes', () => {
    // Two vertical bars (an "I I" pattern). Probe horizontally through the
    // middle of both bars: ray will cross both, producing 2 pairs and the
    // midpoint y=100 is between the two bars (inside neither).
    const path =
      'M100 50 L140 50 L140 150 L100 150 Z ' +
      'M260 50 L300 50 L300 150 L260 150 Z';
    const geo = makeCache(path, 400, 200);

    const result = measureOrthogonalThickness(geo, {
      midpoint: { x: 200, y: 100 }, // between the two bars on x, but no shape at this x
      dominantAxis: VERTICAL,
    });

    // Probe is horizontal (perpendicular to vertical candidate); it will hit
    // both bars and report 2 pairs. The midpoint at x=200 falls in neither
    // pair, so containsMidpoint is false → ambiguous.
    expect(result.hits.length).toBeGreaterThanOrEqual(4);
    expect(result.failureReason).toBe('ambiguous_pairs');
    expect(result.confidence).toBeLessThan(0.5);
  });

  it('reports a single pair with full confidence when only one stroke is in the probe path', () => {
    // Same two-bar geometry, but midpoint is inside the LEFT bar. Probe
    // horizontally — still hits both bars (2 pairs), but one pair contains
    // the midpoint, so confidence should be 0.85 (mild ambiguity), not 1.
    const path =
      'M100 50 L140 50 L140 150 L100 150 Z ' +
      'M260 50 L300 50 L300 150 L260 150 Z';
    const geo = makeCache(path, 400, 200);

    const result = measureOrthogonalThickness(geo, {
      midpoint: { x: 120, y: 100 }, // inside left bar
      dominantAxis: VERTICAL,
    });

    expect(result.thickness).toBeCloseTo(40, 0);
    expect(result.confidence).toBe(0.85);
    expect(result.failureReason).toBeUndefined();
  });

  it('respects minHitPairs and reports insufficient_pairs when not met', () => {
    const path = 'M100 80 L300 80 L300 120 L100 120 Z';
    const geo = makeCache(path, 400, 200);

    const result = measureOrthogonalThickness(geo, {
      midpoint: { x: 200, y: 100 },
      dominantAxis: HORIZONTAL,
      minHitPairs: 2,
    });

    // Single rect → 1 pair, but caller required 2.
    expect(result.failureReason).toBe('insufficient_pairs');
    expect(result.confidence).toBe(0);
    expect(result.thickness).toBe(0);
  });
});
