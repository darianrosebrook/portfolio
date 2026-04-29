/**
 * Disconnected-mark topology predicates.
 *
 * A glyph's contour list is a flat array, but typographically it groups into
 * one main-body shape plus zero or more isolated marks (tittle, accent, ogonek,
 * cedilla). Detection rules that gate purely on position ("above x-height")
 * misclassify main-body fragments — the H crossbar opening lies above x-height
 * but is part of the H, not a mark.
 *
 * This module exposes the topology layer so detectors can ask three structural
 * questions in order:
 *
 *   1. Which contours are physically separate from the main body?
 *      → getConnectedGroups, findMainBodyGroup
 *   2. Of those, which look like a compact mark?
 *      → isCompactContour
 *   3. Of those, which sit above the main body and align with a lower stem?
 *      → isAboveMainBody, isAlignedWithLowerStem
 *
 * Negative pressure — `rejectsAsMainBodyFragment` — applies invariant: a
 * contour that overlaps any other non-hole contour's bbox is part of the main
 * body, regardless of where it sits relative to font metrics. Tittle detection
 * must apply this BEFORE positional gating.
 *
 * The predicates are intentionally pure data: they accept BBox + metric inputs
 * and return booleans/groups. They do not call rayHits, do not consult the
 * orthogonal-thickness substrate, and have no dependency on the detector
 * registry. This keeps the topology evidence family independent of Slice 1's
 * thickness substrate, per TYPEANATOMY-001's invariants.
 */

export {
  bboxesOverlap,
  getConnectedGroups,
  findMainBodyGroup,
  type ContourGroup,
} from './disconnectedContours';

export {
  isCompactContour,
  isAboveMainBody,
  isAlignedWithLowerStem,
  rejectsAsMainBodyFragment,
  type CompactnessOptions,
  type StemAlignmentOptions,
} from './markPredicates';
