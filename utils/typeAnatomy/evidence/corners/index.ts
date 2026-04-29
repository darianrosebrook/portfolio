/**
 * Outline-corner evidence family.
 *
 * Glyph anatomy features in the "corner" family — apex, vertex, crotch,
 * and (in future slices) finial-tip, ear-tip, spur — all share an
 * underlying geometric primitive: a sharp turn in a contour outline,
 * with a known interior direction.
 *
 * Detectors in this family used to synthesize rays from interior probe
 * points outward and try to detect where rays converged. That pattern
 * confused stroke-extreme separation with apex-tip separation and
 * misclassified `A`'s sharp apex as a flat ridge while missing `V`'s
 * crotch entirely. This module replaces ray-cast convergence with
 * direct extraction of corners from the outline polygon.
 *
 * The four-step composition for a corner-class detector:
 *
 *   1. Collect candidate corners from the relevant contour(s)
 *      → extractContourCorners (cache-integrated) or
 *        findOutlineCorners (raw-polygon, for unit tests)
 *   2. Filter by sharpness
 *      → isSharpCorner / isSharpExteriorCorner / isSharpInteriorCorner
 *   3. Filter by anatomy-relevant geometry
 *      → isInTopBand / isInBottomBand,
 *        interiorPointsUp / interiorPointsDown
 *   4. Coalesce near-coincident candidates
 *      → dedupeNearbyCorners
 *
 * The evidence layer is anatomy-neutral: it produces neutral corner
 * candidates and exposes geometric predicates. Mapping a candidate to
 * an anatomy term (`apex`, `vertex`, `crotch`) is a detector decision.
 * The same geometric event can legitimately be reported by more than
 * one detector — V's bottom point is both its `vertex` and its `crotch`.
 *
 * Per TYPEANATOMY-003 invariants: this family is independent of the
 * topology and measureOrthogonalThickness substrates and does not
 * require GeometryCache, ContourClassification, or SegmentWithMeta
 * schema changes.
 */

export { findOutlineCorners, type CornerSample } from './findOutlineCorners';

export {
  isSharpCorner,
  isConvexCorner,
  isConcaveCorner,
  isSharpExteriorCorner,
  isSharpInteriorCorner,
  interiorPointsUp,
  interiorPointsDown,
  isInTopBand,
  isInBottomBand,
  DEFAULT_SHARPNESS_RAD,
  DEFAULT_BAND_RATIO,
  type SharpnessOptions,
  type BandOptions,
} from './cornerPredicates';

export { dedupeNearbyCorners } from './dedupe';

export { inJunctionCluster } from './clustering';

export {
  extractContourCorners,
  collectContourPoints,
} from './extractContourCorners';
