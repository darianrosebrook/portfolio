/**
 * Real-font fixtures and helpers for type anatomy accuracy tests.
 *
 * Loads fonts from public/fonts/ via fontkit, builds a GeometryCache, and
 * exposes shape-bbox / centering / normalization utilities so accuracy tests
 * can assert positional ground truth (e.g., "the H crossbar center sits in
 * the middle 30% of the glyph") without re-implementing the math each time.
 *
 * Loaders THROW on missing fonts. Silent guards (if (!font) return) defeat the
 * point of accuracy tests by letting them pass when fixtures are absent.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as fontkit from 'fontkit';
import type { Font, Glyph } from 'fontkit';
import { expect } from 'vitest';
import { buildGeometryCache } from '@/utils/typeAnatomy/geometryCache';
import { detectFeature } from '@/utils/typeAnatomy/detectorRegistry';
import type {
  BBox,
  FeatureID,
  FeatureInstance,
  FeatureShape,
  Point2D,
  RegionPolygon,
} from '@/utils/typeAnatomy/types';

export type FontName =
  | 'Nohemi-VF.ttf'
  | 'InterVariable.ttf'
  | 'Newsreader-VF.ttf';

export function loadFont(fontName: FontName): Font {
  const fontPath = path.join(process.cwd(), 'public', 'fonts', fontName);
  const buffer = fs.readFileSync(fontPath);
  return fontkit.create(buffer as unknown as Uint8Array) as Font;
}

export function glyphFor(font: Font, char: string): Glyph {
  const codePoint = char.codePointAt(0);
  if (codePoint === undefined) {
    throw new Error(`Missing code point for ${char}`);
  }
  return font.glyphForCodePoint(codePoint) as Glyph;
}

export function detect(
  font: Font,
  char: string,
  featureId: FeatureID
): FeatureInstance[] {
  return detectFeature(
    buildGeometryCache(glyphFor(font, char), font),
    featureId
  );
}

export function shapeBBox(shape: FeatureShape): BBox {
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

export function centerOf(shape: FeatureShape): { x: number; y: number } {
  const bbox = shapeBBox(shape);
  return {
    x: (bbox.minX + bbox.maxX) / 2,
    y: (bbox.minY + bbox.maxY) / 2,
  };
}

export function normalized(
  point: { x: number; y: number },
  bbox: BBox
): { x: number; y: number } {
  return {
    x: (point.x - bbox.minX) / (bbox.maxX - bbox.minX),
    y: (point.y - bbox.minY) / (bbox.maxY - bbox.minY),
  };
}

export function expectInRange(value: number, min: number, max: number): void {
  expect(value).toBeGreaterThanOrEqual(min);
  expect(value).toBeLessThanOrEqual(max);
}

export function regionBBox(region: RegionPolygon): BBox {
  const xs = region.points.map((p) => p.x);
  const ys = region.points.map((p) => p.y);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

/** Even-odd point-in-polygon test. */
export function pointInPolygon(p: Point2D, polygon: Point2D[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i];
    const b = polygon[j];
    const intersect =
      a.y > p.y !== b.y > p.y &&
      p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x;
    if (intersect) inside = !inside;
  }
  return inside;
}
