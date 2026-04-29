/**
 * Disconnected contour grouping.
 *
 * Partitions a glyph's contour list into bbox-connected groups. Two contours
 * are in the same group when their bounding boxes have a non-empty 2D
 * intersection (touching counts, controlled by epsilon). This is a useful
 * proxy for path connectivity for the limited purpose of separating a
 * disconnected mark (i tittle, j tittle, ogonek) from the main body — the
 * mark's bbox does not overlap the main body's bbox in either axis.
 *
 * Limitation: bbox overlap is not true path connectivity. A complex contour
 * shape (e.g., the inside of a 'C') has a bbox that fully contains the bbox
 * of an unrelated mark drawn next to it, and the predicates would group
 * them together. For tittle detection on standard letters this case does
 * not arise — i/j/H/l/I are all simple enough that bbox grouping matches
 * topology.
 *
 * Holes (negative-winding contours) are excluded from grouping. They live
 * inside a base contour by definition; topology grouping is an outer-shape
 * concept. Detectors that care about holes should consult them separately
 * via getHoleContours.
 */

import type { BBox, ContourClassification } from '../../types';

/**
 * A bbox-connected group of contours, with the group's union bbox and total area.
 *
 * Holes are excluded by construction; only base/mark contours can appear here.
 */
export interface ContourGroup {
  /** Contours that participate in this group (excludes holes). */
  contours: ContourClassification[];
  /** Union bbox covering every contour in the group. */
  bbox: BBox;
  /** Sum of |area| across the group's contours, used to identify the main body. */
  area: number;
}

/**
 * Returns true when two bboxes have a non-empty 2D intersection. Touching
 * boundaries with separation <= epsilon count as overlapping.
 */
export function bboxesOverlap(a: BBox, b: BBox, epsilon = 0): boolean {
  return (
    a.minX - b.maxX <= epsilon &&
    b.minX - a.maxX <= epsilon &&
    a.minY - b.maxY <= epsilon &&
    b.minY - a.maxY <= epsilon
  );
}

/**
 * Partitions a contour list into bbox-connected groups, excluding holes.
 *
 * Two contours land in the same group iff their bboxes overlap (within
 * `epsilon`). Transitivity is closed via union-find: A∼B and B∼C ⇒ A∼C.
 *
 * For an `i`: stem bbox and dot bbox have no y-overlap → 2 groups.
 * For an `H`: a single base contour → 1 group.
 * For an unusually-drawn glyph with multiple base contours that all share
 * the same x and y span, they collapse into one group.
 */
export function getConnectedGroups(
  contours: ContourClassification[],
  epsilon = 0
): ContourGroup[] {
  const candidates = contours.filter((c) => c.type !== 'hole');
  if (candidates.length === 0) return [];

  // Union-find by index.
  const parent = candidates.map((_, i) => i);
  const find = (i: number): number => {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  };
  const union = (i: number, j: number): void => {
    const ri = find(i);
    const rj = find(j);
    if (ri !== rj) parent[ri] = rj;
  };

  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      if (bboxesOverlap(candidates[i].bbox, candidates[j].bbox, epsilon)) {
        union(i, j);
      }
    }
  }

  // Collect by root.
  const buckets = new Map<number, ContourClassification[]>();
  for (let i = 0; i < candidates.length; i++) {
    const root = find(i);
    const bucket = buckets.get(root);
    if (bucket) bucket.push(candidates[i]);
    else buckets.set(root, [candidates[i]]);
  }

  return Array.from(buckets.values()).map((group) => {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let area = 0;
    for (const c of group) {
      if (c.bbox.minX < minX) minX = c.bbox.minX;
      if (c.bbox.minY < minY) minY = c.bbox.minY;
      if (c.bbox.maxX > maxX) maxX = c.bbox.maxX;
      if (c.bbox.maxY > maxY) maxY = c.bbox.maxY;
      area += Math.abs(c.area);
    }
    return {
      contours: group,
      bbox: { minX, minY, maxX, maxY },
      area,
    };
  });
}

/**
 * Returns the largest group by total area. Undefined when there are no
 * non-hole contours. Ties (extremely rare in practice) resolve to the first
 * group by index, which is stable across calls but not semantically meaningful.
 */
export function findMainBodyGroup(
  groups: ContourGroup[]
): ContourGroup | undefined {
  if (groups.length === 0) return undefined;
  return groups.reduce((best, g) => (g.area > best.area ? g : best));
}
