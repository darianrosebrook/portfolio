/**
 * classifyContours Bezier-sampling accuracy tests.
 *
 * classifyContours derives winding, signed area, and bbox from the contour
 * polygon. Historically it sampled only segment ENDPOINTS, which makes the
 * polygon a chord approximation of every curve — for a high-curvature Bezier
 * the control points bow well outside the endpoint chord, so the endpoint-only
 * polygon underestimates area (can flip winding) and clips the bbox.
 *
 * These tests build a synthetic high-curvature cubic contour whose endpoints
 * are collinear/flat but whose curve bulges far outside the endpoint chord,
 * and assert the classified bbox + area reflect the actual curve geometry.
 */

import { describe, expect, it } from 'vitest';
import { classifyContours } from '@/utils/typeAnatomy/geometryCache';
import type {
  Metrics,
  SegmentWithMeta,
} from '@/utils/typeAnatomy/types';
import type { Glyph } from '@/ui/modules/FontInspector/fontkit-types';

/** Minimal glyph stub satisfying classifyContours' shape contract. */
function stubGlyph(): Glyph {
  return {
    path: { commands: [{ command: 'closePath', args: [] }] },
    bbox: { minX: 0, minY: 0, maxX: 100, maxY: 200 },
  } as unknown as Glyph;
}

const FLAT_METRICS: Metrics = {
  baseline: 0,
  xHeight: 500,
  capHeight: 700,
  ascent: 800,
  descent: -200,
};

/**
 * Closed "D-shape" contour: a cubic from (0,0) to (100,0) whose control points
 * bow up to y≈150, closed back along the baseline. Endpoints-only sampling
 * yields a degenerate flat polygon (all y=0); correct curve sampling yields a
 * bbox that reaches ~y=150 and a substantial signed area.
 */
function bulgingCubicSegments(): SegmentWithMeta[] {
  return [
    { type: 'moveTo', params: [{ x: 0, y: 0 }] },
    {
      type: 'bezierCurveTo',
      params: [
        { x: 0, y: 0 },
        { x: 25, y: 200 },
        { x: 75, y: 200 },
        { x: 100, y: 0 },
      ],
    },
    {
      type: 'lineTo',
      params: [
        { x: 100, y: 0 },
        { x: 0, y: 0 },
      ],
    },
    { type: 'closePath', params: [{ x: 0, y: 0 }] },
  ];
}

describe('classifyContours Bezier sampling', () => {
  it("classifies the bulging cubic's bbox beyond the endpoint chord", () => {
    const contours = classifyContours(
      stubGlyph(),
      bulgingCubicSegments(),
      FLAT_METRICS
    );

    expect(contours).toHaveLength(1);
    const c = contours[0];

    // Endpoint-only sampling would put maxY at 0 (all endpoints lie on y=0).
    // The cubic's midpoint sits at y = 0.75*200*0.5 = 150 (Bernstein at t=0.5).
    // Require sampling to recover at least y=100 of the bulge.
    expect(c.bbox.maxY).toBeGreaterThan(100);
  });

  it('produces a non-degenerate signed area for the bulging contour', () => {
    const contours = classifyContours(
      stubGlyph(),
      bulgingCubicSegments(),
      FLAT_METRICS
    );
    const c = contours[0];

    // Endpoint-only shoelace is ~0 (degenerate flat polygon). The bulged
    // polygon encloses a triangle-ish area on the order of 0.5*100*150 = 7500.
    expect(c.area).toBeGreaterThan(1000);
  });

  it('recovers a consistent winding sign for the closed curve', () => {
    const contours = classifyContours(
      stubGlyph(),
      bulgingCubicSegments(),
      FLAT_METRICS
    );
    const c = contours[0];

    // Winding must be ±1, never 0 (which is what a degenerate area would yield).
    expect(Math.abs(c.winding)).toBe(1);
  });
});
