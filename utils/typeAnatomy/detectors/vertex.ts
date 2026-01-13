/**
 * Vertex feature detector.
 *
 * A vertex is the bottommost meeting point of two strokes (e.g., V, W, Y).
 * Mirrors apex.ts structure but targets the baseline/descender band.
 *
 * v2 improvements:
 * - Uses geo.scale primitives consistently
 * - Italic angle compensation for slanted fonts
 * - More robust baseline-band gating
 */

import { rayHits } from '@/utils/geometry/geometryCore';
import type { FeatureInstance, GeometryCache, Point2D } from '../types';

/**
 * Checks if a point is in the baseline band.
 * Band extends slightly above baseline for rounded vertices.
 */
function isInBottomBand(
  pt: Point2D,
  glyphBottom: number,
  glyphHeight: number
): boolean {
  const bandHeight = glyphHeight * 0.2;
  return (
    pt.y <= glyphBottom + bandHeight && pt.y >= glyphBottom - bandHeight * 0.5
  );
}

/**
 * Detects vertex features on a glyph.
 * Returns point shapes at detected vertex locations.
 */
export function detectVertex(geo: GeometryCache): FeatureInstance[] {
  const { glyph, svgShape, scale, italicAngle, metrics } = geo;

  if (!glyph?.path?.commands || !glyph.bbox) {
    return [];
  }

  const instances: FeatureInstance[] = [];
  const { eps, bboxW, bboxH } = scale;

  // Use actual glyph bottom
  const glyphBottom = glyph.bbox.minY;
  const rayLength = bboxH * 1.5;

  // Italic angle compensation: adjust ray angles for slanted fonts
  const angleCorrection = (italicAngle * Math.PI) / 180;

  // Base ray angles: 225 degrees (down-left) and 315 degrees (down-right)
  // For italics, rotate both angles by the italic slant
  const leftAngle = (Math.PI * 5) / 4 + angleCorrection;
  const rightAngle = (Math.PI * 7) / 4 + angleCorrection;

  // Probe Y positions: multiple heights for robustness
  const probeYPositions = [
    glyphBottom + bboxH * 0.1,
    glyphBottom + bboxH * 0.2,
    glyphBottom + bboxH * 0.3,
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

      // Find bottommost points from each ray (lowest Y in glyph coords)
      const botL = leftRay.points.reduce((a, b) => (a.y < b.y ? a : b));
      const botR = rightRay.points.reduce((a, b) => (a.y < b.y ? a : b));

      // Bottom-band gating: filter to points near glyph bottom
      if (
        !isInBottomBand(botL, glyphBottom, bboxH) ||
        !isInBottomBand(botR, glyphBottom, bboxH)
      ) {
        continue;
      }

      // Check if both hits are at the same floor level
      const yDiff = Math.abs(botL.y - botR.y);
      const xDiff = Math.abs(botL.x - botR.x);

      // Y convergence threshold: scale-aware
      const yOK = yDiff < Math.max(eps * 20, bboxH * 0.05);
      if (!yOK) {
        continue;
      }

      // Determine if sharp vertex or flat bottom
      const sharpThreshold = Math.max(eps * 8, bboxW * 0.05);
      const flatMaxThreshold = bboxW * 0.3;

      const isSharp = xDiff < sharpThreshold;
      const isFlat = xDiff >= sharpThreshold && xDiff < flatMaxThreshold;

      if (!isSharp && !isFlat) {
        continue;
      }

      const midX = (botL.x + botR.x) / 2;
      const midY = (botL.y + botR.y) / 2;

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
        const vertexPoint: Point2D = { x: midX, y: midY };
        instances.push({
          id: 'vertex',
          shape: {
            type: 'point',
            x: vertexPoint.x,
            y: vertexPoint.y,
            label: 'Vertex',
          },
          confidence: 0.9,
          anchors: {
            tip: vertexPoint,
            left: botL,
            right: botR,
          },
          debug: { italicCompensation: angleCorrection },
        });
      } else {
        // Flat bottom - floor line
        instances.push({
          id: 'vertex',
          shape: {
            type: 'line',
            x1: botL.x,
            y1: botL.y,
            x2: botR.x,
            y2: botR.y,
          },
          confidence: 0.7,
          anchors: {
            left: botL,
            right: botR,
          },
          debug: { type: 'flat-bottom', italicCompensation: angleCorrection },
        });
      }
    }
  }

  return instances;
}
