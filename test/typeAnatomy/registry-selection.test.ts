/**
 * Selection helpers on the detector registry.
 *
 * `filterDetectedFeatures` drops feature ids that produced no instances, so
 * callers can distinguish "detector ran and found nothing" from "feature is
 * present". `getBestInstances` collapses each id to its single
 * highest-confidence instance, mapping empty entries to null rather than
 * dropping them — the two helpers deliberately treat the empty case
 * differently, and that difference is what these tests pin.
 */

import { describe, expect, it } from 'vitest';
import {
  filterDetectedFeatures,
  getBestInstances,
} from '@/utils/typeAnatomy/detectorRegistry';
import type {
  FeatureID,
  FeatureInstance,
  Point2D,
} from '@/utils/typeAnatomy/types';

const points: Point2D[] = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
];

function instance(id: FeatureID, confidence: number): FeatureInstance {
  return { id, shape: { type: 'polyline', points }, confidence };
}

describe('filterDetectedFeatures', () => {
  it('drops ids whose instance list is empty and keeps the rest intact', () => {
    const input = new Map<FeatureID, FeatureInstance[]>([
      ['bowl', [instance('bowl', 0.9)]],
      ['spine', []],
      ['counter', [instance('counter', 0.4), instance('counter', 0.7)]],
    ]);

    const out = filterDetectedFeatures(input);

    expect([...out.keys()].sort()).toEqual(['bowl', 'counter']);
    // Surviving entries are passed through unchanged, not rebuilt or trimmed.
    expect(out.get('counter')).toHaveLength(2);
    expect(out.get('bowl')?.[0].confidence).toBe(0.9);
  });

  it('returns an empty map when every id is empty', () => {
    const input = new Map<FeatureID, FeatureInstance[]>([
      ['bowl', []],
      ['spine', []],
    ]);

    expect(filterDetectedFeatures(input).size).toBe(0);
  });

  it('does not mutate the input map', () => {
    const input = new Map<FeatureID, FeatureInstance[]>([
      ['bowl', [instance('bowl', 0.9)]],
      ['spine', []],
    ]);

    filterDetectedFeatures(input);

    expect(input.size).toBe(2);
    expect(input.has('spine')).toBe(true);
  });
});

describe('getBestInstances', () => {
  it('selects the highest-confidence instance per feature id', () => {
    const input = new Map<FeatureID, FeatureInstance[]>([
      [
        'counter',
        [
          instance('counter', 0.4),
          instance('counter', 0.91),
          instance('counter', 0.7),
        ],
      ],
    ]);

    expect(getBestInstances(input).get('counter')?.confidence).toBe(0.91);
  });

  it('maps an empty instance list to null rather than dropping the id', () => {
    const input = new Map<FeatureID, FeatureInstance[]>([
      ['bowl', [instance('bowl', 0.5)]],
      ['spine', []],
    ]);

    const best = getBestInstances(input);

    // Unlike filterDetectedFeatures, the empty id is retained as an explicit
    // null so callers can tell the detector ran and found nothing.
    expect(best.has('spine')).toBe(true);
    expect(best.get('spine')).toBeNull();
    expect(best.get('bowl')?.confidence).toBe(0.5);
  });

  it('does not reorder the caller’s array while selecting', () => {
    const low = instance('counter', 0.2);
    const high = instance('counter', 0.95);
    const original = [low, high];
    const input = new Map<FeatureID, FeatureInstance[]>([
      ['counter', original],
    ]);

    getBestInstances(input);

    // Sorting must happen on a copy — callers rely on detector emission order.
    expect(original[0]).toBe(low);
    expect(original[1]).toBe(high);
  });
});
