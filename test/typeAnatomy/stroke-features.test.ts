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
import { pointInPolygon } from '@/test/utils/fixtures/fontFixtures';
import { hasApex } from '@/utils/typeAnatomy/apex';
import { hasVertex } from '@/utils/typeAnatomy/vertex';
import { hasCrotch } from '@/utils/typeAnatomy/crotch';
import { hasTerminal } from '@/utils/typeAnatomy/terminal';
import { hasHook } from '@/utils/typeAnatomy/hook';
import { hasLink } from '@/utils/typeAnatomy/link';
import type {
  FeatureInstance,
  GeometryCache,
  Point2D,
} from '@/utils/typeAnatomy/types';

function geometry(
  name: string,
  char: string,
  axes: Record<string, number> = {}
) {
  const source = fontkit.create(
    fs.readFileSync(`public/fonts/${name}`)
  ) as Font;
  const font = Object.keys(axes).length ? source.getVariation(axes) : source;
  return buildGeometryCache(font.glyphForCodePoint(char.codePointAt(0)!), font);
}
const covers = (parts: FeatureInstance[], point: Point2D) =>
  parts.some(
    (part) => !!part.region && pointInPolygon(point, part.region.points)
  );
function horizontal(geo: GeometryCache, y: number) {
  return occupiedRayIntervals(
    geo.filled!,
    { x: geo.glyph.bbox.minX - 10, y },
    0,
    geo.scale.overshoot
  );
}
const fontCases = [
  ...[100, 400, 617.41, 900].map((wght) => ({
    name: 'Nohemi-VF.ttf',
    axes: { wght },
  })),
  ...[100, 400, 900].map((wght) => ({
    name: 'InterVariable.ttf',
    axes: { wght },
  })),
  ...[200, 400, 900].flatMap((wght) =>
    [6, 32].map((opsz) => ({ name: 'Newsreader-VF.ttf', axes: { wght, opsz } }))
  ),
  ...[200, 400, 800].map((wght) => ({
    name: 'MonaspaceNeonVF.ttf',
    axes: { wght },
  })),
];

describe.each(fontCases)(
  '$name $axes occupied stroke anatomy',
  ({ name, axes }) => {
    it('isolates three E free strokes and excludes the backbone and gaps', () => {
      const geo = geometry(name, 'E', axes),
        arms = detectFeature(geo, 'arm');
      expect(arms).toHaveLength(3);
      const x = geo.glyph.bbox.minX + geo.scale.bboxW * 0.6;
      const bands = occupiedRayIntervals(
        geo.filled!,
        { x, y: geo.glyph.bbox.minY - 10 },
        Math.PI / 2,
        geo.scale.overshoot
      );
      expect(bands).toHaveLength(3);
      for (const band of bands) {
        const point = { x, y: (band.near.y + band.far.y) / 2 };
        expect(containsFilledPoint(geo.filled!, point)).toBe(true);
        expect(covers(arms, point)).toBe(true);
      }
      const y = (bands[0].far.y + bands[1].near.y) / 2;
      expect(covers(arms, { x, y })).toBe(false);
      const stem = horizontal(geo, y)[0];
      expect(covers(arms, { x: (stem.near.x + stem.far.x) / 2, y })).toBe(
        false
      );
      expect(detectFeature(geometry(name, 'A', axes), 'arm')).toEqual([]);
      expect(detectFeature(geometry(name, 'H', axes), 'arm')).toEqual([]);
    });
    it('traces one Q descending diagonal and excludes its cavity and upper bowl', () => {
      const geo = geometry(name, 'Q', axes),
        tails = detectFeature(geo, 'tail');
      expect(tails).toHaveLength(1);
      const y = geo.glyph.bbox.minY * 0.6;
      const bands = horizontal(geo, y);
      expect(bands).toHaveLength(1);
      const point = { x: (bands[0].near.x + bands[0].far.x) / 2, y };
      expect(containsFilledPoint(geo.filled!, point)).toBe(true);
      expect(covers(tails, point)).toBe(true);
      const hole = geo.filled!.enclosedRegions[0];
      expect(
        covers(tails, {
          x: (hole.bbox.minX + hole.bbox.maxX) / 2,
          y: (hole.bbox.minY + hole.bbox.maxY) / 2,
        })
      ).toBe(false);
      const bowlY = geo.metrics.capHeight * 0.5;
      const wall = horizontal(geo, bowlY)[0];
      expect(
        covers(tails, { x: (wall.near.x + wall.far.x) / 2, y: bowlY })
      ).toBe(false);
      expect(detectFeature(geometry(name, 'O', axes), 'tail')).toEqual([]);
    });
    for (const char of ['j', 'y'])
      it(`follows ${char} descending ink and excludes upper ink`, () => {
        const geo = geometry(name, char, axes),
          tails = detectFeature(geo, 'tail');
        expect(tails).toHaveLength(1);
        const y = geo.glyph.bbox.minY * 0.6,
          bands = horizontal(geo, y);
        expect(bands.length).toBeGreaterThan(0);
        for (const band of bands) {
          const point = { x: (band.near.x + band.far.x) / 2, y };
          expect(containsFilledPoint(geo.filled!, point)).toBe(true);
          expect(covers(tails, point)).toBe(true);
        }
        const upperY = geo.metrics.xHeight * 0.65,
          upper = horizontal(geo, upperY)[0];
        expect(
          covers(tails, { x: (upper.near.x + upper.far.x) / 2, y: upperY })
        ).toBe(false);
      });
    it('selects the r projecting head without its backbone', () => {
      const geo = geometry(name, 'r', axes),
        ears = detectFeature(geo, 'ear');
      expect(ears).toHaveLength(1);
      const upperExtent = Math.max(
        ...geo
          .filled!.contours.flatMap((contour) => contour.points)
          .filter((point) => point.y > geo.metrics.xHeight * 0.7)
          .map((point) => point.x)
      );
      const x = upperExtent - geo.scale.eps * 2;
      const bands = occupiedRayIntervals(
        geo.filled!,
        { x, y: geo.metrics.xHeight * 0.5 },
        Math.PI / 2,
        geo.scale.overshoot
      );
      expect(bands).toHaveLength(1);
      const point = { x, y: (bands[0].near.y + bands[0].far.y) / 2 };
      expect(containsFilledPoint(geo.filled!, point)).toBe(true);
      expect(covers(ears, point)).toBe(true);
      const shaftY = geo.metrics.xHeight * 0.4,
        shaft = horizontal(geo, shaftY)[0];
      expect(
        covers(ears, { x: (shaft.near.x + shaft.far.x) / 2, y: shaftY })
      ).toBe(false);
    });
    it('rejects ear identity on a and capital E', () => {
      expect(detectFeature(geometry(name, 'a', axes), 'ear')).toEqual([]);
      expect(detectFeature(geometry(name, 'E', axes), 'ear')).toEqual([]);
    });
  }
);

describe.each([100, 400, 617.41, 900])('Nohemi spur %s', (wght) => {
  it('covers the short G branch and excludes the curved main body', () => {
    const geo = geometry('Nohemi-VF.ttf', 'G', { wght }),
      spurs = detectFeature(geo, 'spur');
    expect(spurs).toHaveLength(1);
    const y = geo.metrics.capHeight * 0.05,
      bands = horizontal(geo, y);
    expect(bands.length).toBeGreaterThanOrEqual(2);
    for (const [index, band] of bands.entries()) {
      const point = { x: (band.near.x + band.far.x) / 2, y };
      expect(containsFilledPoint(geo.filled!, point)).toBe(true);
      expect(covers(spurs, point)).toBe(index === bands.length - 1);
    }
    for (const char of ['I', 'O', 'Q'])
      expect(
        detectFeature(geometry('Nohemi-VF.ttf', char, { wght }), 'spur')
      ).toEqual([]);
  });
});

describe.each(
  [200, 400, 900].flatMap((wght) => [6, 32].map((opsz) => ({ wght, opsz })))
)('Newsreader projecting ink $wght/$opsz', (axes) => {
  it('covers the g ear and excludes the bowl and lower loop', () => {
    const geo = geometry('Newsreader-VF.ttf', 'g', axes),
      ears = detectFeature(geo, 'ear');
    expect(ears).toHaveLength(1);
    const upperExtent = Math.max(
      ...geo
        .filled!.contours.flatMap((contour) => contour.points)
        .filter((point) => point.y > geo.metrics.xHeight * 0.7)
        .map((point) => point.x)
    );
    const x = upperExtent - geo.scale.eps * 2;
    const bands = occupiedRayIntervals(
      geo.filled!,
      { x, y: geo.metrics.xHeight * 0.5 },
      Math.PI / 2,
      geo.scale.overshoot
    );
    expect(bands).toHaveLength(1);
    const point = { x, y: (bands[0].near.y + bands[0].far.y) / 2 };
    expect(containsFilledPoint(geo.filled!, point)).toBe(true);
    expect(covers(ears, point)).toBe(true);
    const y = geo.metrics.xHeight * 0.55,
      wall = horizontal(geo, y).at(-1)!;
    expect(covers(ears, { x: (wall.near.x + wall.far.x) / 2, y })).toBe(false);
    expect(detectFeature(geo, 'tail')).toEqual([]);
  });
  it('isolates four I serifs, leaving backbone ink unselected', () => {
    const geo = geometry('Newsreader-VF.ttf', 'I', axes),
      serifs = detectFeature(geo, 'serif');
    expect(serifs).toHaveLength(4);
    for (const fraction of [0.01, 0.99]) {
      const y = geo.glyph.bbox.minY + geo.scale.bboxH * fraction,
        span = horizontal(geo, y)[0];
      const left = { x: span.near.x + (span.far.x - span.near.x) * 0.1, y };
      const right = { x: span.near.x + (span.far.x - span.near.x) * 0.9, y };
      expect(containsFilledPoint(geo.filled!, left)).toBe(true);
      expect(containsFilledPoint(geo.filled!, right)).toBe(true);
      expect(covers(serifs, left)).toBe(true);
      expect(covers(serifs, right)).toBe(true);
    }
    const y = geo.metrics.capHeight * 0.5,
      shaft = horizontal(geo, y)[0];
    // The bracketed flare grows toward the shaft; a rectangle measured at
    // one midpoint would omit its inner ink. Probe each actual vertical band.
    for (const terminal of [
      geo.glyph.bbox.minY + geo.scale.eps,
      geo.glyph.bbox.maxY - geo.scale.eps,
    ]) {
      const outer = horizontal(geo, terminal)[0];
      for (const x of [
        outer.near.x + (shaft.near.x - outer.near.x) * 0.8,
        shaft.far.x + (outer.far.x - shaft.far.x) * 0.2,
      ]) {
        const projection = occupiedRayIntervals(
          geo.filled!,
          { x, y: geo.glyph.bbox.minY - 10 },
          Math.PI / 2,
          geo.scale.overshoot
        ).find((band) => band.near.y <= terminal && band.far.y >= terminal);
        expect(projection).toBeDefined();
        for (const fraction of [0.1, 0.9]) {
          const point = {
            x,
            y:
              projection!.near.y +
              (projection!.far.y - projection!.near.y) * fraction,
          };
          expect(containsFilledPoint(geo.filled!, point)).toBe(true);
          expect(covers(serifs, point)).toBe(true);
        }
      }
    }
    expect(covers(serifs, { x: (shaft.near.x + shaft.far.x) / 2, y })).toBe(
      false
    );
  });
});

it('legacy corner and link positives require actual junction and paired enclosures', () => {
  const a = geometry('Nohemi-VF.ttf', 'A'),
    v = geometry('Nohemi-VF.ttf', 'V'),
    g = geometry('Newsreader-VF.ttf', 'g');
  expect(hasApex(a.glyph, a.metrics)).toBe(true);
  expect(hasVertex(v.glyph, v.metrics)).toBe(true);
  expect(hasCrotch(v.glyph, v.metrics)).toBe(true);
  expect(hasCrotch(a.glyph, a.metrics)).toBe(true);
  expect(hasLink(g.glyph, g.metrics)).toBe(true);
});

it('straight sans endings are not serifs and curved free ends support hook identity', () => {
  for (const name of ['Nohemi-VF.ttf', 'InterVariable.ttf']) {
    const geo = geometry(name, 'I');
    expect(detectFeature(geo, 'serif')).toEqual([]);
    expect(hasTerminal(geo.glyph, geo.metrics)).toBe(true);
  }
  for (const char of ['f', 'j']) {
    const geo = geometry('Nohemi-VF.ttf', char);
    expect(hasHook(geo.glyph, geo.metrics)).toBe(true);
  }
  for (const char of ['O', 'I']) {
    const geo = geometry('Nohemi-VF.ttf', char);
    expect(hasHook(geo.glyph, geo.metrics)).toBe(false);
  }
});

it('a serif I cap does not become a flat non-serif Terminal', () => {
  const geo = geometry('Newsreader-VF.ttf', 'I');
  expect(hasTerminal(geo.glyph, geo.metrics)).toBe(false);
});
