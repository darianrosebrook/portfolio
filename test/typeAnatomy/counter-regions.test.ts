import { describe, expect, it } from 'vitest';
import {
  bundledVariationExtremes,
  glyphFor,
  loadFont,
  pointInPolygon,
} from '@/test/utils/fixtures/fontFixtures';
import { mockGlyphFromPath, mockFont } from '@/test/utils/fixtures/mockGlyph';
import { buildGeometryCache } from '@/utils/typeAnatomy/geometryCache';
import {
  detectFeature,
  detectGlyphFeatures,
  reconcileFeatures,
} from '@/utils/typeAnatomy/detectorRegistry';
import { getFeatureHints } from '@/utils/typeAnatomy/glyphFeatureHints';
import {
  containsFilledPoint,
  occupiedRayIntervals,
} from '@/utils/geometry/filledGeometry';
import {
  counterSeed,
  getCounter,
  traceRegion,
} from '@/utils/typeAnatomy/counter';
import type {
  FeatureInstance,
  GeometryCache,
  Point2D,
} from '@/utils/typeAnatomy/types';

const cases = [
  ...bundledVariationExtremes(),
  ...(
    [
      'Nohemi-VF.ttf',
      'InterVariable.ttf',
      'Newsreader-VF.ttf',
      'MonaspaceNeonVF.ttf',
    ] as const
  ).map((name) => ({ name, axes: { wght: 400, opsz: 32 } })),
];
const covers = (instances: FeatureInstance[], point: Point2D) =>
  instances.some(
    (instance) =>
      !!instance.region && pointInPolygon(point, instance.region.points)
  );
const closure = (instance: FeatureInstance) =>
  (instance.debug as { closure: 'closed' | 'open' }).closure;
function geometry(font: ReturnType<typeof loadFont>, char: string) {
  return buildGeometryCache(glyphFor(font, char), font);
}
function gaps(geo: GeometryCache, sideways: boolean) {
  const box = geo.glyph.bbox;
  const crossPosition = sideways
    ? box.minX + (box.maxX - box.minX) * 0.55
    : box.minY + (box.maxY - box.minY) * 0.25;
  const origin = sideways
    ? { x: crossPosition, y: box.minY - 10 }
    : { x: box.minX - 10, y: crossPosition };
  const spans = occupiedRayIntervals(
    geo.filled!,
    origin,
    sideways ? Math.PI / 2 : 0,
    geo.scale.overshoot
  );
  return {
    spans,
    points: spans.slice(0, -1).map((span, index) => ({
      x: (span.far.x + spans[index + 1].near.x) / 2,
      y: (span.far.y + spans[index + 1].near.y) / 2,
    })),
  };
}

describe.each(cases)(
  '$name $axes closed and open counter spaces',
  ({ name, axes }) => {
    const font = loadFont(name).getVariation(axes);
    for (const [char, count] of [
      ['c', 1],
      ['e', 1],
      ['n', 1],
      ['m', 2],
      ['E', 2],
    ] as const)
      it(`${char} has real partly enclosed spaces and excludes enclosing ink`, () => {
        const geo = geometry(font, char),
          counters = detectFeature(geo, 'counter');
        const open = counters.filter(
            (instance) => closure(instance) === 'open'
          ),
          closed = counters.filter(
            (instance) => closure(instance) === 'closed'
          );
        expect(open).toHaveLength(count);
        expect(closed).toHaveLength(char === 'e' ? 1 : 0);
        const section = gaps(geo, char !== 'n' && char !== 'm');
        expect(section.points).toHaveLength(char === 'e' ? 2 : count);
        for (const point of section.points) {
          expect(containsFilledPoint(geo.filled!, point)).toBe(false);
          expect(covers(counters, point)).toBe(true);
        }
        for (const span of section.spans) {
          const point = {
            x: (span.near.x + span.far.x) / 2,
            y: (span.near.y + span.far.y) / 2,
          };
          expect(containsFilledPoint(geo.filled!, point)).toBe(true);
          expect(covers(counters, point)).toBe(false);
        }
        const outside = {
          x: geo.glyph.bbox.maxX + geo.scale.bboxW * 0.15,
          y: geo.metrics.xHeight * 0.5,
        };
        expect(containsFilledPoint(geo.filled!, outside)).toBe(false);
        expect(covers(counters, outside)).toBe(false);
        expect(
          getFeatureHints(char, geo.context).map((hint) => hint.id)
        ).toContain('counter');
        const legacy = getCounter(geo.glyph, geo.metrics);
        expect(legacy.found).toBe(true);
        const seed = counterSeed(geo.glyph, geo.metrics);
        expect(seed).not.toBeNull();
        expect(containsFilledPoint(geo.filled!, seed!)).toBe(false);
        expect(covers(counters, seed!)).toBe(true);
        const traced = traceRegion(geo.glyph, seed!);
        expect(traced?.type).toBe('polyline');
        if (traced?.type !== 'polyline')
          throw new Error('Expected actual counter polygon');
        expect(pointInPolygon(seed!, traced.points)).toBe(true);
      });
    it('splits E at the middle free arm rather than covering the exterior strip beside it', () => {
      const geo = geometry(font, 'E'),
        counters = detectFeature(geo, 'counter');
      const section = gaps(geo, true);
      expect(section.spans).toHaveLength(3);
      const middle = section.spans[1],
        y = (middle.near.y + middle.far.y) / 2;
      const right = occupiedRayIntervals(
        geo.filled!,
        { x: geo.glyph.bbox.minX - 10, y },
        0,
        geo.scale.overshoot
      ).at(-1)!;
      const point = {
        x: (right.far.x + geo.glyph.bbox.maxX) / 2 + geo.scale.eps,
        y,
      };
      expect(containsFilledPoint(geo.filled!, point)).toBe(false);
      expect(covers(counters, point)).toBe(false);
    });
    it('C and G retain their open interior and exclude actual occupied walls and bars', () => {
      for (const char of ['C', 'G']) {
        const geo = geometry(font, char),
          counters = detectFeature(geo, 'counter'),
          box = geo.glyph.bbox;
        expect(counters).toHaveLength(1);
        expect(closure(counters[0])).toBe('open');
        expect(
          getFeatureHints(char, geo.context).map((hint) => hint.id)
        ).toContain('counter');
        const emptyGaps: Array<{ point: Point2D; width: number }> = [];
        for (let column = 1; column < 24; column++) {
          const x = box.minX + (geo.scale.bboxW * column) / 24;
          const spans = occupiedRayIntervals(
            geo.filled!,
            { x, y: box.minY - geo.scale.eps },
            Math.PI / 2,
            geo.scale.overshoot
          );
          for (let i = 0; i + 1 < spans.length; i++) {
            const a = spans[i].far,
              b = spans[i + 1].near;
            emptyGaps.push({
              point: { x, y: (a.y + b.y) / 2 },
              width: b.y - a.y,
            });
          }
          for (let row = 1; row < 24; row++) {
            const point = { x, y: box.minY + (geo.scale.bboxH * row) / 24 };
            if (containsFilledPoint(geo.filled!, point))
              expect(
                covers(counters, point),
                `${char} ink at ${x},${point.y}`
              ).toBe(false);
          }
        }
        expect(emptyGaps.length).toBeGreaterThan(0);
        const interior = emptyGaps.sort((a, b) => b.width - a.width)[0].point;
        expect(containsFilledPoint(geo.filled!, interior)).toBe(false);
        expect(covers(counters, interior)).toBe(true);
        expect(
          containsFilledPoint(geo.filled!, counters[0].anchors!.center)
        ).toBe(false);
      }
    });
    it('Counter and Eye keep the open e counter after removing only the duplicate eye', () => {
      const geo = geometry(font, 'e'),
        result = reconcileFeatures(
          detectGlyphFeatures(geo, ['counter', 'eye'])
        );
      const counters = result.get('counter')!,
        eyes = result.get('eye')!;
      expect(eyes).toHaveLength(1);
      expect(counters).toHaveLength(1);
      expect(closure(counters[0])).toBe('open');
      const hole = geo.filled!.enclosedRegions[0],
        point = {
          x: (hole.bbox.minX + hole.bbox.maxX) / 2,
          y: (hole.bbox.minY + hole.bbox.maxY) / 2,
        };
      expect(covers(eyes, point)).toBe(true);
      expect(covers(counters, point)).toBe(false);
      const section = gaps(geo, true),
        lower = section.points.sort((a, b) => a.y - b.y)[0];
      expect(covers(counters, lower)).toBe(true);
      expect(covers(eyes, lower)).toBe(false);
    });
    it('rejects T L r exterior whitespace and I serif notches', () => {
      for (const char of ['T', 'L', 'r', 'I']) {
        const geo = geometry(font, char);
        expect(detectFeature(geo, 'counter')).toEqual([]);
        expect(getCounter(geo.glyph, geo.metrics)).toEqual({ found: false });
      }
    });
    it('retains the closed O and a spaces without including their occupied wall', () => {
      for (const char of ['O', 'a']) {
        const geo = geometry(font, char),
          closed = detectFeature(geo, 'counter').filter(
            (instance) => closure(instance) === 'closed'
          );
        expect(closed).toHaveLength(1);
        const hole = geo.filled!.enclosedRegions[0],
          point = {
            x: (hole.bbox.minX + hole.bbox.maxX) / 2,
            y: (hole.bbox.minY + hole.bbox.maxY) / 2,
          };
        expect(containsFilledPoint(geo.filled!, point)).toBe(false);
        expect(covers(closed, point)).toBe(true);
        const spans = occupiedRayIntervals(
          geo.filled!,
          { x: geo.glyph.bbox.minX - 10, y: point.y },
          0,
          geo.scale.overshoot
        );
        for (const span of spans)
          expect(
            covers(closed, { x: (span.near.x + span.far.x) / 2, y: point.y })
          ).toBe(false);
      }
    });
  }
);

it('two explicit E bays are separated by the actual arm and omit its outer-side whitespace', () => {
  const glyph = mockGlyphFromPath(
    'M 0 0 L 600 0 L 600 100 L 100 100 L 100 250 L 500 250 L 500 350 L 100 350 L 100 500 L 600 500 L 600 600 L 0 600 Z',
    { minX: 0, minY: 0, maxX: 600, maxY: 600 }
  );
  const geo = buildGeometryCache(glyph, mockFont()),
    counters = detectFeature(geo, 'counter');
  expect(counters).toHaveLength(2);
  expect(covers(counters, { x: 300, y: 175 })).toBe(true);
  expect(covers(counters, { x: 300, y: 425 })).toBe(true);
  expect(containsFilledPoint(geo.filled!, { x: 550, y: 300 })).toBe(false);
  expect(covers(counters, { x: 550, y: 300 })).toBe(false);
  expect(covers(counters, { x: 300, y: 300 })).toBe(false);
  expect(covers(counters, { x: 50, y: 300 })).toBe(false);
});

for (const [label, d] of [
  [
    'bottom opening',
    'M 0 0 L 100 0 L 100 500 L 500 500 L 500 0 L 600 0 L 600 600 L 0 600 Z',
  ],
  [
    'top opening',
    'M 0 0 L 600 0 L 600 600 L 500 600 L 500 100 L 100 100 L 100 600 L 0 600 Z',
  ],
] as const)
  it(`${label} preserves the interior between real opposed walls`, () => {
    const glyph = mockGlyphFromPath(d, {
        minX: 0,
        minY: 0,
        maxX: 600,
        maxY: 600,
      }),
      geo = buildGeometryCache(glyph, mockFont()),
      counters = detectFeature(geo, 'counter');
    expect(counters).toHaveLength(1);
    expect(closure(counters[0])).toBe('open');
    expect(covers(counters, { x: 300, y: 300 })).toBe(true);
    expect(covers(counters, { x: 50, y: 300 })).toBe(false);
    expect(covers(counters, { x: 300, y: -100 })).toBe(false);
    expect(covers(counters, { x: 300, y: 700 })).toBe(false);
  });

it('caller mask and mouth mutations cannot alter cached or canonical boundary evidence', () => {
  const glyph = mockGlyphFromPath(
      'M 0 0 L 100 0 L 100 500 L 500 500 L 500 0 L 600 0 L 600 600 L 0 600 Z',
      { minX: 0, minY: 0, maxX: 600, maxY: 600 }
    ),
    geo = buildGeometryCache(glyph, mockFont());
  const first = detectFeature(geo, 'counter');
  expect(first).toHaveLength(1);
  first[0].region!.points[0].x = 9000;
  first[0].anchors!.mouthStart.x = 9000;
  const second = detectFeature(geo, 'counter');
  expect(second).toHaveLength(1);
  expect(second[0].region!.points[0].x).toBe(100);
  expect(second[0].anchors!.mouthStart.x).toBe(100);
  expect(covers(second, { x: 300, y: 300 })).toBe(true);
  expect(containsFilledPoint(geo.filled!, { x: 50, y: 300 })).toBe(true);
});

it('offers the source-supported r arm independently from counter identity', () => {
  const font = loadFont('Nohemi-VF.ttf'),
    geo = geometry(font, 'r');
  const ids = getFeatureHints('r', geo.context).map((hint) => hint.id);
  expect(ids).toContain('arm');
  expect(ids).not.toContain('counter');
});

for (const [label, d] of [
  [
    'closed',
    'M 0 0 L 600 0 L 600 600 L 0 600 Z M 100 100 L 100 500 L 500 500 L 500 100 Z',
  ],
  [
    'open',
    'M 0 0 L 100 0 L 100 500 L 500 500 L 500 0 L 600 0 L 600 600 L 0 600 Z',
  ],
] as const)
  it(`${label} counter masks exclude occupied islands and seed empty space`, () => {
    const glyph = mockGlyphFromPath(
      d + ' M 250 200 L 350 200 L 350 300 L 250 300 Z',
      { minX: 0, minY: 0, maxX: 600, maxY: 600 }
    );
    const geo = buildGeometryCache(glyph, mockFont()),
      counters = detectFeature(geo, 'counter');
    expect(counters).toHaveLength(1);
    expect(closure(counters[0])).toBe(label);
    expect(containsFilledPoint(geo.filled!, { x: 300, y: 250 })).toBe(true);
    expect(covers(counters, { x: 300, y: 250 })).toBe(false);
    expect(covers(counters, { x: 150, y: 250 })).toBe(true);
    expect(covers(counters, { x: 450, y: 250 })).toBe(true);
    const seed = counters[0].anchors!.center;
    expect(containsFilledPoint(geo.filled!, seed)).toBe(false);
    expect(covers(counters, seed)).toBe(true);
    expect(
      containsFilledPoint(geo.filled!, counterSeed(glyph, geo.metrics)!)
    ).toBe(false);
  });

it('an occupied mark crossing the open mouth cuts a source-bound notch', () => {
  const glyph = mockGlyphFromPath(
    'M 0 0 L 100 0 L 100 500 L 500 500 L 500 0 L 600 0 L 600 600 L 0 600 Z M 250 -50 L 350 -50 L 350 50 L 250 50 Z',
    { minX: 0, minY: -50, maxX: 600, maxY: 600 }
  );
  const geo = buildGeometryCache(glyph, mockFont()),
    counters = detectFeature(geo, 'counter');
  expect(counters).toHaveLength(1);
  expect(containsFilledPoint(geo.filled!, { x: 300, y: 25 })).toBe(true);
  expect(covers(counters, { x: 300, y: 25 })).toBe(false);
  expect(covers(counters, { x: 300, y: -25 })).toBe(false);
  expect(covers(counters, { x: 300, y: 150 })).toBe(true);
  expect(covers(counters, { x: 150, y: 25 })).toBe(true);
  expect(containsFilledPoint(geo.filled!, counters[0].anchors!.center)).toBe(
    false
  );
});

it('Nohemi G counter mouth excludes the actual inner end of its bar', () => {
  const geo = geometry(
      loadFont('Nohemi-VF.ttf').getVariation({ wght: 400 }),
      'G'
    ),
    counters = detectFeature(geo, 'counter');
  expect(counters).toHaveLength(1);
  expect(containsFilledPoint(geo.filled!, { x: 1600, y: 1300 })).toBe(true);
  expect(covers(counters, { x: 1600, y: 1300 })).toBe(false);
  expect(covers(counters, { x: 1000, y: 1300 })).toBe(true);
});
