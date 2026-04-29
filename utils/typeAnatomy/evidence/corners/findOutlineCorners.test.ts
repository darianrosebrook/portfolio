/**
 * Unit tests for the core corner extraction primitive.
 *
 * Fixtures are hand-crafted Point2D arrays, no fontkit, no real-font load.
 * This mirrors the test style established in evidence/topology/.
 *
 * Coordinate convention throughout: math / Y-up. Polygons listed CCW have
 * positive shoelace area, polygons listed CW have negative. Interior
 * direction is computed under the same convention.
 */

import { describe, expect, it } from 'vitest';
import type { Point2D } from '../../types';
import { findOutlineCorners } from './findOutlineCorners';

const RAD = (deg: number) => (deg * Math.PI) / 180;

describe('findOutlineCorners', () => {
  it('returns no samples for a degenerate input (< 3 points)', () => {
    expect(findOutlineCorners([])).toEqual([]);
    expect(findOutlineCorners([{ x: 0, y: 0 }])).toEqual([]);
    expect(
      findOutlineCorners([
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ])
    ).toEqual([]);
  });

  it('emits one sample per vertex of an equilateral-ish triangle (CCW)', () => {
    // Equilateral-ish triangle, CCW in math coords (Y-up).
    const triangle: Point2D[] = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 50, y: 87 },
    ];
    const corners = findOutlineCorners(triangle);
    expect(corners).toHaveLength(3);

    // Each corner has |turn| ≈ 120° (interior angle 60° → exterior turn 120°)
    for (const c of corners) {
      expect(Math.abs(c.signedTurnAngle)).toBeGreaterThan(RAD(110));
      expect(Math.abs(c.signedTurnAngle)).toBeLessThan(RAD(130));
      // CCW polygon, convex vertex → positive turn
      expect(c.signedTurnAngle).toBeGreaterThan(0);
      // Winding records correctly
      expect(c.contourWinding).toBe(1);
    }
  });

  it('records the same vertex order on input as on output', () => {
    const triangle: Point2D[] = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 50, y: 87 },
    ];
    const corners = findOutlineCorners(triangle);
    expect(corners[0].point).toEqual({ x: 0, y: 0 });
    expect(corners[0].pointIndex).toBe(0);
    expect(corners[1].point).toEqual({ x: 100, y: 0 });
    expect(corners[1].pointIndex).toBe(1);
    expect(corners[2].point).toEqual({ x: 50, y: 87 });
    expect(corners[2].pointIndex).toBe(2);
  });

  it('reports CCW winding for a polygon walked counter-clockwise', () => {
    const ccwSquare: Point2D[] = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ];
    const corners = findOutlineCorners(ccwSquare);
    expect(corners.every((c) => c.contourWinding === 1)).toBe(true);
  });

  it('reports CW winding for a polygon walked clockwise', () => {
    const cwSquare: Point2D[] = [
      { x: 0, y: 0 },
      { x: 0, y: 100 },
      { x: 100, y: 100 },
      { x: 100, y: 0 },
    ];
    const corners = findOutlineCorners(cwSquare);
    expect(corners.every((c) => c.contourWinding === -1)).toBe(true);
  });

  it('emits 90° turns for every corner of a regular CCW square', () => {
    const square: Point2D[] = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ];
    const corners = findOutlineCorners(square);
    expect(corners).toHaveLength(4);
    for (const c of corners) {
      expect(Math.abs(c.signedTurnAngle)).toBeGreaterThan(RAD(89));
      expect(Math.abs(c.signedTurnAngle)).toBeLessThan(RAD(91));
      // CCW + convex → positive
      expect(c.signedTurnAngle).toBeGreaterThan(0);
    }
  });

  it('records interior direction pointing into the square at each corner', () => {
    // CCW square. Interior is the unit-square center (50, 50).
    const square: Point2D[] = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ];
    const corners = findOutlineCorners(square);

    // (0,0): interior at up-right
    expect(corners[0].interiorDirection.x).toBeGreaterThan(0);
    expect(corners[0].interiorDirection.y).toBeGreaterThan(0);

    // (100,0): interior at up-left
    expect(corners[1].interiorDirection.x).toBeLessThan(0);
    expect(corners[1].interiorDirection.y).toBeGreaterThan(0);

    // (100,100): interior at down-left
    expect(corners[2].interiorDirection.x).toBeLessThan(0);
    expect(corners[2].interiorDirection.y).toBeLessThan(0);

    // (0,100): interior at down-right
    expect(corners[3].interiorDirection.x).toBeGreaterThan(0);
    expect(corners[3].interiorDirection.y).toBeLessThan(0);
  });

  it('marks one vertex of an indented polygon as concave (sign opposite to winding)', () => {
    // CCW pentagon with a notch at the top-center: a square with a
    // V-notch eaten out from above. (50,30) is the notch's bottom point —
    // a sharp interior corner.
    const indented: Point2D[] = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 50, y: 30 },
      { x: 0, y: 100 },
    ];
    const corners = findOutlineCorners(indented);
    expect(corners).toHaveLength(5);

    // (50,30) is at index 3
    const notch = corners[3];
    expect(notch.point).toEqual({ x: 50, y: 30 });
    // CCW polygon, concave vertex → negative turn
    expect(notch.signedTurnAngle).toBeLessThan(0);
    // Sharp turn (>100°)
    expect(Math.abs(notch.signedTurnAngle)).toBeGreaterThan(RAD(100));
    // Interior direction points DOWN (the polygon body is below the notch)
    expect(notch.interiorDirection.y).toBeLessThan(-0.5);
  });

  it('records correct interior direction for a CCW triangle apex', () => {
    // Equilateral triangle, CCW. Apex at top.
    const triangle: Point2D[] = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 50, y: 87 },
    ];
    const corners = findOutlineCorners(triangle);
    const apex = corners[2];
    // Apex's interior is below it (down)
    expect(apex.interiorDirection.y).toBeLessThan(-0.5);
  });

  it('records correct interior direction for a CCW triangle base vertex', () => {
    // Equilateral triangle, CCW. Base-left vertex at (0,0).
    const triangle: Point2D[] = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 50, y: 87 },
    ];
    const corners = findOutlineCorners(triangle);
    const baseLeft = corners[0];
    // Interior is up-right
    expect(baseLeft.interiorDirection.y).toBeGreaterThan(0.3);
    expect(baseLeft.interiorDirection.x).toBeGreaterThan(0.3);
  });

  it('skips degenerate vertices where consecutive points coincide', () => {
    // Triangle with a zero-length edge (duplicate point) — should not crash.
    const degenerate: Point2D[] = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 0 }, // duplicate
      { x: 50, y: 87 },
    ];
    const corners = findOutlineCorners(degenerate);
    // The two corners adjacent to the duplicate are skipped (no incoming
    // OR outgoing edge); the remaining corners stay valid.
    expect(corners.length).toBeLessThan(4);
    for (const c of corners) {
      expect(Number.isFinite(c.signedTurnAngle)).toBe(true);
    }
  });

  it('handles a CW-walked triangle: convex turns are negative', () => {
    // Same triangle as the CCW test but walked the other direction.
    const cwTriangle: Point2D[] = [
      { x: 0, y: 0 },
      { x: 50, y: 87 },
      { x: 100, y: 0 },
    ];
    const corners = findOutlineCorners(cwTriangle);
    expect(corners.every((c) => c.contourWinding === -1)).toBe(true);
    // Convex CW vertex → negative turn
    expect(corners.every((c) => c.signedTurnAngle < 0)).toBe(true);
    // Interior direction at the apex (now at index 1) still points DOWN
    const apex = corners[1];
    expect(apex.interiorDirection.y).toBeLessThan(-0.5);
  });
});
