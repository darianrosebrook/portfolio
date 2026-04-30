import { describe, expect, it } from 'vitest';
import {
  rectToPolygon,
  circleToPolygon,
  polylineToPolygon,
  extractContourPolygon,
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

describe('extractContourPolygon', () => {
  function mockGlyphWith(commands: Array<{ command: string; args: number[] }>) {
    return { path: { commands } };
  }

  it('extracts a square contour as 4 vertices (Nohemi-style geometric tittle)', () => {
    const glyph = mockGlyphWith([
      { command: 'moveTo', args: [100, 700] },
      { command: 'lineTo', args: [180, 700] },
      { command: 'lineTo', args: [180, 780] },
      { command: 'lineTo', args: [100, 780] },
      { command: 'closePath', args: [] },
    ]);
    const poly = extractContourPolygon(glyph, 0, 4);
    expect(poly).toHaveLength(4);
    expect(poly).toEqual([
      { x: 100, y: 700 },
      { x: 180, y: 700 },
      { x: 180, y: 780 },
      { x: 100, y: 780 },
    ]);
  });

  it('drops trailing duplicate of first point', () => {
    const glyph = mockGlyphWith([
      { command: 'moveTo', args: [0, 0] },
      { command: 'lineTo', args: [10, 0] },
      { command: 'lineTo', args: [10, 10] },
      { command: 'lineTo', args: [0, 0] }, // duplicate of moveTo
    ]);
    const poly = extractContourPolygon(glyph, 0, 3);
    expect(poly).toHaveLength(3);
  });

  it('records bezier endpoints (not control points)', () => {
    // Triangle traced via three bezier curves; the helper must record the
    // ENDPOINT of each curve, not the control points. If it grabbed the
    // control points instead, the polygon would zigzag through (10,50),
    // (110,-50), and (-50,50) — entirely outside the actual triangle.
    const glyph = mockGlyphWith([
      { command: 'moveTo', args: [0, 0] },
      { command: 'bezierCurveTo', args: [10, 50, 90, 50, 100, 0] }, // → (100,0)
      { command: 'bezierCurveTo', args: [110, -50, 60, -50, 50, -50] }, // → (50,-50)
      { command: 'bezierCurveTo', args: [-50, 50, -50, 0, 0, 0] }, // → (0,0) closure
    ]);
    const poly = extractContourPolygon(glyph, 0, 3);
    expect(poly).toHaveLength(3);
    expect(poly[0]).toEqual({ x: 0, y: 0 });
    expect(poly[1]).toEqual({ x: 100, y: 0 });
    expect(poly[2]).toEqual({ x: 50, y: -50 });
  });

  it('returns [] on unknown commands (forces caller to use approximation fallback)', () => {
    const glyph = mockGlyphWith([
      { command: 'moveTo', args: [0, 0] },
      { command: 'arcTo', args: [10, 10] },
      { command: 'lineTo', args: [20, 20] },
    ]);
    expect(extractContourPolygon(glyph, 0, 2)).toEqual([]);
  });

  it('returns [] for a glyph missing path data', () => {
    expect(extractContourPolygon({}, 0, 0)).toEqual([]);
  });

  it('returns [] when the slice produces fewer than 3 vertices', () => {
    const glyph = mockGlyphWith([
      { command: 'moveTo', args: [0, 0] },
      { command: 'lineTo', args: [10, 10] },
    ]);
    expect(extractContourPolygon(glyph, 0, 1)).toEqual([]);
  });
});
