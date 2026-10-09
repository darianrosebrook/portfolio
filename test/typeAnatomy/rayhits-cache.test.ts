/**
 * rayHits intersection-cache tests.
 *
 * `rayHits` is the hot path for every detector (stem/crossbar/bowl/counter/serif
 * all cast scanlines through it). Repeated calls with the same ray against the
 * same shape must be memoized so that re-running detection on a cached glyph
 * (UI toggles, re-renders) does not re-pay the svg-intersections cost.
 *
 * These tests assert the memoization contract via cache stats: an identical
 * ray must not grow the cache, while a different ray must.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import {
  rayHits,
  clearRayHitCache,
  getRayHitCacheStats,
} from '@/utils/geometry/geometryCore';
import { shapeForV2 } from '@/utils/geometry/geometryCore';
import { glyphFor, loadFont } from '@/test/utils/fixtures/fontFixtures';
import { shape as makeShape } from 'svg-intersections';

describe('rayHits intersection cache', () => {
  let shape: ReturnType<typeof shapeForV2>;

  beforeEach(() => {
    clearRayHitCache();
    const font = loadFont('Nohemi-VF.ttf');
    shape = shapeForV2(glyphFor(font, 'H'));
    clearRayHitCache(); // shapeForV2 may populate nothing, but reset after shape build
  });

  it('returns equal results for an identical ray cast twice', () => {
    const origin = { x: -100, y: 300 };
    const first = rayHits(shape, origin, 0, 2000).points;
    const second = rayHits(shape, origin, 0, 2000).points;

    expect(second.map((p) => ({ x: p.x, y: p.y }))).toEqual(
      first.map((p) => ({ x: p.x, y: p.y }))
    );
  });

  it('does not grow the cache when the same ray is repeated', () => {
    const origin = { x: -100, y: 300 };
    rayHits(shape, origin, 0, 2000);
    const statsAfterFirst = getRayHitCacheStats();

    rayHits(shape, origin, 0, 2000);
    const statsAfterSecond = getRayHitCacheStats();

    expect(statsAfterSecond.entries).toBe(statsAfterFirst.entries);
  });

  it('grows the cache when a distinct ray is cast', () => {
    rayHits(shape, { x: -100, y: 300 }, 0, 2000);
    const before = getRayHitCacheStats().entries;

    rayHits(shape, { x: -100, y: 500 }, 0, 2000);
    const after = getRayHitCacheStats().entries;

    expect(after).toBe(before + 1);
  });

  it('returns results that are safe to mutate without corrupting the cache', () => {
    const origin = { x: -100, y: 300 };
    const first = rayHits(shape, origin, 0, 2000).points;

    expect(first.length).toBeGreaterThan(0);
    const expected = first.map((p) => ({ ...p }));
    first[0].x = -99999;
    first.length = 0;

    const second = rayHits(shape, origin, 0, 2000).points;
    expect(second).toEqual(expected);
  });

  it('does not alias sub-unit rays on opposite sides of a thin boundary', () => {
    const thin = makeShape('path', { d: 'M0 0L10 0L10 0.03L0 0.03Z' });
    const inside = rayHits(thin, { x: -1, y: 0.02 }, 0, 20).points;
    const outside = rayHits(thin, { x: -1, y: 0.04 }, 0, 20).points;
    expect(inside).toHaveLength(2);
    expect(inside[0].x).toBeCloseTo(0, 12);
    expect(inside[1].x).toBeCloseTo(10, 12);
    expect(outside).toEqual([]);
  });

  it('does not alias close explicit deduplication tolerances', () => {
    const thin = makeShape('path', { d: 'M0 0L0.002 0L0.002 10L0 10Z' });
    expect(rayHits(thin, { x: -1, y: 5 }, 0, 20, 0.001).points).toHaveLength(2);
    expect(rayHits(thin, { x: -1, y: 5 }, 0, 20, 0.004).points).toHaveLength(1);
  });

  it('retains thin raw SVG boundaries on long rays', () => {
    const thin = makeShape('path', { d: 'M0 0L0.01 0L0.01 10L0 10Z' });
    for (const length of [10, 1000, 1000000]) {
      const hits = rayHits(thin, { x: -1, y: 5 }, 0, length).points;
      expect(hits).toHaveLength(2);
      expect(hits[1].x - hits[0].x).toBeCloseTo(0.01, 10);
    }
  });
});
