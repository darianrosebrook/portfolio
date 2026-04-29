/**
 * Unit tests for walk-order junction clustering.
 *
 * Fixtures are CornerSamples produced by findOutlineCorners on synthetic
 * polygons. Tests assert that contiguous runs of sharp corners are
 * recognized as junctions while isolated sharp corners (flanked by
 * non-sharp neighbors) are excluded.
 */

import { describe, expect, it } from 'vitest';
import type { Point2D } from '../../types';
import { findOutlineCorners } from './findOutlineCorners';
import { inJunctionCluster } from './clustering';

describe('inJunctionCluster', () => {
  it('returns no clusters when fewer than two corners exist', () => {
    expect(inJunctionCluster([])).toEqual([]);
    const oneCorner = findOutlineCorners([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 50, y: 87 },
    ]).slice(0, 1);
    expect(inJunctionCluster(oneCorner)).toEqual([]);
  });

  it('returns all corners of an equilateral triangle (every neighbor is sharp)', () => {
    // Triangle: every vertex is sharp, so every vertex is a cluster member
    const triangle: Point2D[] = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 50, y: 87 },
    ];
    const corners = findOutlineCorners(triangle);
    const clustered = inJunctionCluster(corners);
    expect(clustered).toHaveLength(3);
  });

  it('rejects every corner of a regular square (none are sharp)', () => {
    const square: Point2D[] = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ];
    const corners = findOutlineCorners(square);
    expect(inJunctionCluster(corners)).toHaveLength(0);
  });

  it('isolates a single sharp corner whose neighbors are gentle (not a cluster)', () => {
    // Polygon with one sharp corner and three gentle ones.
    // Construct by extending a square with a slight indentation that
    // creates exactly one sharp interior corner — but that vertex's
    // walk-neighbors are the square's 90° corners (which are NOT sharp
    // under default 100° threshold).
    //
    // Pentagon: (0,0), (100,0), (100,100), (50,30), (0,100).
    // Per the diagnostic in findOutlineCorners.test.ts, only (50,30)
    // is sharp under default; the other four are 90° (squares) or
    // not sharp enough.
    //
    // Wait — that pentagon actually has FOUR sharp corners: (100,100)
    // and (0,100) at ~144°, (50,30) at ~109°. The two adjacent bottom
    // corners (0,0) and (100,0) are ~90° (gentle). So (50,30) has
    // sharp neighbors (100,100) and (0,100) — they ARE adjacent in
    // walk order. So (50,30) is in a cluster.
    //
    // To get a true ISOLATED sharp corner, build a polygon where the
    // sharp vertex's walk-neighbors are intentionally gentle. Example:
    // a hexagon with one acute notch and otherwise flat sides.
    const hexagonWithNotch: Point2D[] = [
      { x: 0, y: 0 }, // gentle (90°-ish)
      { x: 200, y: 0 }, // gentle
      { x: 250, y: 50 }, // gentle (45° turn)
      { x: 200, y: 100 }, // gentle
      { x: 0, y: 100 }, // gentle
      { x: -50, y: 50 }, // gentle (45° turn)
    ];
    const corners = findOutlineCorners(hexagonWithNotch);
    // All corners are gentle (≤ 90° turn). No clusters.
    expect(inJunctionCluster(corners)).toHaveLength(0);
  });

  it('keeps adjacent sharp corner pairs as cluster members (indented pentagon)', () => {
    // Indented pentagon: a square with a V-notch eaten out of the
    // top-center. Three adjacent sharp corners — (100,100), (50,30),
    // (0,100) — form a contiguous run in walk order. All three are
    // cluster members; the gentle (90°) corners (0,0) and (100,0) are
    // not.
    const indented: Point2D[] = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 50, y: 30 },
      { x: 0, y: 100 },
    ];
    const corners = findOutlineCorners(indented);
    const clustered = inJunctionCluster(corners);
    expect(clustered).toHaveLength(3);
    const points = clustered.map((c) => c.point);
    expect(points).toContainEqual({ x: 100, y: 100 });
    expect(points).toContainEqual({ x: 50, y: 30 });
    expect(points).toContainEqual({ x: 0, y: 100 });
  });

  it('rejects an isolated sharp corner whose walk-neighbors are gentle', () => {
    // Hexagonal "arrow with concave back" — only (0,0) and (0,100) have
    // sharp turns (~135°). Their walk-neighbors are all gentle (45°-90°)
    // turns. Both sharp corners are isolated, so the cluster is empty.
    const arrow: Point2D[] = [
      { x: 0, y: 0 }, // sharp ~135°
      { x: 100, y: 0 }, // gentle ~45°
      { x: 150, y: 50 }, // gentle ~90°
      { x: 100, y: 100 }, // gentle ~45°
      { x: 0, y: 100 }, // sharp ~135°
      { x: 50, y: 50 }, // gentle ~90°
    ];
    const corners = findOutlineCorners(arrow);
    expect(inJunctionCluster(corners)).toHaveLength(0);
  });

  it('respects a custom sharpness threshold via options', () => {
    // Square — default threshold rejects all 90° corners. With a
    // looser threshold (89°), every corner becomes "sharp" and all
    // four are cluster members.
    const square: Point2D[] = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ];
    const corners = findOutlineCorners(square);
    expect(
      inJunctionCluster(corners, {
        minTurnAngleRad: (89 * Math.PI) / 180,
      })
    ).toHaveLength(4);
  });
});
