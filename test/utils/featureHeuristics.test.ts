import { describe, it, expect } from 'vitest';
import {
  getBowl,
  getTittle,
  getEye,
} from '@/utils/geometry/geometryHeuristics';

import { buildGeometryCache } from '@/utils/typeAnatomy/geometryCache';
import {
  mockGlyphFromPath,
  mockFont,
  standardMetrics,
} from './fixtures/mockGlyph';
import { CIRCLE, DONUT } from './fixtures/svgPaths';
import { glyphFor, loadFont, pointInPolygon } from './fixtures/fontFixtures';

describe('Geometry heuristics (Fontkit path contracts)', () => {
  it('detects a simple bowl from a donut-like path', () => {
    const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);
    expect(getBowl(glyph, standardMetrics).found).toBe(true);
  });

  it('does not find a bowl in a solid circle', () => {
    const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);
    expect(getBowl(glyph, standardMetrics).found).toBe(false);
  });

  it('does not find tittle in paths without detached small contour', () => {
    const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);
    expect(getTittle(glyph, standardMetrics, mockFont()).found).toBe(false);
  });

  it('finds the enclosed eye above the e bar with a lower open counter', () => {
    const font = loadFont('Nohemi-VF.ttf').getVariation({ wght: 400 });
    for (const character of ['e', 'ǽ']) {
      const glyph = glyphFor(font, character);
      const eye = getEye(glyph, buildGeometryCache(glyph, font).metrics);
      expect(eye.found, character).toBe(true);
      expect(eye.shape?.type, character).toBe('polyline');
      if (eye.shape?.type !== 'polyline')
        throw new Error('Missing eye polygon');
      if (character === 'ǽ') {
        expect(pointInPolygon({ x: 2900, y: 1600 }, eye.shape.points)).toBe(
          true
        );
        for (const point of [
          { x: 1000, y: 600 }, // a counter
          { x: 2900, y: 600 }, // lower e opening
          { x: 3000, y: 1120 }, // bar ink
        ])
          expect(pointInPolygon(point, eye.shape.points)).toBe(false);
      }
    }
  });

  it('does not label round or stacked enclosures as an eye', () => {
    const font = loadFont('Nohemi-VF.ttf').getVariation({ wght: 400 });
    for (const character of ['O', 'o', 'B', 'R']) {
      const glyph = glyphFor(font, character);
      expect(getEye(glyph, buildGeometryCache(glyph, font).metrics)).toEqual({
        found: false,
      });
    }
  });
});
