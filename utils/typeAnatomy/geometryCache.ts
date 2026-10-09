/**
 * Geometry cache for typographic feature detection.
 *
 * This module provides:
 * - buildGeometryCache: Creates cached geometry data per glyph+variation
 * - classifyContours: Separates base/mark/hole contours
 * - flattenToSegments: Converts path to cubic segments with metadata
 *
 * The cache is keyed by (fontPostscriptName, glyphId, variationSettingsHash)
 * and invalidates when variation settings change.
 */

import { rayHits as geometryRayHits } from '@/utils/geometry/geometryCore';
import {
  buildFilledGeometry,
  getFilledGeometry,
  registerFilledShape,
  contourWinding,
  occupiedRayIntervals,
  type FilledGeometry,
} from '@/utils/geometry/filledGeometry';
import type { Font, Glyph } from '@/ui/modules/FontInspector/fontkit-types';
import { shape } from 'svg-intersections';
import type {
  BBox,
  ContourClassification,
  DetectionContext,
  GeometryCache,
  Metrics,
  Point2D,
  ScalePrimitives,
  SegmentWithMeta,
  SvgShape,
} from './types';
import { rejectsAsMainBodyFragment } from './evidence/topology';

/**
 * Cache storage using WeakMap for automatic garbage collection.
 * Keyed by glyph object, then by variation key string.
 */
let geometryCacheStorage = new WeakMap<Glyph, Map<string, GeometryCache>>();

/**
 * Per-font DetectionContext memo.
 *
 * `buildDetectionContext` runs geometry-based serif detection that casts rays
 * against I/l/i/L test glyphs. That work is font-level (the answer does not
 * change per glyph), so it is memoized on the font object. Without this,
 * building a GeometryCache for every glyph in an alphabet re-runs the same
 * four-glyph probe ~26 times.
 */
let detectionContextCache = new WeakMap<Font, DetectionContext>();

/**
 * Builds or retrieves a cached GeometryCache for a glyph.
 *
 * @param glyph - The fontkit glyph object
 * @param font - The fontkit font object
 * @param variationSettings - Optional variation axis settings (for variable fonts)
 * @returns GeometryCache with all pre-computed geometric data
 */
export function buildGeometryCache(
  glyph: Glyph,
  font: Font,
  variationSettings?: Record<string, number>
): GeometryCache {
  // Generate variation key for cache lookup
  const variationKey = variationSettings
    ? JSON.stringify(
        Object.entries(variationSettings)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => [k, v])
      )
    : 'default';

  // Check cache
  let glyphCache = geometryCacheStorage.get(glyph);
  if (glyphCache?.has(variationKey)) {
    return glyphCache.get(variationKey)!;
  }

  // Build new cache entry
  const metrics = extractMetrics(font);
  const svgShape = glyphToShape(glyph);
  const segments = flattenToSegments(glyph);
  const filled = getFilledGeometry(glyph);
  registerFilledShape(svgShape as object, filled);
  const contours = classifyContours(glyph, segments, metrics, filled);
  const context = buildDetectionContext(font);
  const italicAngle = context.italicAngle;
  const scale = computeScalePrimitives(glyph, font, filled);

  const cache: GeometryCache = {
    glyph,
    font,
    metrics,
    svgShape,
    filled,
    segments,
    contours,
    italicAngle,
    variationKey,
    context,
    scale,
  };

  // Store in cache
  if (!glyphCache) {
    glyphCache = new Map();
    geometryCacheStorage.set(glyph, glyphCache);
  }
  glyphCache.set(variationKey, cache);

  return cache;
}

/**
 * Extracts font metrics from a font object.
 */
function extractMetrics(font: Font): Metrics {
  const currentReferenceHeight = (
    character: string,
    metadata: number
  ): number => {
    try {
      const codePoint = character.codePointAt(0)!;
      if (!font.hasGlyphForCodePoint(codePoint)) return metadata;
      const glyph = font.glyphForCodePoint(codePoint);
      const height = glyph?.bbox?.maxY;
      return glyph?.id !== 0 && Number.isFinite(height) && height > 0
        ? height
        : metadata;
    } catch {
      return metadata;
    }
  };
  return {
    baseline: 0,
    xHeight: currentReferenceHeight('x', font.xHeight || 0),
    capHeight: currentReferenceHeight('H', font.capHeight || 0),
    ascent: font.ascent || 0,
    descent: font.descent || 0,
  };
}

/**
 * Computes scale-aware primitives for consistent detector thresholds.
 * These values are derived from glyph geometry and should be used
 * instead of raw UPM multipliers.
 */
function computeScalePrimitives(
  glyph: Glyph,
  font: Font,
  filled: FilledGeometry
): ScalePrimitives {
  const bbox = glyph.bbox;
  const upm = font.unitsPerEm || 1000;

  const bboxW = bbox.maxX - bbox.minX;
  const bboxH = bbox.maxY - bbox.minY;

  // Base epsilon: max of UPM-based and bbox-based
  const eps = Math.max(upm * 0.001, Math.min(bboxW, bboxH) * 0.001);

  // Overshoot for ray casting
  const overshoot = Math.max(bboxW, bboxH) * 2;

  const stemWidth = estimateStemWidth(filled);

  return {
    eps,
    bboxW,
    bboxH,
    stemWidth,
    overshoot,
  };
}

/**
 * Estimates typical stroke width from repeated occupied spans in the largest
 * body's interior. Rows and columns make horizontal bars and vertical stems
 * comparable. Each line contributes only its narrowest span, so a multi-stem
 * row cannot outweigh other rows; the lower quartile requires support beyond
 * an isolated narrow tip and tolerates rows merging across a connector.
 */
function estimateStemWidth(filled: FilledGeometry): number {
  const main = filled.bodies[0];
  if (!main) return 0;
  const bounds = main.bbox;
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  if (!(width > 0 && height > 0)) return 0;
  const padding = Math.max(width, height) * 0.05;
  const estimates: number[] = [];
  for (const vertical of [false, true]) {
    const spans: number[] = [];
    for (let row = 1; row <= 9; row++) {
      const origin = vertical
        ? { x: bounds.minX + (width * row) / 10, y: bounds.minY - padding }
        : { x: bounds.minX - padding, y: bounds.minY + (height * row) / 10 };
      const intervals = occupiedRayIntervals(
        filled,
        origin,
        vertical ? Math.PI / 2 : 0,
        (vertical ? height : width) + padding * 2
      );
      const widths = intervals
        .filter((interval) => {
          const midpoint = {
            x: (interval.near.x + interval.far.x) / 2,
            y: (interval.near.y + interval.far.y) / 2,
          };
          return (
            contourWinding(main.points, midpoint) !== 0 &&
            !filled.bodies
              .slice(1)
              .some((body) => contourWinding(body.points, midpoint) !== 0)
          );
        })
        .map((interval) => interval.end - interval.start)
        .filter((span) => span > 0);
      if (widths.length) spans.push(Math.min(...widths));
    }
    if (spans.length < 3) continue;
    spans.sort((a, b) => a - b);
    estimates.push(spans[Math.floor(spans.length / 4)]);
  }
  return estimates.length ? Math.min(...estimates) : 0;
}

/**
 * Gets the italic angle from the font (0 for upright).
 */
function variationCoordinate(font: Font, axis: string): number | undefined {
  const variable = font as Font & {
    variationCoords?: number[] | null;
    variationAxes?: Record<string, { default: number }>;
  };
  const keys = Object.keys(variable.variationAxes ?? {});
  const index = keys.indexOf(axis);
  if (index < 0) return undefined;
  return (
    variable.variationCoords?.[index] ?? variable.variationAxes?.[axis]?.default
  );
}

/** Advance spacing identifies fixed-cell fonts even when post.isFixedPitch is
 * unset (texture-healing fonts can retain proportional-looking outlines). */
function hasFixedAdvanceSpacing(font: Font): boolean {
  const probes = ['I', 'i', 'W', 'M', '0', ' '];
  try {
    const glyphs = probes.map((char) =>
      font.glyphForCodePoint(char.codePointAt(0)!)
    );
    if (
      glyphs.some(
        (glyph) =>
          !glyph ||
          glyph.id === 0 ||
          !Number.isFinite(glyph.advanceWidth) ||
          glyph.advanceWidth <= 0
      )
    )
      return false;
    const advance = glyphs[0].advanceWidth;
    return glyphs.every(
      (glyph) =>
        Math.abs(glyph.advanceWidth - advance) <=
        Number.EPSILON * Math.max(1, advance) * 32
    );
  } catch {
    return false;
  }
}

/**
 * Builds detection context with font-level flags.
 * Uses geometry-based serif detection for more accurate classification.
 *
 * Memoized per-font: the result is font-level (not glyph-level) and computing
 * it requires ray-casting against several test glyphs, so it must not re-run
 * on every GeometryCache build.
 */
function buildDetectionContext(font: Font): DetectionContext {
  const cached = detectionContextCache.get(font);
  if (cached) return cached;

  const fontAny = font as Font & {
    post?: { italicAngle?: number; isFixedPitch?: boolean };
    'OS/2'?: { usWeightClass?: number };
  };

  const italicAngle =
    variationCoordinate(font, 'slnt') ?? fontAny.post?.italicAngle ?? 0;
  const isItalic =
    Math.abs(italicAngle) > 0.5 ||
    (variationCoordinate(font, 'ital') ?? 0) >= 0.5;
  const isMono =
    Boolean(fontAny.post?.isFixedPitch) || hasFixedAdvanceSpacing(font);
  const weight =
    variationCoordinate(font, 'wght') ?? fontAny['OS/2']?.usWeightClass ?? 400;
  const unitsPerEm = font.unitsPerEm || 1000;

  // Use geometry-based serif detection with fallback to name heuristics
  const isSerif = detectSerifFromFont(font);

  const context: DetectionContext = {
    isSerif,
    isItalic,
    italicAngle,
    isMono,
    weight,
    unitsPerEm,
  };

  detectionContextCache.set(font, context);
  return context;
}

/**
 * Detects if a font is serif by analyzing glyph geometry.
 * Falls back to name-based heuristics if geometry analysis is inconclusive.
 */
function detectSerifFromFont(font: Font): boolean {
  // Try geometry-based detection first
  const testGlyphs = ['I', 'l', 'i', 'L'];

  for (const char of testGlyphs) {
    try {
      const codePoint = char.codePointAt(0);
      if (!codePoint) continue;

      const glyph = font.glyphForCodePoint(codePoint) as Glyph;
      if (!glyph?.path?.commands || !glyph.bbox) continue;

      const hasSerif = analyzeGlyphTerminals(glyph, font);
      if (hasSerif !== null) {
        return hasSerif;
      }
    } catch {
      continue;
    }
  }

  // Fallback to name-based heuristics
  return detectSerifFromName(font);
}

/**
 * Analyzes a glyph's terminals for serif characteristics.
 * Returns true if serifs detected, false if no serifs, null if inconclusive.
 */
function analyzeGlyphTerminals(glyph: Glyph, _font: Font): boolean | null {
  const svgShape = glyphToShape(glyph);
  const bbox = glyph.bbox;

  const bboxW = bbox.maxX - bbox.minX;
  const bboxH = bbox.maxY - bbox.minY;
  const overshoot = Math.max(bboxW, bboxH) * 2;

  // Measure stroke width at mid-height
  const midY = (bbox.minY + bbox.maxY) / 2;
  const midOrigin = { x: bbox.minX - overshoot * 0.1, y: midY };
  const midHits = geometryRayHits(svgShape, midOrigin, 0, overshoot);

  if (midHits.points.length < 2) return null;

  // Find the narrowest span at mid-height (the stem)
  let strokeWidth = Infinity;
  for (let i = 0; i < midHits.points.length - 1; i += 2) {
    const w = midHits.points[i + 1].x - midHits.points[i].x;
    if (w > 0 && w < strokeWidth) {
      strokeWidth = w;
    }
  }
  if (!Number.isFinite(strokeWidth) || strokeWidth <= 0) return null;

  // Measure total width at baseline (near bottom of glyph)
  const baseY = bbox.minY + bboxH * 0.02;
  const baseOrigin = { x: bbox.minX - overshoot * 0.1, y: baseY };
  const baseHits = geometryRayHits(svgShape, baseOrigin, 0, overshoot);

  if (baseHits.points.length < 2) return null;

  // Calculate total span at baseline
  const baseWidth =
    baseHits.points[baseHits.points.length - 1].x - baseHits.points[0].x;

  // Serif indicator: width at terminal is wider than stroke
  const widthRatio = baseWidth / strokeWidth;

  // Serif fonts typically have widthRatio > 1.15
  if (widthRatio > 1.15) {
    return true;
  } else if (widthRatio < 1.08) {
    return false;
  }

  // Inconclusive - check at top as well
  const topY = bbox.maxY - bboxH * 0.02;
  const topOrigin = { x: bbox.minX - overshoot * 0.1, y: topY };
  const topHits = geometryRayHits(svgShape, topOrigin, 0, overshoot);

  if (topHits.points.length >= 2) {
    const topWidth =
      topHits.points[topHits.points.length - 1].x - topHits.points[0].x;
    const topRatio = topWidth / strokeWidth;

    if (topRatio > 1.15) {
      return true;
    } else if (topRatio < 1.08) {
      return false;
    }
  }

  return null;
}

/**
 * Fallback: detect serif by font name patterns.
 */
function detectSerifFromName(font: Font): boolean {
  const fontName = (font.fullName || font.familyName || '').toLowerCase();

  // Common sans indicators to exclude first
  const sansPatterns = [
    'sans',
    'grotesk',
    'gothic',
    'helvetica',
    'arial',
    'roboto',
    'inter',
    'nohemi',
    'monaspace',
    'neon',
  ];

  for (const pattern of sansPatterns) {
    if (fontName.includes(pattern)) {
      return false;
    }
  }

  // Common serif font indicators
  const serifPatterns = [
    'serif',
    'times',
    'georgia',
    'palatino',
    'garamond',
    'cambria',
    'bodoni',
    'didot',
    'baskerville',
    'caslon',
    'century',
    'minion',
    'newsreader',
  ];

  for (const pattern of serifPatterns) {
    if (fontName.includes(pattern)) {
      return true;
    }
  }

  return false;
}

/**
 * Converts a glyph to an svg-intersections path shape.
 */
function glyphToShape(glyph: Glyph): SvgShape {
  const d = dFor(glyph);
  try {
    return shape('path', { d });
  } catch {
    console.error('[glyphToShape] Error creating shape for path:', d);
    return shape('path', { d: 'M0 0' });
  }
}

/**
 * Returns SVG path data string for a glyph, or empty if not drawable.
 */
function dFor(glyph: Glyph): string {
  try {
    if (!glyph || !glyph.path || typeof glyph.path.toSVG !== 'function') {
      return 'M0 0';
    }
    const d = glyph.path.toSVG();
    if (!d || typeof d !== 'string' || d.trim() === '') return 'M0 0';
    return d;
  } catch {
    console.error('[dFor] Error generating SVG path for glyph');
    return 'M0 0';
  }
}

/**
 * Flattens glyph path commands to segments.
 *
 * Each segment carries its `type` and control `params` (Point2D[]). Tangent /
 * normal / direction metadata is intentionally NOT computed here: those fields
 * are declared optional on SegmentWithMeta and no current detector or renderer
 * reads them. Computing them was per-segment Bezier-derivative dead work.
 * A future medial-axis / segment-opposition substrate can repopulate them.
 */
export function flattenToSegments(glyph: Glyph): SegmentWithMeta[] {
  if (!glyph?.path?.commands) return [];

  const segments: SegmentWithMeta[] = [];
  let currentPoint: Point2D | null = null;

  for (const cmd of glyph.path.commands) {
    const seg: SegmentWithMeta = {
      type: cmd.command,
      params: [],
    };

    switch (cmd.command) {
      case 'moveTo': {
        const [x, y] = cmd.args;
        currentPoint = { x, y };
        seg.params = [currentPoint];
        break;
      }

      case 'lineTo': {
        const [x, y] = cmd.args;
        const endPoint = { x, y };
        if (currentPoint) {
          seg.params = [currentPoint, endPoint];
        }
        currentPoint = endPoint;
        break;
      }

      case 'quadraticCurveTo': {
        const [cx, cy, x, y] = cmd.args;
        const controlPoint = { x: cx, y: cy };
        const endPoint = { x, y };
        if (currentPoint) {
          seg.params = [currentPoint, controlPoint, endPoint];
        }
        currentPoint = endPoint;
        break;
      }

      case 'bezierCurveTo': {
        const [c1x, c1y, c2x, c2y, x, y] = cmd.args;
        const c1 = { x: c1x, y: c1y };
        const c2 = { x: c2x, y: c2y };
        const endPoint = { x, y };
        if (currentPoint) {
          seg.params = [currentPoint, c1, c2, endPoint];
        }
        currentPoint = endPoint;
        break;
      }

      case 'closePath': {
        seg.params = currentPoint ? [currentPoint] : [];
        break;
      }
    }

    segments.push(seg);
  }

  return segments;
}

/**
 * Classifies contours as base, mark, or hole.
 *
 * Classification rules:
 * - Holes: Source contours whose bounded interior is void in nonzero fill
 * - Marks: Small disconnected contours above x-height (or below baseline)
 *   that do NOT overlap any other non-hole contour (negative-pressure
 *   invariant from TYPEANATOMY-001 — main-body classification first,
 *   position second; this is what makes `H` produce zero marks even though
 *   the crossbar opening sits above x-height)
 * - Base: Everything else (main glyph shape, plus any non-hole contour
 *   that fails mark classification)
 *
 * The shared fill model supplies topology before mark-position checks.
 * Compound self-touching body contours stay base; their derived voids live
 * in filled.enclosedRegions rather than requiring separate source contours.
 */
export function classifyContours(
  glyph: Glyph,
  segments: SegmentWithMeta[],
  metrics: Metrics,
  filled?: import('@/utils/geometry/filledGeometry').FilledGeometry
): ContourClassification[] {
  const model = filled ?? buildFilledGeometry(glyph, segments);
  // A source contour is a hole only when its geometric interior is void in
  // the complete fill. Absolute winding sign is arbitrary across fonts.
  const raw = model.contours.map((contour) => {
    const ownInterior = contour.points.find((a, i) => {
      const b = contour.points[(i + 1) % contour.points.length];
      const dx = b.x - a.x,
        dy = b.y - a.y;
      const length = Math.hypot(dx, dy);
      if (!length) return false;
      const sign = Math.sign(contour.signedArea) || 1;
      const epsilon = Math.min(length * 1e-5, 1e-3);
      const p = {
        x: (a.x + b.x) / 2 - (dy / length) * epsilon * sign,
        y: (a.y + b.y) / 2 + (dx / length) * epsilon * sign,
      };
      return (
        contourWinding(contour.points, p) !== 0 &&
        model.contours.reduce(
          (sum, c) => sum + contourWinding(c.points, p),
          0
        ) === 0
      );
    });
    // Separate simple source holes from a compound body contour that also
    // encloses voids: the latter stays base; enclosedRegions carries its holes.
    const hole =
      !!ownInterior &&
      !model.bodies.some((body) =>
        body.points.some((p) =>
          contour.points.some((q) => p.x === q.x && p.y === q.y)
        )
      );
    return { contour, hole };
  });
  const nonHoleBBoxes = raw.filter((r) => !r.hole).map((r) => r.contour.bbox);
  return raw.map(({ contour, hole }) => ({
    index: contour.index,
    type: hole
      ? 'hole'
      : isMarkContour(contour.bbox, metrics, glyph.bbox, nonHoleBBoxes)
        ? 'mark'
        : 'base',
    bbox: contour.bbox,
    area: Math.abs(contour.signedArea),
    winding: Math.sign(contour.signedArea),
    startIndex: contour.startIndex,
    endIndex: contour.endIndex,
  }));
}

/**
 * Determines if a contour is likely a mark/diacritic.
 *
 * Two-stage classification:
 *   1. Topology rejection: a contour overlapping any other non-hole
 *      contour's bbox is part of the main body, regardless of position.
 *      0.5-design-unit epsilon absorbs sub-design-unit drift from Bezier
 *      endpoint extraction in flattenToSegments.
 *   2. Positional check: the contour sits clearly above x-height (tittle,
 *      diaeresis, acute) OR below baseline (cedilla, ogonek).
 *
 * Compactness checks (size relative to stem width, aspect ratio, height
 * fraction of x-height) are intentionally NOT applied here. They are the
 * detector's responsibility via `isCompactContour` from the topology
 * evidence family. Reasoning: a contour can be classified as a mark
 * without being tittle-shaped — e.g., a wide diacritic bar above x-height
 * is still a "mark," just not a tittle. Per-detector compactness gates
 * keep classification general and detection-specific.
 */
function isMarkContour(
  bbox: BBox,
  metrics: Metrics,
  _glyphBBox: { minX: number; maxX: number; minY: number; maxY: number },
  otherNonHoleBBoxes: BBox[]
): boolean {
  if (rejectsAsMainBodyFragment(bbox, otherNonHoleBBoxes, 0.5)) {
    return false;
  }

  // Mark if positioned above x-height (like tittle on i, j)
  const isAboveXHeight = bbox.minY > metrics.xHeight * 0.8;

  // Mark if positioned below baseline (like cedilla)
  const isBelowBaseline = bbox.maxY < metrics.baseline;

  return isAboveXHeight || isBelowBaseline;
}

/**
 * Invalidates cached geometry for a glyph.
 * Call this when variation settings change.
 */
export function invalidateGeometryCache(glyph: Glyph): void {
  geometryCacheStorage.delete(glyph);
}

/**
 * Clears all cached geometry.
 * Use sparingly - mainly for testing or memory pressure.
 */
export function clearAllGeometryCache(): void {
  geometryCacheStorage = new WeakMap();
  detectionContextCache = new WeakMap();
}

/**
 * Gets base contours only (excludes marks and holes).
 */
export function getBaseContours(cache: GeometryCache): ContourClassification[] {
  return cache.contours.filter((c) => c.type === 'base');
}

/**
 * Gets mark contours only (diacritics, tittles).
 */
export function getMarkContours(cache: GeometryCache): ContourClassification[] {
  return cache.contours.filter((c) => c.type === 'mark');
}

/**
 * Gets hole contours only (counters, enclosed spaces).
 */
export function getHoleContours(cache: GeometryCache): ContourClassification[] {
  return cache.contours.filter((c) => c.type === 'hole');
}
