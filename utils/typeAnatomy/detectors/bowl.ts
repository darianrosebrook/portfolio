/**
 * Bowl feature detector.
 *
 * A bowl is a fully enclosed curved stroke (e.g., in 'b', 'd', 'o', 'p', 'q').
 * Uses the same contour-based pattern as counter.
 *
 * Fixed in v1:
 * - Uses contour classification as primary detection
 * - Scale-aware step sizes for radial sweep fallback
 * - Properly distinguishes bowl from counter
 */

import { getBaseContours, getHoleContours } from '../geometryCache';
import { rayHits, isInside } from '@/utils/geometry/geometryCore';
import type { FeatureInstance, GeometryCache, Point2D } from '../types';

/**
 * Detects bowl features on a glyph.
 * Returns circle or polyline shapes tracing the bowl regions.
 */
export function detectBowl(geo: GeometryCache): FeatureInstance[] {
  const { glyph, metrics, scale } = geo;

  if (!glyph?.path?.commands || !glyph.bbox) {
    return [];
  }

  const instances: FeatureInstance[] = [];
  const { eps, bboxW, bboxH, stemWidth, overshoot } = scale;

  // Primary method: detect bowls from base contours that are enclosed and curved
  // A bowl is a curved outer contour, while a counter is a hole contour
  const baseContours = getBaseContours(geo);
  const holeContours = getHoleContours(geo);

  // If there are hole contours, the glyph likely has bowls
  // The bowl is the outer curved stroke that encloses the counter
  if (holeContours.length > 0) {
    for (const hole of holeContours) {
      // The bowl is the enclosing curved region around this hole
      // Use the hole center to find the bowl's extent
      const cx = (hole.bbox.minX + hole.bbox.maxX) / 2;
      const cy = (hole.bbox.minY + hole.bbox.maxY) / 2;

      // Trace outward from hole center to find bowl boundary
      const bowlOutline = traceBowlFromHole(geo, { x: cx, y: cy });

      if (bowlOutline && bowlOutline.length >= 8) {
        instances.push({
          id: 'bowl',
          shape: { type: 'polyline', points: bowlOutline },
          confidence: 0.85,
          anchors: {
            center: { x: cx, y: cy },
            holeCenter: { x: cx, y: cy },
          },
          debug: {
            source: 'hole-contour',
            holeIndex: hole.index,
          },
        });
      } else {
        // Return circle approximation
        const holeWidth = hole.bbox.maxX - hole.bbox.minX;
        const holeHeight = hole.bbox.maxY - hole.bbox.minY;

        instances.push({
          id: 'bowl',
          shape: {
            type: 'circle',
            cx,
            cy,
            r: Math.max(holeWidth, holeHeight) / 2 + stemWidth,
          },
          confidence: 0.7,
          anchors: {
            center: { x: cx, y: cy },
          },
          debug: { source: 'hole-approximation' },
        });
      }
    }
    return instances;
  }

  // Fallback: scan-based detection for glyphs without hole contours
  // (e.g., stylized fonts where hole detection fails)
  if (!hasBowlCharacteristics(geo)) {
    return instances;
  }

  // Try to find bowl seed in x-height zone first
  let seed = findBowlSeed(geo, metrics.baseline, metrics.xHeight);

  // If not found, try cap-height zone
  if (!seed) {
    seed = findBowlSeed(geo, metrics.xHeight, metrics.capHeight);
  }

  if (!seed) {
    return instances;
  }

  const outline = traceBowlRegion(geo, seed);
  if (outline && outline.length >= 8) {
    instances.push({
      id: 'bowl',
      shape: { type: 'polyline', points: outline },
      confidence: 0.65,
      anchors: {
        seed,
        center: calculateCentroid(outline),
      },
      debug: { source: 'scanline-fallback' },
    });
  }

  return instances;
}

/**
 * Traces bowl boundary by radiating outward from hole center.
 * Picks the OUTER boundary (furthest hit before leaving glyph).
 */
function traceBowlFromHole(
  geo: GeometryCache,
  holeCenter: Point2D
): Point2D[] | null {
  const { svgShape, scale } = geo;
  const { eps, stemWidth, overshoot } = scale;

  const angularStep = 12;
  const outline: Point2D[] = [];

  for (let angleDeg = 0; angleDeg < 360; angleDeg += angularStep) {
    const rad = (angleDeg * Math.PI) / 180;
    const { points } = rayHits(svgShape, holeCenter, rad, overshoot);

    if (points.length >= 2) {
      // Pick the OUTER intersection (furthest from center that's still part of bowl)
      // For a bowl, we want the outer edge of the stroke, not the inner hole edge
      const outerPt = points[points.length - 1];
      outline.push(outerPt);
    } else if (points.length === 1) {
      outline.push(points[0]);
    }
  }

  return outline.length >= 8 ? outline : null;
}

/**
 * Checks if glyph has bowl characteristics using vertical scanlines.
 */
function hasBowlCharacteristics(geo: GeometryCache): boolean {
  const { glyph, svgShape, scale } = geo;
  const { bboxW, bboxH, overshoot } = scale;

  const steps = 5;
  let found = 0;

  for (let i = 1; i < steps; i++) {
    const x = glyph.bbox.minX + (bboxW * i) / steps;
    const origin = { x, y: glyph.bbox.minY - overshoot * 0.1 };
    const { points } = rayHits(svgShape, origin, Math.PI / 2, overshoot);

    // Bowl should have multiple intersections (enclosed region)
    if (points.length >= 4) {
      const relevantPoints = points.filter(
        (p) =>
          p.y > glyph.bbox.minY + bboxH * 0.1 &&
          p.y < glyph.bbox.maxY - bboxH * 0.1
      );

      if (relevantPoints.length >= 2) {
        found++;
      }
    }
  }

  return found >= 2;
}

/**
 * Finds a seed point inside a bowl region within specified vertical range.
 */
function findBowlSeed(
  geo: GeometryCache,
  yMin: number,
  yMax: number
): Point2D | null {
  const { glyph, svgShape, scale } = geo;
  const { bboxW, overshoot } = scale;

  const bands = 5;
  const delta = bboxW * 0.01;

  for (let i = 1; i < bands; i++) {
    const y = yMin + (i * (yMax - yMin)) / bands;
    const origin = { x: glyph.bbox.minX - overshoot * 0.1, y };
    const { points } = rayHits(svgShape, origin, 0, overshoot);

    if (points.length >= 2) {
      // Look for interior spans
      for (let j = 0; j < points.length - 1; j += 2) {
        const x1 = points[j].x;
        const x2 = points[j + 1].x;
        const testX = (x1 + x2) / 2;

        for (const nudge of [0, -delta, delta]) {
          const testPt = { x: testX + nudge, y };
          try {
            if (isInside(glyph, testPt)) {
              return testPt;
            }
          } catch {
            continue;
          }
        }
      }
    }
  }

  return null;
}

/**
 * Traces a bowl region by radial sweep from seed point.
 * Uses scale-aware step sizes.
 */
function traceBowlRegion(geo: GeometryCache, seed: Point2D): Point2D[] | null {
  const { glyph, scale } = geo;
  const { eps, stemWidth, overshoot } = scale;

  const angularStep = 12;
  const radialStep = Math.max(eps * 4, stemWidth * 0.15);
  const maxRadius = overshoot;

  const outline: Point2D[] = [];

  for (let angleDeg = 0; angleDeg < 360; angleDeg += angularStep) {
    const rad = (angleDeg * Math.PI) / 180;
    let len = radialStep;
    let lastInside: Point2D | null = null;

    while (len < maxRadius) {
      const pt = {
        x: seed.x + Math.cos(rad) * len,
        y: seed.y + Math.sin(rad) * len,
      };

      try {
        if (!isInside(glyph, pt)) {
          break;
        }
        lastInside = pt;
        len += radialStep;
      } catch {
        break;
      }
    }

    if (lastInside) {
      outline.push(lastInside);
    }
  }

  return outline.length >= 8 ? outline : null;
}

/**
 * Calculates the centroid of a polygon.
 */
function calculateCentroid(points: Point2D[]): Point2D {
  let sumX = 0;
  let sumY = 0;

  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
  }

  return {
    x: sumX / points.length,
    y: sumY / points.length,
  };
}
