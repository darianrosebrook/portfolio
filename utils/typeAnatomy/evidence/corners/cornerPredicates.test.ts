/**
 * Unit tests for corner predicates: sharpness, convex/concave, position-band,
 * interior-direction queries.
 *
 * Tests use real CornerSamples produced by findOutlineCorners on synthetic
 * polygon fixtures, NOT hand-mocked CornerSample objects. Mocking the sample
 * shape would let predicates pass against impossible geometric data; building
 * from real fixtures keeps the tests honest.
 */

import { describe, expect, it } from 'vitest';
import type { BBox, Point2D } from '../../types';
import { findOutlineCorners } from './findOutlineCorners';
import {
  DEFAULT_BAND_RATIO,
  DEFAULT_SHARPNESS_RAD,
  interiorPointsDown,
  interiorPointsUp,
  isConcaveCorner,
  isConvexCorner,
  isInBottomBand,
  isInTopBand,
  isSharpCorner,
  isSharpExteriorCorner,
  isSharpInteriorCorner,
} from './cornerPredicates';

const RAD = (deg: number) => (deg * Math.PI) / 180;

const triangle = (): Point2D[] => [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 50, y: 87 },
];

const square = (): Point2D[] => [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
];

const indentedPentagon = (): Point2D[] => [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 50, y: 30 },
  { x: 0, y: 100 },
];

describe('isSharpCorner', () => {
  it('classifies all triangle corners (≈120° turn) as sharp', () => {
    const corners = findOutlineCorners(triangle());
    expect(corners.every((c) => isSharpCorner(c))).toBe(true);
  });

  it('rejects every corner of a regular square (90° turn) under default threshold', () => {
    const corners = findOutlineCorners(square());
    expect(corners.some((c) => isSharpCorner(c))).toBe(false);
  });

  it('respects a custom minTurnAngleRad threshold', () => {
    const corners = findOutlineCorners(square());
    // Loosened to 80° → 90° corners pass.
    expect(
      corners.every((c) => isSharpCorner(c, { minTurnAngleRad: RAD(80) }))
    ).toBe(true);
  });

  it('exposes a default threshold roughly 100°', () => {
    expect(DEFAULT_SHARPNESS_RAD).toBeGreaterThan(RAD(99));
    expect(DEFAULT_SHARPNESS_RAD).toBeLessThan(RAD(101));
  });
});

describe('isConvexCorner / isConcaveCorner', () => {
  it('marks all triangle corners as convex (CCW)', () => {
    const corners = findOutlineCorners(triangle());
    expect(corners.every(isConvexCorner)).toBe(true);
    expect(corners.some(isConcaveCorner)).toBe(false);
  });

  it('marks the indented vertex as concave on a CCW pentagon', () => {
    const corners = findOutlineCorners(indentedPentagon());
    // (50,30) at index 3 is the concave one
    expect(isConcaveCorner(corners[3])).toBe(true);
    expect(isConvexCorner(corners[3])).toBe(false);
    // The other four are convex
    for (const i of [0, 1, 2, 4]) {
      expect(isConvexCorner(corners[i])).toBe(true);
    }
  });

  it('keeps convex/concave assignment consistent under polygon-direction reversal (CW)', () => {
    // Same triangle reversed → CW. Convex/concave classification should
    // not depend on walk direction.
    const cwTriangle: Point2D[] = [
      { x: 0, y: 0 },
      { x: 50, y: 87 },
      { x: 100, y: 0 },
    ];
    const corners = findOutlineCorners(cwTriangle);
    expect(corners.every(isConvexCorner)).toBe(true);
  });
});

describe('isSharpExteriorCorner / isSharpInteriorCorner', () => {
  it('flags all triangle vertices as sharp exterior corners', () => {
    const corners = findOutlineCorners(triangle());
    expect(corners.every((c) => isSharpExteriorCorner(c))).toBe(true);
    expect(corners.some((c) => isSharpInteriorCorner(c))).toBe(false);
  });

  it('flags the pentagon notch as the sole sharp interior corner', () => {
    const corners = findOutlineCorners(indentedPentagon());
    const interior = corners.filter((c) => isSharpInteriorCorner(c));
    expect(interior).toHaveLength(1);
    expect(interior[0].point).toEqual({ x: 50, y: 30 });
  });

  it('flags the pentagon top-corners (>100° convex turn at (100,100) and (0,100)) as sharp exterior', () => {
    // The two upper corners of the indented pentagon turn ≈ 144°
    // (sharper than 100°) because the path dives inward to the notch.
    const corners = findOutlineCorners(indentedPentagon());
    const exterior = corners.filter((c) => isSharpExteriorCorner(c));
    // (100,100) at i=2 and (0,100) at i=4
    const sharpPoints = exterior.map((c) => c.point);
    expect(sharpPoints).toContainEqual({ x: 100, y: 100 });
    expect(sharpPoints).toContainEqual({ x: 0, y: 100 });
  });
});

describe('interiorPointsUp / interiorPointsDown', () => {
  it('classifies a triangle apex as interior-pointing-down', () => {
    const corners = findOutlineCorners(triangle());
    const apex = corners[2]; // (50, 87)
    expect(interiorPointsDown(apex)).toBe(true);
    expect(interiorPointsUp(apex)).toBe(false);
  });

  it('classifies a triangle base vertex as interior-pointing-up', () => {
    const corners = findOutlineCorners(triangle());
    const baseLeft = corners[0]; // (0, 0)
    expect(interiorPointsUp(baseLeft)).toBe(true);
    expect(interiorPointsDown(baseLeft)).toBe(false);
  });

  it('classifies the indented pentagon notch as interior-pointing-down', () => {
    const corners = findOutlineCorners(indentedPentagon());
    const notch = corners[3]; // (50, 30)
    expect(interiorPointsDown(notch)).toBe(true);
    expect(interiorPointsUp(notch)).toBe(false);
  });

  it('respects a custom epsilon to filter near-horizontal interiors', () => {
    // Construct a corner where the interior is mostly horizontal — a
    // very tall thin "bowtie" missing one side... easier: use a
    // square's corner. (0,0) interior is up-right at ≈45°, so y
    // component is ≈0.71. A loose eps near 0.7 should still pass; a
    // tight eps of 0.9 should reject.
    const corners = findOutlineCorners(square());
    const corner = corners[0];
    expect(interiorPointsUp(corner, 0.5)).toBe(true);
    expect(interiorPointsUp(corner, 0.9)).toBe(false);
  });
});

describe('isInTopBand / isInBottomBand', () => {
  const bbox: BBox = { minX: 0, minY: 0, maxX: 100, maxY: 200 };
  // Default ratio 0.15 → top band y ∈ [170, 200], bottom band y ∈ [0, 30].

  it('classifies a corner at glyph top as in top band', () => {
    const corners = findOutlineCorners([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 50, y: 200 },
    ]);
    const apex = corners[2];
    expect(isInTopBand(apex, bbox)).toBe(true);
    expect(isInBottomBand(apex, bbox)).toBe(false);
  });

  it('classifies corners at the baseline as in bottom band', () => {
    const corners = findOutlineCorners([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 50, y: 200 },
    ]);
    const baseLeft = corners[0];
    expect(isInBottomBand(baseLeft, bbox)).toBe(true);
    expect(isInTopBand(baseLeft, bbox)).toBe(false);
  });

  it('rejects mid-glyph corners from both bands', () => {
    const corners = findOutlineCorners([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 50, y: 100 },
    ]);
    const apex = corners[2]; // y = 100 (mid-glyph)
    expect(isInTopBand(apex, bbox)).toBe(false);
    expect(isInBottomBand(apex, bbox)).toBe(false);
  });

  it('respects a custom band ratio', () => {
    const corners = findOutlineCorners([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 50, y: 100 },
    ]);
    const apex = corners[2]; // y = 100, halfway up a 200-unit bbox
    // Default ratio 0.15 → top band starts at y=170. y=100 is below.
    expect(isInTopBand(apex, bbox)).toBe(false);
    // Loosen to 0.6 → top band starts at y=80. y=100 qualifies.
    expect(isInTopBand(apex, bbox, { ratio: 0.6 })).toBe(true);
  });

  it('exposes a default band ratio of 0.15', () => {
    expect(DEFAULT_BAND_RATIO).toBeCloseTo(0.15, 5);
  });

  it('rejects when bbox has zero height (defensive)', () => {
    const flatBox: BBox = { minX: 0, minY: 100, maxX: 100, maxY: 100 };
    const corners = findOutlineCorners(triangle());
    expect(isInTopBand(corners[0], flatBox)).toBe(false);
    expect(isInBottomBand(corners[0], flatBox)).toBe(false);
  });
});
