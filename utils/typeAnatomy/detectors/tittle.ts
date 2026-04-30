/**
 * Tittle feature detector.
 *
 * A tittle is the dot above letters like 'i' and 'j'.
 *
 * This detector consumes the disconnected-mark topology evidence family
 * (utils/typeAnatomy/evidence/topology). It composes four predicates in
 * fixed order: main-body-fragment rejection (already applied at contour
 * classification time, see geometryCache.classifyContours), compactness,
 * above-main-body, and lower-stem alignment. Any candidate that fails any
 * predicate is rejected — there is no ray-based fallback.
 *
 * The previous implementation had a ray-fallback that scanned horizontal
 * bands above x-height looking for narrow strokes. That fallback fired on
 * any glyph whose upper region contained narrow ink — including the H,
 * whose stems happily registered as a "tittle" through the misnamed-by-
 * accident ray. With topology classification now reliable, the fallback
 * has no purpose: if no contour was classified as a mark, there is no
 * tittle. Period.
 */

import type { FeatureInstance, GeometryCache } from '../types';
import { getMarkContours } from '../geometryCache';
import {
  circleToPolygon,
  extractContourPolygon,
} from '../evidence/regionFromShape';
import {
  type ContourGroup,
  findMainBodyGroup,
  getConnectedGroups,
  isAboveMainBody,
  isAlignedWithLowerStem,
  isCompactContour,
} from '../evidence/topology';

export function detectTittle(geo: GeometryCache): FeatureInstance[] {
  const { glyph, metrics, scale, contours } = geo;

  if (!glyph?.path?.commands || !glyph.bbox) {
    return [];
  }

  const markContours = getMarkContours(geo);
  if (markContours.length === 0) {
    return [];
  }

  // Identify the main body. A glyph with a mark contour but no main body
  // (theoretical: a path that's only a diacritic) is not a tittle context.
  const groups = getConnectedGroups(contours, 0.5);
  const mainBody = findMainBodyGroup(groups);
  if (!mainBody) {
    return [];
  }

  // Vertical-separation epsilon. Sub-design-unit drift is absorbed; anything
  // larger means a real gap between the main body and the candidate. Scale
  // off stemWidth so the threshold scales with glyph size.
  const verticalEpsilon = Math.max(scale.eps * 5, scale.stemWidth * 0.2);

  const instances: FeatureInstance[] = [];

  for (const mark of markContours) {
    // Wrap the mark contour as a one-element group so it satisfies the
    // ContourGroup-shaped predicates without forcing every predicate to
    // accept a raw ContourClassification.
    const candidateGroup: ContourGroup = {
      contours: [mark],
      bbox: mark.bbox,
      area: mark.area,
    };

    if (
      !isCompactContour(mark.bbox, {
        glyphBBox: glyph.bbox,
        metrics,
        stemWidth: scale.stemWidth,
      })
    ) {
      continue;
    }

    if (!isAboveMainBody(candidateGroup, mainBody, verticalEpsilon)) {
      continue;
    }

    if (
      !isAlignedWithLowerStem(candidateGroup, mainBody, {
        stemWidth: scale.stemWidth,
      })
    ) {
      continue;
    }

    const width = mark.bbox.maxX - mark.bbox.minX;
    const height = mark.bbox.maxY - mark.bbox.minY;
    const cx = (mark.bbox.minX + mark.bbox.maxX) / 2;
    const cy = (mark.bbox.minY + mark.bbox.maxY) / 2;
    const r = Math.max(width, height) / 2;

    const circle = { type: 'circle' as const, cx, cy, r };
    // Prefer the actual mark contour over a circle approximation: Nohemi's
    // tittle is square, Inter's is round, Newsreader's is teardrop. Fall
    // back to the circle approximation when extraction can't trace the
    // contour (e.g., arc commands that the helper rejects).
    const contourPolygon = extractContourPolygon(
      geo.glyph,
      mark.startIndex,
      mark.endIndex
    );
    const regionPoints =
      contourPolygon.length >= 3 ? contourPolygon : circleToPolygon(circle);

    instances.push({
      id: 'tittle',
      shape: circle,
      region: { kind: 'stroke', points: regionPoints },
      confidence: 0.95,
      anchors: {
        center: { x: cx, y: cy },
      },
      debug: {
        source: 'topology',
        contourIndex: mark.index,
        markBBox: mark.bbox,
        mainBodyBBox: mainBody.bbox,
      },
    });
  }

  return instances;
}
