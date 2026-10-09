import { describe, expect, it } from 'vitest';
import type { Font } from 'fontkit';
import { buildGeometryCache } from '@/utils/typeAnatomy/geometryCache';
import { detectFeature } from '@/utils/typeAnatomy/detectorRegistry';
import {
  containsFilledPoint,
  occupiedRayIntervals,
} from '@/utils/geometry/filledGeometry';
import type { FeatureInstance, GeometryCache } from '@/utils/typeAnatomy/types';
import {
  glyphFor,
  loadFont,
  pointInPolygon,
} from '@/test/utils/fixtures/fontFixtures';
import { mockFont, mockGlyphFromPath } from '@/test/utils/fixtures/mockGlyph';

function covers(instances: FeatureInstance[], x: number, y: number) {
  return instances.some(
    (instance) =>
      instance.region && pointInPolygon({ x, y }, instance.region.points)
  );
}
function geometry(font: Font, char: string): GeometryCache {
  return buildGeometryCache(glyphFor(font, char), font);
}

const cases = [
  { name: 'Nohemi-VF.ttf', axes: { wght: 100 } },
  { name: 'Nohemi-VF.ttf', axes: { wght: 400 } },
  { name: 'Nohemi-VF.ttf', axes: { wght: 617.41 } },
  { name: 'Nohemi-VF.ttf', axes: { wght: 900 } },
  { name: 'InterVariable.ttf', axes: { wght: 100, opsz: 14 } },
  { name: 'InterVariable.ttf', axes: { wght: 400, opsz: 32 } },
  { name: 'InterVariable.ttf', axes: { wght: 900, opsz: 32 } },
  { name: 'Newsreader-VF.ttf', axes: { wght: 200, opsz: 6 } },
  { name: 'Newsreader-VF.ttf', axes: { wght: 400, opsz: 18 } },
  { name: 'Newsreader-VF.ttf', axes: { wght: 800, opsz: 72 } },
] as const;

describe('body regions identify actual compound strokes', () => {
  const geo = geometry(
    loadFont('Nohemi-VF.ttf').getVariation({ wght: 400 }),
    'ǽ'
  );
  it('covers two rounded bowls without the central stem, e bar, spaces or acute', () => {
    const bowls = detectFeature(geo, 'bowl');
    expect(bowls).toHaveLength(2);
    for (const [x, y] of [
      [250, 550],
      [900, 100],
      [3700, 1500],
      [2900, 2100],
      [2900, 100],
    ]) {
      expect(containsFilledPoint(geo.filled!, { x, y })).toBe(true);
      expect(covers(bowls, x, y), `${x},${y}`).toBe(true);
    }
    for (const [x, y] of [
      [1000, 600],
      [2900, 1600],
      [2230, 2600],
      [2020, 850],
      [2020, 1550],
      [2500, 1120],
      [3000, 1120],
      [3800, 1120],
    ])
      expect(covers(bowls, x, y), `${x},${y}`).toBe(false);
  });
  it('covers one shared upright without coloring outer bowl walls or the accent', () => {
    const stems = detectFeature(geo, 'stem');
    expect(stems).toHaveLength(1);
    for (const y of [850, 1550]) {
      expect(containsFilledPoint(geo.filled!, { x: 2020, y })).toBe(true);
      expect(covers(stems, 2020, y)).toBe(true);
    }
    for (const [x, y] of [
      [250, 550],
      [3700, 1500],
      [2900, 2100],
      [2230, 2600],
      [1000, 600],
      [2900, 1600],
      [2500, 1120],
      [3000, 1120],
      [3800, 1120],
    ])
      expect(covers(stems, x, y)).toBe(false);
  });
  it('covers the full right e bar without coloring its eye, a counter or acute', () => {
    const bars = detectFeature(geo, 'crossbar');
    expect(bars).toHaveLength(1);
    for (const x of [2500, 3000, 3800]) {
      expect(containsFilledPoint(geo.filled!, { x, y: 1120 })).toBe(true);
      expect(covers(bars, x, 1120)).toBe(true);
    }
    for (const [x, y] of [
      [1000, 600],
      [2900, 1600],
      [2230, 2600],
      [250, 550],
      [3700, 1500],
      [2900, 2100],
      [2020, 850],
      [2020, 1550],
    ])
      expect(covers(bars, x, y)).toBe(false);
  });
});

describe.each(cases)('$name $axes real body boundaries', ({ name, axes }) => {
  const font = loadFont(name).getVariation(axes);
  it('keeps O curved wall ink in its bowl and excludes the center void and stems', () => {
    const geo = geometry(font, 'O');
    const bowls = detectFeature(geo, 'bowl');
    expect(bowls).toHaveLength(1);
    expect(detectFeature(geo, 'stem')).toEqual([]);
    const hole = geo.filled!.enclosedRegions[0];
    const x = (hole.bbox.minX + hole.bbox.maxX) / 2,
      y = (hole.bbox.minY + hole.bbox.maxY) / 2;
    expect(containsFilledPoint(geo.filled!, { x, y })).toBe(false);
    expect(covers(bowls, x, y)).toBe(false);
    const spans = occupiedRayIntervals(
      geo.filled!,
      { x: geo.glyph.bbox.minX - 10, y },
      0,
      geo.scale.overshoot
    );
    expect(spans).toHaveLength(2);
    for (const span of spans) {
      const point = { x: (span.near.x + span.far.x) / 2, y };
      expect(covers(bowls, point.x, point.y)).toBe(true);
    }
  });
  it('keeps b ascender ink in the backbone and out of the curved bowl', () => {
    const geo = geometry(font, 'b');
    const bowls = detectFeature(geo, 'bowl'),
      stems = detectFeature(geo, 'stem');
    expect(bowls).toHaveLength(1);
    expect(stems).toHaveLength(1);
    // A serif can curve into its head above the straight ascender. Probe the
    // outline-supported vertical section above current x-height, not the head.
    const ascenderEdges = geo.segments
      .filter(
        (segment) =>
          segment.type === 'lineTo' &&
          segment.params.length === 2 &&
          Math.abs(segment.params[0].x - segment.params[1].x) <=
            geo.scale.eps &&
          Math.max(segment.params[0].y, segment.params[1].y) >
            geo.metrics.xHeight
      )
      .sort(
        (a, b) =>
          Math.abs(b.params[1].y - b.params[0].y) -
          Math.abs(a.params[1].y - a.params[0].y)
      );
    expect(ascenderEdges.length).toBeGreaterThan(0);
    const edge = ascenderEdges[0].params;
    const y =
      (Math.max(geo.metrics.xHeight, Math.min(edge[0].y, edge[1].y)) +
        Math.max(edge[0].y, edge[1].y)) /
      2;
    expect(y).toBeGreaterThan(geo.metrics.xHeight);
    const spans = occupiedRayIntervals(
      geo.filled!,
      { x: geo.glyph.bbox.minX - 10, y },
      0,
      geo.scale.overshoot
    );
    expect(spans).toHaveLength(1);
    const x = (spans[0].near.x + spans[0].far.x) / 2;
    expect(covers(stems, x, y)).toBe(true);
    expect(covers(bowls, x, y)).toBe(false);
    const hole = geo.filled!.enclosedRegions[0];
    const wallY = (hole.bbox.minY + hole.bbox.maxY) / 2;
    const walls = occupiedRayIntervals(
      geo.filled!,
      { x: hole.bbox.maxX, y: wallY },
      0,
      geo.scale.overshoot
    );
    expect(walls.length).toBeGreaterThanOrEqual(1);
    const wall = walls[0];
    const wallX = (wall.near.x + wall.far.x) / 2;
    expect(covers(bowls, wallX, wallY)).toBe(true);
    expect(covers(stems, wallX, wallY)).toBe(false);
  });
  it('covers e bar ink across the eye floor and excludes upper eye and curved roof', () => {
    const geo = geometry(font, 'e');
    const bars = detectFeature(geo, 'crossbar');
    const bowls = detectFeature(geo, 'bowl');
    expect(bars).toHaveLength(1);
    expect(bowls).toHaveLength(1);
    const hole = geo.filled!.enclosedRegions[0];
    const x = (hole.bbox.minX + hole.bbox.maxX) / 2;
    const vertical = occupiedRayIntervals(
      geo.filled!,
      { x, y: geo.glyph.bbox.minY - 10 },
      Math.PI / 2,
      geo.scale.overshoot
    );
    const bar = vertical.find(
      (span) =>
        span.near.y < hole.bbox.minY &&
        span.far.y >= hole.bbox.minY &&
        span.far.y < (hole.bbox.minY + hole.bbox.maxY) / 2
    );
    expect(bar).toBeDefined();
    const y = (bar!.near.y + bar!.far.y) / 2;
    for (const fraction of [0.2, 0.5, 0.8]) {
      const sampleX =
        hole.bbox.minX + (hole.bbox.maxX - hole.bbox.minX) * fraction;
      expect(containsFilledPoint(geo.filled!, { x: sampleX, y })).toBe(true);
      expect(covers(bars, sampleX, y)).toBe(true);
      expect(covers(bowls, sampleX, y)).toBe(false);
    }
    expect(covers(bars, x, (hole.bbox.minY + hole.bbox.maxY) / 2)).toBe(false);
    const roof = vertical[vertical.length - 1];
    expect(covers(bars, x, (roof.near.y + roof.far.y) / 2)).toBe(false);
    expect(covers(bowls, x, (roof.near.y + roof.far.y) / 2)).toBe(true);
    expect(covers(bowls, x, (vertical[0].near.y + vertical[0].far.y) / 2)).toBe(
      true
    );
  });
});

it('a remote curved occupied component cannot extend a local bowl or become a stem', () => {
  const glyph = mockGlyphFromPath(
    'M 0 250 C 0 112 112 0 250 0 C 388 0 500 112 500 250 C 500 388 388 500 250 500 C 112 500 0 388 0 250 Z ' +
      'M 100 250 C 100 333 167 400 250 400 C 333 400 400 333 400 250 C 400 167 333 100 250 100 C 167 100 100 167 100 250 Z ' +
      'M 800 650 C 800 595 845 550 900 550 C 955 550 1000 595 1000 650 C 1000 705 955 750 900 750 C 845 750 800 705 800 650 Z',
    { minX: 0, minY: 0, maxX: 1000, maxY: 750 }
  );
  const geo = buildGeometryCache(glyph, mockFont());
  const bowls = detectFeature(geo, 'bowl');
  expect(bowls).toHaveLength(1);
  expect(covers(bowls, 450, 250)).toBe(true);
  expect(covers(bowls, 900, 650)).toBe(false);
  expect(covers(bowls, 250, 250)).toBe(false);
  expect(detectFeature(geo, 'stem')).toEqual([]);
});

it('subdividing a straight counter does not make its enclosure a curved bowl', () => {
  const glyph = mockGlyphFromPath(
    'M 0 0 L 600 0 L 600 600 L 0 600 Z ' +
      'M 100 100 L 100 200 L 100 300 L 100 400 L 100 500 ' +
      'L 200 500 L 300 500 L 400 500 L 500 500 L 500 400 L 500 300 ' +
      'L 500 200 L 500 100 L 400 100 L 300 100 L 200 100 Z',
    { minX: 0, minY: 0, maxX: 600, maxY: 600 }
  );
  const geo = buildGeometryCache(glyph, mockFont());
  expect(geo.filled!.enclosedRegions).toHaveLength(1);
  expect(detectFeature(geo, 'bowl')).toEqual([]);
});

describe.each([100, 400, 617.41, 900])('Nohemi compound weight %s', (wght) => {
  it('keeps its adjacent cavities, bar and disconnected mark separate', () => {
    const geo = geometry(loadFont('Nohemi-VF.ttf').getVariation({ wght }), 'ǽ');
    const bowls = detectFeature(geo, 'bowl'),
      stems = detectFeature(geo, 'stem'),
      bars = detectFeature(geo, 'crossbar');
    expect(bowls).toHaveLength(2);
    expect(stems).toHaveLength(1);
    expect(bars).toHaveLength(1);
    const holes = geo.filled!.enclosedRegions;
    expect(holes).toHaveLength(2);
    for (const hole of holes) {
      const center = {
        x: (hole.bbox.minX + hole.bbox.maxX) / 2,
        y: (hole.bbox.minY + hole.bbox.maxY) / 2,
      };
      expect(containsFilledPoint(geo.filled!, center)).toBe(false);
      for (const regions of [bowls, stems, bars])
        expect(covers(regions, center.x, center.y)).toBe(false);
    }
    const eye = holes[1],
      body = geo.filled!.bodies[eye.bodyIndex!];
    const x = (eye.bbox.minX + eye.bbox.maxX) / 2;
    const vertical = occupiedRayIntervals(
      geo.filled!,
      { x, y: body.bbox.minY - 10 },
      Math.PI / 2,
      geo.scale.overshoot
    );
    const bar = vertical.find(
      (span) => Math.abs(span.far.y - eye.bbox.minY) < geo.scale.eps
    );
    expect(bar).toBeDefined();
    const y = (bar!.near.y + bar!.far.y) / 2;
    for (const fraction of [0.2, 0.5, 0.85]) {
      const point = {
        x: eye.bbox.minX + (body.bbox.maxX - eye.bbox.minX) * fraction,
        y,
      };
      expect(containsFilledPoint(geo.filled!, point)).toBe(true);
      expect(covers(bars, point.x, point.y)).toBe(true);
      expect(covers(bowls, point.x, point.y)).toBe(false);
      expect(covers(stems, point.x, point.y)).toBe(false);
    }
    const accent = geo.filled!.bodies.find(
      (candidate) => candidate.bbox.minY > geo.metrics.xHeight
    );
    expect(accent).toBeDefined();
    const point = {
      x: (accent!.bbox.minX + accent!.bbox.maxX) / 2,
      y: (accent!.bbox.minY + accent!.bbox.maxY) / 2,
    };
    expect(containsFilledPoint(geo.filled!, point)).toBe(true);
    for (const regions of [bowls, stems, bars])
      expect(covers(regions, point.x, point.y)).toBe(false);
  });
});

it('a disconnected island inside a cavity is excluded from the enclosing bowl', () => {
  const glyph = mockGlyphFromPath(
    'M 0 250 C 0 112 112 0 250 0 C 388 0 500 112 500 250 C 500 388 388 500 250 500 C 112 500 0 388 0 250 Z ' +
      'M 100 250 C 100 333 167 400 250 400 C 333 400 400 333 400 250 C 400 167 333 100 250 100 C 167 100 100 167 100 250 Z ' +
      'M 230 250 C 230 239 239 230 250 230 C 261 230 270 239 270 250 C 270 261 261 270 250 270 C 239 270 230 261 230 250 Z',
    { minX: 0, minY: 0, maxX: 500, maxY: 500 }
  );
  const geo = buildGeometryCache(glyph, mockFont());
  const bowls = detectFeature(geo, 'bowl');
  expect(bowls).toHaveLength(1);
  expect(containsFilledPoint(geo.filled!, { x: 250, y: 250 })).toBe(true);
  expect(covers(bowls, 450, 250)).toBe(true);
  expect(covers(bowls, 250, 250)).toBe(false);
});

describe('opposed walls retain heavy backbones through stroke attachments', () => {
  const heavyCases = [
    {
      name: 'Newsreader-VF.ttf',
      axes: { wght: 800, opsz: 6 },
      char: 'r',
      bounds: { x: 215, y: 157, width: 476, height: 667 },
      negatives: [
        [900, 950],
        [110, 100],
      ],
    },
    {
      name: 'Nohemi-VF.ttf',
      axes: { wght: 617.41 },
      char: 'E',
      bounds: { x: 135, y: 0, width: 651, height: 2860 },
      negatives: [
        [1800, 250],
        [1800, 1400],
        [1800, 2600],
      ],
    },
    {
      name: 'Nohemi-VF.ttf',
      axes: { wght: 900 },
      char: 'E',
      bounds: { x: 90, y: 0, width: 950, height: 2860 },
      negatives: [
        [1800, 250],
        [1800, 1400],
        [1800, 2600],
      ],
    },
    {
      name: 'InterVariable.ttf',
      axes: { wght: 900, opsz: 32 },
      char: 'E',
      bounds: { x: 80, y: 0, width: 416, height: 1490 },
      negatives: [
        [1000, 175],
        [1000, 744],
        [1000, 1314],
      ],
    },
    {
      name: 'Newsreader-VF.ttf',
      axes: { wght: 800, opsz: 6 },
      char: 'I',
      bounds: { x: 262, y: 185, width: 538, height: 1044 },
      negatives: [
        [181, 50],
        [881, 1364],
      ],
    },
    {
      name: 'Nohemi-VF.ttf',
      axes: { wght: 900 },
      char: 'G',
      bounds: { x: 2039, y: 0, width: 880, height: 1530 },
      negatives: [
        [1700, 1280],
        [380, 1500],
        [1400, 2750],
      ],
    },
  ] as const;
  it.each(heavyCases)(
    '$name $axes $char keeps shaft ink and excludes attached arms serifs and curves',
    ({ name, axes, char, bounds, negatives }) => {
      const geo = geometry(loadFont(name).getVariation(axes), char);
      const stems = detectFeature(geo, 'stem');
      expect(stems).toHaveLength(1);
      // Bounds are established by the current font-instance source walls;
      // the samples include rows whose scanlines merge into attached strokes.
      expect(stems[0].shape).toEqual({ type: 'rect', ...bounds });
      for (const along of [0.1, 0.35, 0.65, 0.9]) {
        for (const across of [0.15, 0.5, 0.85]) {
          const x = bounds.x + bounds.width * across,
            y = bounds.y + bounds.height * along;
          expect(containsFilledPoint(geo.filled!, { x, y })).toBe(true);
          expect(covers(stems, x, y)).toBe(true);
        }
      }
      for (const [x, y] of negatives) {
        expect(containsFilledPoint(geo.filled!, { x, y })).toBe(true);
        expect(covers(stems, x, y)).toBe(false);
      }
    }
  );
});

it('opposed walls on an unattached square do not manufacture a backbone', () => {
  const glyph = mockGlyphFromPath('M 0 0 L 600 0 L 600 600 L 0 600 Z', {
    minX: 0,
    minY: 0,
    maxX: 600,
    maxY: 600,
  });
  const geo = buildGeometryCache(glyph, mockFont());
  expect(containsFilledPoint(geo.filled!, { x: 300, y: 300 })).toBe(true);
  expect(detectFeature(geo, 'stem')).toEqual([]);
});
