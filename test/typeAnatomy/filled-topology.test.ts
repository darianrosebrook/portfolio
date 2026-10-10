import { describe, expect, it } from 'vitest';
import { buildGeometryCache } from '@/utils/typeAnatomy/geometryCache';
import {
  containsFilledPoint,
  contourWinding,
  occupiedRayIntervals,
} from '@/utils/geometry/filledGeometry';
import {
  glyphFor,
  loadFont,
  bundledVariationExtremes,
} from '@/test/utils/fixtures/fontFixtures';

// Native Path2D/nonzero cross-checks of the full grid are saved by the root
// browser validation. These fixed positive/negative samples pin font semantics
// without calling the predicate under test to construct the expected values.
describe('current-font occupied topology', () => {
  it('retains the wide slanted Neon f connected body across its source stem foot and crossbar intersections', () => {
    const font = loadFont('MonaspaceNeonVF.ttf').getVariation({
      wght: 200,
      wdth: 125,
      slnt: -11,
    });
    const geo = buildGeometryCache(glyphFor(font, 'f'), font),
      filled = geo.filled!;
    expect(filled.contours).toHaveLength(3);
    expect(filled.bodies).toHaveLength(1);
    expect(filled.enclosedRegions).toEqual([]);
    expect(filled.tolerance).toBe(0.2);
    expect(filled.bodies[0].bbox).toEqual({
      minX: 90,
      minY: 0,
      maxX: 1629,
      maxY: 1596,
    });
    for (const point of [
      { x: 630, y: 500 },
      { x: 1000, y: 950 },
      { x: 250, y: 50 },
      { x: 1400, y: 1530 },
    ]) {
      expect(containsFilledPoint(filled, point)).toBe(true);
      expect(contourWinding(filled.bodies[0].points, point)).toBe(1);
    }
    for (const point of [
      { x: 1000, y: 500 },
      { x: 50, y: 50 },
      { x: 1400, y: 1400 },
    ]) {
      expect(containsFilledPoint(filled, point)).toBe(false);
      expect(contourWinding(filled.bodies[0].points, point)).toBe(0);
    }
  });
  it('Inter i has a body and a disconnected tittle despite both negative source windings', () => {
    const font = loadFont('InterVariable.ttf');
    const geo = buildGeometryCache(glyphFor(font, 'i'), font);
    expect(geo.filled!.bodies).toHaveLength(2);
    expect(geo.filled!.enclosedRegions).toHaveLength(0);
    expect(geo.contours.map((c) => c.type)).toEqual(['base', 'mark']);
    expect(geo.contours.map((c) => c.winding)).toEqual([-1, -1]);
    expect(containsFilledPoint(geo.filled!, { x: 248, y: 559 })).toBe(true);
    expect(containsFilledPoint(geo.filled!, { x: 250, y: 1420 })).toBe(true);
    expect(containsFilledPoint(geo.filled!, { x: 250, y: 1200 })).toBe(false);
  });
  it('Inter O owns its enclosed empty region rather than treating its outer winding as a hole', () => {
    const font = loadFont('InterVariable.ttf');
    const geo = buildGeometryCache(glyphFor(font, 'O'), font);
    expect(geo.contours.map((c) => c.type)).toEqual(['base', 'hole']);
    expect(geo.filled!.bodies).toHaveLength(1);
    expect(geo.filled!.enclosedRegions).toHaveLength(1);
    expect(geo.filled!.enclosedRegions[0].bodyIndex).toBe(0);
    expect(geo.filled!.enclosedRegions[0].bbox).toEqual({
      minX: 307,
      minY: 156,
      maxX: 1259,
      maxY: 1334,
    });
    expect(containsFilledPoint(geo.filled!, { x: 200, y: 745 })).toBe(true);
    expect(containsFilledPoint(geo.filled!, { x: 783, y: 745 })).toBe(false);
    expect(containsFilledPoint(geo.filled!, { x: 783, y: 1400 })).toBe(true);
  });
  it('Nohemi aeacute derives two independent voids from its single self-touching body source contour', () => {
    const font = loadFont('Nohemi-VF.ttf');
    const geo = buildGeometryCache(glyphFor(font, 'ǽ'), font);
    expect(geo.filled!.contours).toHaveLength(2);
    expect(geo.contours.map((c) => c.type)).toEqual(['base', 'mark']);
    expect(geo.filled!.bodies).toHaveLength(2);
    expect(geo.filled!.enclosedRegions).toHaveLength(2);
    expect(geo.filled!.enclosedRegions.map((h) => h.bodyIndex)).toEqual([0, 0]);
    expect(geo.filled!.enclosedRegions[0].bbox).toEqual({
      minX: 500,
      minY: 293,
      maxX: 1811,
      maxY: 917,
    });
    const upper = geo.filled!.enclosedRegions[1].bbox;
    expect(upper.minX).toBeCloseTo(2231.32, 1);
    expect(upper.maxX).toBeCloseTo(3497.46, 1);
    expect([upper.minY, upper.maxY]).toEqual([1305, 1899]);
    expect(containsFilledPoint(geo.filled!, { x: 1200, y: 600 })).toBe(false);
    expect(containsFilledPoint(geo.filled!, { x: 2800, y: 1600 })).toBe(false);
    expect(containsFilledPoint(geo.filled!, { x: 1000, y: 100 })).toBe(true);
  });
});

describe.each(bundledVariationExtremes())(
  '$name $axes actual source ink has boundary custody',
  ({ name, axes }) => {
    const font = loadFont(name).getVariation(axes);
    it('matches occupied source spans and real voids for representative glyphs', () => {
      for (const character of ['A', 'H', 'O', 'i', 'f', 'r', 'g', 'j', 'é']) {
        expect(font.hasGlyphForCodePoint(character.codePointAt(0)!)).toBe(true);
        const geo = buildGeometryCache(glyphFor(font, character), font),
          filled = geo.filled!;
        const reconstructed = (point: { x: number; y: number }) =>
          [...filled.bodies, ...filled.enclosedRegions].reduce(
            (sum, boundary) => sum + contourWinding(boundary.points, point),
            0
          ) !== 0;
        let positiveCount = 0;
        for (const fraction of [0.3, 0.5, 0.7]) {
          const y = geo.glyph.bbox.minY + geo.scale.bboxH * fraction;
          const intervals = occupiedRayIntervals(
            filled,
            { x: geo.glyph.bbox.minX - geo.scale.eps, y },
            0,
            geo.scale.overshoot
          );
          for (const interval of intervals) {
            const point = { x: (interval.near.x + interval.far.x) / 2, y };
            expect(containsFilledPoint(filled, point)).toBe(true);
            expect(
              reconstructed(point),
              `${character} unowned actual ink ${point.x},${point.y}`
            ).toBe(true);
            positiveCount++;
          }
          for (let index = 1; index < intervals.length; index++) {
            if (
              intervals[index].near.x - intervals[index - 1].far.x <
              filled.tolerance * 4
            )
              continue;
            const point = {
              x: (intervals[index].near.x + intervals[index - 1].far.x) / 2,
              y,
            };
            expect(containsFilledPoint(filled, point)).toBe(false);
            expect(
              reconstructed(point),
              `${character} fabricated void fill ${point.x},${point.y}`
            ).toBe(false);
          }
          if (!intervals.length) {
            const point = {
              x: (geo.glyph.bbox.minX + geo.glyph.bbox.maxX) / 2,
              y,
            };
            expect(containsFilledPoint(filled, point)).toBe(false);
            expect(reconstructed(point)).toBe(false);
          }
        }
        expect(positiveCount, character).toBeGreaterThan(0);
        expect(filled.bodies.length, character).toBeGreaterThan(0);
        for (const hole of filled.enclosedRegions) {
          expect(
            hole.bodyIndex,
            `${character} detached enclosure`
          ).toBeDefined();
          expect(
            contourWinding(
              filled.bodies[hole.bodyIndex!].points,
              hole.points[0]
            )
          ).toBe(1);
        }
      }
    });
    it('preserves an actual empty space as zero ink rather than inventing a body', () => {
      const geo = buildGeometryCache(glyphFor(font, ' '), font),
        filled = geo.filled!;
      expect(geo.glyph.path.commands).toEqual([]);
      expect(filled.contours).toEqual([]);
      expect(filled.bodies).toEqual([]);
      expect(filled.enclosedRegions).toEqual([]);
      expect(containsFilledPoint(filled, { x: 0, y: 0 })).toBe(false);
    });
  }
);
