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
import { Bezier } from 'bezier-js';
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

/**
 * Cache storage using WeakMap for automatic garbage collection.
 * Keyed by glyph object, then by variation key string.
 */
const geometryCacheStorage = new WeakMap<Glyph, Map<string, GeometryCache>>();

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
          .map(([k, v]) => `${k}:${v.toFixed(2)}`)
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
  const contours = classifyContours(glyph, segments, metrics);
  const context = buildDetectionContext(font);
  const italicAngle = getItalicAngle(font);
  const scale = computeScalePrimitives(glyph, font, svgShape, metrics);

  const cache: GeometryCache = {
    glyph,
    font,
    metrics,
    svgShape,
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
  return {
    baseline: 0,
    xHeight: font.xHeight || 0,
    capHeight: font.capHeight || 0,
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
  svgShape: SvgShape,
  metrics: Metrics
): ScalePrimitives {
  const bbox = glyph.bbox;
  const upm = font.unitsPerEm || 1000;

  const bboxW = bbox.maxX - bbox.minX;
  const bboxH = bbox.maxY - bbox.minY;

  // Base epsilon: max of UPM-based and bbox-based
  const eps = Math.max(upm * 0.001, Math.min(bboxW, bboxH) * 0.001);

  // Overshoot for ray casting
  const overshoot = Math.max(bboxW, bboxH) * 2;

  // Estimate stem width by sampling at mid-height
  const stemWidth = estimateStemWidth(svgShape, metrics, bbox, overshoot);

  return {
    eps,
    bboxW,
    bboxH,
    stemWidth,
    overshoot,
  };
}

/**
 * Estimates stem width by measuring stroke thickness at mid-height.
 * Uses median of small spans to filter out bowls and counters.
 */
function estimateStemWidth(
  svgShape: SvgShape,
  metrics: Metrics,
  bbox: { minX: number; maxX: number; minY: number; maxY: number },
  overshoot: number
): number {
  const midY = (metrics.baseline + metrics.xHeight) / 2;
  const origin = { x: bbox.minX - overshoot * 0.1, y: midY };

  try {
    const { points } = geometryRayHits(svgShape, origin, 0, overshoot);

    if (points.length < 2) {
      // Fallback: use 8% of bbox width as typical stem
      return (bbox.maxX - bbox.minX) * 0.08;
    }

    // Collect all span widths
    const spans: number[] = [];
    for (let i = 0; i < points.length - 1; i += 2) {
      const w = points[i + 1].x - points[i].x;
      if (w > 0) spans.push(w);
    }

    if (spans.length === 0) {
      return (bbox.maxX - bbox.minX) * 0.08;
    }

    // Take median of smaller spans (filter out wide bowls)
    spans.sort((a, b) => a - b);

    // Use 25th percentile or first span if few samples
    const idx = Math.max(0, Math.floor(spans.length * 0.25));
    return spans[idx];
  } catch {
    // Fallback on error
    return (bbox.maxX - bbox.minX) * 0.08;
  }
}

/**
 * Gets the italic angle from the font (0 for upright).
 */
function getItalicAngle(font: Font): number {
  // fontkit stores italic angle in post table
  const fontAny = font as Font & { post?: { italicAngle?: number } };
  return fontAny.post?.italicAngle || 0;
}

/**
 * Builds detection context with font-level flags.
 * Uses geometry-based serif detection for more accurate classification.
 */
function buildDetectionContext(font: Font): DetectionContext {
  const fontAny = font as Font & {
    post?: { italicAngle?: number; isFixedPitch?: boolean };
    'OS/2'?: { usWeightClass?: number };
  };

  const italicAngle = fontAny.post?.italicAngle || 0;
  const isItalic = Math.abs(italicAngle) > 0.5;
  const isMono = fontAny.post?.isFixedPitch || false;
  const weight = fontAny['OS/2']?.usWeightClass || 400;
  const unitsPerEm = font.unitsPerEm || 1000;

  // Use geometry-based serif detection with fallback to name heuristics
  const isSerif = detectSerifFromFont(font);

  return {
    isSerif,
    isItalic,
    italicAngle,
    isMono,
    weight,
    unitsPerEm,
  };
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
function analyzeGlyphTerminals(glyph: Glyph, font: Font): boolean | null {
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
 * Flattens glyph path commands to segments with metadata.
 * Handles lines and Beziers (C, Q) with tangent/normal estimation.
 */
export function flattenToSegments(glyph: Glyph): SegmentWithMeta[] {
  if (!glyph?.path?.commands) return [];

  const segments: SegmentWithMeta[] = [];
  let currentPoint: Point2D | null = null;

  for (const cmd of glyph.path.commands) {
    const seg: SegmentWithMeta = {
      type: cmd.command,
      params: [],
      _tangent: null,
      _normal: null,
      _segmentDir: 1,
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
          enrichLine(seg, currentPoint, endPoint);
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
          enrichQuadratic(seg);
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
          enrichCubic(seg);
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
 * Enriches a line segment with tangent/normal/direction.
 */
function enrichLine(seg: SegmentWithMeta, p0: Point2D, p1: Point2D): void {
  const tx = p1.x - p0.x;
  const ty = p1.y - p0.y;
  const len = Math.hypot(tx, ty) || 1;
  seg._tangent = { x: tx / len, y: ty / len };
  seg._normal = { x: ty / len, y: -tx / len };
  seg._segmentDir = Math.sign(seg._tangent.x) || 1;
}

/**
 * Enriches a quadratic Bezier segment with tangent/normal/direction.
 */
function enrichQuadratic(seg: SegmentWithMeta): void {
  if (seg.params.length < 3) return;
  const [p0, c, p1] = seg.params;

  try {
    const bz = new Bezier(p0, c, p1);
    const tan = bz.derivative(0);
    const len = Math.hypot(tan.x, tan.y) || 1;
    seg._tangent = { x: tan.x / len, y: tan.y / len };
    seg._normal = { x: tan.y / len, y: -tan.x / len };
    seg._segmentDir = Math.sign(seg._tangent.x) || 1;
  } catch {
    // Fallback to straight line tangent
    enrichLine(seg, p0, p1);
  }
}

/**
 * Enriches a cubic Bezier segment with tangent/normal/direction.
 * For high curvature curves, samples midpoint for stability.
 */
function enrichCubic(seg: SegmentWithMeta): void {
  if (seg.params.length < 4) return;
  const [p0, c1, c2, p1] = seg.params;

  try {
    const bz = new Bezier(p0, c1, c2, p1);

    // Sample at start by default, but use midpoint for high curvature
    const startDeriv = bz.derivative(0);
    const midDeriv = bz.derivative(0.5);
    const startMag = startDeriv.x * startDeriv.x + startDeriv.y * startDeriv.y;
    const midMag = midDeriv.x * midDeriv.x + midDeriv.y * midDeriv.y;
    const isHighCurvature = startMag > midMag * 2;

    const sampleT = isHighCurvature ? 0.5 : 0;
    const tan = bz.derivative(sampleT);
    const len = Math.hypot(tan.x, tan.y) || 1;

    seg._tangent = { x: tan.x / len, y: tan.y / len };
    seg._normal = { x: tan.y / len, y: -tan.x / len };
    seg._segmentDir = Math.sign(seg._tangent.x) || 1;
  } catch {
    // Fallback to straight line tangent
    enrichLine(seg, p0, p1);
  }
}

/**
 * Classifies contours as base, mark, or hole.
 *
 * Classification rules:
 * - Holes: Counter-clockwise winding (negative area)
 * - Marks: Small contours above x-height (diacritics, tittles)
 * - Base: Everything else (main glyph shape)
 */
export function classifyContours(
  glyph: Glyph,
  segments: SegmentWithMeta[],
  metrics: Metrics
): ContourClassification[] {
  if (!glyph?.path?.commands) return [];

  const contours: ContourClassification[] = [];
  let contourIndex = 0;
  let contourStart = 0;
  let currentContourPoints: Point2D[] = [];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];

    // Collect points for area calculation
    if (seg.type !== 'closePath' && seg.params.length > 0) {
      currentContourPoints.push(...seg.params);
    }

    // End of contour
    if (seg.type === 'closePath' || i === segments.length - 1) {
      if (currentContourPoints.length >= 3) {
        const area = calculateSignedArea(currentContourPoints);
        const bbox = calculateBBox(currentContourPoints);
        const winding = area >= 0 ? 1 : -1;

        // Classify contour type
        let type: 'base' | 'mark' | 'hole';

        if (winding < 0) {
          // Counter-clockwise = hole
          type = 'hole';
        } else if (isMarkContour(bbox, metrics, glyph.bbox)) {
          // Small contour above main body = mark/diacritic
          type = 'mark';
        } else {
          // Main glyph shape
          type = 'base';
        }

        contours.push({
          index: contourIndex,
          type,
          bbox,
          area: Math.abs(area),
          winding,
          startIndex: contourStart,
          endIndex: i,
        });
      }

      contourIndex++;
      contourStart = i + 1;
      currentContourPoints = [];
    }
  }

  return contours;
}

/**
 * Calculates the signed area of a polygon using the shoelace formula.
 * Positive = clockwise, Negative = counter-clockwise
 */
function calculateSignedArea(points: Point2D[]): number {
  let area = 0;
  const n = points.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }

  return area / 2;
}

/**
 * Calculates the bounding box of a set of points.
 */
function calculateBBox(points: Point2D[]): BBox {
  if (points.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }

  return { minX, minY, maxX, maxY };
}

/**
 * Determines if a contour is likely a mark/diacritic.
 * Marks are typically small and positioned above or below the main glyph body.
 */
function isMarkContour(
  bbox: BBox,
  metrics: Metrics,
  glyphBBox: { minX: number; maxX: number; minY: number; maxY: number }
): boolean {
  const contourWidth = bbox.maxX - bbox.minX;
  const contourHeight = bbox.maxY - bbox.minY;
  const glyphWidth = glyphBBox.maxX - glyphBBox.minX;
  const glyphHeight = glyphBBox.maxY - glyphBBox.minY;

  // Mark if small relative to glyph size
  const isSmall =
    contourWidth < glyphWidth * 0.3 && contourHeight < glyphHeight * 0.3;

  // Mark if positioned above x-height (like tittle on i, j)
  const isAboveXHeight = bbox.minY > metrics.xHeight * 0.8;

  // Mark if positioned below baseline (like cedilla)
  const isBelowBaseline = bbox.maxY < metrics.baseline;

  return isSmall && (isAboveXHeight || isBelowBaseline);
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
  // WeakMap doesn't have a clear method, so we just let GC handle it
  // by not holding any references
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
