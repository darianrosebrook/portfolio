/**
 * Mark-classification predicates that operate on bbox + topology data.
 *
 * Each predicate answers a single yes/no question about a candidate contour
 * group. Detectors compose them in a fixed order:
 *
 *   1. rejectsAsMainBodyFragment(candidate, mainBody)  — negative pressure
 *   2. isCompactContour(candidate.bbox, options)       — shape sanity
 *   3. isAboveMainBody(candidate, mainBody, eps)       — vertical placement
 *   4. isAlignedWithLowerStem(candidate, mainBody, …)  — horizontal placement
 *
 * The negative-pressure check (#1) must run first: a contour that visually
 * touches the main body cannot be a mark, regardless of where it sits or how
 * compact it looks. Letting positional checks run first is what allowed the
 * H crossbar opening to register as a tittle candidate before this slice.
 */

import type { BBox, Metrics } from '../../types';
import { bboxesOverlap, type ContourGroup } from './disconnectedContours';

/** Tunables for compactness checks. All defaults work for typical Latin glyphs. */
export interface CompactnessOptions {
  /** Glyph bounding box; used as a fallback height scale when xHeight is 0. */
  glyphBBox: BBox;
  /** Font metrics; used for x-height-relative height ceiling. */
  metrics: Metrics;
  /**
   * Stem width in design units. When provided, the candidate's width must
   * not exceed `maxWidthInStems * stemWidth` — the natural scale for marks
   * is "comparable to the lower stem." Without this, a candidate wider
   * than the stem-and-dot union (impossible by construction) is the only
   * rejection criterion, which is tautological for `i`/`j` glyphs whose
   * bbox is dominated by the dot's x-extent.
   *
   * If omitted, the width check is skipped — callers should always
   * provide it for tittle-class detection.
   */
  stemWidth?: number;
  /**
   * Maximum aspect ratio (longer side / shorter side). 1 = perfect square.
   * Default 2.0 — allows rectangular dots like Nohemi i tittle while still
   * rejecting long bars and tall strokes.
   */
  maxAspectRatio?: number;
  /**
   * Maximum width in stem-width units. Default 3.0. A diacritic should be
   * at most a few stem widths wide; anything larger is a stroke or bar.
   * Only applied when `stemWidth` is provided.
   */
  maxWidthInStems?: number;
  /**
   * Maximum height as a fraction of x-height. Default 1.2 — slightly above
   * x-height to allow accents that extend a bit higher than the dot. A
   * full-cap-height contour is never a mark.
   */
  maxHeightFractionOfXHeight?: number;
}

/** Tunables for stem-alignment checks. */
export interface StemAlignmentOptions {
  /** Estimated stem width in design units (geo.scale.stemWidth). */
  stemWidth: number;
  /**
   * Half-tolerance for stem-center alignment, in stem widths. Default 1.0 —
   * a candidate centered within ±stemWidth of any base contour's center-x is
   * considered aligned. Italic fonts may need this tightened.
   */
  alignmentToleranceInStems?: number;
}

/**
 * Returns true when `candidate` is small enough and roughly square enough to
 * plausibly be a mark. This is shape-only — does not consult position.
 *
 * The three thresholds (aspect ratio, width fraction, height fraction) are
 * combined with AND: failing any one rejects the candidate. Loosen any
 * threshold and you start false-positiving on horizontal bars; tighten and
 * you start rejecting legitimate but slightly-off-square dots.
 */
export function isCompactContour(
  bbox: BBox,
  options: CompactnessOptions
): boolean {
  const {
    glyphBBox,
    metrics,
    stemWidth,
    maxAspectRatio = 2.0,
    maxWidthInStems = 3.0,
    maxHeightFractionOfXHeight = 1.2,
  } = options;

  const width = bbox.maxX - bbox.minX;
  const height = bbox.maxY - bbox.minY;

  if (width <= 0 || height <= 0) return false;

  const longer = Math.max(width, height);
  const shorter = Math.min(width, height);
  const aspectRatio = longer / shorter;
  if (aspectRatio > maxAspectRatio) return false;

  if (
    typeof stemWidth === 'number' &&
    stemWidth > 0 &&
    width / stemWidth > maxWidthInStems
  ) {
    return false;
  }

  // Height ceiling uses x-height as the natural scale. If x-height is
  // missing (xHeight == 0), fall back to glyph bbox height as a safety net
  // so the predicate doesn't always reject.
  const heightScale =
    metrics.xHeight > 0 ? metrics.xHeight : glyphBBox.maxY - glyphBBox.minY;
  if (heightScale > 0 && height / heightScale > maxHeightFractionOfXHeight) {
    return false;
  }

  return true;
}

/**
 * Returns true when the candidate's bottom edge sits strictly above the
 * main body's top edge, with `epsilon` separation. The epsilon prevents
 * borderline-overlap cases from passing — without it, a candidate whose
 * minY equals the main body's maxY would qualify, and that's typically a
 * fragment touching the body, not a separated mark.
 *
 * Caller supplies epsilon scaled to the glyph (typical: scale.eps * 5 or
 * stemWidth * 0.2). Hard-coding here would couple the predicate to font
 * scale, which it should remain free of.
 */
export function isAboveMainBody(
  candidate: ContourGroup,
  mainBody: ContourGroup,
  epsilon: number
): boolean {
  return candidate.bbox.minY - mainBody.bbox.maxY >= epsilon;
}

/**
 * Returns true when the candidate's center-x lies within
 * `alignmentToleranceInStems * stemWidth` of any individual contour's
 * center-x in the main body group. The lower stem's center is approximated
 * as the center of the narrowest base contour in the group — the dot above
 * an `i` is centered over the i's vertical stroke, not the glyph midpoint
 * (those coincide for upright `i` but diverge in italics or for `j`).
 */
export function isAlignedWithLowerStem(
  candidate: ContourGroup,
  mainBody: ContourGroup,
  options: StemAlignmentOptions
): boolean {
  const { stemWidth, alignmentToleranceInStems = 1.0 } = options;
  if (stemWidth <= 0) return false;

  const candidateCx = (candidate.bbox.minX + candidate.bbox.maxX) / 2;
  const tolerance = stemWidth * alignmentToleranceInStems;

  for (const c of mainBody.contours) {
    const cx = (c.bbox.minX + c.bbox.maxX) / 2;
    if (Math.abs(candidateCx - cx) <= tolerance) return true;
  }

  // Fall back to the main body's bbox center if no individual contour
  // matched. This handles single-contour main bodies (typical `i`/`j`
  // drawn as one long stroke ending in the descender, with the tittle
  // as a separate contour above).
  const mainCx = (mainBody.bbox.minX + mainBody.bbox.maxX) / 2;
  return Math.abs(candidateCx - mainCx) <= tolerance;
}

/**
 * Returns true when `candidate` overlaps any other non-hole contour's bbox
 * — i.e., the candidate is part of the main body, not a disconnected mark.
 *
 * `others` should be every other non-hole contour in the glyph (the caller
 * filters holes). If the candidate is genuinely isolated, every overlap test
 * fails and the predicate returns false (i.e., it does NOT reject).
 *
 * Naming: returns true means "reject this candidate." Callers pass the
 * candidate to this predicate first; a true result short-circuits the rest
 * of the mark-classification pipeline.
 */
export function rejectsAsMainBodyFragment(
  candidate: BBox,
  others: BBox[],
  epsilon = 0
): boolean {
  for (const other of others) {
    if (other === candidate) continue;
    if (bboxesOverlap(candidate, other, epsilon)) return true;
  }
  return false;
}
