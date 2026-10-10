import { describe, expect, it } from 'vitest';
import {
  buildFilledGeometry,
  containsFilledPoint,
  occupiedRayIntervals,
  contourWinding,
} from '@/utils/geometry/filledGeometry';
import { shapeForV2, isInside, rayHits } from '@/utils/geometry/geometryCore';
import { mockGlyphFromPath } from '@/test/utils/fixtures/mockGlyph';
const box = { minX: 0, minY: 0, maxX: 20, maxY: 20 };
const square = 'M0 0L10 0L10 10L0 10Z';
const reversedSquare = 'M0 0L0 10L10 10L10 0Z';
const reversedHole = 'M2 2L2 8L8 8L8 2Z';
const hole = 'M2 2L8 2L8 8L2 8Z';
const modelFor = (d: string) => buildFilledGeometry(mockGlyphFromPath(d, box));
const spans = (d: string, y = 5) =>
  occupiedRayIntervals(modelFor(d), { x: -1, y }, 0, 30).map((i) => [
    i.near.x,
    i.far.x,
  ]);

describe('nonzero occupied fill', () => {
  it('joins a shared crossing across neighboring numeric hash cells without losing its body or merging a mark', () => {
    const shaft = 'M466 0L678 1089L799 1073L590 0Z';
    const foot = 'M109 99L1125 99L1106 0L90 0Z';
    const mark = 'M1600 100L1629 100L1629 120L1600 120Z';
    for (const d of [shaft + foot + mark, foot + shaft + mark]) {
      const model = buildFilledGeometry(
        mockGlyphFromPath(d, { minX: 90, minY: 0, maxX: 1629, maxY: 1089 })
      );
      expect(model.bodies).toHaveLength(2);
      expect(model.enclosedRegions).toEqual([]);
      expect(model.tolerance).toBe(0.2);
      const overlap = 124 * 99 + ((209 / 1073 - 212 / 1089) * 99 * 99) / 2;
      expect(model.bodies[0].area).toBeCloseTo(134106.5 + 100584 - overlap, 6);
      expect(model.bodies[1].area).toBe(580);
      for (const point of [
        { x: 630, y: 500 },
        { x: 250, y: 50 },
      ]) {
        expect(containsFilledPoint(model, point)).toBe(true);
        expect(contourWinding(model.bodies[0].points, point)).toBe(1);
        expect(contourWinding(model.bodies[1].points, point)).toBe(0);
      }
      expect(contourWinding(model.bodies[0].points, { x: 1615, y: 110 })).toBe(
        0
      );
      expect(contourWinding(model.bodies[1].points, { x: 1615, y: 110 })).toBe(
        1
      );
      expect(containsFilledPoint(model, { x: 300, y: 500 })).toBe(false);
      expect(contourWinding(model.bodies[0].points, { x: 300, y: 500 })).toBe(
        0
      );
      const interval = occupiedRayIntervals(model, { x: 0, y: 500 }, 0, 1700);
      expect(interval).toHaveLength(1);
      expect(interval[0].near.x).toBeCloseTo(466 + (212 * 500) / 1089, 10);
      expect(interval[0].far.x).toBeCloseTo(590 + (209 * 500) / 1073, 10);
    }
  });
  it('includes all actual occupied boundaries and preserves cap-parallel spans', () => {
    const model = modelFor(square + reversedHole);
    for (const point of [
      { x: 0, y: 5 },
      { x: 10, y: 5 },
      { x: 5, y: 10 },
      { x: 5, y: 0 },
      { x: 2, y: 5 },
      { x: 8, y: 5 },
      { x: 5, y: 8 },
      { x: 5, y: 2 },
    ]) {
      expect(containsFilledPoint(model, point), JSON.stringify(point)).toBe(
        true
      );
      expect(
        containsFilledPoint({ ...model, sourceCurves: undefined }, point)
      ).toBe(true);
    }
    expect(spans(square, 10)).toEqual([[0, 10]]);
    expect(containsFilledPoint(model, { x: 10.0001, y: 5 })).toBe(false);
    expect(containsFilledPoint(model, { x: 5, y: 10.0001 })).toBe(false);
  });
  it('includes analytic quadratic and cubic boundary points without promoting cancelled source edges', () => {
    expect(
      containsFilledPoint(modelFor('M0 0Q5 10 10 0L0 0Z'), { x: 5, y: 5 })
    ).toBe(true);
    expect(
      containsFilledPoint(modelFor('M0 0C0 300 100 300 100 0L0 0Z'), {
        x: 50,
        y: 225,
      })
    ).toBe(true);
    const cancelled = modelFor(square + reversedSquare);
    for (const point of [
      { x: 0, y: 5 },
      { x: 10, y: 5 },
      { x: 5, y: 0 },
      { x: 5, y: 10 },
    ]) {
      expect(containsFilledPoint(cancelled, point)).toBe(false);
    }
  });
  it('is invariant to reversing every contour, including a hole and a disconnected negative accent', () => {
    const normal = modelFor(
      square + reversedHole + 'M12 12L15 12L15 15L12 15Z'
    );
    const reverse = modelFor(
      reversedSquare + hole + 'M12 12L12 15L15 15L15 12Z'
    );
    for (const model of [normal, reverse]) {
      expect(model.bodies.map((b) => b.area)).toEqual([100, 9]);
      expect(model.enclosedRegions.map((h) => [h.area, h.bodyIndex])).toEqual([
        [36, 0],
      ]);
      expect(containsFilledPoint(model, { x: 1, y: 5 })).toBe(true);
      expect(containsFilledPoint(model, { x: 5, y: 5 })).toBe(false);
      expect(containsFilledPoint(model, { x: 13, y: 13 })).toBe(true);
      expect(containsFilledPoint(model, { x: 11, y: 11 })).toBe(false);
    }
  });
  it('unions same-winding overlapping bodies and removes their internal crossings', () => {
    const d = square + 'M5 0L15 0L15 10L5 10Z';
    const model = modelFor(d);
    expect(model.bodies.map((b) => b.area)).toEqual([150]);
    expect(model.enclosedRegions).toHaveLength(0);
    expect(spans(d)).toEqual([[0, 15]]);
    const glyph = mockGlyphFromPath(d, box);
    expect(isInside(glyph, { x: 7, y: 5 })).toBe(true);
    expect(
      rayHits(shapeForV2(glyph), { x: -1, y: 5 }, 0, 30).points.map((p) => p.x)
    ).toEqual([0, 15]);
  });
  it('uses nonzero winding rather than parity for nested same-winding ink', () => {
    const d = square + hole;
    expect(spans(d)).toEqual([[0, 10]]);
    expect(modelFor(d).enclosedRegions).toHaveLength(0);
    expect(isInside(mockGlyphFromPath(d, box), { x: 5, y: 5 })).toBe(true);
  });
  it('preserves actual cancellation for opposite-winding overlap', () => {
    const d = square + 'M5 0L5 10L15 10L15 0Z';
    expect(spans(d)).toEqual([
      [0, 5],
      [10, 15],
    ]);
    expect(modelFor(d).bodies.map((b) => b.area)).toEqual([50, 50]);
    expect(containsFilledPoint(modelFor(d), { x: 7, y: 5 })).toBe(false);
  });
  it('derives multiple void polygons when one source contour traverses connecting seams', () => {
    const d =
      'M0 0L20 0L20 20L0 20L0 0L3 3L3 8L8 8L8 3L3 3L0 0L12 12L12 17L17 17L17 12L12 12L0 0Z';
    const model = modelFor(d);
    expect(model.contours).toHaveLength(1);
    expect(model.bodies.map((b) => b.area)).toEqual([400]);
    expect(model.enclosedRegions.map((h) => [h.area, h.bodyIndex])).toEqual([
      [25, 0],
      [25, 0],
    ]);
    expect(containsFilledPoint(model, { x: 5, y: 5 })).toBe(false);
    expect(containsFilledPoint(model, { x: 14, y: 14 })).toBe(false);
    expect(containsFilledPoint(model, { x: 10, y: 10 })).toBe(true);
  });
  it('traces touching bodies without introducing a fictitious void', () => {
    const model = modelFor(square + 'M10 10L20 10L20 20L10 20Z');
    expect(model.bodies.map((b) => b.area)).toEqual([100, 100]);
    expect(model.enclosedRegions).toHaveLength(0);
  });
  it('retains a 0.01-unit boundary span independently of probe length', () => {
    const glyph = mockGlyphFromPath('M0 0L0.01 0L0.01 10L0 10Z', box);
    const model = buildFilledGeometry(glyph);
    expect(model.bodies[0].area).toBeCloseTo(0.1, 12);
    for (const length of [10, 1000, 1000000]) {
      const intervals = occupiedRayIntervals(model, { x: -1, y: 5 }, 0, length);
      expect(intervals).toHaveLength(1);
      expect(intervals[0].end - intervals[0].start).toBeCloseTo(0.01, 12);
      const hits = rayHits(
        shapeForV2(glyph),
        { x: -1, y: 5 },
        0,
        length
      ).points;
      expect(hits).toHaveLength(2);
      expect(hits[1].x - hits[0].x).toBeCloseTo(0.01, 12);
    }
  });
  it('clips occupied intervals when the probe starts and ends inside ink', () => {
    const result = occupiedRayIntervals(modelFor(square), { x: 4, y: 5 }, 0, 2);
    expect(result).toEqual([
      { start: 0, end: 2, near: { x: 4, y: 5 }, far: { x: 6, y: 5 } },
    ]);
  });
  it('queries quadratic boundaries analytically rather than projecting flattened chord error onto the ray', () => {
    const model = modelFor('M0 0Q5 10 10 0L0 0Z');
    const intervals = occupiedRayIntervals(model, { x: -1, y: 4 }, 0, 20);
    expect(intervals).toHaveLength(1);
    expect(intervals[0].near.x).toBeCloseTo(5 * (1 - Math.sqrt(0.2)), 11);
    expect(intervals[0].far.x).toBeCloseTo(5 * (1 + Math.sqrt(0.2)), 11);
    expect(containsFilledPoint(model, { x: 5, y: 4.9999 })).toBe(true);
    expect(containsFilledPoint(model, { x: 5, y: 5.0001 })).toBe(false);
    expect(occupiedRayIntervals(model, { x: -1, y: 5 }, 0, 20)).toEqual([]);
  });
  it('retains exact cubic boundaries and narrow near-tangent occupied spans', () => {
    const model = modelFor('M0 0C0 300 100 300 100 0L0 0Z');
    const middle = occupiedRayIntervals(model, { x: -1, y: 200 }, 0, 200);
    expect(middle).toHaveLength(1);
    expect(middle[0].near.x).toBeCloseTo(700 / 27, 10);
    expect(middle[0].far.x).toBeCloseTo(2000 / 27, 10);
    const tangent = occupiedRayIntervals(model, { x: -1, y: 224.99 }, 0, 200);
    const t = 0.5 - Math.sqrt(0.01 / 900);
    const x = 100 * (3 * t * t - 2 * t * t * t);
    expect(tangent).toHaveLength(1);
    expect(tangent[0].near.x).toBeCloseTo(x, 8);
    expect(tangent[0].far.x).toBeCloseTo(100 - x, 8);
    expect(occupiedRayIntervals(model, { x: -1, y: 225 }, 0, 200)).toEqual([]);
  });
  it('handles an empty/degenerate path and nonpositive probe lengths', () => {
    const model = modelFor('M0 0L0 0L0 0Z');
    expect(model.bodies).toEqual([]);
    expect(model.enclosedRegions).toEqual([]);
    expect(containsFilledPoint(model, { x: 0, y: 0 })).toBe(false);
    expect(occupiedRayIntervals(model, { x: 0, y: 0 }, 0, 0)).toEqual([]);
    expect(occupiedRayIntervals(model, { x: 0, y: 0 }, 0, -1)).toEqual([]);
  });
});
