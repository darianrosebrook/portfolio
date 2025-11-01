/**
 * Spine feature detection for typographic glyphs.
 * Detects the main curved stroke in letters like 's'.
 */

import type { Glyph } from 'fontkit';
import { getOvershoot, shapeForV2 } from '@/utils/caching/caching';
import { rayHits, isDrawable } from '@/utils/geometry/geometryCore';
import type { Metrics } from './index';
import { FeatureDetectionConfig } from './featureConfig';

/**
 * Detects if a glyph contains a spine (main S-curve stroke, e.g., in 's').
 * Uses vertical scanning to detect curved paths that span the middle region.
 * @param g - The fontkit Glyph object.
 * @param m - Font metrics
 * @returns boolean
 */
export function hasSpine(g: Glyph, m: Metrics): boolean {
  if (!isDrawable(g)) return false;
  
  const gs = shapeForV2(g);
  const overshoot = getOvershoot(g);
  const bboxW = g.bbox.maxX - g.bbox.minX;
  const bands = 5; // Vertical scan bands
  
  // Spine typically spans from slightly below baseline to slightly above x-height
  const spineStartY = m.baseline - (m.baseline - m.descent) * 0.2;
  const spineEndY = m.xHeight + (m.ascent - m.xHeight) * 0.2;
  const spineHeight = spineEndY - spineStartY;
  
  let curvedPathCount = 0;
  
  // Scan vertically across the glyph
  for (let i = 1; i < bands; i++) {
    const x = g.bbox.minX + (bboxW * i) / bands;
    const origin = { x, y: -overshoot };
    
    const { points } = rayHits(gs, origin, Math.PI / 2, overshoot * 2);
    
    // Count intersections that fall within the spine region
    const spineIntersections = points.filter(
      (p) => p.y >= spineStartY && p.y <= spineEndY
    );
    
    // A spine should have multiple intersections (S-curve typically has 2+ crossings)
    // and should span a significant portion of the middle region
    if (spineIntersections.length >= 2) {
      // Check if the intersections span a significant portion of the spine height
      const minY = Math.min(...spineIntersections.map((p) => p.y));
      const maxY = Math.max(...spineIntersections.map((p) => p.y));
      const span = maxY - minY;
      
      if (span > spineHeight * 0.4) {
        curvedPathCount++;
      }
    }
  }
  
  // Require multiple bands to confirm a spine
  return curvedPathCount >= FeatureDetectionConfig.stem.minThickBands;
}

