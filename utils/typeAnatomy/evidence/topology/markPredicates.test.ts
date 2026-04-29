/**
 * Unit tests for mark-classification predicates.
 *
 * Predicates accept BBox + topology data; tests construct fixtures by hand.
 * No GeometryCache, no font, no glyph paths. Every predicate is exercised
 * with at least one positive case (predicate fires) and one negative case
 * (predicate rejects), per TYPEANATOMY-001 A6.
 */

import { describe, expect, it } from 'vitest';
import type { BBox, ContourClassification, Metrics } from '../../types';
import { getConnectedGroups, type ContourGroup } from './disconnectedContours';
import {
  isAboveMainBody,
  isAlignedWithLowerStem,
  isCompactContour,
  rejectsAsMainBodyFragment,
} from './markPredicates';

const NOHEMI_LIKE_METRICS: Metrics = {
  baseline: 0,
  xHeight: 500,
  capHeight: 700,
  ascent: 800,
  descent: -200,
};

const GLYPH_BBOX: BBox = { minX: 0, minY: 0, maxX: 400, maxY: 800 };

function contour(
  index: number,
  bbox: BBox,
  type: ContourClassification['type'] = 'base'
): ContourClassification {
  return {
    index,
    type,
    bbox,
    area: (bbox.maxX - bbox.minX) * (bbox.maxY - bbox.minY),
    winding: type === 'hole' ? -1 : 1,
    startIndex: index,
    endIndex: index,
  };
}

function singleContourGroup(bbox: BBox): ContourGroup {
  const c = contour(0, bbox);
  return getConnectedGroups([c])[0];
}

describe('isCompactContour', () => {
  it('accepts a small near-square dot', () => {
    const dot: BBox = { minX: 100, minY: 600, maxX: 160, maxY: 660 };
    expect(
      isCompactContour(dot, {
        glyphBBox: GLYPH_BBOX,
        metrics: NOHEMI_LIKE_METRICS,
      })
    ).toBe(true);
  });

  it('rejects a long horizontal bar (aspect ratio too extreme)', () => {
    const bar: BBox = { minX: 50, minY: 600, maxX: 350, maxY: 640 };
    // width=300, height=40 → ratio=7.5
    expect(
      isCompactContour(bar, {
        glyphBBox: GLYPH_BBOX,
        metrics: NOHEMI_LIKE_METRICS,
      })
    ).toBe(false);
  });

  it('rejects a tall thin stem (aspect ratio too extreme)', () => {
    const stem: BBox = { minX: 180, minY: 0, maxX: 220, maxY: 700 };
    expect(
      isCompactContour(stem, {
        glyphBBox: GLYPH_BBOX,
        metrics: NOHEMI_LIKE_METRICS,
      })
    ).toBe(false);
  });

  it('rejects a contour wider than maxWidthInStems × stemWidth when stemWidth is provided', () => {
    // 200×100 dot. With stemWidth=40, maxWidthInStems default 3.0 → max 120.
    const wideDot: BBox = { minX: 100, minY: 600, maxX: 300, maxY: 700 };
    expect(
      isCompactContour(wideDot, {
        glyphBBox: GLYPH_BBOX,
        metrics: NOHEMI_LIKE_METRICS,
        stemWidth: 40,
      })
    ).toBe(false);
  });

  it('skips the stem-width check when stemWidth is omitted', () => {
    // Same dot, no stemWidth provided — passes (aspect ratio + height ok).
    const dot: BBox = { minX: 100, minY: 600, maxX: 300, maxY: 700 };
    expect(
      isCompactContour(dot, {
        glyphBBox: GLYPH_BBOX,
        metrics: NOHEMI_LIKE_METRICS,
      })
    ).toBe(true);
  });

  it('accepts a dot whose width is comparable to the stem (Nohemi i case)', () => {
    // Nohemi i: dot bbox 425×500, stemWidth 405. Width / stem = 1.05 ≤ 3.
    const dot: BBox = { minX: 150, minY: 2460, maxX: 575, maxY: 2960 };
    expect(
      isCompactContour(dot, {
        glyphBBox: { minX: 150, minY: 0, maxX: 575, maxY: 2960 },
        metrics: { ...NOHEMI_LIKE_METRICS, xHeight: 2205, capHeight: 2860 },
        stemWidth: 405,
      })
    ).toBe(true);
  });

  it('rejects a contour taller than 1.2× x-height', () => {
    // x-height = 500. 1.2× = 600. This dot is 700 tall.
    const tallDot: BBox = { minX: 100, minY: 0, maxX: 200, maxY: 700 };
    expect(
      isCompactContour(tallDot, {
        glyphBBox: GLYPH_BBOX,
        metrics: NOHEMI_LIKE_METRICS,
      })
    ).toBe(false);
  });

  it('returns false for zero-size bboxes', () => {
    const zero: BBox = { minX: 100, minY: 100, maxX: 100, maxY: 100 };
    expect(
      isCompactContour(zero, {
        glyphBBox: GLYPH_BBOX,
        metrics: NOHEMI_LIKE_METRICS,
      })
    ).toBe(false);
  });

  it('respects custom maxAspectRatio override', () => {
    // 60×100 dot, ratio = 1.667. Default 2.0 accepts; override 1.5 rejects.
    const dot: BBox = { minX: 100, minY: 600, maxX: 160, maxY: 700 };
    expect(
      isCompactContour(dot, {
        glyphBBox: GLYPH_BBOX,
        metrics: NOHEMI_LIKE_METRICS,
      })
    ).toBe(true);
    expect(
      isCompactContour(dot, {
        glyphBBox: GLYPH_BBOX,
        metrics: NOHEMI_LIKE_METRICS,
        maxAspectRatio: 1.5,
      })
    ).toBe(false);
  });
});

describe('isAboveMainBody', () => {
  it('returns true when candidate sits clearly above main body', () => {
    const main = singleContourGroup({ minX: 100, minY: 0, maxX: 140, maxY: 500 });
    const dot = singleContourGroup({ minX: 100, minY: 600, maxX: 140, maxY: 660 });
    expect(isAboveMainBody(dot, main, 5)).toBe(true);
  });

  it('returns false when candidate overlaps the main body vertically', () => {
    const main = singleContourGroup({ minX: 100, minY: 0, maxX: 140, maxY: 500 });
    const overlap = singleContourGroup({ minX: 200, minY: 400, maxX: 240, maxY: 600 });
    expect(isAboveMainBody(overlap, main, 5)).toBe(false);
  });

  it('returns false when candidate touches main body within epsilon', () => {
    const main = singleContourGroup({ minX: 100, minY: 0, maxX: 140, maxY: 500 });
    // Candidate's minY is exactly main body's maxY.
    const touching = singleContourGroup({ minX: 100, minY: 500, maxX: 140, maxY: 560 });
    expect(isAboveMainBody(touching, main, 5)).toBe(false);
  });
});

describe('isAlignedWithLowerStem', () => {
  it('returns true when candidate is centered over a stem in the main body', () => {
    // Main body is one stem at x=100..140, center 120.
    const main = singleContourGroup({ minX: 100, minY: 0, maxX: 140, maxY: 500 });
    // Dot at x=100..140 → center 120, perfectly aligned.
    const dot = singleContourGroup({ minX: 100, minY: 600, maxX: 140, maxY: 660 });
    expect(
      isAlignedWithLowerStem(dot, main, { stemWidth: 40 })
    ).toBe(true);
  });

  it('returns true when candidate is within ±stemWidth of stem center', () => {
    const main = singleContourGroup({ minX: 100, minY: 0, maxX: 140, maxY: 500 });
    // Dot offset by 30 design units (stemWidth=40, tolerance=40).
    const dot = singleContourGroup({ minX: 130, minY: 600, maxX: 170, maxY: 660 });
    expect(
      isAlignedWithLowerStem(dot, main, { stemWidth: 40 })
    ).toBe(true);
  });

  it('returns false when candidate is too far from any stem', () => {
    const main = singleContourGroup({ minX: 100, minY: 0, maxX: 140, maxY: 500 });
    // Dot center at x=300, stem center at 120. Distance 180 >> stemWidth=40.
    const dot = singleContourGroup({ minX: 280, minY: 600, maxX: 320, maxY: 660 });
    expect(
      isAlignedWithLowerStem(dot, main, { stemWidth: 40 })
    ).toBe(false);
  });

  it('selects the closest of multiple stems in the main body group', () => {
    // H-like main body with two stems. (Constructed by overlap so they're one
    // group; here we fake it by having both contours land in the same group.)
    const left = contour(0, { minX: 100, minY: 0, maxX: 140, maxY: 500 });
    const crossbar = contour(1, { minX: 130, minY: 240, maxX: 270, maxY: 280 });
    const right = contour(2, { minX: 260, minY: 0, maxX: 300, maxY: 500 });
    const groups = getConnectedGroups([left, crossbar, right]);
    expect(groups).toHaveLength(1);
    const main = groups[0];

    // Dot aligned with right stem (center x≈280).
    const dot = singleContourGroup({ minX: 260, minY: 600, maxX: 300, maxY: 660 });
    expect(
      isAlignedWithLowerStem(dot, main, { stemWidth: 40 })
    ).toBe(true);
  });
});

describe('rejectsAsMainBodyFragment', () => {
  it('returns false when candidate is genuinely isolated (no other bbox overlaps)', () => {
    const dot: BBox = { minX: 100, minY: 600, maxX: 140, maxY: 660 };
    const others: BBox[] = [{ minX: 100, minY: 0, maxX: 140, maxY: 500 }];
    expect(rejectsAsMainBodyFragment(dot, others)).toBe(false);
  });

  it('returns true when candidate overlaps another non-hole contour bbox', () => {
    // Candidate at x=100..200 overlaps another at x=150..300.
    const candidate: BBox = { minX: 100, minY: 200, maxX: 200, maxY: 300 };
    const others: BBox[] = [{ minX: 150, minY: 250, maxX: 300, maxY: 350 }];
    expect(rejectsAsMainBodyFragment(candidate, others)).toBe(true);
  });

  it('does not self-reject when the same bbox object appears in others', () => {
    // The predicate skips identity-equal bboxes so callers can pass the full
    // list including the candidate itself without spurious self-rejection.
    const candidate: BBox = { minX: 0, minY: 0, maxX: 100, maxY: 100 };
    expect(rejectsAsMainBodyFragment(candidate, [candidate])).toBe(false);
  });

  it('rejects candidates whose bbox touches another at gap=0 with default epsilon', () => {
    // Touching counts as connected — a candidate that shares an edge with a
    // sibling contour is a fragment of the same path, not an isolated mark.
    const candidate: BBox = { minX: 0, minY: 0, maxX: 100, maxY: 100 };
    const adjacent: BBox = { minX: 100, minY: 0, maxX: 200, maxY: 100 };
    expect(rejectsAsMainBodyFragment(candidate, [adjacent], 0)).toBe(true);
  });

  it('does not reject when the gap exceeds epsilon', () => {
    const candidate: BBox = { minX: 0, minY: 0, maxX: 100, maxY: 100 };
    // 10-unit gap on the x axis.
    const separated: BBox = { minX: 110, minY: 0, maxX: 200, maxY: 100 };
    expect(rejectsAsMainBodyFragment(candidate, [separated], 5)).toBe(false);
    expect(rejectsAsMainBodyFragment(candidate, [separated], 15)).toBe(true);
  });

  it('returns false when others is empty', () => {
    const candidate: BBox = { minX: 0, minY: 0, maxX: 100, maxY: 100 };
    expect(rejectsAsMainBodyFragment(candidate, [])).toBe(false);
  });
});
