/**
 * Duplicate suppression for corner samples.
 *
 * When a polygon has near-coincident vertices — or when corners from
 * multiple contours land in the same neighborhood — detectors typically
 * want to collapse them to one representative corner. This module
 * implements the chosen tiebreaker: keep the SHARPEST candidate.
 *
 * Rationale: dedupe is invoked downstream of sharpness filtering, so
 * every input is already a viable candidate. Choosing the sharpest one
 * favors the most prominent geometric event in the cluster — preferable
 * to "first found in walk order," which is order-dependent.
 */

import type { CornerSample } from './findOutlineCorners';

/**
 * Coalesce corner samples within `threshold` distance into a single
 * representative each.
 *
 * Algorithm: greedy. Walk the input list; for each corner, find an
 * already-kept corner within `threshold` and either replace it (if the
 * new one is sharper by |signedTurnAngle|) or skip the new one. This is
 * O(n²) in the worst case; corner counts per glyph are small so it is
 * adequate.
 *
 * `threshold` is in the same units as the corner points (typically font
 * design units). A threshold ≤ 0 returns the input unchanged.
 */
export function dedupeNearbyCorners(
  corners: CornerSample[],
  threshold: number
): CornerSample[] {
  if (threshold <= 0) return [...corners];

  const kept: CornerSample[] = [];
  for (const c of corners) {
    const dupIdx = kept.findIndex(
      (k) => distance(k.point, c.point) < threshold
    );
    if (dupIdx === -1) {
      kept.push(c);
    } else if (
      Math.abs(c.signedTurnAngle) > Math.abs(kept[dupIdx].signedTurnAngle)
    ) {
      kept[dupIdx] = c;
    }
  }
  return kept;
}

function distance(
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
