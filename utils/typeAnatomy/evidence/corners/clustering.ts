/**
 * Walk-order clustering for corner samples.
 *
 * The simplest distinguishing geometric signal between a "junction" (where
 * two strokes converge to a sharp meeting) and a "termination" (where a
 * single stroke ends at a sharp foot or cap corner) is *adjacency in walk
 * order*: at a junction, both incoming and outgoing strokes contribute
 * sharp corners that sit next to each other on the contour. At a
 * termination, the sharp corner is flanked by gentle bevels (the stroke's
 * shoulders).
 *
 * Two crisp examples on Nohemi-VF:
 *
 *   `A`'s inside-of-^: corners at (1479, 2728) and (1343, 2728) — a
 *   contiguous pair of ~110° turns, both sharp. CLUSTER.
 *
 *   `A`'s outer foot at (35, 0): the single sharp 110° corner with
 *   gentle ~70° neighbors at (1101, 2860) and (471, 0). NOT a cluster.
 *
 *   `V`'s tip: (1299, 132) and (1435, 132) — pair of ~110° turns,
 *   both sharp. CLUSTER.
 *
 *   `V`'s outer top-left at (35, 2860): single sharp ~109°, neighbors
 *   are gentle ~70° each. NOT a cluster.
 *
 * This predicate is the cluster filter, not the cluster ENUMERATOR; it
 * returns the subset of corners that have at least one sharp neighbor in
 * walk order. Downstream dedupe collapses each retained cluster to a
 * single representative.
 */

import { isSharpCorner, type SharpnessOptions } from './cornerPredicates';
import type { CornerSample } from './findOutlineCorners';

/**
 * Returns the subset of `corners` that are members of a junction cluster
 * (sharp AND have at least one sharp adjacent corner in walk order).
 *
 * Walk order is interpreted modulo `corners.length`, so the predecessor
 * of index 0 is the last corner and the successor of the last is index 0
 * — a closed loop, matching the semantics of a closed contour polygon.
 *
 * `corners` must be the output of `findOutlineCorners` (or
 * `extractContourCorners`) for ONE contour, in walk order. Mixing
 * corners from multiple contours would produce nonsensical adjacency.
 */
export function inJunctionCluster(
  corners: CornerSample[],
  options?: SharpnessOptions
): CornerSample[] {
  const n = corners.length;
  if (n < 2) return [];

  const sharpFlags = corners.map((c) => isSharpCorner(c, options));

  return corners.filter((_, i) => {
    if (!sharpFlags[i]) return false;
    const prev = sharpFlags[(i - 1 + n) % n];
    const next = sharpFlags[(i + 1) % n];
    return prev || next;
  });
}
