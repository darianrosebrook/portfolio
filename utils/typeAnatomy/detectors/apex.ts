/**
 * Apex feature detector.
 *
 * An apex is the topmost meeting point of two strokes (e.g., A, M, N, W).
 * Can return multiple instances for flat-topped letters (ridge) or
 * letters with multiple apexes (M, W).
 *
 * v2 improvements:
 * - Uses geo.scale primitives consistently
 * - Italic angle compensation for slanted fonts
 * - Probes from actual glyph top, not just capHeight
 * - More robust cap-band gating
 */

import { rayHits } from '@/utils/geometry/geometryCore';
import type { FeatureInstance, GeometryCache, Point2D } from '../types';

/**
 * Checks if a point is in the top band of the glyph.
 */
function isInTopBand(
  pt: Point2D,
  glyphTop: number,
  glyphHeight: number
): boolean {
  const bandHeight = glyphHeight * 0.2;
  return pt.y >= glyphTop - bandHeight && pt.y <= glyphTop + bandHeight * 0.5;
}

/**
 * Detects apex features on a glyph.
 * Returns point shapes at detected apex locations.
 */
export function detectApex(geo: GeometryCache): FeatureInstance[] {
  const { glyph, svgShape, scale, italicAngle } = geo;

  if (!glyph?.path?.commands || !glyph.bbox) {
    return [];
  }

  const instances: FeatureInstance[] = [];
  const { eps, bboxW, bboxH } = scale;

  // Use actual glyph top
  const glyphTop = glyph.bbox.maxY;
  const rayLength = bboxH * 1.5;

  // Italic angle compensation: adjust ray angles for slanted fonts
  // italicAngle is in degrees, convert to radians
  const angleCorrection = (italicAngle * Math.PI) / 180;

  // Base ray angles: 135 degrees (up-left) and 45 degrees (up-right)
  // For italics, rotate both angles by the italic slant
  const leftAngle = (Math.PI * 3) / 4 + angleCorrection;
  const rightAngle = Math.PI / 4 + angleCorrection;

  // Probe Y positions: multiple heights for robustness
  const probeYPositions = [
    glyphTop - bboxH * 0.1,
    glyphTop - bboxH * 0.2,
    glyphTop - bboxH * 0.3,
  ];

  // Probe multiple x positions to avoid symmetry bias
  const probeXPositions = [0.2, 0.35, 0.5, 0.65, 0.8].map(
    (t) => glyph.bbox.minX + bboxW * t
  );

  for (const probeY of probeYPositions) {
    for (const probeX of probeXPositions) {
      const leftRay = rayHits(
        svgShape,
        { x: probeX, y: probeY },
        leftAngle,
        rayLength
      );
      const rightRay = rayHits(
        svgShape,
        { x: probeX, y: probeY },
        rightAngle,
        rayLength
      );

      if (leftRay.points.length === 0 || rightRay.points.length === 0) {
        continue;
      }

      // Find topmost points from each ray (highest Y in glyph coords)
      const topL = leftRay.points.reduce((a, b) => (a.y > b.y ? a : b));
      const topR = rightRay.points.reduce((a, b) => (a.y > b.y ? a : b));

      // Top-band gating: filter to points near glyph top
      if (
        !isInTopBand(topL, glyphTop, bboxH) ||
        !isInTopBand(topR, glyphTop, bboxH)
      ) {
        continue;
      }

      // Check if both hits are on the same roof level
      const yDiff = Math.abs(topL.y - topR.y);
      const xDiff = Math.abs(topL.x - topR.x);

      // Y convergence threshold: scale-aware
      const yOK = yDiff < Math.max(eps * 20, bboxH * 0.05);
      if (!yOK) {
        continue;
      }

      // Determine if sharp apex or ridge
      const sharpThreshold = Math.max(eps * 8, bboxW * 0.05);
      const ridgeMaxThreshold = bboxW * 0.3;

      const isSharp = xDiff < sharpThreshold;
      const isRidge = xDiff >= sharpThreshold && xDiff < ridgeMaxThreshold;

      if (!isSharp && !isRidge) {
        continue;
      }

      const midX = (topL.x + topR.x) / 2;
      const midY = (topL.y + topR.y) / 2;

      // 2D duplicate suppression
      const isDuplicate = instances.some((inst) => {
        let instX: number;
        let instY: number;

        if (inst.shape.type === 'point') {
          instX = inst.shape.x;
          instY = inst.shape.y;
        } else if (inst.shape.type === 'line') {
          instX = (inst.shape.x1 + inst.shape.x2) / 2;
          instY = (inst.shape.y1 + inst.shape.y2) / 2;
        } else {
          return false;
        }

        const distance = Math.hypot(instX - midX, instY - midY);
        const threshold = Math.max(eps * 30, bboxW * 0.05);
        return distance < threshold;
      });

      if (isDuplicate) {
        continue;
      }

      // Emit feature instance
      if (isSharp) {
        const apexPoint: Point2D = { x: midX, y: midY };
        instances.push({
          id: 'apex',
          shape: {
            type: 'point',
            x: apexPoint.x,
            y: apexPoint.y,
            label: 'Apex',
          },
          confidence: 0.9,
          anchors: {
            tip: apexPoint,
            left: topL,
            right: topR,
          },
          debug: { italicCompensation: angleCorrection },
        });
      } else {
        // Flat top - ridge line
        instances.push({
          id: 'apex',
          shape: {
            type: 'line',
            x1: topL.x,
            y1: topL.y,
            x2: topR.x,
            y2: topR.y,
          },
          confidence: 0.7,
          anchors: {
            left: topL,
            right: topR,
          },
          debug: { type: 'ridge', italicCompensation: angleCorrection },
        });
      }
    }
  }

  return instances;
}
