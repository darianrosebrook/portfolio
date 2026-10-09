import { describe, expect, it } from 'vitest';
import { buildGeometryCache } from '@/utils/typeAnatomy/geometryCache';
import {
  detectGlyphFeatures,
  detectFeature,
  reconcileFeatures,
} from '@/utils/typeAnatomy/detectorRegistry';
import { getFeatureHints } from '@/utils/typeAnatomy/glyphFeatureHints';
import {
  glyphFor,
  loadFont,
  pointInPolygon,
} from '@/test/utils/fixtures/fontFixtures';
import type { FeatureInstance } from '@/utils/typeAnatomy/types';

function covers(instances: FeatureInstance[], x: number, y: number) {
  return instances.some(
    (instance) =>
      instance.region && pointInPolygon({ x, y }, instance.region.points)
  );
}

describe('compound anatomy follows the Nohemi Aeacute geometry', () => {
  const font = loadFont('Nohemi-VF.ttf').getVariation({ wght: 400 });
  const geo = buildGeometryCache(glyphFor(font, 'ǽ'), font);

  it('keeps both enclosed spaces and never treats the acute ink as a counter', () => {
    const counters = detectFeature(geo, 'counter');
    expect(counters).toHaveLength(2);
    expect(covers(counters, 1000, 600)).toBe(true);
    expect(covers(counters, 2900, 1600)).toBe(true);
    expect(covers(counters, 2230, 2600)).toBe(false);
    expect(covers(counters, 3000, 1120)).toBe(false);
    expect(covers(counters, 250, 550)).toBe(false);
  });

  it('locates the e eye above its bar and retains the separate a counter', () => {
    const result = reconcileFeatures(
      detectGlyphFeatures(geo, ['counter', 'eye'])
    );
    const eyes = result.get('eye') ?? [];
    const counters = result.get('counter') ?? [];
    expect(eyes).toHaveLength(1);
    expect(counters).toHaveLength(1);
    expect(covers(eyes, 2900, 1600)).toBe(true);
    expect(covers(eyes, 1000, 600)).toBe(false);
    expect(covers(counters, 1000, 600)).toBe(true);
    expect(covers(counters, 2900, 1600)).toBe(false);
  });

  it('offers the compound anatomy and accent rather than unrelated Latin defaults', () => {
    const ids = getFeatureHints('ǽ', geo.context).map((hint) => hint.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        'crossbar',
        'bowl',
        'counter',
        'eye',
        'aperture',
        'stem',
        'accent',
      ])
    );
    for (const id of ['apex', 'vertex', 'tail', 'tittle'])
      expect(ids).not.toContain(id);
  });

  it('highlights the acute mark without fabricating a tittle or extreme-point features', () => {
    const accents = detectFeature(geo, 'accent');
    expect(accents).toHaveLength(1);
    expect(covers(accents, 2230, 2600)).toBe(true);
    expect(covers(accents, 2900, 2100)).toBe(false);
    for (const id of ['tittle', 'apex', 'vertex', 'tail'] as const) {
      expect(detectFeature(geo, id)).toEqual([]);
    }
  });

  it('highlights the aperture mouth rather than the whole open counter', () => {
    const apertures = detectFeature(geo, 'aperture');
    expect(covers(apertures, 3750, 800)).toBe(true);
    expect(covers(apertures, 2900, 600)).toBe(false);
    expect(covers(apertures, 2900, 1600)).toBe(false);
    expect(covers(apertures, 3000, 1120)).toBe(false);
  });
});

describe('eyes require an enclosure over an open lower counter', () => {
  for (const filename of [
    'Nohemi-VF.ttf',
    'InterVariable.ttf',
    'Newsreader-VF.ttf',
  ] as const) {
    const font = loadFont(filename).getVariation({ wght: 400, opsz: 32 });
    it(`${filename} recognizes e while rejecting ordinary a g and o counters`, () => {
      expect(
        detectFeature(buildGeometryCache(glyphFor(font, 'e'), font), 'eye')
      ).toHaveLength(1);
      for (const character of ['a', 'g', 'o', 'O']) {
        expect(
          detectFeature(
            buildGeometryCache(glyphFor(font, character), font),
            'eye'
          )
        ).toEqual([]);
      }
    });
  }
});

describe('structural dots and diacritics remain distinct in compounds', () => {
  const font = loadFont('Nohemi-VF.ttf');
  it('attaches the fi dot to its own i stem rather than the taller f body', () => {
    const geo = buildGeometryCache(glyphFor(font, 'ﬁ'), font);
    const tittles = detectFeature(geo, 'tittle');
    expect(tittles).toHaveLength(1);
    expect(covers(tittles, 2047, 2710)).toBe(true);
    expect(covers(tittles, 2047, 1100)).toBe(false);
    expect(detectFeature(geo, 'accent')).toEqual([]);
  });
  it('keeps i acute and diaeresis marks separate from structural dots', () => {
    for (const [character, count] of [
      ['í', 1],
      ['ï', 2],
    ] as const) {
      const geo = buildGeometryCache(glyphFor(font, character), font);
      expect(detectFeature(geo, 'tittle')).toEqual([]);
      expect(detectFeature(geo, 'accent')).toHaveLength(count);
    }
  });
});
