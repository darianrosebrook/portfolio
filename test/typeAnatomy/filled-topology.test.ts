import { describe, expect, it } from 'vitest';
import { buildGeometryCache } from '@/utils/typeAnatomy/geometryCache';
import { containsFilledPoint } from '@/utils/geometry/filledGeometry';
import { glyphFor, loadFont } from '@/test/utils/fixtures/fontFixtures';

// Native Path2D/nonzero cross-checks of the full grid are saved by the root
// browser validation. These fixed positive/negative samples pin font semantics
// without calling the predicate under test to construct the expected values.
describe('current-font occupied topology', () => {
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
