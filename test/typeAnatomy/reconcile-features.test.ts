import { describe, expect, it } from 'vitest';
import {
  detectAllFeatures,
  detectGlyphFeatures,
  reconcileFeatures,
} from '@/utils/typeAnatomy/detectorRegistry';
import { buildGeometryCache } from '@/utils/typeAnatomy/geometryCache';
import {
  glyphFor,
  loadFont,
  pointInPolygon,
} from '@/test/utils/fixtures/fontFixtures';
import type {
  FeatureID,
  FeatureInstance,
  Point2D,
  RegionKind,
} from '@/utils/typeAnatomy/types';

const square: Point2D[] = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
];
function instance(
  id: FeatureID,
  points = square,
  kind: RegionKind = 'enclosed',
  confidence = 0.9
): FeatureInstance {
  return {
    id,
    shape: { type: 'polyline', points },
    region: { kind, points },
    confidence,
  };
}

describe('reconcileFeatures preserves distinct anatomical claims', () => {
  it('closed o has a bowl and counter without fabricating a spine', () => {
    const font = loadFont('Nohemi-VF.ttf');
    const result = reconcileFeatures(
      detectAllFeatures(buildGeometryCache(glyphFor(font, 'o'), font))
    );
    expect(result.get('bowl')).toHaveLength(1);
    expect(result.get('counter')).toHaveLength(1);
    expect(result.get('spine')).toEqual([]);
  });
  it('keeps both distinct stroke interpretations even when their masks coincide', () => {
    const bowl = instance('bowl', square, 'stroke', 0.1);
    const spine = instance('spine', square, 'stroke', 0.99);
    const input = new Map<FeatureID, FeatureInstance[]>([
      ['bowl', [bowl]],
      ['spine', [spine]],
    ]);
    expect(reconcileFeatures(input)).toBe(input);
  });
  it('keeps complementary ink and enclosed-space claims', () => {
    const input = new Map<FeatureID, FeatureInstance[]>([
      ['bowl', [instance('bowl', square, 'stroke')]],
      ['counter', [instance('counter')]],
    ]);
    expect(reconcileFeatures(input)).toBe(input);
  });
  it.each(
    [
      square,
      [...square.slice(2), ...square.slice(0, 2)],
      [...square].reverse(),
    ].map((points) => ({ points }))
  )(
    'prefers the specific eye on the same boundary independently of confidence',
    ({ points }) => {
      const counter = instance('counter', square, 'enclosed', 1);
      const eye = instance('eye', points, 'enclosed', 0.1);
      const input = new Map<FeatureID, FeatureInstance[]>([
        ['counter', [counter]],
        ['eye', [eye]],
        ['stem', []],
      ]);
      const result = reconcileFeatures(input);
      expect(result.get('eye')).toEqual([eye]);
      expect(result.get('counter')).toEqual([]);
      expect(result.has('stem')).toBe(true);
      expect(input.get('counter')).toEqual([counter]);
    }
  );
  it('keeps distinct spaces with identical bounding boxes', () => {
    const first = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 0, y: 100 },
    ];
    const second = [
      { x: 100, y: 100 },
      { x: 100, y: 0 },
      { x: 0, y: 100 },
    ];
    const input = new Map<FeatureID, FeatureInstance[]>([
      ['counter', [instance('counter', first)]],
      ['eye', [instance('eye', second)]],
    ]);
    expect(reconcileFeatures(input)).toBe(input);
  });
  it('keeps partly overlapping spaces instead of deriving identity from box overlap', () => {
    const shifted = square.map((p) => ({ ...p, x: p.x + 10 }));
    const input = new Map<FeatureID, FeatureInstance[]>([
      ['counter', [instance('counter')]],
      ['eye', [instance('eye', shifted)]],
    ]);
    expect(reconcileFeatures(input)).toBe(input);
  });
  it('keeps point-only claims and rejects a stroke-shaped eye as a counter alias', () => {
    const point: FeatureInstance = {
      id: 'eye',
      shape: { type: 'point', x: 50, y: 50 },
      confidence: 1,
    };
    const input = new Map<FeatureID, FeatureInstance[]>([
      ['counter', [instance('counter')]],
      ['eye', [point, instance('eye', square, 'stroke')]],
    ]);
    expect(reconcileFeatures(input)).toBe(input);
  });
  it('retains the a counter and both open interiors separately from the e eye in Aeacute', () => {
    const font = loadFont('Nohemi-VF.ttf').getVariation({ wght: 400 });
    const result = reconcileFeatures(
      detectGlyphFeatures(buildGeometryCache(glyphFor(font, 'ǽ'), font), [
        'counter',
        'eye',
      ])
    );
    const counters = result.get('counter')!;
    expect(
      counters
        .map((counter) => (counter.debug as { closure: string }).closure)
        .sort()
    ).toEqual(['closed', 'open', 'open']);
    expect(result.get('eye')).toHaveLength(1);
    const coversCounter = (x: number, y: number) =>
      counters.some((counter) =>
        pointInPolygon({ x, y }, counter.region!.points)
      );
    const eye = result.get('eye')![0].region!.points;
    expect(coversCounter(1000, 600)).toBe(true);
    expect(coversCounter(1000, 1550)).toBe(true);
    expect(coversCounter(2900, 600)).toBe(true);
    expect(coversCounter(2900, 1600)).toBe(false);
    expect(coversCounter(3000, 1120)).toBe(false);
    expect(coversCounter(2230, 2600)).toBe(false);
    expect(pointInPolygon({ x: 2900, y: 1600 }, eye)).toBe(true);
    expect(pointInPolygon({ x: 1000, y: 600 }, eye)).toBe(false);
  });
});
