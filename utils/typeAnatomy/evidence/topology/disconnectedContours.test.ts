/**
 * Unit tests for disconnected-contour grouping.
 *
 * Tests use hand-crafted ContourClassification fixtures with explicit bboxes
 * — the predicate's contract is purely structural and should not require a
 * GeometryCache, a font, or a real glyph path. This mirrors the test style
 * established in measureOrthogonalThickness.test.ts.
 */

import { describe, expect, it } from 'vitest';
import type { BBox, ContourClassification } from '../../types';
import {
  bboxesOverlap,
  findMainBodyGroup,
  getConnectedGroups,
} from './disconnectedContours';

function contour(
  index: number,
  bbox: BBox,
  type: ContourClassification['type'] = 'base',
  area = (bbox.maxX - bbox.minX) * (bbox.maxY - bbox.minY)
): ContourClassification {
  return {
    index,
    type,
    bbox,
    area,
    winding: type === 'hole' ? -1 : 1,
    startIndex: index,
    endIndex: index,
  };
}

describe('bboxesOverlap', () => {
  it('returns true for clearly intersecting bboxes', () => {
    const a: BBox = { minX: 0, minY: 0, maxX: 100, maxY: 100 };
    const b: BBox = { minX: 50, minY: 50, maxX: 150, maxY: 150 };
    expect(bboxesOverlap(a, b)).toBe(true);
  });

  it('returns false when boxes are disjoint on x', () => {
    const a: BBox = { minX: 0, minY: 0, maxX: 100, maxY: 100 };
    const b: BBox = { minX: 200, minY: 50, maxX: 300, maxY: 150 };
    expect(bboxesOverlap(a, b)).toBe(false);
  });

  it('returns false when boxes are disjoint on y (the i/dot case)', () => {
    // Stem at y=0..500, dot at y=600..700 — the bboxes share x but not y.
    const stem: BBox = { minX: 100, minY: 0, maxX: 140, maxY: 500 };
    const dot: BBox = { minX: 100, minY: 600, maxX: 140, maxY: 700 };
    expect(bboxesOverlap(stem, dot)).toBe(false);
  });

  it('returns true when boxes touch (gap=0) at epsilon=0', () => {
    // a.maxX === b.minX. The predicate is "gap ≤ epsilon", so gap=0 counts.
    // This is intentional: glyph contours that meet at shared endpoints
    // typically have bboxes that touch in design units, and we want them
    // grouped together (a connected H, not three disjoint pieces).
    const a: BBox = { minX: 0, minY: 0, maxX: 100, maxY: 100 };
    const b: BBox = { minX: 100, minY: 0, maxX: 200, maxY: 100 };
    expect(bboxesOverlap(a, b, 0)).toBe(true);
  });

  it('returns false when separation exceeds epsilon', () => {
    const a: BBox = { minX: 0, minY: 0, maxX: 100, maxY: 100 };
    const b: BBox = { minX: 110, minY: 0, maxX: 200, maxY: 100 };
    expect(bboxesOverlap(a, b, 5)).toBe(false);
  });
});

describe('getConnectedGroups', () => {
  it('returns no groups for an empty contour list', () => {
    expect(getConnectedGroups([])).toEqual([]);
  });

  it('returns one group for a single H-shaped main body', () => {
    // H drawn as one outer contour spanning the full glyph.
    const h = contour(0, { minX: 0, minY: 0, maxX: 400, maxY: 700 });
    const groups = getConnectedGroups([h]);
    expect(groups).toHaveLength(1);
    expect(groups[0].contours).toHaveLength(1);
    expect(groups[0].bbox).toEqual({ minX: 0, minY: 0, maxX: 400, maxY: 700 });
  });

  it('returns two groups for an i-shape (stem below, dot above)', () => {
    const stem = contour(0, { minX: 100, minY: 0, maxX: 140, maxY: 500 });
    const dot = contour(1, { minX: 100, minY: 600, maxX: 140, maxY: 700 });
    const groups = getConnectedGroups([stem, dot]);
    expect(groups).toHaveLength(2);

    // Stem is the larger group by area.
    const main = findMainBodyGroup(groups);
    expect(main).toBeDefined();
    expect(main!.contours[0].index).toBe(0);
  });

  it('excludes hole contours from group output', () => {
    const o = contour(0, { minX: 0, minY: 0, maxX: 400, maxY: 600 });
    const counter = contour(
      1,
      { minX: 50, minY: 50, maxX: 350, maxY: 550 },
      'hole'
    );
    const groups = getConnectedGroups([o, counter]);
    expect(groups).toHaveLength(1);
    expect(groups[0].contours).toHaveLength(1);
    expect(groups[0].contours[0].type).toBe('base');
  });

  it('groups three overlapping contours transitively', () => {
    // A∼B (overlap on right edge), B∼C (overlap on right edge), so A∼C.
    const a = contour(0, { minX: 0, minY: 0, maxX: 100, maxY: 100 });
    const b = contour(1, { minX: 80, minY: 0, maxX: 200, maxY: 100 });
    const c = contour(2, { minX: 180, minY: 0, maxX: 300, maxY: 100 });
    const groups = getConnectedGroups([a, b, c]);
    expect(groups).toHaveLength(1);
    expect(groups[0].contours).toHaveLength(3);
    expect(groups[0].bbox).toEqual({ minX: 0, minY: 0, maxX: 300, maxY: 100 });
  });

  it("respects epsilon when grouping nearly-touching contours", () => {
    // Tiny gap of 2 design units between the two contours.
    const a = contour(0, { minX: 0, minY: 0, maxX: 100, maxY: 100 });
    const b = contour(1, { minX: 102, minY: 0, maxX: 200, maxY: 100 });

    // With epsilon=0, gap is real → 2 groups.
    expect(getConnectedGroups([a, b], 0)).toHaveLength(2);

    // With epsilon=5, gap absorbed → 1 group.
    expect(getConnectedGroups([a, b], 5)).toHaveLength(1);
  });

  it('aggregates area across the contours in a group', () => {
    const a = contour(0, { minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'base', 100);
    const b = contour(
      1,
      { minX: 5, minY: 5, maxX: 15, maxY: 15 },
      'base',
      50
    );
    const groups = getConnectedGroups([a, b]);
    expect(groups).toHaveLength(1);
    expect(groups[0].area).toBe(150);
  });
});

describe('findMainBodyGroup', () => {
  it('returns undefined for an empty group list', () => {
    expect(findMainBodyGroup([])).toBeUndefined();
  });

  it('returns the only group when there is just one', () => {
    const stem = contour(0, { minX: 100, minY: 0, maxX: 140, maxY: 500 });
    const groups = getConnectedGroups([stem]);
    expect(findMainBodyGroup(groups)).toBe(groups[0]);
  });

  it('selects the largest-area group across multiple groups', () => {
    // i-shape: stem dominates the dot in area.
    const stem = contour(0, { minX: 100, minY: 0, maxX: 140, maxY: 500 });
    const dot = contour(1, { minX: 100, minY: 600, maxX: 140, maxY: 640 });
    const groups = getConnectedGroups([stem, dot]);
    const main = findMainBodyGroup(groups);
    expect(main).toBeDefined();
    expect(main!.contours).toContain(stem);
  });
});
