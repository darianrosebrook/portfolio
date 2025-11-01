/**
 * Aperture feature detection for typographic glyphs.
 * Detects open spaces/voids in letters like 'c', 'e', 'a'.
 * More general than Eye - detects any opening, not just right-opening.
 */

import type { Glyph } from 'fontkit';
import { getOvershoot, shapeForV2 } from '@/utils/caching/caching';
import { rayHits, isInside, isDrawable } from '@/utils/geometry/geometryCore';
import type { Metrics } from './index';
import { FeatureDetectionConfig } from './featureConfig';

/**
 * Finds a seed point inside an aperture region (open counter).
 * Similar to counter seed but looks for regions with openings.
 */
function apertureSeed(g: Glyph, m: Metrics): { x: number; y: number } | null {
  if (!isDrawable(g) || !g.path || !Array.isArray(g.path.commands)) {
    return null;
  }
  
  const gs = shapeForV2(g);
  const overshoot = getOvershoot(g);
  const bands = FeatureDetectionConfig.counter.scanBands;
  
  for (let i = 1; i < bands; i++) {
    const y = m.baseline + (i * (m.xHeight - m.baseline)) / bands;
    const origin = { x: -overshoot, y };
    let points: { x: number; y: number }[] = [];
    
    try {
      const result = rayHits(gs, origin, 0, overshoot * 2);
      points = Array.isArray(result.points) ? result.points : [];
    } catch {
      continue;
    }
    
    // Look for interior regions (odd number of intersections)
    if (points.length >= 2 && (points.length / 2) % 2 === 1) {
      for (let j = 0; j < points.length - 1; j += 2) {
        const x = (points[j].x + points[j + 1].x) / 2;
        
        // Try nudging to find a point inside
        for (const nudge of FeatureDetectionConfig.counter.nudgeSteps.map(
          (n) => n * (g.bbox.maxX - g.bbox.minX)
        )) {
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
 * Detects if a glyph contains an aperture (open space/void).
 * More general than Eye - detects openings in any direction.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns boolean
 */
export function hasAperture(g: Glyph, m: Metrics): boolean {
  if (!isDrawable(g)) return false;
  
  // Find a seed point inside a potential aperture
  const seed = apertureSeed(g, m);
  if (!seed) return false;
  
  const gs = shapeForV2(g);
  const overshoot = getOvershoot(g);
  
  // Cast rays in multiple directions to detect openings
  const rays = [
    { angle: 0, desc: 'right' }, // 0° = right
    { angle: Math.PI / 2, desc: 'up' }, // 90° = up
    { angle: Math.PI, desc: 'left' }, // 180° = left
    { angle: -Math.PI / 2, desc: 'down' }, // 270° = down
    { angle: Math.PI / 4, desc: 'up-right' }, // 45°
    { angle: (3 * Math.PI) / 4, desc: 'up-left' }, // 135°
  ];
  
  let openSides = 0;
  
  for (const ray of rays) {
    const { points } = rayHits(gs, seed, ray.angle, overshoot * 1.5);
    
    // Odd number of intersections means ray exits (open side)
    // Even number means ray stays inside (enclosed side)
    const isOpen = points.length % 2 === 1;
    
    if (isOpen) {
      openSides++;
    }
  }
  
  // An aperture should have at least one open side
  // But not be fully enclosed (would be a counter) or fully open (would be invalid)
  return openSides >= 1 && openSides < rays.length;
}

