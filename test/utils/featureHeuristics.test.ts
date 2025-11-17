import { describe, it, expect } from 'vitest';
import { shape } from 'svg-intersections';
import type { Glyph } from 'fontkit';
import {
  getBowl,
  getTittle,
  getEye,
} from '@/utils/geometry/geometryHeuristics';
import { isInside } from '@/utils/geometry/geometryCore';

// Minimal mock Glyph with path and bbox sufficient for heuristics that only use d/path
function mockGlyphFromPath(
  d: string,
  bbox: { minX: number; minY: number; maxX: number; maxY: number }
): Glyph {
  // We only need properties accessed by the heuristics: path.toSVG(), bbox, advanceWidth
  const commandsShape = shape('path', { d }) as { params: any[] };
  // Create a lightweight path object exposing toSVG and commands
  const path = {
    toSVG: () => d,
    commands: commandsShape.params?.[0] ?? [],
  } as unknown as Glyph['path'];
  return {
    id: 0,
    name: 'mock',
    codePoints: [],
    path,
    bbox: bbox as any,
    cbox: bbox as any,
    advanceWidth: bbox.maxX - bbox.minX,
    render: () => {},
  } as unknown as Glyph;
}

describe('Geometry heuristics (baseline smoke tests)', () => {
  const m = {
    baseline: 0,
    xHeight: 500,
    capHeight: 700,
    ascent: 800,
    descent: -200,
  };

  it('detects a simple bowl from a donut-like path', () => {
    // Outer circle (r=300) with inner hole (r=120)
    const d =
      'M 300 0 A 300 300 0 1 0 -300 0 A 300 300 0 1 0 300 0 Z M 120 0 A 120 120 0 1 1 -120 0 A 120 120 0 1 1 120 0 Z';
    const g = mockGlyphFromPath(d, {
      minX: -300,
      minY: -300,
      maxX: 300,
      maxY: 300,
    });
    const bowl = getBowl(g, m as any);
    expect(bowl.found).toBe(true);
  });

  it('does not find tittle in paths without detached small contour', () => {
    const d = 'M 300 0 A 300 300 0 1 0 -300 0 A 300 300 0 1 0 300 0 Z';
    const g = mockGlyphFromPath(d, {
      minX: -300,
      minY: -300,
      maxX: 300,
      maxY: 300,
    });
    const tittle = getTittle(g, m as any, { unitsPerEm: 1000 } as any);
    expect(tittle.found).toBe(false);
  });

  it('detects eye when counter opens to the right', () => {
    // Roughly an "e": circle-like counter near center; right side opening simulated by cutting outer on right
    const d =
      'M 300 0 A 300 300 0 1 0 -300 0 A 300 300 0 0 0 300 50 L 300 -50 Z M 120 0 A 120 120 0 1 1 -120 0 A 120 120 0 1 1 120 0 Z';
    const g = mockGlyphFromPath(d, {
      minX: -300,
      minY: -300,
      maxX: 300,
      maxY: 300,
    });
    const eye = getEye(g, m as any);
    expect(eye.found).toBe(true);
  });
});
