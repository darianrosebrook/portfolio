import { beforeAll, describe, expect, it } from 'vitest';
import type { Font } from 'fontkit';
import { rayHits } from '@/utils/geometry/geometryCore';
import { buildGeometryCache } from '@/utils/typeAnatomy/geometryCache';
import {
  detectFeature,
  reconcileFeatures,
} from '@/utils/typeAnatomy/detectorRegistry';
import type { FeatureID, FeatureInstance } from '@/utils/typeAnatomy/types';
import {
  detect,
  glyphFor,
  loadFont,
  pointInPolygon,
  shapeBBox,
} from '@/test/utils/fixtures/fontFixtures';

describe('stem regions follow glyph backbones', () => {
  let font: Font;
  beforeAll(() => {
    font = loadFont('Nohemi-VF.ttf');
  });

  it.each([100, 400, 617.41, 900])(
    'tracks both A legs in the actual weight %s instance',
    (wght) => {
      const varied = font.getVariation({ wght, opsz: 32 });
      const glyph = glyphFor(varied, 'A');
      const geo = buildGeometryCache(glyph, varied);
      const stems = detectFeature(geo, 'stem');
      expect(stems).toHaveLength(2);
      expect(stems.map((s) => s.shape.type)).toEqual(['polyline', 'polyline']);

      // Probe actual leg ink below and above the connecting bar. Each side's
      // interior width must stay in the same slanted mask across the height.
      const ordered = [...stems].sort(
        (a, b) => shapeBBox(a.shape).minX - shapeBBox(b.shape).minX
      );
      for (const fraction of [0.12, 0.5, 0.78]) {
        const y =
          glyph.bbox.minY + fraction * (glyph.bbox.maxY - glyph.bbox.minY);
        const { points } = rayHits(
          geo.svgShape,
          { x: glyph.bbox.minX - geo.scale.overshoot * 0.1, y },
          0,
          geo.scale.overshoot
        );
        expect(points).toHaveLength(4);
        for (const side of [0, 1]) {
          for (const across of [0.1, 0.5, 0.9]) {
            const point = {
              x:
                points[side * 2].x +
                across * (points[side * 2 + 1].x - points[side * 2].x),
              y,
            };
            expect(pointInPolygon(point, ordered[side].region!.points)).toBe(
              true
            );
            expect(
              pointInPolygon(point, ordered[1 - side].region!.points)
            ).toBe(false);
          }
        }
      }

      const bars = detectFeature(geo, 'crossbar');
      expect(bars).toHaveLength(1);
      const bar = shapeBBox(bars[0].shape);
      const y = (bar.minY + bar.maxY) / 2;
      // Probe the connector's interior, away from its overlap with the legs.
      // The left point at weight 400 was inside an old vertical stem mask.
      for (const fraction of [0.25, 0.65]) {
        const point = { x: bar.minX + fraction * (bar.maxX - bar.minX), y };
        expect(pointInPolygon(point, bars[0].region!.points)).toBe(true);
        expect(stems.some((s) => pointInPolygon(point, s.region!.points))).toBe(
          false
        );
      }

      const crotches = detectFeature(geo, 'crotch');
      expect(crotches).toHaveLength(1);
      const selected = new Map<FeatureID, FeatureInstance[]>([
        ['crossbar', bars],
        ['crotch', crotches],
        ['stem', stems],
      ]);
      const reconciled = reconcileFeatures(selected);
      expect(reconciled.get('stem')).toEqual(stems);
      expect(reconciled.get('crossbar')).toEqual(bars);
      expect(reconciled.get('crotch')).toEqual(crotches);
    }
  );

  it.each([
    ['H', 2],
    ['T', 1],
    ['E', 1],
    ['M', 2],
  ] as const)('preserves %s straight stems', (char, count) => {
    const varied = font.getVariation({ wght: 400, opsz: 32 });
    const glyph = glyphFor(varied, char);
    const stems = detect(varied, char, 'stem');
    expect(stems).toHaveLength(count);
    for (const stem of stems) {
      expect(stem.shape.type).toBe('rect');
      const bounds = shapeBBox(stem.shape);
      expect(bounds.minY).toBeCloseTo(glyph.bbox.minY, 4);
      expect(bounds.maxY).toBeCloseTo(glyph.bbox.maxY, 4);
      expect(
        pointInPolygon(
          { x: (bounds.minX + bounds.maxX) / 2, y: glyph.bbox.maxY * 0.25 },
          stem.region!.points
        )
      ).toBe(true);
    }
  });

  it('returns no regions for a blank glyph', () => {
    expect(detect(font, ' ', 'stem')).toEqual([]);
  });

  it('keeps the b backbone and excludes its far-right bowl edge', () => {
    const glyph = glyphFor(font, 'b');
    const geo = buildGeometryCache(glyph, font);
    const stems = detectFeature(geo, 'stem');
    expect(stems).toHaveLength(1);
    expect(stems[0].shape.type).toBe('rect');
    const y = glyph.bbox.minY + (glyph.bbox.maxY - glyph.bbox.minY) * 0.25;
    const { points } = rayHits(
      geo.svgShape,
      { x: glyph.bbox.minX - geo.scale.overshoot * 0.1, y },
      0,
      geo.scale.overshoot
    );
    expect(points).toHaveLength(4);
    const leftInk = { x: (points[0].x + points[1].x) / 2, y };
    const bowlInk = { x: (points[2].x + points[3].x) / 2, y };
    expect(pointInPolygon(leftInk, stems[0].region!.points)).toBe(true);
    expect(pointInPolygon(bowlInk, stems[0].region!.points)).toBe(false);
    const bounds = shapeBBox(stems[0].shape);
    expect(bounds.minX).toBeCloseTo(glyph.bbox.minX, 4);
    expect(bounds.maxX).toBeLessThan(
      glyph.bbox.minX + (glyph.bbox.maxX - glyph.bbox.minX) * 0.3
    );
  });

  it.each([400, 617.41, 700, 900])(
    'retains both H upright boundaries at weight %s',
    (wght) => {
      const varied = font.getVariation({ wght, opsz: 32 });
      const glyph = glyphFor(varied, 'H');
      const stems = detect(varied, 'H', 'stem');
      expect(stems).toHaveLength(2);
      const ordered = [...stems].sort(
        (a, b) => shapeBBox(a.shape).minX - shapeBBox(b.shape).minX
      );
      expect(shapeBBox(ordered[0].shape).minX).toBeCloseTo(glyph.bbox.minX, 4);
      expect(shapeBBox(ordered[1].shape).maxX).toBeCloseTo(glyph.bbox.maxX, 4);
      for (const stem of stems) {
        expect(stem.shape.type).toBe('rect');
        const bounds = shapeBBox(stem.shape);
        expect(bounds.minY).toBeCloseTo(glyph.bbox.minY, 4);
        expect(bounds.maxY).toBeCloseTo(glyph.bbox.maxY, 4);
      }
    }
  );
});
