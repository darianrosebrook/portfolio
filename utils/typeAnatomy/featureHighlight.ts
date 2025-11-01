/**
 * Feature path extraction and highlighting utilities.
 * Extracts relevant path segments for each anatomy feature and creates
 * highlight regions that match the glyph geometry.
 */

import type { Point2D } from '@/utils/geometry/geometry';
import { segmentsFor } from '@/utils/geometry/geometryHeuristics';
import type { Font, Glyph } from 'fontkit';
import type { Metrics } from './index';

export interface FeaturePathSegment {
  type: 'line' | 'bezier' | 'quadratic';
  points: Point2D[];
  // For bezier: [p0, c1, c2, p1]
  // For quadratic: [p0, c, p1]
  // For line: [p0, p1]
}

export interface FeatureHighlight {
  segments: FeaturePathSegment[];
  closed: boolean;
}

/**
 * Extracts path segments for the apex feature (top meeting point).
 */
export function extractApexSegments(
  glyph: Glyph,
  metrics: Metrics
): FeatureHighlight | null {
  const segments = segmentsFor(glyph);
  console.log(`[extractApexSegments] Total segments: ${segments.length}`, {
    metrics,
    segmentTypes: segments.map((s) => s.type),
  });

  if (segments.length === 0) {
    console.log('[extractApexSegments] No segments found');
    return null;
  }

  // Find segments near the top of the glyph
  const topY = metrics.ascent;
  const threshold = (metrics.ascent - metrics.capHeight) * 0.2;
  console.log(
    `[extractApexSegments] Looking for segments near topY=${topY}, threshold=${threshold}`
  );
  const apexSegments: FeaturePathSegment[] = [];

  for (const seg of segments) {
    if (seg.type === 'M' || !seg.params || seg.params.length < 2) continue;

    const points = seg.params as Point2D[];
    const segmentTop = Math.min(...points.map((p) => p.y));
    const segmentBottom = Math.max(...points.map((p) => p.y));

    console.log(`[extractApexSegments] Checking segment type=${seg.type}`, {
      segmentTop,
      segmentBottom,
      topY,
      threshold,
      isNearTop: segmentTop > topY - threshold && segmentTop < topY + threshold,
      points: points.map((p) => ({ x: p.x, y: p.y })),
    });

    // Check if segment is near the top
    if (segmentTop > topY - threshold && segmentTop < topY + threshold) {
      console.log(
        `[extractApexSegments] Segment matches! Adding to apexSegments`
      );
      if (seg.type === 'L' && points.length === 2) {
        apexSegments.push({
          type: 'line',
          points: points,
        });
      } else if (seg.type === 'C' && points.length === 4) {
        apexSegments.push({
          type: 'bezier',
          points: points,
        });
      } else if (seg.type === 'Q' && points.length === 3) {
        apexSegments.push({
          type: 'quadratic',
          points: points,
        });
      }
    }
  }

  const result =
    apexSegments.length > 0 ? { segments: apexSegments, closed: false } : null;

  console.log(`[extractApexSegments] Final result:`, {
    found: !!result,
    segmentCount: apexSegments.length,
    segments: apexSegments,
  });

  return result;
}

/**
 * Extracts path segments for the tail feature (descending stroke).
 */
export function extractTailSegments(
  glyph: Glyph,
  metrics: Metrics
): FeatureHighlight | null {
  const segments = segmentsFor(glyph);
  if (segments.length === 0) return null;

  const tailSegments: FeaturePathSegment[] = [];
  const baseline = metrics.baseline;

  for (const seg of segments) {
    if (seg.type === 'M' || !seg.params || seg.params.length < 2) continue;

    const points = seg.params as Point2D[];
    const segmentBottom = Math.max(...points.map((p) => p.y));

    // Check if segment extends below baseline
    if (segmentBottom < baseline) {
      if (seg.type === 'L' && points.length === 2) {
        tailSegments.push({
          type: 'line',
          points: points,
        });
      } else if (seg.type === 'C' && points.length === 4) {
        tailSegments.push({
          type: 'bezier',
          points: points,
        });
      } else if (seg.type === 'Q' && points.length === 3) {
        tailSegments.push({
          type: 'quadratic',
          points: points,
        });
      }
    }
  }

  return tailSegments.length > 0
    ? { segments: tailSegments, closed: false }
    : null;
}

/**
 * Extracts path segments for stem features (vertical strokes).
 * Handles both lowercase (x-height region) and uppercase (cap height region) letters.
 */
export function extractStemSegments(
  glyph: Glyph,
  metrics: Metrics,
  font: Font
): FeatureHighlight | null {
  const segments = segmentsFor(glyph);
  if (segments.length === 0) return null;

  const stemSegments: FeaturePathSegment[] = [];
  const UPEM = font.unitsPerEm ?? 1000;
  const minThickness = UPEM * 0.03;
  const xHeight = metrics.xHeight;
  const capHeight = metrics.capHeight;
  const baseline = metrics.baseline;
  const bbox = glyph.bbox;

  // Stems can be in both lowercase (x-height) and uppercase (cap height) regions
  const lowercaseTop = xHeight;
  const uppercaseTop = capHeight || bbox.maxY;

  for (const seg of segments) {
    if (seg.type === 'M' || !seg.params || seg.params.length < 2) continue;

    const points = seg.params as Point2D[];
    const minX = Math.min(...points.map((p) => p.x));
    const maxX = Math.max(...points.map((p) => p.x));
    const minY = Math.min(...points.map((p) => p.y));
    const maxY = Math.max(...points.map((p) => p.y));

    const width = maxX - minX;
    const height = maxY - minY;
    const isVertical = height > width * 2;
    const isThick = width >= minThickness;

    // Check if segment is in stem zone (either lowercase or uppercase)
    const inLowercaseZone = minY >= baseline && maxY <= lowercaseTop;
    const inUppercaseZone = minY >= baseline && maxY <= uppercaseTop;
    const inStemZone = inLowercaseZone || inUppercaseZone;

    if (isVertical && isThick && inStemZone) {
      if (seg.type === 'L' && points.length === 2) {
        stemSegments.push({
          type: 'line',
          points: points,
        });
      } else if (seg.type === 'C' && points.length === 4) {
        stemSegments.push({
          type: 'bezier',
          points: points,
        });
      } else if (seg.type === 'Q' && points.length === 3) {
        stemSegments.push({
          type: 'quadratic',
          points: points,
        });
      }
    }
  }

  return stemSegments.length > 0
    ? { segments: stemSegments, closed: false }
    : null;
}

/**
 * Extracts path segments for crossbar/bar features (horizontal dividers).
 * Handles both lowercase (x-height region) and uppercase (cap height region) letters.
 */
export function extractCrossbarSegments(
  glyph: Glyph,
  metrics: Metrics
): FeatureHighlight | null {
  const segments = segmentsFor(glyph);
  if (segments.length === 0) return null;

  const barSegments: FeaturePathSegment[] = [];
  const xHeight = metrics.xHeight;
  const capHeight = metrics.capHeight;
  const baseline = metrics.baseline;
  const bbox = glyph.bbox;
  const glyphHeight = bbox.maxY - bbox.minY;

  // For capital letters, crossbar is typically around middle of cap height
  // For lowercase letters, it's around x-height
  // Check both regions
  const lowercaseMidY = baseline + (xHeight - baseline) * 0.5;
  const uppercaseMidY = baseline + (capHeight - baseline) * 0.5;
  const tolerance = glyphHeight * 0.2;

  for (const seg of segments) {
    if (seg.type === 'M' || !seg.params || seg.params.length < 2) continue;

    const points = seg.params as Point2D[];
    const minX = Math.min(...points.map((p) => p.x));
    const maxX = Math.max(...points.map((p) => p.x));
    const minY = Math.min(...points.map((p) => p.y));
    const maxY = Math.max(...points.map((p) => p.y));

    const width = maxX - minX;
    const height = maxY - minY;
    const isHorizontal = width > height * 2;
    const segmentMidY = (minY + maxY) / 2;

    // Check if segment is near either the lowercase midline (x-height) or uppercase midline (cap height)
    const isNearLowercaseMidline =
      Math.abs(segmentMidY - lowercaseMidY) < tolerance;
    const isNearUppercaseMidline =
      Math.abs(segmentMidY - uppercaseMidY) < tolerance;
    const isNearMidline = isNearLowercaseMidline || isNearUppercaseMidline;

    if (isHorizontal && isNearMidline) {
      if (seg.type === 'L' && points.length === 2) {
        barSegments.push({
          type: 'line',
          points: points,
        });
      } else if (seg.type === 'C' && points.length === 4) {
        barSegments.push({
          type: 'bezier',
          points: points,
        });
      } else if (seg.type === 'Q' && points.length === 3) {
        barSegments.push({
          type: 'quadratic',
          points: points,
        });
      }
    }
  }

  return barSegments.length > 0
    ? { segments: barSegments, closed: false }
    : null;
}

/**
 * Extracts path segments for serif features (terminal projections).
 */
export function extractSerifSegments(
  glyph: Glyph,
  _metrics: Metrics
): FeatureHighlight | null {
  const segments = segmentsFor(glyph);
  if (segments.length === 0) return null;

  const serifSegments: FeaturePathSegment[] = [];
  const bbox = glyph.bbox;
  const bboxW = bbox.maxX - bbox.minX;
  const bboxH = bbox.maxY - bbox.minY;

  for (const seg of segments) {
    if (seg.type === 'M' || !seg.params || seg.params.length < 2) continue;

    const points = seg.params as Point2D[];
    const minX = Math.min(...points.map((p) => p.x));
    const maxX = Math.max(...points.map((p) => p.x));
    const minY = Math.min(...points.map((p) => p.y));
    const maxY = Math.max(...points.map((p) => p.y));

    const width = maxX - minX;
    const height = maxY - minY;
    const isSmall = width < bboxW * 0.15 && height < bboxH * 0.2;
    const isAtEdge =
      Math.abs(minX - bbox.minX) < bboxW * 0.1 ||
      Math.abs(maxX - bbox.maxX) < bboxW * 0.1;

    if (isSmall && isAtEdge) {
      if (seg.type === 'L' && points.length === 2) {
        serifSegments.push({
          type: 'line',
          points: points,
        });
      } else if (seg.type === 'C' && points.length === 4) {
        serifSegments.push({
          type: 'bezier',
          points: points,
        });
      } else if (seg.type === 'Q' && points.length === 3) {
        serifSegments.push({
          type: 'quadratic',
          points: points,
        });
      }
    }
  }

  return serifSegments.length > 0
    ? { segments: serifSegments, closed: false }
    : null;
}

/**
 * Extracts path segments for ear features (small projections).
 */
export function extractEarSegments(
  glyph: Glyph,
  metrics: Metrics
): FeatureHighlight | null {
  const segments = segmentsFor(glyph);
  if (segments.length === 0) return null;

  const earSegments: FeaturePathSegment[] = [];
  const bbox = glyph.bbox;
  const cx = bbox.maxX - (bbox.maxX - bbox.minX) * 0.2;
  const cy = metrics.xHeight + (metrics.ascent - metrics.xHeight) * 0.2;

  for (const seg of segments) {
    if (seg.type === 'M' || !seg.params || seg.params.length < 2) continue;

    const points = seg.params as Point2D[];
    const avgX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const avgY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

    const distFromCenter = Math.hypot(avgX - cx, avgY - cy);
    const radius = (bbox.maxX - bbox.minX) * 0.3;

    if (distFromCenter < radius) {
      if (seg.type === 'L' && points.length === 2) {
        earSegments.push({
          type: 'line',
          points: points,
        });
      } else if (seg.type === 'C' && points.length === 4) {
        earSegments.push({
          type: 'bezier',
          points: points,
        });
      } else if (seg.type === 'Q' && points.length === 3) {
        earSegments.push({
          type: 'quadratic',
          points: points,
        });
      }
    }
  }

  return earSegments.length > 0
    ? { segments: earSegments, closed: false }
    : null;
}

/**
 * Extracts path segments for arm features (horizontal/angled strokes).
 */
export function extractArmSegments(
  glyph: Glyph,
  metrics: Metrics
): FeatureHighlight | null {
  const segments = segmentsFor(glyph);
  if (segments.length === 0) return null;

  const armSegments: FeaturePathSegment[] = [];
  const xHeight = metrics.xHeight;
  const baseline = metrics.baseline;

  for (const seg of segments) {
    if (seg.type === 'M' || !seg.params || seg.params.length < 2) continue;

    const points = seg.params as Point2D[];
    const minX = Math.min(...points.map((p) => p.x));
    const maxX = Math.max(...points.map((p) => p.x));
    const minY = Math.min(...points.map((p) => p.y));
    const maxY = Math.max(...points.map((p) => p.y));

    const width = maxX - minX;
    const height = maxY - minY;
    const isHorizontal = width > height * 1.5;
    const inArmZone = minY >= baseline && maxY <= xHeight;
    const isRightSide = minX > (glyph.bbox.minX + glyph.bbox.maxX) / 2;

    if (isHorizontal && inArmZone && isRightSide) {
      if (seg.type === 'L' && points.length === 2) {
        armSegments.push({
          type: 'line',
          points: points,
        });
      } else if (seg.type === 'C' && points.length === 4) {
        armSegments.push({
          type: 'bezier',
          points: points,
        });
      } else if (seg.type === 'Q' && points.length === 3) {
        armSegments.push({
          type: 'quadratic',
          points: points,
        });
      }
    }
  }

  return armSegments.length > 0
    ? { segments: armSegments, closed: false }
    : null;
}

/**
 * Extracts path segments for bowl features (enclosed curved counters).
 */
export function extractBowlSegments(
  glyph: Glyph,
  metrics: Metrics
): FeatureHighlight | null {
  const segments = segmentsFor(glyph);
  if (segments.length === 0) return null;

  const bowlSegments: FeaturePathSegment[] = [];
  const xHeight = metrics.xHeight;
  const baseline = metrics.baseline;

  for (const seg of segments) {
    if (seg.type === 'M' || !seg.params || seg.params.length < 2) continue;

    const points = seg.params as Point2D[];
    const minY = Math.min(...points.map((p) => p.y));
    const maxY = Math.max(...points.map((p) => p.y));
    const minX = Math.min(...points.map((p) => p.x));
    const maxX = Math.max(...points.map((p) => p.x));

    // Bowl segments are typically curved and in the middle zone
    const isInBowlZone = minY >= baseline && maxY <= xHeight;
    const isCurved = seg.type === 'C' || seg.type === 'Q';
    const width = maxX - minX;
    const height = maxY - minY;
    const isRounded =
      width > 0 && height > 0 && width / height < 2 && height / width < 2;

    if (isInBowlZone && (isCurved || isRounded)) {
      if (seg.type === 'L' && points.length === 2) {
        bowlSegments.push({
          type: 'line',
          points: points,
        });
      } else if (seg.type === 'C' && points.length === 4) {
        bowlSegments.push({
          type: 'bezier',
          points: points,
        });
      } else if (seg.type === 'Q' && points.length === 3) {
        bowlSegments.push({
          type: 'quadratic',
          points: points,
        });
      }
    }
  }

  return bowlSegments.length > 0
    ? { segments: bowlSegments, closed: false }
    : null;
}

/**
 * Extracts path segments for eye features (enclosed counters with open apertures).
 */
export function extractEyeSegments(
  glyph: Glyph,
  metrics: Metrics
): FeatureHighlight | null {
  // Eye is similar to bowl but typically has an opening
  // For now, use bowl extraction logic
  return extractBowlSegments(glyph, metrics);
}

/**
 * Extracts path segments for aperture features (open spaces/voids).
 * Aperture is the opening between counter and outside space.
 */
export function extractApertureSegments(
  glyph: Glyph,
  metrics: Metrics
): FeatureHighlight | null {
  const segments = segmentsFor(glyph);
  if (segments.length === 0) return null;

  const apertureSegments: FeaturePathSegment[] = [];
  const xHeight = metrics.xHeight;
  const capHeight = metrics.capHeight;
  const baseline = metrics.baseline;
  const bbox = glyph.bbox;

  // Aperture can be in both lowercase and uppercase regions
  // Look for segments that form openings (typically on the right side for 'c', 'e', 'a')
  const apertureZoneTop = Math.max(capHeight, xHeight);
  const apertureZoneBottom = baseline;

  for (const seg of segments) {
    if (seg.type === 'M' || !seg.params || seg.params.length < 2) continue;

    const points = seg.params as Point2D[];
    const minX = Math.min(...points.map((p) => p.x));
    const minY = Math.min(...points.map((p) => p.y));
    const maxY = Math.max(...points.map((p) => p.y));

    // Aperture segments are typically curved and form openings
    const isInApertureZone =
      minY >= apertureZoneBottom && maxY <= apertureZoneTop;
    const isCurved = seg.type === 'C' || seg.type === 'Q';
    // Aperture openings are often on the right side
    const isRightSide = minX > (bbox.minX + bbox.maxX) * 0.4;

    if (isInApertureZone && (isCurved || isRightSide)) {
      if (seg.type === 'L' && points.length === 2) {
        apertureSegments.push({
          type: 'line',
          points: points,
        });
      } else if (seg.type === 'C' && points.length === 4) {
        apertureSegments.push({
          type: 'bezier',
          points: points,
        });
      } else if (seg.type === 'Q' && points.length === 3) {
        apertureSegments.push({
          type: 'quadratic',
          points: points,
        });
      }
    }
  }

  return apertureSegments.length > 0
    ? { segments: apertureSegments, closed: false }
    : null;
}

/**
 * Extracts path segments for crotch features (interior angles, e.g. A, V, W).
 */
export function extractCrotchSegments(
  glyph: Glyph,
  metrics: Metrics
): FeatureHighlight | null {
  const segments = segmentsFor(glyph);
  if (segments.length === 0) return null;

  const crotchSegments: FeaturePathSegment[] = [];
  const baseline = metrics.baseline;
  const xHeight = metrics.xHeight;
  const bbox = glyph.bbox;
  const cx = (bbox.minX + bbox.maxX) / 2;

  // Crotch is typically at the bottom interior angle (below x-height, near baseline)
  const crotchY = baseline + (xHeight - baseline) * 0.2;
  const tolerance = (xHeight - baseline) * 0.3;

  for (const seg of segments) {
    if (seg.type === 'M' || !seg.params || seg.params.length < 2) continue;

    const points = seg.params as Point2D[];
    const maxY = Math.max(...points.map((p) => p.y));
    const avgX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const avgY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

    // Crotch segments are near the expected crotch position
    const isNearCrotchY = Math.abs(avgY - crotchY) < tolerance;
    const isNearCenterX = Math.abs(avgX - cx) < (bbox.maxX - bbox.minX) * 0.3;
    const isInLowerZone = maxY <= baseline + (xHeight - baseline) * 0.5;

    if (isNearCrotchY && isNearCenterX && isInLowerZone) {
      if (seg.type === 'L' && points.length === 2) {
        crotchSegments.push({
          type: 'line',
          points: points,
        });
      } else if (seg.type === 'C' && points.length === 4) {
        crotchSegments.push({
          type: 'bezier',
          points: points,
        });
      } else if (seg.type === 'Q' && points.length === 3) {
        crotchSegments.push({
          type: 'quadratic',
          points: points,
        });
      }
    }
  }

  return crotchSegments.length > 0
    ? { segments: crotchSegments, closed: false }
    : null;
}

/**
 * Extracts path segments for foot features (stem resting on baseline).
 */
export function extractFootSegments(
  glyph: Glyph,
  metrics: Metrics
): FeatureHighlight | null {
  const segments = segmentsFor(glyph);
  if (segments.length === 0) return null;

  const footSegments: FeaturePathSegment[] = [];
  const baseline = metrics.baseline;
  const xHeight = metrics.xHeight;
  const footTolerance = (xHeight - baseline) * 0.15; // Small range around baseline

  for (const seg of segments) {
    if (seg.type === 'M' || !seg.params || seg.params.length < 2) continue;

    const points = seg.params as Point2D[];
    const minX = Math.min(...points.map((p) => p.x));
    const maxX = Math.max(...points.map((p) => p.x));
    const minY = Math.min(...points.map((p) => p.y));
    const maxY = Math.max(...points.map((p) => p.y));

    // Foot segments are at the baseline with some vertical component
    const height = maxY - minY;
    const width = maxX - minX;
    const isVertical = height > width * 1.5;
    const isAtBaseline =
      Math.abs(maxY - baseline) < footTolerance ||
      Math.abs(minY - baseline) < footTolerance;
    const extendsToBaseline =
      minY <= baseline && maxY >= baseline - footTolerance;

    if ((isAtBaseline || extendsToBaseline) && isVertical) {
      if (seg.type === 'L' && points.length === 2) {
        footSegments.push({
          type: 'line',
          points: points,
        });
      } else if (seg.type === 'C' && points.length === 4) {
        footSegments.push({
          type: 'bezier',
          points: points,
        });
      } else if (seg.type === 'Q' && points.length === 3) {
        footSegments.push({
          type: 'quadratic',
          points: points,
        });
      }
    }
  }

  return footSegments.length > 0
    ? { segments: footSegments, closed: false }
    : null;
}

/**
 * Extracts path segments for arc features (curved stroke extending from stem).
 */
export function extractArcSegments(
  glyph: Glyph,
  metrics: Metrics
): FeatureHighlight | null {
  const segments = segmentsFor(glyph);
  if (segments.length === 0) return null;

  const arcSegments: FeaturePathSegment[] = [];
  const xHeight = metrics.xHeight;
  const baseline = metrics.baseline;
  const arcStartY = baseline;
  const arcEndY = xHeight;

  for (const seg of segments) {
    if (seg.type === 'M' || !seg.params || seg.params.length < 2) continue;

    const points = seg.params as Point2D[];
    const minY = Math.min(...points.map((p) => p.y));
    const maxY = Math.max(...points.map((p) => p.y));
    const isCurved = seg.type === 'C' || seg.type === 'Q';
    const isInArcZone = minY >= arcStartY && maxY <= arcEndY;
    const spansArcZone = minY <= arcStartY && maxY >= arcEndY;

    // Arc segments are typically curved and in the arc region
    if (isInArcZone && isCurved) {
      if (seg.type === 'L' && points.length === 2) {
        arcSegments.push({
          type: 'line',
          points: points,
        });
      } else if (seg.type === 'C' && points.length === 4) {
        arcSegments.push({
          type: 'bezier',
          points: points,
        });
      } else if (seg.type === 'Q' && points.length === 3) {
        arcSegments.push({
          type: 'quadratic',
          points: points,
        });
      }
    } else if (spansArcZone && isCurved) {
      // Also include segments that span the arc zone
      if (seg.type === 'C' && points.length === 4) {
        arcSegments.push({
          type: 'bezier',
          points: points,
        });
      } else if (seg.type === 'Q' && points.length === 3) {
        arcSegments.push({
          type: 'quadratic',
          points: points,
        });
      }
    }
  }

  return arcSegments.length > 0
    ? { segments: arcSegments, closed: false }
    : null;
}

/**
 * Extracts path segments for finial features (terminal endings).
 */
export function extractFinialSegments(
  glyph: Glyph,
  metrics: Metrics
): FeatureHighlight | null {
  const segments = segmentsFor(glyph);
  if (segments.length === 0) return null;

  const finialSegments: FeaturePathSegment[] = [];
  const xHeight = metrics.xHeight;
  const baseline = metrics.baseline;
  const bbox = glyph.bbox;
  const bboxW = bbox.maxX - bbox.minX;

  // Finials are typically at terminal points (ends of strokes)
  const finialZoneTop = xHeight;
  const finialZoneBottom = baseline;

  for (const seg of segments) {
    if (seg.type === 'M' || !seg.params || seg.params.length < 2) continue;

    const points = seg.params as Point2D[];
    const minX = Math.min(...points.map((p) => p.x));
    const maxX = Math.max(...points.map((p) => p.x));
    const minY = Math.min(...points.map((p) => p.y));
    const maxY = Math.max(...points.map((p) => p.y));

    // Finials are typically at the edges (left or right) and in the terminal zone
    const isAtLeftEdge = Math.abs(minX - bbox.minX) < bboxW * 0.15;
    const isAtRightEdge = Math.abs(maxX - bbox.maxX) < bboxW * 0.15;
    const isInFinialZone = minY >= finialZoneBottom && maxY <= finialZoneTop;

    if ((isAtLeftEdge || isAtRightEdge) && isInFinialZone) {
      if (seg.type === 'L' && points.length === 2) {
        finialSegments.push({
          type: 'line',
          points: points,
        });
      } else if (seg.type === 'C' && points.length === 4) {
        finialSegments.push({
          type: 'bezier',
          points: points,
        });
      } else if (seg.type === 'Q' && points.length === 3) {
        finialSegments.push({
          type: 'quadratic',
          points: points,
        });
      }
    }
  }

  return finialSegments.length > 0
    ? { segments: finialSegments, closed: false }
    : null;
}

/**
 * Extracts path segments for loop features (closed/partial below baseline).
 */
export function extractLoopSegments(
  glyph: Glyph,
  metrics: Metrics
): FeatureHighlight | null {
  const segments = segmentsFor(glyph);
  if (segments.length === 0) return null;

  const loopSegments: FeaturePathSegment[] = [];
  const baseline = metrics.baseline;
  const descent =
    metrics.descent || baseline - (baseline - metrics.baseline) * 0.3;

  for (const seg of segments) {
    if (seg.type === 'M' || !seg.params || seg.params.length < 2) continue;

    const points = seg.params as Point2D[];
    const minY = Math.min(...points.map((p) => p.y));
    const maxY = Math.max(...points.map((p) => p.y));
    const isCurved = seg.type === 'C' || seg.type === 'Q';

    // Loop segments are below baseline, typically curved
    const isBelowBaseline = maxY < baseline && minY > descent;

    if (isBelowBaseline && isCurved) {
      if (seg.type === 'C' && points.length === 4) {
        loopSegments.push({
          type: 'bezier',
          points: points,
        });
      } else if (seg.type === 'Q' && points.length === 3) {
        loopSegments.push({
          type: 'quadratic',
          points: points,
        });
      }
    }
  }

  return loopSegments.length > 0
    ? { segments: loopSegments, closed: false }
    : null;
}

/**
 * Extracts path segments for terminal features (stroke endings).
 */
export function extractTerminalSegments(
  glyph: Glyph,
  metrics: Metrics
): FeatureHighlight | null {
  // Terminal is similar to finial but may be more specific
  // For now, use finial extraction logic
  return extractFinialSegments(glyph, metrics);
}

/**
 * Extracts path segments for vertex features (bottom meeting point).
 */
export function extractVertexSegments(
  glyph: Glyph,
  metrics: Metrics
): FeatureHighlight | null {
  const segments = segmentsFor(glyph);
  if (segments.length === 0) return null;

  const vertexSegments: FeaturePathSegment[] = [];
  const baseline = metrics.baseline;
  const bbox = glyph.bbox;
  const cx = (bbox.minX + bbox.maxX) / 2;
  const tolerance = (bbox.maxY - bbox.minY) * 0.15;

  for (const seg of segments) {
    if (seg.type === 'M' || !seg.params || seg.params.length < 2) continue;

    const points = seg.params as Point2D[];
    const maxY = Math.max(...points.map((p) => p.y));
    const avgX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const avgY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

    // Vertex is at the bottom center, near baseline
    const isNearBaseline = Math.abs(avgY - baseline) < tolerance;
    const isNearCenterX = Math.abs(avgX - cx) < (bbox.maxX - bbox.minX) * 0.3;
    const isAtBottom = maxY <= baseline + tolerance;

    if (isNearBaseline && isNearCenterX && isAtBottom) {
      if (seg.type === 'L' && points.length === 2) {
        vertexSegments.push({
          type: 'line',
          points: points,
        });
      } else if (seg.type === 'C' && points.length === 4) {
        vertexSegments.push({
          type: 'bezier',
          points: points,
        });
      } else if (seg.type === 'Q' && points.length === 3) {
        vertexSegments.push({
          type: 'quadratic',
          points: points,
        });
      }
    }
  }

  return vertexSegments.length > 0
    ? { segments: vertexSegments, closed: false }
    : null;
}

/**
 * Extracts path segments for shoulder features (curved transition from stem to bowl).
 */
export function extractShoulderSegments(
  glyph: Glyph,
  metrics: Metrics
): FeatureHighlight | null {
  const segments = segmentsFor(glyph);
  if (segments.length === 0) return null;

  const shoulderSegments: FeaturePathSegment[] = [];
  const xHeight = metrics.xHeight;
  const baseline = metrics.baseline;
  const shoulderStartY = baseline + (xHeight - baseline) * 0.3;
  const shoulderEndY = baseline + (xHeight - baseline) * 0.8;

  for (const seg of segments) {
    if (seg.type === 'M' || !seg.params || seg.params.length < 2) continue;

    const points = seg.params as Point2D[];
    const minY = Math.min(...points.map((p) => p.y));
    const maxY = Math.max(...points.map((p) => p.y));
    const isCurved = seg.type === 'C' || seg.type === 'Q';

    // Shoulder segments are in the shoulder zone and typically curved
    const isInShoulderZone = minY >= shoulderStartY && maxY <= shoulderEndY;
    const spansShoulderZone = minY <= shoulderStartY && maxY >= shoulderEndY;

    if ((isInShoulderZone || spansShoulderZone) && isCurved) {
      if (seg.type === 'C' && points.length === 4) {
        shoulderSegments.push({
          type: 'bezier',
          points: points,
        });
      } else if (seg.type === 'Q' && points.length === 3) {
        shoulderSegments.push({
          type: 'quadratic',
          points: points,
        });
      }
    }
  }

  return shoulderSegments.length > 0
    ? { segments: shoulderSegments, closed: false }
    : null;
}

/**
 * Extracts path segments for spine features (S-curve stroke).
 */
export function extractSpineSegments(
  glyph: Glyph,
  metrics: Metrics
): FeatureHighlight | null {
  const segments = segmentsFor(glyph);
  if (segments.length === 0) return null;

  const spineSegments: FeaturePathSegment[] = [];
  const xHeight = metrics.xHeight;
  const baseline = metrics.baseline;
  const ascent = metrics.ascent || xHeight;
  const descent = metrics.descent || baseline;
  const spineStartY = baseline - (baseline - descent) * 0.2;
  const spineEndY = xHeight + (ascent - xHeight) * 0.2;

  for (const seg of segments) {
    if (seg.type === 'M' || !seg.params || seg.params.length < 2) continue;

    const points = seg.params as Point2D[];
    const minY = Math.min(...points.map((p) => p.y));
    const maxY = Math.max(...points.map((p) => p.y));
    const isCurved = seg.type === 'C' || seg.type === 'Q';

    // Spine segments span the middle region and are curved
    const spansSpineZone = minY <= spineStartY && maxY >= spineEndY;
    const isInSpineZone = minY >= spineStartY && maxY <= spineEndY;

    if ((spansSpineZone || isInSpineZone) && isCurved) {
      if (seg.type === 'C' && points.length === 4) {
        spineSegments.push({
          type: 'bezier',
          points: points,
        });
      } else if (seg.type === 'Q' && points.length === 3) {
        spineSegments.push({
          type: 'quadratic',
          points: points,
        });
      }
    }
  }

  return spineSegments.length > 0
    ? { segments: spineSegments, closed: false }
    : null;
}

/**
 * Registry mapping feature names to their extractor functions.
 * This centralizes feature extraction logic and makes it easy to add new features.
 */
type FeatureExtractor = (
  glyph: Glyph,
  metrics: Metrics,
  font?: Font
) => FeatureHighlight | null;

const featureExtractors = new Map<string, FeatureExtractor>([
  ['Apex', (g, m) => extractApexSegments(g, m)],
  ['Arc', (g, m) => extractArcSegments(g, m)],
  ['Aperture', (g, m) => extractApertureSegments(g, m)],
  ['Arm', (g, m) => extractArmSegments(g, m)],
  ['Bar', (g, m) => extractCrossbarSegments(g, m)],
  ['Beak', (_g, _m) => null], // TODO: Add extractor
  ['Bowl', (g, m) => extractBowlSegments(g, m)],
  ['Bracket', (_g, _m) => null], // TODO: Add extractor
  ['Counter', (_g, _m) => null], // Uses shape-based rendering, not segments
  ['Cross stroke', (g, m) => extractCrossbarSegments(g, m)],
  ['Crossbar', (g, m) => extractCrossbarSegments(g, m)],
  ['Crotch', (g, m) => extractCrotchSegments(g, m)],
  ['Ear', (g, m) => extractEarSegments(g, m)],
  ['Eye', (g, m) => extractEyeSegments(g, m)],
  ['Finial', (g, m) => extractFinialSegments(g, m)],
  ['Foot', (g, m) => extractFootSegments(g, m)],
  ['Hook', (_g, _m) => null], // TODO: Add extractor
  ['Leg', (_g, _m) => null], // TODO: Add extractor
  ['Link', (_g, _m) => null], // TODO: Add extractor
  ['Loop', (g, m) => extractLoopSegments(g, m)],
  ['Neck', (_g, _m) => null], // TODO: Add extractor
  ['Serif', (g, m) => extractSerifSegments(g, m)],
  ['Shoulder', (g, m) => extractShoulderSegments(g, m)],
  ['Spine', (g, m) => extractSpineSegments(g, m)],
  ['Spur', (_g, _m) => null], // TODO: Add extractor
  ['Stem', (g, m, font) => (font ? extractStemSegments(g, m, font) : null)],
  ['Tail', (g, m) => extractTailSegments(g, m)],
  ['Terminal', (g, m) => extractTerminalSegments(g, m)],
  ['Tittle', (_g, _m, _font) => null], // Uses shape-based rendering, not segments
  ['Vertex', (g, m) => extractVertexSegments(g, m)],
]);

/**
 * Main function to extract feature path segments.
 */
export function extractFeatureSegments(
  featureName: string,
  glyph: Glyph,
  metrics: Metrics,
  font?: Font
): FeatureHighlight | null {
  console.log(`[extractFeatureSegments] Extracting ${featureName}`, {
    glyphCode: glyph.codePoints?.[0] ?? glyph.id,
    glyphName: glyph.name,
    metrics,
    hasFont: !!font,
  });

  const extractor = featureExtractors.get(featureName);

  if (!extractor) {
    console.log(`[extractFeatureSegments] No extractor for ${featureName}`);
    return null;
  }

  const result = extractor(glyph, metrics, font);

  if (result) {
    console.log(`[extractFeatureSegments] ${featureName} extracted:`, {
      segmentCount: result.segments?.length || 0,
      closed: result.closed,
      segments: result.segments?.map((seg, i) => ({
        index: i,
        type: seg.type,
        pointCount: seg.points.length,
        points: seg.points,
      })),
    });
  } else {
    console.log(
      `[extractFeatureSegments] ${featureName} extraction returned null`
    );
  }

  return result;
}
