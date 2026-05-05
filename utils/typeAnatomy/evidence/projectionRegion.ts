/**
 * Build a contour-walk polygon around a feature anchor.
 *
 * Used by projection detectors (serif, ear, finial, spur) to convert a
 * single point marker into a small filled region that follows the actual
 * contour shape near the anchor. The walker:
 *
 *   1. Picks the contour vertex nearest the anchor (optionally restricted
 *      to a single contour by `contourIndex`).
 *   2. Walks forward and backward from that vertex along the contour,
 *      accumulating Euclidean arc length until each side has consumed the
 *      `arcLengthBudget`.
 *   3. Stitches the two slices into a closed polygon: `[...backward.reverse(),
 *      anchorVertex, ...forward]`. The renderer closes the polygon implicitly.
 *
 * Returns [] if the anchor doesn't land on any contour, the budget is too
 * small to capture ≥ 3 vertices, or the glyph has no path data. In that
 * case detectors should leave `region` undefined and fall through to the
 * existing point/shape rendering.
 */

import type { Glyph } from 'fontkit';
import type { Point2D } from '@/utils/geometry/geometry';

interface PathCommand {
  command: string;
  args: number[];
}

interface PathLikeGlyph {
  path?: { commands?: PathCommand[] };
}

interface ContourVertex {
  point: Point2D;
  /** Index into the host glyph's command array. */
  cmdIndex: number;
  /** Which contour this vertex belongs to (0-based). */
  contourIndex: number;
}

export interface ProjectionOptions {
  glyph: PathLikeGlyph | Glyph;
  anchor: Point2D;
  /** Arc-length budget per side, in glyph design units. */
  arcLengthBudget: number;
  /**
   * If supplied, only walk this contour. The contour index is the 0-based
   * count of `moveTo` commands seen before the candidate vertex. Useful when
   * the detector already knows which contour the projection belongs to and
   * wants to avoid drift onto a neighbouring contour with a closer vertex.
   */
  contourIndex?: number;
}

function endpointOf(c: PathCommand): Point2D | null {
  switch (c.command) {
    case 'moveTo':
    case 'lineTo':
      return { x: c.args[0], y: c.args[1] };
    case 'quadraticCurveTo':
      return { x: c.args[2], y: c.args[3] };
    case 'bezierCurveTo':
      return { x: c.args[4], y: c.args[5] };
    default:
      return null;
  }
}

/**
 * Flatten the glyph's command list into one ContourVertex per endpoint,
 * tagged with contour index. We use this enriched representation so the
 * walker can step around the contour ring (`closePath` jumps back to the
 * last `moveTo`) without re-deriving structure mid-walk.
 */
function collectContours(cmds: PathCommand[]): {
  contours: ContourVertex[][];
  flat: ContourVertex[];
} {
  const contours: ContourVertex[][] = [];
  const flat: ContourVertex[] = [];
  let contourIndex = -1;
  let current: ContourVertex[] = [];
  for (let i = 0; i < cmds.length; i++) {
    const c = cmds[i];
    if (c.command === 'moveTo') {
      if (current.length > 0) {
        contours.push(current);
      }
      contourIndex += 1;
      current = [];
      const p = endpointOf(c);
      if (p) {
        const v: ContourVertex = { point: p, cmdIndex: i, contourIndex };
        current.push(v);
        flat.push(v);
      }
      continue;
    }
    if (c.command === 'closePath') continue;
    const p = endpointOf(c);
    if (!p) continue;
    const v: ContourVertex = { point: p, cmdIndex: i, contourIndex };
    current.push(v);
    flat.push(v);
  }
  if (current.length > 0) contours.push(current);
  // Drop a trailing duplicate-of-first within each contour (some upstream
  // emitters close polylines explicitly with a repeat).
  for (const ring of contours) {
    if (ring.length >= 2) {
      const first = ring[0].point;
      const last = ring[ring.length - 1].point;
      if (first.x === last.x && first.y === last.y) {
        ring.pop();
      }
    }
  }
  return { contours, flat };
}

function distSq(a: Point2D, b: Point2D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

/**
 * Walk forward (+1) or backward (-1) from `startIdx` around `ring`,
 * accumulating arc length until `budget` is reached or the walker returns
 * to the start. Returns the visited vertices in walk order, NOT including
 * the start vertex.
 *
 * To guarantee a usable polygon for short contour segments, the walker
 * always takes at least one step when `budget > 0` even if the first
 * neighbour exceeds the budget. Without that floor, anchors that land
 * close to a vertex but whose neighbours are far apart (typical for
 * coarse Bézier-only contours) would always produce empty walks and the
 * detector would silently drop the region.
 */
function walkRing(
  ring: ContourVertex[],
  startIdx: number,
  step: 1 | -1,
  budget: number
): Point2D[] {
  const collected: Point2D[] = [];
  if (ring.length < 2 || budget <= 0) return collected;
  let acc = 0;
  let cur = ring[startIdx].point;
  let i = startIdx;
  for (let safety = 0; safety < ring.length; safety++) {
    const next = (i + step + ring.length) % ring.length;
    if (next === startIdx) break;
    const np = ring[next].point;
    const seg = Math.hypot(np.x - cur.x, np.y - cur.y);
    if (collected.length > 0 && acc + seg > budget) break;
    acc += seg;
    collected.push(np);
    cur = np;
    i = next;
    if (acc >= budget) break;
  }
  return collected;
}

export function buildProjectionPolygon(opts: ProjectionOptions): Point2D[] {
  const cmds = (opts.glyph as PathLikeGlyph).path?.commands;
  if (!cmds || cmds.length === 0) return [];
  if (!Number.isFinite(opts.arcLengthBudget) || opts.arcLengthBudget <= 0) {
    return [];
  }

  const { contours, flat } = collectContours(cmds);
  if (flat.length < 3) return [];

  // Find the closest vertex (optionally on a specific contour).
  const candidates =
    opts.contourIndex !== undefined
      ? flat.filter((v) => v.contourIndex === opts.contourIndex)
      : flat;
  if (candidates.length < 3) return [];

  let best = candidates[0];
  let bestD = distSq(best.point, opts.anchor);
  for (let i = 1; i < candidates.length; i++) {
    const d = distSq(candidates[i].point, opts.anchor);
    if (d < bestD) {
      bestD = d;
      best = candidates[i];
    }
  }

  const ring = contours[best.contourIndex];
  if (!ring || ring.length < 3) return [];
  const startIdx = ring.findIndex((v) => v.cmdIndex === best.cmdIndex);
  if (startIdx < 0) return [];

  const forward = walkRing(ring, startIdx, +1, opts.arcLengthBudget);
  const backward = walkRing(ring, startIdx, -1, opts.arcLengthBudget);

  if (forward.length === 0 && backward.length === 0) return [];

  const polygon: Point2D[] = [];
  for (let i = backward.length - 1; i >= 0; i--) {
    polygon.push(backward[i]);
  }
  polygon.push(best.point);
  for (const p of forward) polygon.push(p);

  return polygon.length >= 3 ? polygon : [];
}
