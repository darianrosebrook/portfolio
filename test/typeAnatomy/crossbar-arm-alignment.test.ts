import { describe, expect, it } from 'vitest';
import { rayHits } from '@/utils/geometry/geometryCore';
import {
  detectFeature,
  detectGlyphFeatures,
  reconcileFeatures,
} from '@/utils/typeAnatomy/detectorRegistry';
import { buildGeometryCache } from '@/utils/typeAnatomy/geometryCache';
import { getFeatureHints } from '@/utils/typeAnatomy/glyphFeatureHints';
import type { FeatureInstance, GeometryCache } from '@/utils/typeAnatomy/types';
import {
  glyphFor,
  loadFont,
  pointInPolygon,
  shapeBBox,
  type FontName,
} from '@/test/utils/fixtures/fontFixtures';

const fontNames: FontName[] = [
  'Nohemi-VF.ttf',
  'InterVariable.ttf',
  'Newsreader-VF.ttf',
];

function geometry(fontName: FontName, character: string, weight = 400) {
  const font = loadFont(fontName).getVariation({ wght: weight, opsz: 32 });
  return buildGeometryCache(glyphFor(font, character), font);
}

function covered(instances: FeatureInstance[], x: number, y: number) {
  return instances.some((instance) => {
    expect(instance.region?.kind).toBe('stroke');
    return pointInPolygon({ x, y }, instance.region!.points);
  });
}

/** Read top-stroke ink directly from the current outline, independent of detectors. */
function topInkSamples(geo: GeometryCache) {
  const { bbox } = geo.glyph;
  const samples = [];
  for (const fraction of [0.2, 0.3, 0.7, 0.8]) {
    const x = bbox.minX + geo.scale.bboxW * fraction;
    const { points } = rayHits(
      geo.svgShape,
      { x, y: bbox.minY - geo.scale.overshoot * 0.1 },
      Math.PI / 2,
      geo.scale.overshoot
    );
    expect(points.length).toBeGreaterThanOrEqual(2);
    const lo = points[points.length - 2].y;
    const hi = points[points.length - 1].y;
    expect(hi - lo).toBeGreaterThan(0);
    for (const depth of [0.25, 0.5, 0.75]) {
      samples.push({ x, y: lo + (hi - lo) * depth });
    }
  }
  return samples;
}

describe('T horizontal arms and vertical stem', () => {
  for (const fontName of fontNames) {
    for (const weight of [100, 400, 617, 700, 900]) {
      it(`${fontName} ${weight}: crossbar never claims the vertical stem`, () => {
        expect(
          detectFeature(geometry(fontName, 'T', weight), 'crossbar')
        ).toEqual([]);
      });

      it(`${fontName} ${weight}: Arm covers both top extensions and excludes mid-stem`, () => {
        const geo = geometry(fontName, 'T', weight);
        const arms = detectFeature(geo, 'arm');
        expect(arms.length).toBeGreaterThanOrEqual(1);
        expect(arms.length).toBeLessThanOrEqual(2);
        for (const point of topInkSamples(geo)) {
          expect(covered(arms, point.x, point.y), JSON.stringify(point)).toBe(
            true
          );
        }
        const midY = geo.glyph.bbox.minY + geo.scale.bboxH * 0.5;
        const { points } = rayHits(
          geo.svgShape,
          { x: geo.glyph.bbox.minX - geo.scale.overshoot * 0.1, y: midY },
          0,
          geo.scale.overshoot
        );
        expect(points).toHaveLength(2);
        expect(covered(arms, (points[0].x + points[1].x) / 2, midY)).toBe(
          false
        );
        for (const arm of arms) {
          const bounds = shapeBBox(arm.shape);
          expect(bounds.maxX - bounds.minX).toBeGreaterThan(
            bounds.maxY - bounds.minY
          );
          expect(bounds.minY).toBeGreaterThan(
            geo.glyph.bbox.minY + geo.scale.bboxH * 0.7
          );
        }
      });

      it(`${fontName} ${weight}: default Arm and Stem coexist after reconciliation`, () => {
        const geo = geometry(fontName, 'T', weight);
        const hints = getFeatureHints('T', geo.context);
        expect(hints.find((hint) => hint.id === 'arm')?.defaultOn).toBe(true);
        expect(hints.find((hint) => hint.id === 'stem')?.defaultOn).toBe(true);
        expect(hints.some((hint) => hint.id === 'crossbar')).toBe(false);
        const selected = hints
          .filter((hint) => hint.defaultOn)
          .map((hint) => hint.id);
        const regions = reconcileFeatures(detectGlyphFeatures(geo, selected));
        expect(regions.get('stem')).toHaveLength(1);
        const arms = regions.get('arm') ?? [];
        expect(arms.length).toBeGreaterThanOrEqual(1);
        for (const point of topInkSamples(geo)) {
          expect(covered(arms, point.x, point.y)).toBe(true);
        }
      });
    }
  }
});

describe('horizontal crossbar and non-arm controls', () => {
  for (const character of ['A', 'H', 'e', 'f', 't']) {
    it(`preserves a horizontal Nohemi ${character} crossbar`, () => {
      const bars = detectFeature(
        geometry('Nohemi-VF.ttf', character),
        'crossbar'
      );
      expect(bars.length).toBeGreaterThanOrEqual(1);
      for (const bar of bars) {
        const bounds = shapeBBox(bar.shape);
        expect(bounds.maxX - bounds.minX).toBeGreaterThan(
          bounds.maxY - bounds.minY
        );
      }
    });
  }

  for (const weight of [100, 400, 617, 700, 900]) {
    it(`does not promote Newsreader I ${weight} cap serifs to bilateral arms`, () => {
      expect(
        detectFeature(geometry('Newsreader-VF.ttf', 'I', weight), 'arm')
      ).toEqual([]);
    });
  }

  for (const character of ['f', 't']) {
    it(`covers Nohemi ${character} horizontal ink near x-height while excluding the lower stem`, () => {
      const geo = geometry('Nohemi-VF.ttf', character);
      const bars = detectFeature(geo, 'crossbar');
      expect(bars.length).toBeGreaterThanOrEqual(1);
      const y = geo.metrics.xHeight * 0.9;
      const x = geo.glyph.bbox.minX + geo.scale.bboxW * 0.8;
      const { points } = rayHits(
        geo.svgShape,
        { x: geo.glyph.bbox.minX - geo.scale.overshoot * 0.1, y },
        0,
        geo.scale.overshoot
      );
      const spans = [];
      for (let i = 0; i + 1 < points.length; i += 2) {
        spans.push({ x1: points[i].x, x2: points[i + 1].x });
      }
      expect(spans.some((span) => x > span.x1 && x < span.x2)).toBe(true);
      expect(covered(bars, x, y)).toBe(true);
      const lowerY = geo.metrics.xHeight * 0.45;
      const lowerHits = rayHits(
        geo.svgShape,
        { x: geo.glyph.bbox.minX - geo.scale.overshoot * 0.1, y: lowerY },
        0,
        geo.scale.overshoot
      ).points;
      expect(lowerHits).toHaveLength(2);
      expect(covered(bars, (lowerHits[0].x + lowerHits[1].x) / 2, lowerY)).toBe(
        false
      );
    });
  }

  for (const fontName of fontNames) {
    it(`${fontName}: blank glyph has no crossbar or arm`, () => {
      const geo = geometry(fontName, ' ');
      expect(detectFeature(geo, 'crossbar')).toEqual([]);
      expect(detectFeature(geo, 'arm')).toEqual([]);
    });
  }
});
