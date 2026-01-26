/**
 * Mock glyph and font factories for typographic feature detection tests.
 * Provides utilities to create test glyphs from SVG path strings.
 */
import { shape } from 'svg-intersections';
import type { Glyph, Font, Path } from 'fontkit';

/**
 * Standard font metrics for testing.
 * Based on typical Latin font proportions with 1000 units per em.
 */
export const standardMetrics = {
  baseline: 0,
  xHeight: 500,
  capHeight: 700,
  ascent: 800,
  descent: -200,
};

/**
 * Creates a minimal mock Glyph from an SVG path string and bounding box.
 * The mock contains only the properties accessed by feature detection heuristics.
 *
 * @param d - SVG path data string
 * @param bbox - Bounding box with minX, minY, maxX, maxY
 * @param options - Optional overrides for glyph properties
 * @returns Mock Glyph object
 */
export function mockGlyphFromPath(
  d: string,
  bbox: { minX: number; minY: number; maxX: number; maxY: number },
  options: {
    id?: number;
    name?: string;
    codePoints?: number[];
    advanceWidth?: number;
  } = {}
): Glyph {
  // Parse path commands using svg-intersections
  const commandsShape = shape('path', { d }) as { params: unknown[] };
  const commands = (commandsShape.params?.[0] as unknown[]) ?? [];

  // Create a lightweight path object
  const path = {
    toSVG: () => d,
    commands,
  } as unknown as Path;

  return {
    id: options.id ?? 0,
    name: options.name ?? 'mock',
    codePoints: options.codePoints ?? [],
    path,
    bbox: bbox as Glyph['bbox'],
    cbox: bbox as Glyph['cbox'],
    advanceWidth: options.advanceWidth ?? bbox.maxX - bbox.minX,
    render: () => {},
  } as unknown as Glyph;
}

/**
 * Creates a non-drawable mock glyph (missing path or bbox).
 * Useful for testing error handling in feature detectors.
 *
 * @param variant - Type of non-drawable glyph to create
 * @returns Mock Glyph object that fails isDrawable() check
 */
export function mockNonDrawableGlyph(
  variant: 'null-path' | 'no-commands' | 'null-bbox' | 'empty'
): Glyph {
  const baseBbox = { minX: 0, minY: 0, maxX: 100, maxY: 100 };

  switch (variant) {
    case 'null-path':
      return {
        id: 0,
        name: 'non-drawable',
        codePoints: [],
        path: null,
        bbox: baseBbox,
        advanceWidth: 100,
      } as unknown as Glyph;

    case 'no-commands':
      return {
        id: 0,
        name: 'non-drawable',
        codePoints: [],
        path: { toSVG: () => '', commands: null },
        bbox: baseBbox,
        advanceWidth: 100,
      } as unknown as Glyph;

    case 'null-bbox':
      return {
        id: 0,
        name: 'non-drawable',
        codePoints: [],
        path: { toSVG: () => 'M0 0', commands: [] },
        bbox: null,
        advanceWidth: 100,
      } as unknown as Glyph;

    case 'empty':
    default:
      return {} as Glyph;
  }
}

/**
 * Creates a minimal mock Font for detectors that require font context.
 *
 * @param options - Optional font properties
 * @returns Mock Font object
 */
export function mockFont(
  options: {
    unitsPerEm?: number;
    postscriptName?: string;
    fontMatrix?: number[];
  } = {}
): Font {
  return {
    unitsPerEm: options.unitsPerEm ?? 1000,
    postscriptName: options.postscriptName ?? 'MockFont',
    fontMatrix: options.fontMatrix ?? [1, 0, 0, 1, 0, 0],
    // Minimal required properties for fontkit Font interface
    fullName: 'Mock Font',
    familyName: 'Mock',
    subfamilyName: 'Regular',
    copyright: '',
    version: 1,
    ascent: 800,
    descent: -200,
    lineGap: 0,
    underlinePosition: -100,
    underlineThickness: 50,
    italicAngle: 0,
    capHeight: 700,
    xHeight: 500,
    bbox: { minX: 0, minY: -200, maxX: 1000, maxY: 800 },
    numGlyphs: 1,
    characterSet: [],
    availableFeatures: [],
    glyphsForString: () => [],
    hasGlyphForCodePoint: () => false,
    glyphForCodePoint: () => ({} as Glyph),
    layout: () => ({ glyphs: [], positions: [] }),
    stringsForGlyph: () => [],
    getGlyph: () => ({} as Glyph),
    createSubset: () => ({}),
    variationAxes: {},
    namedVariations: {},
    getVariation: () => ({} as Font),
  } as unknown as Font;
}

/**
 * Creates a mock glyph representing a specific character.
 * Useful for creating realistic test scenarios.
 *
 * @param char - The character to mock (e.g., 'a', 'A', 'i')
 * @param pathData - SVG path data for the character
 * @param bbox - Bounding box
 * @returns Mock Glyph object
 */
export function mockCharGlyph(
  char: string,
  pathData: string,
  bbox: { minX: number; minY: number; maxX: number; maxY: number }
): Glyph {
  return mockGlyphFromPath(pathData, bbox, {
    name: char,
    codePoints: [char.charCodeAt(0)],
  });
}
