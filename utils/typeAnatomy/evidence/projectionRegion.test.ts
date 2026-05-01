import { describe, expect, it } from 'vitest';
import { buildProjectionPolygon } from './projectionRegion';

interface PathCommand {
  command: string;
  args: number[];
}

function stubGlyph(commands: PathCommand[]) {
  return { path: { commands } };
}

// A 100×100 square contour, vertices at (0,0), (100,0), (100,100), (0,100).
const SQUARE: PathCommand[] = [
  { command: 'moveTo', args: [0, 0] },
  { command: 'lineTo', args: [100, 0] },
  { command: 'lineTo', args: [100, 100] },
  { command: 'lineTo', args: [0, 100] },
  { command: 'closePath', args: [] },
];

describe('buildProjectionPolygon', () => {
  it('returns [] for empty commands', () => {
    expect(
      buildProjectionPolygon({
        glyph: stubGlyph([]),
        anchor: { x: 0, y: 0 },
        arcLengthBudget: 50,
      })
    ).toEqual([]);
  });

  it('returns [] when the budget is non-positive', () => {
    expect(
      buildProjectionPolygon({
        glyph: stubGlyph(SQUARE),
        anchor: { x: 0, y: 0 },
        arcLengthBudget: 0,
      })
    ).toEqual([]);
  });

  it('always advances at least one vertex per side when budget > 0', () => {
    // From (100,0) with budget=30: the next forward vertex is (100,100) at
    // 100 units — over budget. The walker still takes one step per side so
    // anchors that land near sparse-Bézier contours (typical Roman serifs)
    // produce a usable polygon. The arc-length cap kicks in on the SECOND
    // step, not the first.
    const polygon = buildProjectionPolygon({
      glyph: stubGlyph(SQUARE),
      anchor: { x: 100, y: 0 },
      arcLengthBudget: 30,
    });
    expect(polygon.length).toBe(3);
    const set = new Set(polygon.map((p) => `${p.x},${p.y}`));
    expect(set.has('100,0')).toBe(true);
    expect(set.has('100,100')).toBe(true);
    expect(set.has('0,0')).toBe(true);
  });

  it('captures both sides when budget covers a full edge', () => {
    const polygon = buildProjectionPolygon({
      glyph: stubGlyph(SQUARE),
      anchor: { x: 100, y: 0 },
      arcLengthBudget: 150,
    });
    // From (100,0): forward (100,100) [100u] then (0,100) [100u → over]. Stop after 1.
    // Backward (0,0) [100u] then (0,100) [100u → over]. Stop after 1.
    // Polygon: [(0,0), (100,0), (100,100)] — 3 vertices.
    expect(polygon.length).toBe(3);
    const set = new Set(polygon.map((p) => `${p.x},${p.y}`));
    expect(set.has('100,0')).toBe(true);
    expect(set.has('100,100')).toBe(true);
    expect(set.has('0,0')).toBe(true);
  });

  it('respects contourIndex to avoid drift onto a closer foreign contour', () => {
    // Two contours: outer square + a tiny inner square nearer the anchor.
    const innerSquare: PathCommand[] = [
      { command: 'moveTo', args: [40, 40] },
      { command: 'lineTo', args: [60, 40] },
      { command: 'lineTo', args: [60, 60] },
      { command: 'lineTo', args: [40, 60] },
      { command: 'closePath', args: [] },
    ];
    const both = [...SQUARE, ...innerSquare];

    // Anchor near (50,50) — the inner square is closer. With contourIndex=0
    // we must still pick a vertex from the outer square.
    const polygon = buildProjectionPolygon({
      glyph: stubGlyph(both),
      anchor: { x: 50, y: 50 },
      arcLengthBudget: 200,
      contourIndex: 0,
    });
    expect(polygon.length).toBeGreaterThanOrEqual(3);
    // At least one polygon vertex should be on the outer square (i.e. at
    // x in {0,100} or y in {0,100}). Inner-square vertices are inside (40-60).
    const onOuter = polygon.some(
      (p) =>
        Math.abs(p.x) < 1e-3 ||
        Math.abs(p.x - 100) < 1e-3 ||
        Math.abs(p.y) < 1e-3 ||
        Math.abs(p.y - 100) < 1e-3
    );
    expect(onOuter).toBe(true);
  });

  it('drops a trailing duplicate-of-first when upstream produced one', () => {
    const explicitlyClosed: PathCommand[] = [
      ...SQUARE.slice(0, -1),
      { command: 'lineTo', args: [0, 0] }, // explicit return to start
      { command: 'closePath', args: [] },
    ];
    const polygon = buildProjectionPolygon({
      glyph: stubGlyph(explicitlyClosed),
      anchor: { x: 100, y: 0 },
      arcLengthBudget: 150,
    });
    // The duplicate (0,0) is trimmed before walking, so the result is the
    // same as the canonical SQUARE: 3 vertices.
    expect(polygon.length).toBe(3);
  });
});
