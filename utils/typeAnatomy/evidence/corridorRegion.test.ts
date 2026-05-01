import { describe, expect, it } from 'vitest';
import { buildCorridorPolygon } from './corridorRegion';

describe('buildCorridorPolygon', () => {
  it('returns [] for fewer than 2 midpoints', () => {
    expect(buildCorridorPolygon({ midpoints: [], thickness: 10 })).toEqual([]);
    expect(
      buildCorridorPolygon({ midpoints: [{ x: 0, y: 0 }], thickness: 10 })
    ).toEqual([]);
  });

  it('builds an axis-aligned rectangle for a horizontal centerline', () => {
    const polygon = buildCorridorPolygon({
      midpoints: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ],
      thickness: 20,
    });
    expect(polygon.length).toBe(4);
    const ys = polygon.map((p) => p.y).sort((a, b) => a - b);
    expect(ys[0]).toBeCloseTo(-10, 5);
    expect(ys[3]).toBeCloseTo(10, 5);
    const xs = polygon.map((p) => p.x).sort((a, b) => a - b);
    expect(xs[0]).toBeCloseTo(0, 5);
    expect(xs[3]).toBeCloseTo(100, 5);
  });

  it('builds an axis-aligned rectangle for a vertical centerline', () => {
    const polygon = buildCorridorPolygon({
      midpoints: [
        { x: 50, y: 0 },
        { x: 50, y: 200 },
      ],
      thickness: 30,
    });
    const xs = polygon.map((p) => p.x).sort((a, b) => a - b);
    expect(xs[0]).toBeCloseTo(35, 5);
    expect(xs[3]).toBeCloseTo(65, 5);
  });

  it('honours per-vertex thickness via the function form', () => {
    const polygon = buildCorridorPolygon({
      midpoints: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 200, y: 0 },
      ],
      // Thinner at start, thicker at end.
      thickness: (_m, _t, i) => 10 + i * 10,
    });
    // Right edge is below the centerline (positive normal flips depending on
    // orientation). Just assert that vertex pairs at x=0 are closer in y
    // than vertex pairs at x=200.
    expect(polygon.length).toBeGreaterThanOrEqual(6);
    const atStart = polygon.filter((p) => Math.abs(p.x) < 1e-3);
    const atEnd = polygon.filter((p) => Math.abs(p.x - 200) < 1e-3);
    expect(atStart.length).toBe(2);
    expect(atEnd.length).toBe(2);
    const widthStart = Math.abs(atStart[0].y - atStart[1].y);
    const widthEnd = Math.abs(atEnd[0].y - atEnd[1].y);
    expect(widthEnd).toBeGreaterThan(widthStart);
  });

  it('drops near-duplicate consecutive samples', () => {
    const polygon = buildCorridorPolygon({
      midpoints: [
        { x: 0, y: 0 },
        { x: 0.1, y: 0.1 }, // below default minSeg=1
        { x: 100, y: 0 },
      ],
      thickness: 20,
    });
    // Only 2 distinct samples remain → 4-vertex rectangle.
    expect(polygon.length).toBe(4);
  });

  it('skips vertices with non-positive thickness', () => {
    const polygon = buildCorridorPolygon({
      midpoints: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 200, y: 0 },
      ],
      thickness: (_m, _t, i) => (i === 1 ? 0 : 20),
    });
    // Middle sample is dropped, so we still get a 4-vertex rectangle.
    expect(polygon.length).toBe(4);
  });

  it('produces a closed ring when closed=true', () => {
    const polygon = buildCorridorPolygon({
      midpoints: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
      ],
      thickness: 20,
      closed: true,
    });
    // 4 right-edge + 4 left-edge = 8 vertices.
    expect(polygon.length).toBe(8);
    // The ring should span both inside and outside the centerline square.
    const xs = polygon.map((p) => p.x);
    expect(Math.min(...xs)).toBeLessThan(0);
    expect(Math.max(...xs)).toBeGreaterThan(100);
  });
});
