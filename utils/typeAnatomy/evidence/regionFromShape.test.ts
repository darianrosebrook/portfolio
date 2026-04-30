import { describe, expect, it } from 'vitest';
import {
  rectToPolygon,
  circleToPolygon,
  polylineToPolygon,
} from './regionFromShape';

describe('rectToPolygon', () => {
  it('emits 4 corners for a positive-extent rect', () => {
    const poly = rectToPolygon({ x: 10, y: 20, width: 30, height: 40 });
    expect(poly).toEqual([
      { x: 10, y: 20 },
      { x: 40, y: 20 },
      { x: 40, y: 60 },
      { x: 10, y: 60 },
    ]);
  });

  it('emits 4 corners for a zero-area rect (degenerate but valid)', () => {
    const poly = rectToPolygon({ x: 0, y: 0, width: 0, height: 0 });
    expect(poly).toHaveLength(4);
  });
});

describe('circleToPolygon', () => {
  it('returns N vertices on the circle for any sides count', () => {
    const poly = circleToPolygon({ cx: 0, cy: 0, r: 100 }, 32);
    expect(poly).toHaveLength(32);
    for (const p of poly) {
      const dist = Math.sqrt(p.x * p.x + p.y * p.y);
      expect(dist).toBeCloseTo(100, 5);
    }
  });

  it('respects custom sides count', () => {
    const tri = circleToPolygon({ cx: 0, cy: 0, r: 1 }, 3);
    expect(tri).toHaveLength(3);
  });
});

describe('polylineToPolygon', () => {
  it('returns the points unchanged when not closed', () => {
    const poly = polylineToPolygon({
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
    });
    expect(poly).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ]);
  });

  it('drops a trailing duplicate-of-first vertex', () => {
    const poly = polylineToPolygon({
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 0 },
      ],
    });
    expect(poly).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ]);
  });

  it('returns [] for fewer than 2 points', () => {
    expect(polylineToPolygon({ points: [] })).toEqual([]);
    expect(polylineToPolygon({ points: [{ x: 0, y: 0 }] })).toEqual([]);
  });
});
