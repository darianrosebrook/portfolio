// NOTE: This file is browser-safe and does not import or use any Node.js-only modules.
// Node worker pool logic is now in utils/scanlineWorkerPool.node.ts
// NOTE: svg-intersections does not provide TypeScript types. See https://github.com/signavio/svg-intersections/issues/41
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: svg-intersections types may be missing
import './patch-kld';
import { shape, intersect } from 'svg-intersections';
import type { Glyph, Font } from 'fontkit';
import type { Point2D } from './geometry';
import { Bezier } from 'bezier-js';
import { Metrics } from '@/utils/typeAnatomy';

// Declare IntersectionQuery as global (for kld >= 0.4 point-in-path support)
declare const IntersectionQuery: unknown;

/**
 * Font metric lines for feature heuristics (canvas Y: up is negative).
 * All values are in font units, negative for upward Y.
 */

/**
 * Alias for svg-intersections shape objects.
 */
export type SvgShape = ReturnType<typeof shape>;

/**
 * Represents a geometric shape for a typographic feature.
 * @typedef {Object} FeatureShape
 * @property {'circle'|'polyline'|'path'} type - The type of shape.
 * @property {number} [cx] - Center X (for circle).
 * @property {number} [cy] - Center Y (for circle).
 * @property {number} [r] - Radius (for circle).
 * @property {Point2D[]} [points] - Polyline points (for polyline).
 * @property {string} [d] - SVG path data (for path).
 */
export type FeatureShape =
  | { type: 'circle'; cx: number; cy: number; r: number }
  | { type: 'polyline'; points: Point2D[] }
  | { type: 'path'; d: string };

/**
 * Result of a feature detection, including shape if found.
 * @typedef {Object} FeatureResult
 * @property {boolean} found - Whether the feature was found.
 * @property {FeatureShape=} shape - The shape of the feature, if found.
 */
export interface FeatureResult {
  found: boolean;
  shape?: FeatureShape;
}

/**
 * Finds a seed point inside a counter region of the glyph, if present.
 * Scans horizontal bands between baseline and xHeight, returns midpoint of first detected counter.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns Point2D inside the counter, or null if not found.
 */
export function counterSeed(g: Glyph, m: Metrics): Point2D | null {
  if (!isDrawable(g) || !g.path || !Array.isArray(g.path.commands)) {
    console.warn(
      '[counterSeed] Glyph is not drawable or has no path/commands:',
      g
    );
    return null;
  }
  const gs = shapeForV2(g);
  const overshoot = getOvershoot(g);
  const bands = 5;
  const delta = (g.bbox.maxX - g.bbox.minX) * 0.01; // 1% of width
  for (let i = 1; i < bands; i++) {
    const y = m.baseline + (i * (m.xHeight - m.baseline)) / bands;
    const origin = { x: -overshoot, y };
    let points: Point2D[] = [];
    try {
      const result = rayHits(gs, origin, 0, overshoot * 2);
      points = Array.isArray(result.points) ? result.points : [];
    } catch {
      console.warn('[counterSeed] Error in rayHits:', { g, m });
      continue;
    }
    if ((points.length / 2) % 2 === 1 && points.length >= 2) {
      for (let j = 0; j < points.length - 1; j += 2) {
        const x = (points[j].x + points[j + 1].x) / 2;
        // Try nudging the midpoint slightly inward and check isInside
        for (const nudge of [0, -delta, delta, -2 * delta, 2 * delta]) {
          const testPt = { x: x + nudge, y };
          if (isInside(g, testPt)) {
            return testPt;
          }
        }
      }
    }
  }
  return null;
}

/**
 * Grows a seed point into a region by radial sweep, returning a polyline shape.
 * @param g - The fontkit Glyph object.
 * @param seed - Seed point inside the region
 * @param step - Degrees per radial step (default 6)
 * @param rad - Start radius multiplier (default 1.5)
 * @returns FeatureShape polyline, or null if region not found
 */
export function traceRegion(
  g: Glyph,
  seed: Point2D,
  step = 6,
  rad = 1.5
): FeatureShape | null {
  if (!isDrawable(g) || !g.path || !Array.isArray(g.path.commands)) {
    console.warn(
      '[traceRegion] Glyph is not drawable or has no path/commands:',
      g
    );
    return null;
  }
  // Log the seed point for debugging
  console.log('[traceRegion] Starting trace from seed:', seed);
  const outline: Point2D[] = [];
  const overshoot = getOvershoot(g);
  for (let a = 0; a < 360; a += step) {
    const ang = (a * Math.PI) / 180;
    let len = rad;
    let lastInside = null;
    while (len < overshoot * 2) {
      const pt = {
        x: seed.x + Math.cos(ang) * len,
        y: seed.y + Math.sin(ang) * len,
      };
      let inside = false;
      try {
        inside = isInside(g, pt);
      } catch {
        console.warn('[traceRegion] Error in isInside:', { g, pt });
        break;
      }
      // Log each test point and result for the first few angles
      // if (a < 20) console.log('[traceRegion] Test pt:', pt, 'inside:', inside);
      if (!inside) {
        break;
      }
      lastInside = pt;
      len += rad;
    }
    if (lastInside) outline.push(lastInside);
  }
  if (outline.length < 6) {
    console.warn('[traceRegion] Outline too sparse or invalid:', outline);
    return null;
  }
  return { type: 'polyline', points: outline };
}

/**
 * Returns the counter feature as a FeatureResult (found + shape).
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns FeatureResult for counter
 */
export function getCounter(g: Glyph, m: Metrics): FeatureResult {
  if (!isDrawable(g) || !g.path || !Array.isArray(g.path.commands)) {
    console.warn(
      '[getCounter] Glyph is not drawable or has no path/commands:',
      g
    );
    return { found: false };
  }
  const seed = counterSeed(g, m);
  if (!seed) {
    console.warn('[getCounter] No seed found for counter:', { g, m });
    return { found: false };
  }
  // Log the seed and isInside result for debugging
  const inside = isInside(g, seed);
  console.log(
    '[getCounter] Seed point:',
    seed,
    'isInside:',
    inside,
    'glyph:',
    g
  );
  const poly = traceRegion(g, seed);
  if (poly && poly.type === 'polyline' && !Array.isArray(poly.points)) {
    return { found: false };
  }
  return poly ? { found: true, shape: poly } : { found: false };
}

/**
 * Returns the bowl feature as a FeatureResult (stub).
 * @param _g - The fontkit Glyph object.
 * @param _m - Font metrics
 * @returns FeatureResult for bowl
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getBowl(_g: Glyph, _m: Metrics): FeatureResult {
  // TODO: Implement bowl detection and region tracing
  return { found: false };
}

/**
 * Returns the tittle feature as a FeatureResult (stub).
 * @param _g - The fontkit Glyph object.
 * @param _m - Font metrics
 * @param _font - The fontkit Font object
 * @returns FeatureResult for tittle
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getTittle(_g: Glyph, _m: Metrics, _font: Font): FeatureResult {
  // TODO: Implement tittle detection and shape extraction
  return { found: false };
}

/**
 * Returns SVG path data string for a glyph, or empty if not drawable.
 * @param g - The fontkit Glyph object.
 * @returns SVG path data string
 */
export function dFor(g: Glyph): string {
  try {
    if (!g || !g.path || typeof g.path.toSVG !== 'function') return 'M0 0';
    const d = g.path.toSVG();
    if (!d || typeof d !== 'string' || d.trim() === '') return 'M0 0';
    return d;
  } catch {
    console.error('[dFor] Error generating SVG path for glyph:', { g });
    return 'M0 0';
  }
}

/**
 * Convert a Fontkit glyph to an svg-intersections PATH shape.
 * @param g - The fontkit Glyph object.
 * @returns svg-intersections path shape
 */
function glyphToShape(g: Glyph): SvgShape {
  const d = dFor(g);
  try {
    return shape('path', { d });
  } catch {
    console.error('[glyphToShape] Error creating shape for path:', d);
    return shape('path', { d: 'M0 0' });
  }
}

/**
 * Checks if a glyph is drawable (has path commands and bbox).
 * @param g - The fontkit Glyph object.
 * @returns boolean
 */
function isDrawable(g: Glyph): g is Glyph & { path: { commands: unknown[] } } {
  return !!(g && g.path && g.path.commands && g.bbox);
}

/**
 * Improved glyph shape cache: caches by composite key of glyph id/codePoint and font postscriptName.
 * Prevents memory leaks and improves cache hit rate for dynamic font/glyph use.
 */
const glyphShapeCacheV2 = new WeakMap<Glyph, SvgShape>();

/**
 * Caches and returns the svg-intersections shape for a glyph, using improved cache key.
 * @param g - The fontkit Glyph object.
 * @returns svg-intersections path shape (unknown type)
 */
function shapeForV2(g: Glyph): SvgShape {
  if (!glyphShapeCacheV2.has(g)) glyphShapeCacheV2.set(g, glyphToShape(g));
  return glyphShapeCacheV2.get(g)!;
}

/**
 * All probe logic now uses rayHits (direction-agnostic, memoized, and efficient).
 * Keep circle helper for tittle detection.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const circle = (cx: number, cy: number, r: number): SvgShape =>
  shape('circle', { cx, cy, r });

/**
 * Intersect any probe with a glyph, return point count + coords
 * @param glyphShape - svg-intersections path shape (unknown type)
 * @param probe - svg-intersections probe shape (unknown type)
 * @returns { count: number, points: Point2D[] }
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function hits(
  glyphShape: SvgShape,
  probe: SvgShape
): { count: number; points: Point2D[] } {
  try {
    const result = safeIntersect(glyphShape, probe) as { points: Point2D[] };
    return { count: result.points.length, points: result.points as Point2D[] };
  } catch {
    console.error('[hits] Error during intersection:', {
      glyphShape,
      probe,
    });
    return { count: 0, points: [] };
  }
}

/**
 * Checks if a point is inside the glyph outline using the fastest available method.
 * Uses IntersectionQuery.pointInPath if available (kld >= 0.4), else falls back to ray/winding number.
 * @param g - The fontkit Glyph object.
 * @param pt - The point to test.
 * @returns boolean
 */
export function isInside(g: Glyph, pt: Point2D): boolean {
  const gs = shapeForV2(g);
  // Feature check for IntersectionQuery.pointInPath (kld >= 0.4)
  const insideFast =
    typeof IntersectionQuery === 'object' &&
    IntersectionQuery !== null &&
    typeof (IntersectionQuery as { pointInPath?: unknown }).pointInPath ===
      'function'
      ? (
          IntersectionQuery as {
            pointInPath: (shape: SvgShape, pt: Point2D) => boolean;
          }
        ).pointInPath
      : null;
  if (insideFast) {
    return insideFast(gs, pt);
  }
  // Legacy fallback: cast a long horizontal ray from far left to pt.x
  const probe = shape('line', { x1: -1e6, y1: pt.y, x2: pt.x, y2: pt.y });
  return Math.abs(windingNumber(gs, probe)) % 2 === 1;
}

/**
 * Measures stroke thickness at (x, y) along the vertical direction.
 * @param g - The fontkit Glyph object.
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param font - The fontkit Font object
 * @returns thickness (number)
 */
export function strokeThickness(
  g: Glyph,
  x: number,
  y: number,
  font?: Font
): number {
  const gs = shapeForV2(g);
  const bboxW = g.bbox.maxX - g.bbox.minX;
  const bboxH = g.bbox.maxY - g.bbox.minY;
  const overshoot = Math.max(bboxW, bboxH) * 2;
  const { points } = rayHits(gs, { x, y }, 0, overshoot);
  const EPS = font ? getEPS(font) : 0.01;
  for (let i = 0; i < points.length - 1; i += 2) {
    if (
      points[i].y < y &&
      y < points[i + 1].y &&
      Math.abs(points[i + 1].x - points[i].x) > EPS
    ) {
      return points[i + 1].x - points[i].x;
    }
  }
  return 0;
}

/**
 * Returns a cached overshoot value for a glyph (max of bbox width/height * 2).
 * @param g - The fontkit Glyph object.
 * @returns overshoot (number)
 */
const overshootCache = new WeakMap<Glyph, number>();
function getOvershoot(g: Glyph): number {
  if (!overshootCache.has(g)) {
    const bboxW = g.bbox.maxX - g.bbox.minX;
    const bboxH = g.bbox.maxY - g.bbox.minY;
    overshootCache.set(g, Math.max(bboxW, bboxH) * 2);
  }
  return overshootCache.get(g)!;
}

/**
 * Returns a scale factor for the font, accounting for fontMatrix transforms (italic, bold, etc.).
 * @param font - The fontkit Font object
 * @returns scale factor (number)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getFontScale(font?: Font & { fontMatrix?: number[] }): number {
  // fontMatrix is [a, b, c, d, e, f] for 2D affine transform; scale is sqrt(a^2 + b^2)
  // Most fonts use [1,0,0,1,0,0], but oblique/italic may scale X or Y
  if (font && Array.isArray(font.fontMatrix)) {
    const m = font.fontMatrix;
    // Use X scale for horizontal metrics
    return Math.sqrt(m[0] * m[0] + m[1] * m[1]);
  }
  return 1;
}

/**
 * Detects if a glyph contains a counter (enclosed negative space).
 * Uses multiple horizontal scanlines between baseline and x-height.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns boolean
 */
export function hasCounter(g: Glyph, m: Metrics): boolean {
  if (!isDrawable(g)) return false;
  const gs = shapeForV2(g);
  const overshoot = getOvershoot(g);
  const bands = 5;
  let hitsAbove = 0;
  for (let i = 1; i < bands; i++) {
    const y = m.baseline + (i * (m.xHeight - m.baseline)) / bands;
    const origin = { x: -overshoot, y };
    const { points } = rayHits(gs, origin, 0, overshoot * 2);
    // Use (points.length/2) % 2 to detect enclosed regions
    if ((points.length / 2) % 2 === 1) hitsAbove++;
  }
  return hitsAbove >= 2;
}

/**
 * Detects if a glyph contains a stem (main vertical/diagonal stroke).
 * Uses vertical and diagonal scanlines and measures gap thickness at several Y positions.
 * Early bail-out after two bands with thick regions.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @param font - The fontkit Font object
 * @returns boolean
 */
export function hasStem(g: Glyph, m: Metrics, font: Font): boolean {
  if (!isDrawable(g)) return false;
  const gs = shapeForV2(g);
  const overshoot = getOvershoot(g);
  const UPEM = font.unitsPerEm ?? 1000;
  const scale = getFontScale(font);
  const THICK = UPEM * 0.03 * scale; // font-transform aware
  const EPS = getEPS(font) * scale;
  const bands = 5;
  let found = 0;
  for (let i = 1; i < bands; i++) {
    const y = m.baseline + (i * (m.xHeight - m.baseline)) / bands;
    // Vertical probe (horizontal ray)
    const origin = { x: -overshoot, y };
    const { points: vPoints } = rayHits(gs, origin, 0, overshoot * 2);
    let thick = false;
    for (let j = 0; j < vPoints.length - 1; j += 2) {
      if (vPoints[j + 1].x - vPoints[j].x > THICK + EPS) {
        thick = true;
        break;
      }
    }
    // Diagonal probe (both directions)
    const x = (g.bbox.minX + g.bbox.maxX) / 2;
    const diagOrigin1 = { x, y: 0 };
    const diagOrigin2 = { x, y: 0 };
    const { points: dPoints1 } = rayHits(gs, diagOrigin1, 0.21, overshoot);
    const { points: dPoints2 } = rayHits(gs, diagOrigin2, -0.21, overshoot);
    let thickDiag = false;
    let thickDiagOpposite = false;
    for (const arr of [dPoints1]) {
      for (let j = 0; j < arr.length - 1; j += 2) {
        if (arr[j + 1].x - arr[j].x > THICK) {
          thickDiag = true;
          break;
        }
      }
      if (thickDiag) break;
    }
    for (const arr of [dPoints2]) {
      for (let j = 0; j < arr.length - 1; j += 2) {
        if (arr[j + 1].x - arr[j].x > THICK) {
          thickDiagOpposite = true;
          break;
        }
      }
      if (thickDiagOpposite) break;
    }
    if (thick || (thickDiag && !thickDiagOpposite)) {
      found++;
      if (found >= 2) return true;
    }
  }
  return found >= 2;
}

/**
 * Detects if a glyph contains a bowl (fully enclosed curved counter).
 * Uses multiple vertical scanlines and intersection counting.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns boolean
 */
export function hasBowl(g: Glyph, m: Metrics): boolean {
  if (!isDrawable(g)) return false;
  const gs = shapeForV2(g);
  const overshoot = getOvershoot(g);
  const bboxW = g.bbox.maxX - g.bbox.minX;
  const steps = 5;
  let found = 0;
  for (let i = 1; i < steps; i++) {
    const x = g.bbox.minX + (bboxW * i) / steps;
    const origin = { x, y: -overshoot };
    const { points } = rayHits(gs, origin, Math.PI / 2, overshoot * 2);
    if (points.length >= 4) {
      const interior = points.filter(
        (p) => p.y > m.baseline && p.y < m.xHeight
      );
      if (interior.length >= 4) found++;
    }
  }
  return found >= 2;
}

/**
 * Detects if a glyph contains an arm (free horizontal/angled stroke).
 * Uses vertical scanline near right edge, slides inward until inside glyph.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns boolean
 */
export function hasArm(g: Glyph, m: Metrics): boolean {
  if (!isDrawable(g)) return false;
  const gs = shapeForV2(g);
  const overshoot = getOvershoot(g);
  let gx = g.bbox.maxX - 2;
  // Slide inward until a scan at gx is inside the glyph
  while (
    rayHits(gs, { x: gx, y: -overshoot }, Math.PI / 2, overshoot * 2).points
      .length === 0 &&
    gx > g.bbox.minX
  ) {
    gx -= 4;
  }
  const { points } = rayHits(
    gs,
    { x: gx, y: -overshoot },
    Math.PI / 2,
    overshoot * 2
  );
  if (points.length === 2) {
    return points[0].y > m.baseline && points[0].y < m.xHeight;
  }
  return false;
}

/**
 * Detects if a glyph contains a tail (descending, curved stroke).
 * Minimal: horizontal scan below baseline, one-sided intersection.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns boolean
 */
export function hasTail(g: Glyph, m: Metrics): boolean {
  if (!isDrawable(g)) return false;
  const gs = shapeForV2(g);
  const overshoot = getOvershoot(g);
  const y = m.baseline - (m.baseline - m.descent) * 0.5;
  const origin = { x: -overshoot, y };
  const { points } = rayHits(gs, origin, 0, overshoot * 2);
  // One-sided: odd number of intersections (entry but no exit)
  return points.length % 2 === 1;
}

/**
 * Detects if a glyph contains a loop (closed/partial below baseline, e.g. g, y).
 * Minimal: detect a bowl below baseline (baseline → descent band).
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns boolean
 */
export function hasLoop(g: Glyph, m: Metrics): boolean {
  if (!isDrawable(g)) return false;
  const gs = shapeForV2(g);
  const overshoot = getOvershoot(g);
  const bboxW = g.bbox.maxX - g.bbox.minX;
  // Horizontal scan below baseline (for g)
  const steps = 4;
  let found = 0;
  for (let i = 1; i < steps; i++) {
    const y = m.baseline - (i * (m.baseline - m.descent)) / steps;
    const origin = { x: -overshoot, y };
    const { points } = rayHits(gs, origin, 0, overshoot * 2);
    if (points.length >= 4) {
      const interior = points.filter(
        (p) => p.y < m.baseline && p.y > m.descent
      );
      if (interior.length >= 4) found++;
    }
  }
  // Vertical scan below baseline (for y)
  const vSteps = 4;
  for (let i = 1; i < vSteps; i++) {
    const x = (bboxW * i) / vSteps + g.bbox.minX;
    const origin = { x, y: -overshoot };
    const { points } = rayHits(gs, origin, Math.PI / 2, overshoot * 2);
    if (points.length >= 4) {
      const interior = points.filter(
        (p) => p.y < m.baseline && p.y > m.descent
      );
      if (interior.length >= 4) found++;
    }
  }
  return found >= 1;
}

/**
 * Detects if a glyph contains an apex (top meeting point, e.g. A, V).
 * Minimal: cast two 45° rays from center upward, check if they converge within EPS at top.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @param font - The fontkit Font object
 * @returns boolean
 */
export function hasApex(g: Glyph, m: Metrics, font: Font): boolean {
  if (!isDrawable(g)) return false;
  const gs = shapeForV2(g);
  const EPS = getEPS(font);
  const cx = (g.bbox.minX + g.bbox.maxX) / 2;
  const cy = m.capHeight;
  // 45° rays upward left/right
  const o = (g.bbox.maxY - g.bbox.minY) * 1.5;
  const leftRay = rayHits(gs, { x: cx, y: cy }, (Math.PI * 3) / 4, o); // 135°
  const rightRay = rayHits(gs, { x: cx, y: cy }, Math.PI / 4, o); // 45°
  const ptsL = leftRay.points;
  const ptsR = rightRay.points;
  if (ptsL.length && ptsR.length) {
    const topL = ptsL.reduce((a, b) => (a.y < b.y ? a : b));
    const topR = ptsR.reduce((a, b) => (a.y < b.y ? a : b));
    return Math.abs(topL.y - topR.y) < EPS && Math.abs(topL.x - topR.x) > EPS;
  }
  return false;
}

/**
 * Detects if a glyph contains a vertex (bottom meeting point, e.g. V, W).
 * Minimal: cast two 45° rays from center downward, check if they converge within EPS at bottom.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @param font - The fontkit Font object
 * @returns boolean
 */
export function hasVertex(g: Glyph, m: Metrics, font: Font): boolean {
  if (!isDrawable(g)) return false;
  const gs = shapeForV2(g);
  const EPS = getEPS(font);
  const cx = (g.bbox.minX + g.bbox.maxX) / 2;
  const cy = m.baseline;
  const o = (g.bbox.maxY - g.bbox.minY) * 1.5;
  const leftRay = rayHits(gs, { x: cx, y: cy }, (Math.PI * 5) / 4, o); // 225°
  const rightRay = rayHits(gs, { x: cx, y: cy }, (Math.PI * 7) / 4, o); // 315°
  const ptsL = leftRay.points;
  const ptsR = rightRay.points;
  if (ptsL.length && ptsR.length) {
    const botL = ptsL.reduce((a, b) => (a.y > b.y ? a : b));
    const botR = ptsR.reduce((a, b) => (a.y > b.y ? a : b));
    return Math.abs(botL.y - botR.y) < EPS && Math.abs(botL.x - botR.x) > EPS;
  }
  return false;
}

/**
 * Detects if a glyph contains a serif (terminal projection).
 * Minimal: at each vertical stem hit, cast a short horizontal ray outward; if thickness at y ± EPS spikes, it's a serif.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @param font - The fontkit Font object
 * @returns boolean
 */
export function hasSerif(g: Glyph, m: Metrics, font: Font): boolean {
  if (!isDrawable(g)) return false;
  const gs = shapeForV2(g);
  const scale = getFontScale(font);
  const EPS = getEPS(font) * scale;
  const bboxH = (g.bbox.maxY - g.bbox.minY) * scale;
  const overshoot = getOvershoot(g);
  const bands = 3;
  for (let i = 1; i < bands; i++) {
    const y = m.baseline + (i * (m.xHeight - m.baseline)) / bands;
    const origin = { x: -overshoot, y };
    const { points } = rayHits(gs, origin, 0, overshoot * 2);
    for (let j = 0; j < points.length - 1; j += 2) {
      // Cast short ray left/right from each stem edge
      const xL = points[j].x - EPS * 10;
      const xR = points[j + 1].x + EPS * 10;
      const leftProbe = rayHits(gs, { x: xL, y }, Math.PI / 2, bboxH * 0.2);
      const rightProbe = rayHits(gs, { x: xR, y }, Math.PI / 2, bboxH * 0.2);
      // Diagonal 45° downward ray from stem corner
      const diagL = rayHits(gs, { x: xL, y }, 0.785, EPS * 20); // 45° down
      const diagR = rayHits(gs, { x: xR, y }, -0.785, EPS * 20);
      if (
        leftProbe.points.length > 0 ||
        rightProbe.points.length > 0 ||
        (diagL.points.length > 0 &&
          diagL.points[0] &&
          Math.abs(diagL.points[0].x - xL) < EPS * 20) ||
        (diagR.points.length > 0 &&
          diagR.points[0] &&
          Math.abs(diagR.points[0].x - xR) < EPS * 20)
      ) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Detects if a glyph contains a finial (non-serif, non-ball terminal).
 * Uses diagonal probe: if no quick intersection, likely a square finial.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @param font - The fontkit Font object
 * @returns boolean
 */
export function hasFinial(g: Glyph, m: Metrics, font: Font): boolean {
  if (!isDrawable(g)) return false;
  const gs = shapeForV2(g);
  const scale = getFontScale(font);
  const EPS = getEPS(font) * scale;
  const overshoot = getOvershoot(g);
  const bands = 3;
  for (let i = 1; i < bands; i++) {
    const y = m.baseline + (i * (m.xHeight - m.baseline)) / bands;
    const origin = { x: -overshoot, y };
    const { points } = rayHits(gs, origin, 0, overshoot * 2);
    for (let j = 0; j < points.length - 1; j += 2) {
      const xL = points[j].x - EPS * 10;
      const xR = points[j + 1].x + EPS * 10;
      const diagL = rayHits(gs, { x: xL, y }, 0.785, EPS * 20);
      const diagR = rayHits(gs, { x: xR, y }, -0.785, EPS * 20);
      // If diagonal does NOT hit quickly, likely a square finial
      if (
        (!diagL.points.length ||
          (diagL.points[0] && Math.abs(diagL.points[0].x - xL) > EPS * 20)) &&
        (!diagR.points.length ||
          (diagR.points[0] && Math.abs(diagR.points[0].x - xR) > EPS * 20))
      ) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Returns the number of intersections between a glyph and an arc-shaped wedge probe.
 * Uses safeIntersect to avoid degenerate Bézier bugs (see svg-intersections issue #41).
 * @param gs - The glyph SvgShape
 * @param cx - Center X of the arc
 * @param cy - Center Y of the arc
 * @param r - Radius of the arc
 * @param startDeg - Start angle in degrees
 * @param sweepDeg - Sweep angle in degrees
 * @returns number of intersection points
 */
function hitsInWedge(
  gs: SvgShape,
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  sweepDeg: number
): number {
  const arcShape = shape('arc', {
    cx,
    cy,
    rx: r,
    ry: r,
    start: (startDeg * Math.PI) / 180,
    end: ((startDeg + sweepDeg) * Math.PI) / 180,
  });
  return safeIntersect(gs, arcShape).points.length;
}

/**
 * Detects if a glyph contains an ear (small projection, e.g. g, r).
 * Uses a wedge probe at the top-right of the glyph, sweeping outward.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns boolean
 */
export function hasEar(g: Glyph, m: Metrics): boolean {
  if (!isDrawable(g)) return false;
  const gs = shapeForV2(g);
  const bbox = g.bbox;
  const cx = bbox.maxX - (bbox.maxX - bbox.minX) * 0.2;
  const cy = m.xHeight + (m.ascent - m.xHeight) * 0.2;
  const r = (bbox.maxX - bbox.minX) * 0.3;
  // Wedge: 45° to 135° (top-right outward)
  const hits = hitsInWedge(gs, cx, cy, r, 45, 90);
  // TODO: Tune threshold for different glyphs
  return hits > 0;
}

/**
 * Detects if a glyph contains a spur (small projection, e.g. G, S).
 * Uses a wedge probe at the bottom-left, sweeping downward.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns boolean
 */
export function hasSpur(g: Glyph, m: Metrics): boolean {
  if (!isDrawable(g)) return false;
  const gs = shapeForV2(g);
  const bbox = g.bbox;
  const cx = bbox.minX + (bbox.maxX - bbox.minX) * 0.2;
  const cy = m.descent + (m.baseline - m.descent) * 0.2;
  const r = (bbox.maxX - bbox.minX) * 0.3;
  // Wedge: 225° to 315° (bottom-left downward)
  const hits = hitsInWedge(gs, cx, cy, r, 225, 90);
  // TODO: Tune threshold for different glyphs
  return hits > 0;
}

/**
 * Detects if a glyph contains a crotch (interior angle, e.g. A, V, W).
 * Uses a wedge probe between limbs, sweeping 30°.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns boolean
 */
export function hasCrotch(g: Glyph, m: Metrics): boolean {
  if (!isDrawable(g)) return false;
  const gs = shapeForV2(g);
  const bbox = g.bbox;
  const cx = (bbox.minX + bbox.maxX) / 2;
  const cy = m.baseline + (m.xHeight - m.baseline) * 0.2;
  const r = (bbox.maxX - bbox.minX) * 0.25;
  // Wedge: 80° to 110° (centered upward)
  const hits = hitsInWedge(gs, cx, cy, r, 80, 30);
  // TODO: Tune threshold for different glyphs
  return hits > 1;
}

/**
 * Detects if a glyph contains a bar (horizontal divider/crossbar).
 * Minimal: for each vertical stem, find two thick segments at the same Y; if distance between them is consistent across bands, it's a bar.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns boolean
 */
export function hasBar(g: Glyph, m: Metrics): boolean {
  if (!isDrawable(g)) return false;
  const gs = shapeForV2(g);
  const overshoot = getOvershoot(g);
  const bboxW = g.bbox.maxX - g.bbox.minX;
  const bands = 3;
  let prevDist: number | null = null;
  let consistent = 0;
  for (let i = 1; i < bands; i++) {
    const y = m.baseline + (i * (m.xHeight - m.baseline)) / bands;
    const origin = { x: -overshoot, y };
    const { points } = rayHits(gs, origin, 0, overshoot * 2);
    if (points.length >= 4) {
      const mid = points.length / 2;
      const dist = points[mid].x - points[mid - 1].x;
      if (prevDist !== null && Math.abs(dist - prevDist) < bboxW * 0.1) {
        consistent++;
      }
      prevDist = dist;
    }
  }
  return consistent >= 1;
}

/**
 * Detects if a glyph contains an eye (enclosed counter in e).
 * @param glyph - The fontkit Glyph object.
 * @returns boolean
 */
export function hasEye(): boolean {
  // TODO: Implement geometric analysis for eye detection
  return false;
}

/**
 * Returns a robust epsilon value for geometric comparisons, based on font unitsPerEm.
 * @param font - The fontkit Font object
 * @returns epsilon (number)
 */
function getEPS(font: Font): number {
  // 1e-4 of unitsPerEm is a safe default for most geometric tests
  return (font.unitsPerEm ?? 1000) * 1e-4;
}

/**
 * Casts a ray (line probe) at a glyph shape and returns intersection points.
 * Always creates a new probe shape to avoid mutation issues with svg-intersections.
 * Fail-safe: If intersection fails or returns invalid data, returns an empty array.
 * Logs glyph outline/path and probe parameters on error for debugging.
 * @param gs - SvgShape for the glyph
 * @param origin - Start point of the ray
 * @param angle - Angle in radians
 * @param len - Length of the ray
 * @returns { points: Point2D[] } Intersection points (empty if error)
 */
export function rayHits(
  gs: SvgShape,
  origin: Point2D,
  angle: number,
  len: number
): { points: Point2D[] } {
  // Always create a new probe shape to avoid mutation issues
  const dx = Math.cos(angle) * len;
  const dy = Math.sin(angle) * len;
  const probe = shape('line', {
    x1: origin.x,
    y1: origin.y,
    x2: origin.x + dx,
    y2: origin.y + dy,
  });
  let result: { points?: Point2D[] } | null | undefined;
  try {
    result = safeIntersect(gs, probe);
  } catch {
    // Fail-safe: log and return empty points
    console.error('[rayHits] Error during intersection:', {
      origin,
      angle,
      len,
      probe,
    });
    return { points: [] };
  }
  if (!result || !Array.isArray(result.points)) {
    // Defensive: always return a points array
    return { points: [] };
  }
  return { points: result.points ?? [] };
}

/**
 * Caches parsed path segments (IntersectionParams[]) for each glyph.
 */
const segCache = new WeakMap<Glyph, SegmentWithMeta[]>();

/**
 * Type for a path segment with injected metadata.
 */
type Point = { x: number; y: number };
type SegmentWithMeta = {
  type: string;
  params: Point[];
  _tangent: Point | null;
  _normal: Point | null;
  _segmentDir: number;
};

/**
 * Enriches a cubic or quadratic Bezier segment with tangent, normal, and direction metadata using Bezier.js.
 * @param seg - The segment to enrich
 */
function enrichBezier(seg: SegmentWithMeta) {
  const ctrl = seg.params;
  if (seg.type === 'C' && ctrl.length === 4) {
    // Cubic: [P0, C1, C2, P1]
    const bz = new Bezier(ctrl[0], ctrl[1], ctrl[2], ctrl[3]);
    const tan = bz.derivative(0);
    const len = Math.hypot(tan.x, tan.y) || 1;
    seg._tangent = { x: tan.x / len, y: tan.y / len };
    seg._normal = { x: tan.y / len, y: -tan.x / len };
    seg._segmentDir = Math.sign(seg._tangent.x);
  } else if (seg.type === 'Q' && ctrl.length === 3) {
    // Quadratic: [P0, C, P1]
    const bz = new Bezier(ctrl[0], ctrl[1], ctrl[2]);
    const tan = bz.derivative(0);
    const len = Math.hypot(tan.x, tan.y) || 1;
    seg._tangent = { x: tan.x / len, y: tan.y / len };
    seg._normal = { x: tan.y / len, y: -tan.x / len };
    seg._segmentDir = Math.sign(seg._tangent.x);
  }
  // TODO: For high curvature, sample midpoint or t=1 for more robust direction.
}

/**
 * Returns cached path segments for a glyph, parsing if needed.
 * Injects _normal, _tangent, and _segmentDir metadata for each segment.
 * Handles lines and Béziers (C, Q) with tangent/normal estimation.
 * @param g - The fontkit Glyph object
 * @returns SegmentWithMeta[]
 */
export function segmentsFor(g: Glyph): SegmentWithMeta[] {
  if (!segCache.has(g)) {
    const d = dFor(g);
    const shapeResult = shape('path', { d }) as { params: unknown[] };
    const params = shapeResult.params[0] as SegmentWithMeta[];
    for (const seg of params) {
      if (seg.type === 'L' || seg.type === 'M') {
        const [p0, p1] = seg.params;
        const tx = p1.x - p0.x;
        const ty = p1.y - p0.y;
        const len = Math.hypot(tx, ty) || 1;
        seg._tangent = { x: tx / len, y: ty / len };
        seg._normal = { x: ty / len, y: -tx / len };
        seg._segmentDir = Math.sign(seg._tangent.x);
      } else if (seg.type === 'C' || seg.type === 'Q') {
        enrichBezier(seg);
      } else {
        seg._tangent = null;
        seg._normal = null;
        seg._segmentDir = 1;
      }
    }
    segCache.set(g, params);
  }
  return segCache.get(g)!;
}

/**
 * Computes the signed winding number for a probe intersecting a glyph shape.
 * Uses segment1 index to look up _segmentDir from segmentsFor.
 * @param gs - The glyph SvgShape
 * @param probe - The probe SvgShape
 * @param segments - Precomputed segment metadata array
 * @returns signed winding number (0 = outside, ±N = inside)
 */
export function windingNumber(
  gs: SvgShape,
  probe: SvgShape,
  segments?: SegmentWithMeta[]
): number {
  const result = safeIntersect(gs, probe) as {
    points: (Point2D & { segment1?: number })[];
  };
  let wn = 0;
  for (const p of result.points) {
    let dir = 1;
    if (segments && typeof p.segment1 === 'number' && segments[p.segment1]) {
      dir = Math.sign(segments[p.segment1]._segmentDir ?? 1);
    }
    wn += dir;
  }
  return wn;
}

/**
 * Converts an SVG elliptical arc to an array of cubic Bezier curves.
 * Algorithm adapted from the SVG spec implementation notes and Pomax's reference.
 * @param p0 - Start point {x, y}
 * @param rx - X radius
 * @param ry - Y radius
 * @param xAxisRot - X axis rotation in degrees
 * @param largeArcFlag - Large arc flag (0 or 1)
 * @param sweepFlag - Sweep flag (0 or 1)
 * @param p1 - End point {x, y}
 * @returns Array of cubic Bezier segments, each as [P0, C1, C2, P1]
 */
function arcToCubics(
  p0: Point2D,
  rx: number,
  ry: number,
  xAxisRot: number,
  largeArcFlag: number,
  sweepFlag: number,
  p1: Point2D
): Array<[Point2D, Point2D, Point2D, Point2D]> {
  // Adapted from https://github.com/fontello/svgpath/blob/master/lib/a2c.js and Pomax's guide
  const TAU = Math.PI * 2;
  const rad = (a: number) => (a * Math.PI) / 180;
  const x1 = p0.x,
    y1 = p0.y,
    x2 = p1.x,
    y2 = p1.y;
  const phi = rad(xAxisRot);
  const cosPhi = Math.cos(phi),
    sinPhi = Math.sin(phi);
  // Step 1: Compute (x1', y1')
  const dx = (x1 - x2) / 2,
    dy = (y1 - y2) / 2;
  const x1p = cosPhi * dx + sinPhi * dy;
  const y1p = -sinPhi * dx + cosPhi * dy;
  // Step 2: Compute (cx', cy')
  let _rx = rx,
    _ry = ry;
  const x1p2 = x1p * x1p,
    y1p2 = y1p * y1p;
  let rx2 = _rx * _rx,
    ry2 = _ry * _ry;
  // Ensure radii are large enough
  const lam = x1p2 / rx2 + y1p2 / ry2;
  if (lam > 1) {
    _rx *= Math.sqrt(lam);
    _ry *= Math.sqrt(lam);
    rx2 = _rx * _rx;
    ry2 = _ry * _ry;
  }
  const sign = largeArcFlag !== sweepFlag ? 1 : -1;
  const sq = Math.max(
    0,
    (rx2 * ry2 - rx2 * y1p2 - ry2 * x1p2) / (rx2 * y1p2 + ry2 * x1p2)
  );
  const coef = sign * Math.sqrt(sq);
  const cxp = (coef * (_rx * y1p)) / _ry;
  const cyp = (coef * (-_ry * x1p)) / _rx;
  // Step 3: Compute (cx, cy)
  const cx = cosPhi * cxp - sinPhi * cyp + (x1 + x2) / 2;
  const cy = sinPhi * cxp + cosPhi * cyp + (y1 + y2) / 2;
  // Step 4: Compute start and end angles
  function angle(u: number[], v: number[]): number {
    const dot = u[0] * v[0] + u[1] * v[1];
    const len =
      Math.sqrt(u[0] * u[0] + u[1] * u[1]) *
      Math.sqrt(v[0] * v[0] + v[1] * v[1]);
    let ang = Math.acos(Math.max(-1, Math.min(1, dot / len)));
    if (u[0] * v[1] - u[1] * v[0] < 0) ang = -ang;
    return ang;
  }
  const v1 = [(x1p - cxp) / _rx, (y1p - cyp) / _ry];
  const v2 = [(-x1p - cxp) / _rx, (-y1p - cyp) / _ry];
  const theta1 = angle([1, 0], v1);
  let delta = angle(v1, v2);
  if (!sweepFlag && delta > 0) delta -= TAU;
  if (sweepFlag && delta < 0) delta += TAU;
  // Split arc into segments <= 90°
  const nSegs = Math.ceil(Math.abs(delta) / (TAU / 4));
  const segs: Array<[Point2D, Point2D, Point2D, Point2D]> = [];
  for (let i = 0; i < nSegs; i++) {
    const t1 = theta1 + (i * delta) / nSegs;
    const t2 = theta1 + ((i + 1) * delta) / nSegs;
    // Compute endpoints
    const cosT1 = Math.cos(t1),
      sinT1 = Math.sin(t1);
    const cosT2 = Math.cos(t2),
      sinT2 = Math.sin(t2);
    // Endpoints
    const pA = {
      x: cx + _rx * (cosPhi * cosT1 - sinPhi * sinT1),
      y: cy + _ry * (sinPhi * cosT1 + cosPhi * sinT1),
    };
    const pB = {
      x: cx + _rx * (cosPhi * cosT2 - sinPhi * sinT2),
      y: cy + _ry * (sinPhi * cosT2 + cosPhi * sinT2),
    };
    // Derivatives
    const alpha = Math.tan((t2 - t1) / 4) * (4 / 3);
    const q1 = {
      x: pA.x - alpha * (_rx * (cosPhi * sinT1 + sinPhi * cosT1)),
      y: pA.y - alpha * (_ry * (sinPhi * sinT1 - cosPhi * cosT1)),
    };
    const q2 = {
      x: pB.x + alpha * (_rx * (cosPhi * sinT2 + sinPhi * cosT2)),
      y: pB.y + alpha * (_ry * (sinPhi * sinT2 - cosPhi * cosT2)),
    };
    segs.push([pA, q1, q2, pB]);
  }
  return segs;
}

/**
 * Tessellates a path SvgShape into a polyline approximation using bezier-js for curves.
 * @param s - The SvgShape (must be a path)
 * @param tol - Tolerance for flattening (smaller = more segments)
 * @returns SvgShape polyline
 */
function tessellate(s: SvgShape, tol = 0.25): SvgShape {
  if ((s as { type?: string }).type !== 'path') return s;
  const shapeResult = s as { params: unknown[] };
  const segs = shapeResult.params[0] as SegmentWithMeta[];
  const points: Point2D[] = [];
  let lastPt: Point2D | null = null;
  for (const seg of segs) {
    if (seg.type === 'M') {
      points.push(seg.params[0]);
      lastPt = seg.params[0];
    } else if (seg.type === 'L') {
      points.push(seg.params[1]);
      lastPt = seg.params[1];
    } else if (seg.type === 'C' && seg.params.length === 4) {
      // Cubic: [P0, C1, C2, P1]
      const bz = new Bezier(
        seg.params[0],
        seg.params[1],
        seg.params[2],
        seg.params[3]
      );
      const pts = bz.getLUT(Math.max(2, Math.ceil(bz.length() / tol)));
      for (const pt of pts) points.push({ x: pt.x, y: pt.y });
      lastPt = seg.params[3];
    } else if (seg.type === 'Q' && seg.params.length === 3) {
      // Quadratic: [P0, C, P1]
      const bz = new Bezier(seg.params[0], seg.params[1], seg.params[2]);
      const pts = bz.getLUT(Math.max(2, Math.ceil(bz.length() / tol)));
      for (const pt of pts) points.push({ x: pt.x, y: pt.y });
      lastPt = seg.params[2];
    } else if (seg.type === 'A' && seg.params.length === 7 && lastPt) {
      // Arc: [rx, ry, xAxisRot, largeArcFlag, sweepFlag, x, y]
      const [rx, ry, xAxisRot, largeArcFlag, sweepFlag, x, y] =
        seg.params as unknown as [
          number,
          number,
          number,
          number,
          number,
          number,
          number,
        ];
      const arcCubics = arcToCubics(
        lastPt as Point2D,
        rx,
        ry,
        xAxisRot,
        largeArcFlag,
        sweepFlag,
        { x, y }
      );
      for (const cubic of arcCubics) {
        const bz = new Bezier(cubic[0], cubic[1], cubic[2], cubic[3]);
        const pts = bz.getLUT(Math.max(2, Math.ceil(bz.length() / tol)));
        for (const pt of pts) points.push({ x: pt.x, y: pt.y });
        lastPt = cubic[3];
      }
    }
    // TODO: Handle other segment types if needed
  }
  // Remove duplicate points
  const deduped = points.filter(
    (pt, i, arr) => i === 0 || pt.x !== arr[i - 1].x || pt.y !== arr[i - 1].y
  );
  // Build a polyline shape
  return shape('polyline', { points: deduped });
}

/**
 * Caches polyline tessellations for SvgShapes by tolerance.
 * Avoids redundant tessellation work in safeIntersect fallback.
 * @param s - The SvgShape (must be a path)
 * @param tol - Tolerance for flattening (smaller = more segments)
 * @returns SvgShape polyline
 */
const flatCache = new WeakMap<object, Map<number, SvgShape>>();
function flatMemo(s: SvgShape, tol = 0.25): SvgShape {
  let tmap = flatCache.get(s as object);
  if (!tmap) flatCache.set(s as object, (tmap = new Map()));
  if (!tmap.has(tol)) tmap.set(tol, tessellate(s, tol));
  return tmap.get(tol)!;
}

/**
 * Performs a robust intersection, falling back to poly-line tessellation if the result is unstable.
 * Always returns an object with a 'status' string and a 'points' array (empty if error or malformed result).
 * @param a - First SvgShape
 * @param b - Second SvgShape
 * @returns intersection result
 */
export function safeIntersect(
  a: SvgShape,
  b: SvgShape
): { status: string; points: Point2D[] } {
  try {
    try {
      const res = intersect(a, b) as { status: string; points: Point2D[] };
      if (!res || typeof res !== 'object' || !Array.isArray(res.points)) {
        return { status: 'Error', points: [] };
      }
      if (res.status !== 'Intersection') return res;
      if (Number.isNaN(res.points[0]?.x)) {
        // fallback: poly-line tessellation with caching
        try {
          const fallback = intersect(flatMemo(a, 0.25), flatMemo(b, 0.25)) as {
            status: string;
            points: Point2D[];
          };
          if (
            !fallback ||
            typeof fallback !== 'object' ||
            !Array.isArray(fallback.points)
          ) {
            return { status: 'Error', points: [] };
          }
          return fallback;
        } catch {
          console.error('[safeIntersect] Fallback tessellation failed:', {
            a,
            b,
          });
          return { status: 'Error', points: [] };
        }
      }
      return res;
    } catch {
      // If intersect throws, fallback to tessellation
      try {
        const fallback = intersect(flatMemo(a, 0.25), flatMemo(b, 0.25)) as {
          status: string;
          points: Point2D[];
        };
        if (
          !fallback ||
          typeof fallback !== 'object' ||
          !Array.isArray(fallback.points)
        ) {
          return { status: 'Error', points: [] };
        }
        return fallback;
      } catch {
        console.error('[safeIntersect] Fallback tessellation failed:', {
          a,
          b,
        });
        return { status: 'Error', points: [] };
      }
    }
  } catch (finalErr) {
    // Log both shapes' data for debugging
    console.error('[safeIntersect] Unrecoverable error:', finalErr, { a, b });
    try {
      // Attempt to log SVG path data if available
      const aObj = a as { params?: unknown[] };
      const bObj = b as { params?: unknown[] };
      const aPath =
        (aObj?.params?.[0] && (aObj.params[0] as { d?: string }).d) || '[no d]';
      const bPath =
        (bObj?.params?.[0] && (bObj.params[0] as { d?: string }).d) || '[no d]';
      console.error('[safeIntersect] Shape A path:', aPath);
      console.error('[safeIntersect] Shape B path:', bPath);
    } catch {}
    return { status: 'Error', points: [] };
  }
}

/**
 * Precomputes horizontal and vertical scanline probes for a glyph's bbox and metrics.
 * @param g - The fontkit Glyph object
 * @param m - Font metrics
 * @param bands - Number of scanlines per direction
 * @returns Array of scanline probe objects { origin, angle, len, type }
 */
export function precomputeScanlines(
  g: Glyph,
  m: Metrics,
  bands = 8
): Array<{
  origin: Point2D;
  angle: number;
  len: number;
  type: 'horizontal' | 'vertical';
}> {
  const bbox = g.bbox;
  const overshoot = getOvershoot(g);
  const scanlines: Array<{
    origin: Point2D;
    angle: number;
    len: number;
    type: 'horizontal' | 'vertical';
  }> = [];
  // Horizontal scanlines (Y varies)
  for (let i = 1; i < bands; i++) {
    const y = bbox.minY + ((bbox.maxY - bbox.minY) * i) / bands;
    scanlines.push({
      origin: { x: bbox.minX - overshoot, y },
      angle: 0,
      len: bbox.maxX - bbox.minX + overshoot * 2,
      type: 'horizontal',
    });
  }
  // Vertical scanlines (X varies)
  for (let i = 1; i < bands; i++) {
    const x = bbox.minX + ((bbox.maxX - bbox.minX) * i) / bands;
    scanlines.push({
      origin: { x, y: bbox.minY - overshoot },
      angle: Math.PI / 2,
      len: bbox.maxY - bbox.minY + overshoot * 2,
      type: 'vertical',
    });
  }
  return scanlines;
}

/**
 * Chunks scanlines into batches for parallel processing.
 * @param scanlines - Array of scanline probe objects
 * @param batchSize - Number of scanlines per batch
 * @returns Array of scanline batches
 */
export function batchScanlines<T>(scanlines: T[], batchSize = 4): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < scanlines.length; i += batchSize) {
    batches.push(scanlines.slice(i, i + batchSize));
  }
  return batches;
}

/**
 * Pre-filters degenerate Bézier segments in a glyph's path to avoid intersection errors.
 * Converts degenerate quadratic/cubic curves to line segments.
 * @param g - The fontkit Glyph object
 */
export function filterDegenerateBeziers(g: Glyph): void {
  if (!g?.path?.commands) return;
  for (const seg of g.path.commands) {
    if (seg.command === 'quadraticCurveTo') {
      const [cx, cy, x, y] = seg.args;
      if (cx === x && cy === y) seg.command = 'lineTo';
    }
    if (seg.command === 'bezierCurveTo') {
      const pts = seg.args;
      // Check if all control points collapse to the end point
      if (
        pts[0] === pts[4] &&
        pts[1] === pts[5] &&
        pts[2] === pts[4] &&
        pts[3] === pts[5]
      ) {
        seg.command = 'lineTo';
      }
    }
  }
}
