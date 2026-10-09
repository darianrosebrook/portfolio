import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import * as fontkit from 'fontkit';
import type { Font } from 'fontkit';
import { buildGeometryCache } from '@/utils/typeAnatomy/geometryCache';
import { detectFeature } from '@/utils/typeAnatomy/detectorRegistry';
import {
  containsFilledPoint,
  occupiedRayIntervals,
} from '@/utils/geometry/filledGeometry';
import { mockGlyphFromPath, mockFont } from '@/test/utils/fixtures/mockGlyph';
import { hasApex } from '@/utils/typeAnatomy/apex';
import { hasVertex } from '@/utils/typeAnatomy/vertex';
import { hasCrotch } from '@/utils/typeAnatomy/crotch';
import type {
  FeatureInstance,
  GeometryCache,
  Point2D,
} from '@/utils/typeAnatomy/types';

const cases = [
  ...[100, 400, 617.41, 900].map((wght) => ({
    name: 'Nohemi-VF.ttf',
    axes: { wght },
  })),
  ...[100, 400, 900].map((wght) => ({
    name: 'InterVariable.ttf',
    axes: { wght },
  })),
  ...[200, 400, 800].flatMap((wght) =>
    [6, 32].map((opsz) => ({ name: 'Newsreader-VF.ttf', axes: { wght, opsz } }))
  ),
  ...[200, 400, 800].map((wght) => ({
    name: 'MonaspaceNeonVF.ttf',
    axes: { wght },
  })),
];
function geometry(
  name: string,
  char: string,
  axes: Record<string, number>
): GeometryCache {
  const source = fontkit.create(
      fs.readFileSync(`public/fonts/${name}`)
    ) as Font,
    font = source.getVariation(axes);
  return buildGeometryCache(font.glyphForCodePoint(char.codePointAt(0)!), font);
}
function point(instance: FeatureInstance): Point2D {
  expect(instance.shape.type).toBe('point');
  if (instance.shape.type !== 'point')
    throw new Error('Expected junction point');
  return { x: instance.shape.x, y: instance.shape.y };
}
function mainBody(geo: GeometryCache) {
  return [...geo.filled!.bodies].sort((a, b) => b.area - a.area)[0];
}

describe.each(cases)('$name $axes actual junctions', ({ name, axes }) => {
  it('places A apex outside its upper counter and crotch at the counter roof; free feet are not vertices', () => {
    const geo = geometry(name, 'A', axes),
      apexes = detectFeature(geo, 'apex'),
      crotches = detectFeature(geo, 'crotch');
    expect(apexes).toHaveLength(1);
    expect(crotches).toHaveLength(1);
    expect(detectFeature(geo, 'vertex')).toEqual([]);
    const apex = point(apexes[0]),
      crotch = point(crotches[0]),
      body = mainBody(geo);
    expect(apex.y).toBeCloseTo(body.bbox.maxY, 1);
    const cap = occupiedRayIntervals(
      geo.filled!,
      { x: body.bbox.minX - 10, y: body.bbox.maxY - geo.scale.eps * 0.1 },
      0,
      geo.scale.overshoot
    );
    expect(cap).toHaveLength(1);
    expect(Math.abs(apex.x - (cap[0].near.x + cap[0].far.x) / 2)).toBeLessThan(
      geo.scale.eps * 2
    );
    const hole = geo.filled!.enclosedRegions[0];
    expect(crotch.y).toBeCloseTo(hole.bbox.maxY, 1);
    const roof = hole.points.filter(
      (p) => Math.abs(p.y - hole.bbox.maxY) < 0.01
    );
    expect(roof.length).toBeGreaterThan(0);
    expect(crotch.x).toBeCloseTo(
      (Math.min(...roof.map((p) => p.x)) + Math.max(...roof.map((p) => p.x))) /
        2,
      1
    );
    expect(apex.y - crotch.y).toBeGreaterThan(geo.scale.eps);
    const offset = Math.min((apex.y - crotch.y) / 4, geo.scale.eps * 2);
    expect(
      containsFilledPoint(geo.filled!, { x: crotch.x, y: crotch.y - offset })
    ).toBe(false);
    expect(
      containsFilledPoint(geo.filled!, { x: crotch.x, y: crotch.y + offset })
    ).toBe(true);
    expect(hasApex(geo.glyph, geo.metrics)).toBe(true);
    expect(hasCrotch(geo.glyph, geo.metrics)).toBe(true);
    expect(hasVertex(geo.glyph, geo.metrics)).toBe(false);
  });
  it('places V exterior vertex below its actual open interior angle and rejects top free ends as apexes', () => {
    const geo = geometry(name, 'V', axes),
      vertices = detectFeature(geo, 'vertex'),
      crotches = detectFeature(geo, 'crotch');
    expect(vertices).toHaveLength(1);
    expect(crotches).toHaveLength(1);
    expect(detectFeature(geo, 'apex')).toEqual([]);
    const vertex = point(vertices[0]),
      crotch = point(crotches[0]),
      body = mainBody(geo);
    expect(vertex.y).toBeCloseTo(body.bbox.minY, 1);
    expect(crotch.y - vertex.y).toBeGreaterThan(geo.scale.eps);
    const vertical = occupiedRayIntervals(
      geo.filled!,
      { x: crotch.x, y: body.bbox.minY - 10 },
      Math.PI / 2,
      geo.scale.overshoot
    );
    expect(vertical.length).toBeGreaterThan(0);
    expect(vertical[0].far.y).toBeCloseTo(crotch.y, 0);
    const offset = Math.min((crotch.y - vertex.y) / 4, geo.scale.eps * 2);
    expect(
      containsFilledPoint(geo.filled!, { x: crotch.x, y: crotch.y - offset })
    ).toBe(true);
    expect(
      containsFilledPoint(geo.filled!, { x: crotch.x, y: crotch.y + offset })
    ).toBe(false);
    expect(hasVertex(geo.glyph, geo.metrics)).toBe(true);
    expect(hasApex(geo.glyph, geo.metrics)).toBe(false);
  });
  it('keeps W two lower meetings separate from its three interior angles', () => {
    const geo = geometry(name, 'W', axes),
      vertices = detectFeature(geo, 'vertex'),
      crotches = detectFeature(geo, 'crotch');
    expect(vertices).toHaveLength(2);
    expect(crotches).toHaveLength(3);
    const lower = crotches
      .map(point)
      .sort((a, b) => a.y - b.y)
      .slice(0, 2)
      .sort((a, b) => a.x - b.x);
    const outer = vertices.map(point).sort((a, b) => a.x - b.x);
    for (let i = 0; i < 2; i++)
      expect(lower[i].y).toBeGreaterThan(outer[i].y + geo.scale.eps);
  });
  it('finds the M central diagonal meeting and its distinct interior angle above that meeting', () => {
    const geo = geometry(name, 'M', axes),
      vertices = detectFeature(geo, 'vertex'),
      crotches = detectFeature(geo, 'crotch');
    expect(vertices).toHaveLength(1);
    expect(detectFeature(geo, 'apex')).toEqual([]);
    const vertex = point(vertices[0]);
    const interior = crotches.map(point).sort((a, b) => a.y - b.y)[0];
    expect(interior).toBeDefined();
    expect(interior.y).toBeGreaterThan(vertex.y + geo.scale.eps);
    // The source-supported empty notch starts at the first ink exit here;
    // M's outer stem feet do not constrain this diagonal meeting to baseline.
    const spans = occupiedRayIntervals(
      geo.filled!,
      { x: interior.x, y: geo.glyph.bbox.minY - 10 },
      Math.PI / 2,
      geo.scale.overshoot
    );
    expect(spans[0].far.y).toBeCloseTo(interior.y, 0);
    expect(
      containsFilledPoint(geo.filled!, {
        x: interior.x,
        y: interior.y - geo.scale.eps,
      })
    ).toBe(true);
    expect(
      containsFilledPoint(geo.filled!, {
        x: interior.x,
        y: interior.y + geo.scale.eps,
      })
    ).toBe(false);
  });
  it('rejects H ends, E decorative terminals, round O and i marks as diagonal junctions', () => {
    for (const char of ['H', 'E', 'O', 'i']) {
      const geo = geometry(name, char, axes);
      for (const id of ['apex', 'vertex', 'crotch'] as const)
        expect(detectFeature(geo, id)).toEqual([]);
    }
  });
  it('keeps accent and compound mark boundaries out of the base junctions', () => {
    const geo = geometry(name, 'Á', axes),
      base = mainBody(geo);
    for (const id of ['apex', 'crotch'] as const) {
      const parts = detectFeature(geo, id);
      expect(parts).toHaveLength(1);
      for (const instance of parts)
        expect(point(instance).y).toBeLessThanOrEqual(base.bbox.maxY);
    }
    expect(detectFeature(geo, 'vertex')).toEqual([]);
    const compound = geometry(name, 'ǽ', axes),
      body = mainBody(compound);
    for (const id of ['apex', 'vertex', 'crotch'] as const) {
      for (const instance of detectFeature(compound, id))
        expect(point(instance).y).toBeLessThanOrEqual(body.bbox.maxY);
    }
  });
});

const syntheticV = [
  {
    label: 'pointed',
    d: 'M 0 600 L 100 600 L 300 100 L 500 600 L 600 600 L 300 0 Z',
    minY: 0,
  },
  {
    label: 'flat',
    d: 'M 0 600 L 100 600 L 300 100 L 500 600 L 600 600 L 350 0 L 250 0 Z',
    minY: 0,
  },
  {
    label: 'small rounded tip',
    d: 'M 0 600 L 100 600 L 300 100 L 500 600 L 600 600 L 320 15 Q 300 -5 280 15 Z',
    minY: 5,
  },
];
describe.each(syntheticV)('$label actual meeting', ({ d, minY }) => {
  it('finds outer bottom and interior notch as distinct boundary points', () => {
    const glyph = mockGlyphFromPath(d, { minX: 0, minY, maxX: 600, maxY: 600 }),
      geo = buildGeometryCache(glyph, mockFont());
    const vertices = detectFeature(geo, 'vertex'),
      crotches = detectFeature(geo, 'crotch');
    expect(vertices).toHaveLength(1);
    expect(crotches).toHaveLength(1);
    expect(Math.abs(point(vertices[0]).y - minY)).toBeLessThanOrEqual(
      geo.filled!.tolerance
    );
    expect(point(crotches[0])).toEqual({ x: 300, y: 100 });
    expect(detectFeature(geo, 'apex')).toEqual([]);
  });
});

it('a disconnected triangular accent cannot turn a rectangular base into an apex or vertex', () => {
  const glyph = mockGlyphFromPath(
    'M 0 0 L 100 0 L 100 600 L 0 600 Z M 150 800 L 200 900 L 250 800 Z',
    { minX: 0, minY: 0, maxX: 250, maxY: 900 }
  );
  const geo = buildGeometryCache(glyph, mockFont());
  for (const id of ['apex', 'vertex', 'crotch'] as const)
    expect(detectFeature(geo, id)).toEqual([]);
});
