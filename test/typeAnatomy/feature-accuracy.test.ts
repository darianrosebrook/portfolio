/**
 * Geometry accuracy tests for typographic anatomy detection.
 *
 * These tests intentionally assert anatomical expectations: a feature must be
 * found, have the right renderable shape family, and land in the expected
 * region of the glyph. They are separate from API-contract tests that only
 * prove detectors return without throwing.
 */

import { describe, expect, it, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as fontkit from 'fontkit';
import type { Font, Glyph } from 'fontkit';
import { buildGeometryCache } from '@/utils/typeAnatomy/geometryCache';
import { detectFeature } from '@/utils/typeAnatomy/detectorRegistry';
import type {
  BBox,
  FeatureID,
  FeatureInstance,
  FeatureShape,
} from '@/utils/typeAnatomy/types';

function loadFont(fontName: string): Font {
  const fontPath = path.join(process.cwd(), 'public', 'fonts', fontName);
  const buffer = fs.readFileSync(fontPath);
  return fontkit.create(buffer as unknown as Uint8Array) as Font;
}

function glyphFor(font: Font, char: string): Glyph {
  const codePoint = char.codePointAt(0);
  if (!codePoint) throw new Error(`Missing code point for ${char}`);
  return font.glyphForCodePoint(codePoint) as Glyph;
}

function detect(
  font: Font,
  char: string,
  featureId: FeatureID
): FeatureInstance[] {
  return detectFeature(
    buildGeometryCache(glyphFor(font, char), font),
    featureId
  );
}

function shapeBBox(shape: FeatureShape): BBox {
  switch (shape.type) {
    case 'circle':
      return {
        minX: shape.cx - shape.r,
        maxX: shape.cx + shape.r,
        minY: shape.cy - shape.r,
        maxY: shape.cy + shape.r,
      };
    case 'line':
      return {
        minX: Math.min(shape.x1, shape.x2),
        maxX: Math.max(shape.x1, shape.x2),
        minY: Math.min(shape.y1, shape.y2),
        maxY: Math.max(shape.y1, shape.y2),
      };
    case 'point':
      return {
        minX: shape.x,
        maxX: shape.x,
        minY: shape.y,
        maxY: shape.y,
      };
    case 'polyline': {
      const xs = shape.points.map((p) => p.x);
      const ys = shape.points.map((p) => p.y);
      return {
        minX: Math.min(...xs),
        maxX: Math.max(...xs),
        minY: Math.min(...ys),
        maxY: Math.max(...ys),
      };
    }
    case 'rect':
      return {
        minX: shape.x,
        maxX: shape.x + shape.width,
        minY: shape.y,
        maxY: shape.y + shape.height,
      };
    case 'path':
      throw new Error(
        'Path feature shapes need explicit anchors for accuracy tests'
      );
  }
}

function centerOf(shape: FeatureShape): { x: number; y: number } {
  const bbox = shapeBBox(shape);
  return {
    x: (bbox.minX + bbox.maxX) / 2,
    y: (bbox.minY + bbox.maxY) / 2,
  };
}

function normalized(
  point: { x: number; y: number },
  bbox: BBox
): { x: number; y: number } {
  return {
    x: (point.x - bbox.minX) / (bbox.maxX - bbox.minX),
    y: (point.y - bbox.minY) / (bbox.maxY - bbox.minY),
  };
}

function expectInRange(value: number, min: number, max: number): void {
  expect(value).toBeGreaterThanOrEqual(min);
  expect(value).toBeLessThanOrEqual(max);
}

describe('type anatomy geometry accuracy', () => {
  let nohemi: Font;

  beforeAll(() => {
    nohemi = loadFont('Nohemi-VF.ttf');
  });

  it('places the two H stems at the left and right sides of the glyph', () => {
    const glyph = glyphFor(nohemi, 'H');
    const stems = detect(nohemi, 'H', 'stem');

    expect(stems).toHaveLength(2);

    const sorted = [...stems].sort(
      (a, b) => centerOf(a.shape).x - centerOf(b.shape).x
    );

    const left = normalized(centerOf(sorted[0].shape), glyph.bbox);
    const right = normalized(centerOf(sorted[1].shape), glyph.bbox);
    expectInRange(left.x, 0, 0.25);
    expectInRange(right.x, 0.75, 1);

    for (const stem of stems) {
      expect(stem.shape.type).toBe('rect');
      const bbox = shapeBBox(stem.shape);
      const stemHeightRatio =
        (bbox.maxY - bbox.minY) / (glyph.bbox.maxY - glyph.bbox.minY);
      expect(stemHeightRatio).toBeGreaterThanOrEqual(0.85);
    }
  });

  it('places the e eye inside the upper-middle bowl region', () => {
    const glyph = glyphFor(nohemi, 'e');
    const eyes = detect(nohemi, 'e', 'eye');

    expect(eyes).toHaveLength(1);
    expect(eyes[0].shape.type).toBe('polyline');

    const eyeCenter = normalized(centerOf(eyes[0].shape), glyph.bbox);
    expectInRange(eyeCenter.x, 0.3, 0.7);
    expectInRange(eyeCenter.y, 0.5, 0.9);
  });

  it('places the Q tail below the baseline on the lower-right side', () => {
    const glyph = glyphFor(nohemi, 'Q');
    const tails = detect(nohemi, 'Q', 'tail');

    expect(tails).toHaveLength(1);
    expect(tails[0].shape.type).toBe('polyline');

    const tailBBox = shapeBBox(tails[0].shape);
    const tailCenter = normalized(centerOf(tails[0].shape), glyph.bbox);
    expect(tailBBox.minY).toBeLessThan(0);
    expectInRange(tailCenter.x, 0.75, 1);
    expectInRange(tailCenter.y, 0, 0.25);
  });

  it('places the S spine through the vertical body of the glyph', () => {
    const glyph = glyphFor(nohemi, 'S');
    const spines = detect(nohemi, 'S', 'spine');

    expect(spines).toHaveLength(1);
    expect(spines[0].shape.type).toBe('polyline');

    const spineBBox = shapeBBox(spines[0].shape);
    const glyphHeight = glyph.bbox.maxY - glyph.bbox.minY;
    const spineHeightRatio = (spineBBox.maxY - spineBBox.minY) / glyphHeight;
    expect(spineHeightRatio).toBeGreaterThanOrEqual(0.8);
  });
});

describe('known type anatomy accuracy gaps', () => {
  let nohemi: Font;

  beforeAll(() => {
    nohemi = loadFont('Nohemi-VF.ttf');
  });

  it.fails('detects the lowercase i tittle above the stem', () => {
    const glyph = glyphFor(nohemi, 'i');
    const tittles = detect(nohemi, 'i', 'tittle');

    expect(tittles).toHaveLength(1);
    expect(tittles[0].shape.type).toBe('circle');

    const center = normalized(centerOf(tittles[0].shape), glyph.bbox);
    expectInRange(center.x, 0.25, 0.75);
    expectInRange(center.y, 0.75, 1);
  });

  it.fails('does not report a tittle on an uppercase H', () => {
    expect(detect(nohemi, 'H', 'tittle')).toHaveLength(0);
  });

  it.fails(
    'detects one horizontal H crossbar centered between the stems',
    () => {
      const glyph = glyphFor(nohemi, 'H');
      const crossbars = detect(nohemi, 'H', 'crossbar');

      expect(crossbars).toHaveLength(1);
      expect(crossbars[0].shape.type).toBe('rect');

      const barBBox = shapeBBox(crossbars[0].shape);
      const barCenter = normalized(centerOf(crossbars[0].shape), glyph.bbox);
      const widthRatio =
        (barBBox.maxX - barBBox.minX) / (glyph.bbox.maxX - glyph.bbox.minX);
      const heightRatio =
        (barBBox.maxY - barBBox.minY) / (glyph.bbox.maxY - glyph.bbox.minY);

      expectInRange(barCenter.x, 0.35, 0.65);
      expectInRange(barCenter.y, 0.35, 0.65);
      expect(widthRatio).toBeGreaterThanOrEqual(0.45);
      expect(heightRatio).toBeLessThanOrEqual(0.2);
    }
  );

  it.fails(
    'detects the A crossbar as a horizontal bar, not a tall vertical region',
    () => {
      const glyph = glyphFor(nohemi, 'A');
      const crossbars = detect(nohemi, 'A', 'crossbar');

      expect(crossbars).toHaveLength(1);
      expect(crossbars[0].shape.type).toBe('rect');

      const barBBox = shapeBBox(crossbars[0].shape);
      const widthRatio =
        (barBBox.maxX - barBBox.minX) / (glyph.bbox.maxX - glyph.bbox.minX);
      const heightRatio =
        (barBBox.maxY - barBBox.minY) / (glyph.bbox.maxY - glyph.bbox.minY);

      expect(widthRatio).toBeGreaterThanOrEqual(0.2);
      expect(heightRatio).toBeLessThanOrEqual(0.15);
    }
  );
});
