/**
 * Unit tests for duplicate corner suppression.
 *
 * Fixtures are CornerSamples produced by findOutlineCorners on synthetic
 * polygons. Tests assert dedupe behavior (cluster collapse, sharpness
 * tiebreaker, threshold respect) without mocking the sample shape.
 */

import { describe, expect, it } from 'vitest';
import type { Point2D } from '../../types';
import { findOutlineCorners } from './findOutlineCorners';
import { dedupeNearbyCorners } from './dedupe';

describe('dedupeNearbyCorners', () => {
  it('returns the input unchanged when no two corners are within threshold', () => {
    const triangle: Point2D[] = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 50, y: 87 },
    ];
    const corners = findOutlineCorners(triangle);
    const deduped = dedupeNearbyCorners(corners, 5);
    expect(deduped).toHaveLength(3);
  });

  it('coalesces near-coincident corners into one representative', () => {
    // A polygon with two near-coincident vertices at the apex region:
    // (50, 87) and (52, 88). After dedupe with threshold 10, only one
    // should remain.
    const polygon: Point2D[] = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 50, y: 87 },
      { x: 52, y: 88 },
    ];
    const corners = findOutlineCorners(polygon);
    expect(corners).toHaveLength(4);
    const deduped = dedupeNearbyCorners(corners, 10);
    // (50,87) and (52,88) are within √(4+1) ≈ 2.24 — well below threshold.
    expect(deduped).toHaveLength(3);
  });

  it('keeps the SHARPER corner when collapsing a duplicate cluster', () => {
    // Build two near-coincident corners with different sharpness.
    // Trick: a 5-vertex polygon where (49,1) is a near-collinear point
    // (very shallow turn) and (50,87) is the sharp apex. They are far
    // apart, so they don't dedupe — but if we craft another polygon
    // where the sharp corner appears AFTER the shallow one in walk
    // order and they're within threshold, we can verify the sharper is
    // retained.
    //
    // Polygon: equilateral apex at (50, 87) preceded by a shallow turn
    // at (49.5, 86) which is within 2 units of the apex. The walk order
    // is base-left, base-right, shallow, sharp — so the shallow corner
    // is added first; the sharp corner triggers replacement.
    const polygon: Point2D[] = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 49.5, y: 86 },
      { x: 50, y: 87 },
    ];
    const corners = findOutlineCorners(polygon);
    // Both apex-region samples should be present pre-dedupe.
    expect(corners).toHaveLength(4);
    const deduped = dedupeNearbyCorners(corners, 5);
    expect(deduped).toHaveLength(3);
    // The retained apex-region corner should be the SHARPER one.
    const apexLike = deduped.find(
      (c) => c.point.y > 80 && c.point.x > 40 && c.point.x < 60
    );
    expect(apexLike).toBeDefined();
    // Sanity: the retained one's |turn| should match the sharpest of the
    // two pre-dedupe candidates.
    const apexCandidates = corners.filter(
      (c) => c.point.y > 80 && c.point.x > 40 && c.point.x < 60
    );
    expect(apexCandidates.length).toBeGreaterThanOrEqual(2);
    const maxSharp = Math.max(
      ...apexCandidates.map((c) => Math.abs(c.signedTurnAngle))
    );
    expect(Math.abs(apexLike!.signedTurnAngle)).toBe(maxSharp);
  });

  it('returns the input unchanged for non-positive thresholds', () => {
    const triangle: Point2D[] = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 50, y: 87 },
    ];
    const corners = findOutlineCorners(triangle);
    expect(dedupeNearbyCorners(corners, 0)).toHaveLength(3);
    expect(dedupeNearbyCorners(corners, -5)).toHaveLength(3);
  });

  it('handles an empty input', () => {
    expect(dedupeNearbyCorners([], 10)).toEqual([]);
  });

  it('preserves walk-order for the kept representatives', () => {
    // Three sharp corners, none within 5 of each other — order should
    // match the input walk order.
    const triangle: Point2D[] = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 50, y: 87 },
    ];
    const corners = findOutlineCorners(triangle);
    const deduped = dedupeNearbyCorners(corners, 5);
    expect(deduped[0].point).toEqual({ x: 0, y: 0 });
    expect(deduped[1].point).toEqual({ x: 100, y: 0 });
    expect(deduped[2].point).toEqual({ x: 50, y: 87 });
  });
});
