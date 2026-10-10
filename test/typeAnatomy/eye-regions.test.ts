import { describe, expect, it } from 'vitest';
import { buildGeometryCache } from '@/utils/typeAnatomy/geometryCache';
import { detectFeature } from '@/utils/typeAnatomy/detectorRegistry';
import {
  bundledVariationExtremes,
  glyphFor,
  loadFont,
} from '@/test/utils/fixtures/fontFixtures';

describe('eye enclosure belongs to the e structure', () => {
  for (const name of [
    'Nohemi-VF.ttf',
    'InterVariable.ttf',
    'Newsreader-VF.ttf',
    'MonaspaceNeonVF.ttf',
  ] as const) {
    const font = loadFont(name);
    it(`${name} rejects ordinary capital enclosures`, () => {
      for (const character of ['A', 'B', 'D', 'P', 'R']) {
        const geo = buildGeometryCache(glyphFor(font, character), font);
        expect(detectFeature(geo, 'eye').length, character).toBe(0);
      }
    });
  }
});

describe.each(bundledVariationExtremes())(
  '$name $axes eye custody',
  ({ name, axes }) => {
    const font = loadFont(name).getVariation(axes);
    it('retains the actual e and Aeacute eye without adopting B enclosures', () => {
      for (const character of ['e', 'ǽ']) {
        const geo = buildGeometryCache(glyphFor(font, character), font);
        const eyes = detectFeature(geo, 'eye');
        expect(eyes, character).toHaveLength(1);
        expect(eyes[0].region?.points).toEqual(
          geo.filled!.enclosedRegions.find(
            (hole) =>
              hole.bbox.maxX ===
              Math.max(
                ...geo.filled!.enclosedRegions.map((region) => region.bbox.maxX)
              )
          )!.points
        );
      }
      for (const character of ['A', 'B', 'D', 'P', 'R']) {
        const geo = buildGeometryCache(glyphFor(font, character), font);
        expect(detectFeature(geo, 'eye').length, character).toBe(0);
      }
    });
  }
);
