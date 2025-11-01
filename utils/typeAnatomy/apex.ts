import { shapeForV2 } from '@/utils/caching/caching';
import { rayHits } from '@/utils/geometry/geometryCore';
import type { Glyph } from 'fontkit';
import { FeatureDetectionConfig } from './featureConfig';
import type { Metrics } from './index';

type Pt = { x: number; y: number };

export function hasApex(g: Glyph, m: Metrics): boolean {
  if (!isDrawable(g)) return false;

  const gs = shapeForV2(g);
  const { minX, maxX, minY, maxY } = g.bbox;
  const h = maxY - minY;
  if (h <= 0) return false;

  // Normalize EPS to glyph height; allow config to be either absolute or scale factor.
  const baseEPS = FeatureDetectionConfig.global.defaultEps ?? 1;
  const EPS = baseEPS * Math.max(1, h / 1000); // adapt to units-per-em scale

  // Choose a start scanline comfortably below the cap region but above noise.
  // If Metrics has capHeight in the same coordinate system, prefer that band.
  const capTop = m.capHeight ?? maxY;
  const cy = Math.min(
    maxY - 0.15 * h,
    (m.baseline ?? minY) + 0.7 * (capTop - (m.baseline ?? minY))
  );

  const cx = 0.5 * (minX + maxX);
  const o = 3 * h; // generous ray length

  // Adjust for italic angle if present (Metrics doesn't include italicAngle, default to 0)
  const italic = 0; // Italic angle not in Metrics interface, would need font instance
  const thetaRight = Math.PI / 4 + italic; // ~45° + slant
  const thetaLeft = (3 * Math.PI) / 4 + italic; // ~135° + slant

  // Optionally sample a small horizontal neighborhood to avoid occlusion
  const startsX = [cx, cx - 0.03 * h, cx + 0.03 * h];

  // Find the best (highest) hit from each side across all starts
  const bestLeft = topmostHitOverStarts(gs, startsX, cy, thetaLeft, o);
  const bestRight = topmostHitOverStarts(gs, startsX, cy, thetaRight, o);
  if (!bestLeft || !bestRight) return false;

  // Y-up: topmost means closer to maxY
  const topY = Math.min(maxY - bestLeft.y, maxY - bestRight.y) < 0.18 * h; // within top ~18% band
  if (!topY) return false;

  // Convergence test: if the rays land at (nearly) the same point, we likely have a point apex.
  const dx = bestLeft.x - bestRight.x;
  const dy = bestLeft.y - bestRight.y;
  const d2 = dx * dx + dy * dy;

  // Accept if they converge closely...
  const pointApex = d2 <= 2 * EPS * (2 * EPS);

  if (pointApex) return true;

  // ...otherwise, allow a tiny flat/rounded apex:
  // similar heights, small horizontal separation, and steep incident directions.
  const yClose = Math.abs(dy) <= 2 * EPS;
  const xSmall = Math.abs(dx) <= 0.05 * (maxX - minX);

  if (yClose && xSmall) {
    // Optional: angle test to reject actual flat tops.
    // You can fetch local tangents (if your geometry core exposes them).
    // For now, a conservative acceptance:
    return true;
  }

  return false;
}

function topmostHitOverStarts(
  gs: unknown,
  startsX: number[],
  cy: number,
  theta: number,
  o: number
): Pt | null {
  let best: Pt | null = null;
  for (const sx of startsX) {
    const hit = rayHits(gs, { x: sx, y: cy }, theta, o);
    if (!hit?.points?.length) continue;
    // Y-up → highest = max y
    const top = hit.points.reduce((a: Pt, b: Pt) => (a.y >= b.y ? a : b));
    if (!best || top.y > best.y) best = top;
  }
  return best;
}

function isDrawable(g: Glyph): g is Glyph & { path: { commands: unknown[] } } {
  return !!(g && g.path && g.path.commands && g.bbox);
}
