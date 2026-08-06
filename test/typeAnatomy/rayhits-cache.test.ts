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

    // Caller mutates / clears their reference.
    if (first.length > 0) {
      first.length = 0;
    }

    const second = rayHits(shape, origin, 0, 2000).points;
    expect(second.length).toBeGreaterThan(0);
  });
});
