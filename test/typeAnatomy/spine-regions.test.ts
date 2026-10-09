import { describe, expect, it } from 'vitest';
import { buildGeometryCache } from '@/utils/typeAnatomy/geometryCache';
import {
  detectFeature,
  detectGlyphFeatures,
  reconcileFeatures,
} from '@/utils/typeAnatomy/detectorRegistry';
import {
  glyphFor,
  loadFont,
  pointInPolygon,
} from '@/test/utils/fixtures/fontFixtures';

describe('spines follow one curved open body', () => {
  for (const filename of [
    'Nohemi-VF.ttf',
    'InterVariable.ttf',
    'Newsreader-VF.ttf',
  ] as const) {
    const font = loadFont(filename).getVariation({ wght: 400, opsz: 32 });
    for (const character of ['O', 'o', 'c', 'H', 'X']) {
      it(`${filename} ${character} is not an S spine`, () => {
        expect(
          detectFeature(
            buildGeometryCache(glyphFor(font, character), font),
            'spine'
          )
        ).toEqual([]);
      });
    }
    it(`${filename} retains a bowl when Spine is requested too`, () => {
      const geo = buildGeometryCache(glyphFor(font, 'O'), font);
      const selected = reconcileFeatures(
        detectGlyphFeatures(geo, ['bowl', 'spine'])
      );
      expect(selected.get('bowl')).toHaveLength(1);
      expect(selected.get('spine') ?? []).toEqual([]);
    });
    for (const character of ['s', 'S']) {
      it(`${filename} ${character} covers the real curved stroke`, () => {
        const geo = buildGeometryCache(glyphFor(font, character), font);
        const spines = detectFeature(geo, 'spine');
        expect(spines).toHaveLength(1);
        const region = spines[0].region!;
        // The central crossing belongs to the spine; remote space does not.
        const center = {
          x: (geo.glyph.bbox.minX + geo.glyph.bbox.maxX) / 2,
          y: (geo.glyph.bbox.minY + geo.glyph.bbox.maxY) / 2,
        };
        expect(region.kind).toBe('stroke');
        expect(pointInPolygon(center, region.points)).toBe(true);
        expect(
          pointInPolygon(
            { x: geo.glyph.bbox.maxX + 10, y: center.y },
            region.points
          )
        ).toBe(false);
      });
    }
  }
});
