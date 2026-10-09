/**
 * Geometry accuracy tests for typographic anatomy detection.
 *
 * These tests assert anatomical expectations: a feature must be found in the
 * right count, with the right renderable shape family, in the expected region
 * of the glyph. They are separate from API-contract tests that only prove
 * detectors return without throwing.
 *
 * Positive and hostile cases pin anatomical meaning and selected regions.
 */

import { describe, expect, it, beforeAll } from 'vitest';
import type { Font } from 'fontkit';
import {
  centerOf,
  detect,
  expectInRange,
  glyphFor,
  loadFont,
  normalized,
  pointInPolygon,
  regionBBox,
  shapeBBox,
} from '@/test/utils/fixtures/fontFixtures';

describe('type anatomy geometry accuracy', () => {
  let nohemi: Font;
  let newsreader: Font;

  beforeAll(() => {
    nohemi = loadFont('Nohemi-VF.ttf');
    newsreader = loadFont('Newsreader-VF.ttf');
  });

  // --- stems ---------------------------------------------------------------

  it('places the two H stems at the left and right sides of the glyph', () => {
    const glyph = glyphFor(nohemi, 'H');
    const stems = detect(nohemi, 'H', 'stem');

    expect(stems).toHaveLength(2);

    const sorted = [...stems].sort(
      (a, b) => centerOf(a.shape).x - centerOf(b.shape).x
    );

    const left = normalized(centerOf(sorted[0].shape), glyph.bbox);
    const right = normalized(centerOf(sorted[1].shape), glyph.bbox);
    expectInRange(left.x, 0, 0.25);
    expectInRange(right.x, 0.75, 1);

    for (const stem of stems) {
      expect(stem.shape.type).toBe('rect');
      const bbox = shapeBBox(stem.shape);
      const stemHeightRatio =
        (bbox.maxY - bbox.minY) / (glyph.bbox.maxY - glyph.bbox.minY);
      expect(stemHeightRatio).toBeGreaterThanOrEqual(0.85);
    }
  });

  it('places a single T stem centered horizontally and full height', () => {
    const glyph = glyphFor(nohemi, 'T');
    const stems = detect(nohemi, 'T', 'stem');

    expect(stems).toHaveLength(1);
    expect(stems[0].shape.type).toBe('rect');

    const center = normalized(centerOf(stems[0].shape), glyph.bbox);
    expectInRange(center.x, 0.4, 0.6);

    const stemBBox = shapeBBox(stems[0].shape);
    const heightRatio =
      (stemBBox.maxY - stemBBox.minY) / (glyph.bbox.maxY - glyph.bbox.minY);
    expect(heightRatio).toBeGreaterThanOrEqual(0.95);
  });

  it('places the single E stem on the left side, full height', () => {
    const glyph = glyphFor(nohemi, 'E');
    const stems = detect(nohemi, 'E', 'stem');

    expect(stems).toHaveLength(1);
    expect(stems[0].shape.type).toBe('rect');

    const center = normalized(centerOf(stems[0].shape), glyph.bbox);
    expectInRange(center.x, 0, 0.25);

    const stemBBox = shapeBBox(stems[0].shape);
    const heightRatio =
      (stemBBox.maxY - stemBBox.minY) / (glyph.bbox.maxY - glyph.bbox.minY);
    expect(heightRatio).toBeGreaterThanOrEqual(0.95);
  });

  it('places the two M stems at the far left and far right edges', () => {
    const glyph = glyphFor(nohemi, 'M');
    const stems = detect(nohemi, 'M', 'stem');

    expect(stems).toHaveLength(2);
    const sorted = [...stems].sort(
      (a, b) => centerOf(a.shape).x - centerOf(b.shape).x
    );
    const left = normalized(centerOf(sorted[0].shape), glyph.bbox);
    const right = normalized(centerOf(sorted[1].shape), glyph.bbox);
    expectInRange(left.x, 0, 0.15);
    expectInRange(right.x, 0.85, 1);
  });

  // --- bowl / counter ------------------------------------------------------

  it('places the O bowl spanning the full glyph (O is its own bowl)', () => {
    const glyph = glyphFor(nohemi, 'O');
    const bowls = detect(nohemi, 'O', 'bowl');

    expect(bowls).toHaveLength(1);
    expect(bowls[0].shape.type).toBe('rect');

    const center = normalized(centerOf(bowls[0].shape), glyph.bbox);
    expectInRange(center.x, 0.4, 0.6);
    expectInRange(center.y, 0.4, 0.6);
  });

  it('finds exactly one counter inside Nohemi O', () => {
    const counters = detect(nohemi, 'O', 'counter');
    expect(counters).toHaveLength(1);
  });

  it('finds exactly one counter inside Newsreader o (curve commands)', () => {
    const counters = detect(newsreader, 'o', 'counter');
    expect(counters).toHaveLength(1);
  });

  // --- eye / loop / ear (curved-letter features) ---------------------------

  it('places the e eye inside the upper-middle bowl region', () => {
    const glyph = glyphFor(nohemi, 'e');
    const eyes = detect(nohemi, 'e', 'eye');

    expect(eyes).toHaveLength(1);
    expect(eyes[0].shape.type).toBe('polyline');

    const eyeCenter = normalized(centerOf(eyes[0].shape), glyph.bbox);
    expectInRange(eyeCenter.x, 0.3, 0.7);
    expectInRange(eyeCenter.y, 0.5, 0.9);
  });

  it('does not rename the Newsreader a counter as an eye', () => {
    expect(detect(newsreader, 'a', 'eye')).toEqual([]);
  });

  it('finds the loop on Newsreader g below the baseline', () => {
    const loops = detect(newsreader, 'g', 'loop');

    expect(loops).toHaveLength(1);
    const loopBBox = shapeBBox(loops[0].shape);
    // Newsreader g bbox starts at y=-530, so the loop should extend below baseline (0).
    expect(loopBBox.minY).toBeLessThan(0);
  });

  it('finds the ear on Newsreader g in the upper-right region', () => {
    const glyph = glyphFor(newsreader, 'g');
    const ears = detect(newsreader, 'g', 'ear');

    expect(ears).toHaveLength(1);
    const center = normalized(centerOf(ears[0].shape), glyph.bbox);
    expectInRange(center.x, 0.75, 1.0);
    expectInRange(center.y, 0.85, 1.0);
  });

  // --- terminal anatomy on shaped strokes ----------------------------------

  it('places the Q tail below the baseline on the lower-right side', () => {
    const glyph = glyphFor(nohemi, 'Q');
    const tails = detect(nohemi, 'Q', 'tail');

    expect(tails).toHaveLength(1);
    expect(tails[0].shape.type).toBe('polyline');

    const tailBBox = shapeBBox(tails[0].shape);
    const tailEnd = normalized(tails[0].anchors!.end, glyph.bbox);
    expect(tailBBox.minY).toBeLessThan(0);
    expectInRange(tailEnd.x, 0.75, 1);
    expectInRange(tailEnd.y, 0, 0.25);
  });

  it('places the S spine through the vertical body of the glyph', () => {
    const glyph = glyphFor(nohemi, 'S');
    const spines = detect(nohemi, 'S', 'spine');

    expect(spines).toHaveLength(1);
    expect(spines[0].shape.type).toBe('polyline');

    const spineBBox = shapeBBox(spines[0].shape);
    const glyphHeight = glyph.bbox.maxY - glyph.bbox.minY;
    const spineHeightRatio = (spineBBox.maxY - spineBBox.minY) / glyphHeight;
    expect(spineHeightRatio).toBeGreaterThanOrEqual(0.8);
  });

  // --- aperture (counter-form openings) ------------------------------------

  it('finds a side aperture on Nohemi e at mid-height', () => {
    const glyph = glyphFor(nohemi, 'e');
    const apertures = detect(nohemi, 'e', 'aperture');

    expect(apertures.length).toBeGreaterThanOrEqual(1);
    const right = apertures.find(
      (instance) => (instance.debug as { side?: string })?.side === 'right'
    );
    expect(right).toBeDefined();
    const mouth = normalized(centerOf(right!.shape), glyph.bbox);
    expect(mouth.x).toBeGreaterThan(0.7);
  });
});

describe('positive and hostile anatomy regression cases', () => {
  let nohemi: Font;
  let newsreader: Font;

  beforeAll(() => {
    nohemi = loadFont('Nohemi-VF.ttf');
    newsreader = loadFont('Newsreader-VF.ttf');
  });

  // -- false negatives: detectors return [] on glyphs that have the feature --

  it('detects the lowercase i tittle above the stem', () => {
    const glyph = glyphFor(nohemi, 'i');
    const tittles = detect(nohemi, 'i', 'tittle');

    expect(tittles).toHaveLength(1);
    expect(tittles[0].shape.type).toBe('circle');

    const center = normalized(centerOf(tittles[0].shape), glyph.bbox);
    expectInRange(center.x, 0.25, 0.75);
    expectInRange(center.y, 0.75, 1);
  });

  it('detects the lowercase j tittle above the stem', () => {
    const glyph = glyphFor(nohemi, 'j');
    const tittles = detect(nohemi, 'j', 'tittle');

    expect(tittles).toHaveLength(1);
    expect(tittles[0].shape.type).toBe('circle');

    // Note: j's glyph bbox is asymmetric — the descender extends far left
    // (minX is well negative), so the upper stem (and the dot above it)
    // sits at normalized x ≈ 0.77, not ~0.5 as it would on a symmetric glyph
    // like i. The detector's alignment is enforced by isAlignedWithLowerStem
    // at runtime; this test loosens the x range to accommodate the bbox
    // asymmetry rather than reimplementing stem alignment in the assertion.
    const center = normalized(centerOf(tittles[0].shape), glyph.bbox);
    expectInRange(center.x, 0.25, 0.85);
    expectInRange(center.y, 0.75, 1);
  });

  it('detects the T arms as the two free horizontal top extensions', () => {
    const arms = detect(nohemi, 'T', 'arm');
    expect(arms).toHaveLength(2);
    const glyph = glyphFor(nohemi, 'T');
    for (const arm of arms) {
      const bounds = shapeBBox(arm.shape);
      expect(bounds.minY).toBeGreaterThan(glyph.bbox.maxY * 0.8);
      expect(bounds.maxX - bounds.minX).toBeGreaterThan(
        bounds.maxY - bounds.minY
      );
    }
  });

  it('detects the three E arms — top, middle, bottom', () => {
    const arms = detect(nohemi, 'E', 'arm');
    expect(arms.length).toBeGreaterThanOrEqual(3);
  });

  it('detects the V crotch at the bottom-center sharp join', () => {
    const crotches = detect(nohemi, 'V', 'crotch');
    expect(crotches).toHaveLength(1);
  });

  it('detects the A crotch at the interior of the upper angle', () => {
    const crotches = detect(nohemi, 'A', 'crotch');
    expect(crotches).toHaveLength(1);
  });

  it('detects two vertices on Nohemi A at the leg-end region', () => {
    const vertices = detect(nohemi, 'A', 'vertex');
    expect(vertices.length).toBeGreaterThanOrEqual(2);
  });

  it('detects serifs on Newsreader I (foot + cap, both sides)', () => {
    const serifs = detect(newsreader, 'I', 'serif');
    expect(serifs.length).toBeGreaterThanOrEqual(2);
  });

  it('detects the spur on Nohemi G', () => {
    const spurs = detect(nohemi, 'G', 'spur');
    expect(spurs).toHaveLength(1);
  });

  it('detects the finials on Nohemi c', () => {
    const finials = detect(nohemi, 'c', 'finial');
    expect(finials.length).toBeGreaterThanOrEqual(1);
  });

  it('detects the finials on Newsreader c', () => {
    const finials = detect(newsreader, 'c', 'finial');
    expect(finials.length).toBeGreaterThanOrEqual(1);
  });

  it('does not invent an ear on Newsreader a', () => {
    expect(detect(newsreader, 'a', 'ear')).toEqual([]);
  });

  // -- false positives: detector fires where the feature does not exist -----

  it('rejects spurious arms on Nohemi A — A has legs, not arms', () => {
    const arms = detect(nohemi, 'A', 'arm');
    expect(arms).toHaveLength(0);
  });

  it('finds exactly one apex on Nohemi A as a point near the top center', () => {
    const apexes = detect(nohemi, 'A', 'apex');
    expect(apexes).toHaveLength(1);
    expect(apexes[0].shape.type).toBe('point');
  });

  it('does not report an apex on Nohemi V', () => {
    // V has no apex — its top corners are stroke terminations of the
    // two diagonals, not a junction. The apex detector must reject
    // them as isolated sharp corners.
    const apexes = detect(nohemi, 'V', 'apex');
    expect(apexes).toHaveLength(0);
  });

  it('returns a bowl smaller than the full glyph for Nohemi b', () => {
    const glyph = glyphFor(nohemi, 'b');
    const bowls = detect(nohemi, 'b', 'bowl');

    expect(bowls).toHaveLength(1);
    const bbox = shapeBBox(bowls[0].shape);
    const widthRatio =
      (bbox.maxX - bbox.minX) / (glyph.bbox.maxX - glyph.bbox.minX);
    // b's bowl is on the right side; it should not span the full glyph width.
    expect(widthRatio).toBeLessThan(0.85);
  });

  it('finds one left backbone stem on Nohemi b without claiming its bowl edge', () => {
    const glyph = glyphFor(nohemi, 'b');
    const stems = detect(nohemi, 'b', 'stem');
    expect(stems).toHaveLength(1);
    const bounds = shapeBBox(stems[0].shape);
    expect(bounds.minX).toBeCloseTo(glyph.bbox.minX, 5);
    expect(bounds.maxX).toBeLessThan(
      glyph.bbox.minX + (glyph.bbox.maxX - glyph.bbox.minX) * 0.3
    );
    expect(bounds.maxY - bounds.minY).toBeGreaterThan(
      (glyph.bbox.maxY - glyph.bbox.minY) * 0.8
    );
  });

  it('does not rename the Newsreader g counters as eyes', () => {
    expect(detect(newsreader, 'g', 'eye')).toEqual([]);
  });

  it('does not classify Newsreader a serif feet as finials', () => {
    expect(detect(newsreader, 'a', 'finial')).toEqual([]);
  });

  it('finds exactly one aperture on Nohemi c — c only opens on the right', () => {
    const apertures = detect(nohemi, 'c', 'aperture');
    expect(apertures).toHaveLength(1);
  });

  // -- crossbar geometry bugs (existing) -----------------------------------

  it('does not report a tittle on an uppercase H', () => {
    expect(detect(nohemi, 'H', 'tittle')).toHaveLength(0);
  });

  it('does not report a tittle on a lowercase l', () => {
    expect(detect(nohemi, 'l', 'tittle')).toHaveLength(0);
  });

  it('does not report a tittle on an uppercase I', () => {
    expect(detect(nohemi, 'I', 'tittle')).toHaveLength(0);
  });

  it('detects one horizontal H crossbar centered between the stems', () => {
    const glyph = glyphFor(nohemi, 'H');
    const crossbars = detect(nohemi, 'H', 'crossbar');

    expect(crossbars).toHaveLength(1);
    expect(crossbars[0].shape.type).toBe('rect');

    const barBBox = shapeBBox(crossbars[0].shape);
    const barCenter = normalized(centerOf(crossbars[0].shape), glyph.bbox);
    const widthRatio =
      (barBBox.maxX - barBBox.minX) / (glyph.bbox.maxX - glyph.bbox.minX);
    const heightRatio =
      (barBBox.maxY - barBBox.minY) / (glyph.bbox.maxY - glyph.bbox.minY);

    expectInRange(barCenter.x, 0.35, 0.65);
    // Tightened from [0.35, 0.65]: the broad range allowed a y-offset
    // bug where the rect was anchored at the sampling-band y (0.55)
    // instead of the measured pair's centerline (~0.50). Nohemi H's
    // actual bar centerline is at y≈1427 of glyph height 2860 → ratio
    // ≈ 0.50. Range of ±3% catches the original 5% offset.
    expectInRange(barCenter.y, 0.47, 0.53);
    expect(widthRatio).toBeGreaterThanOrEqual(0.45);
    expect(heightRatio).toBeLessThanOrEqual(0.2);
  });

  it('detects the A crossbar as a horizontal bar, not a tall vertical region', () => {
    const glyph = glyphFor(nohemi, 'A');
    const crossbars = detect(nohemi, 'A', 'crossbar');

    expect(crossbars).toHaveLength(1);
    expect(crossbars[0].shape.type).toBe('rect');

    const barBBox = shapeBBox(crossbars[0].shape);
    const widthRatio =
      (barBBox.maxX - barBBox.minX) / (glyph.bbox.maxX - glyph.bbox.minX);
    const heightRatio =
      (barBBox.maxY - barBBox.minY) / (glyph.bbox.maxY - glyph.bbox.minY);

    // Threshold of 0.18 reflects the bar's actual width on Nohemi A
    // (~508 of ~2748 glyph width). The previous 0.2 threshold was
    // calibrated against pre-fix output where the merger combined
    // legitimate bar candidates with rejected candidates from upper-zone
    // sampling bands, inflating the apparent width. Post-fix, the rect
    // reflects only the real bar.
    expect(widthRatio).toBeGreaterThanOrEqual(0.18);
    expect(heightRatio).toBeLessThanOrEqual(0.15);
  });

  // Regression guard against the height-inflation bug. The original bug
  // used the y-spread of sampling bands as the bar's height, producing rects
  // that spanned 30%+ of glyph height for ~13%-thick bars. Slice 1 replaced
  // that with a perpendicular raycast measurement at the candidate midpoint;
  // mergeGroup uses median of constituent measurements, never min/max of
  // constituent y-bounds.
  //
  // The assertion below couples to `debug.measuredHeight` (the
  // perpendicular-probe measurement that's *always* present, regardless of
  // whether a merge ran) or `debug.medianHeight` (present only when
  // mergeGroup combined multiple inputs). Either is acceptable evidence that
  // the height came from a measurement, not a bounds operation. If a future
  // edit reintroduces `Math.min/max` over constituent y-bounds, neither
  // field will be present and the test fails at the existence check before
  // the value comparison.
  //
  // `debug` is treated as a diagnostic surface, not product API — this test
  // is brittle on purpose, to lock in the structural contract.
  it('anchors A crossbar height on a measured thickness, not a bounds operation', () => {
    const glyph = glyphFor(nohemi, 'A');
    const crossbars = detect(nohemi, 'A', 'crossbar');
    expect(crossbars).toHaveLength(1);

    const debug = crossbars[0].debug as
      | {
          measuredHeight?: number;
          medianHeight?: number;
        }
      | undefined;

    // Either path through the detector must surface a measured-thickness
    // marker. A direct emission carries `measuredHeight`; a merged result
    // carries `medianHeight` (which itself is computed from constituent
    // measuredHeights, so still measurement-rooted).
    const measuredMarker = debug?.measuredHeight ?? debug?.medianHeight;
    expect(measuredMarker).toBeDefined();

    // The rect's height must equal the marker (within float tolerance).
    // If the merger ever reverted to `Math.max - Math.min` over rect
    // bounds, this equality fails.
    const shape = crossbars[0].shape as Extract<
      (typeof crossbars)[0]['shape'],
      { type: 'rect' }
    >;
    expect(shape.height).toBeCloseTo(measuredMarker ?? -1, 4);

    // And the height should be in stem-thickness order of magnitude — well
    // below the y-spread of the sampling band window. Pre-fix, the rect
    // height on A was 1127 design units (39% of glyph height); post-fix,
    // it should be roughly stem-width.
    const glyphHeight = glyph.bbox.maxY - glyph.bbox.minY;
    expect((measuredMarker ?? Infinity) / glyphHeight).toBeLessThan(0.2);
  });
});

/**
 * Region-polygon assertions. Each Tier-1 detector populates
 * FeatureInstance.region; these tests assert the polygon is
 *   1. defined when the feature is detected,
 *   2. a real polygon (≥ 3 points),
 *   3. tagged with the correct kind,
 *   4. positioned inside the glyph bbox (catches coord-space bugs), and
 *   5. for stroke-kind regions, contains a sample point that lies inside
 *      the polygon (proves the clip will produce a non-empty highlight).
 *
 * Real-font, runtime-only — no precomputed geometry per font.
 */
describe('feature region polygons', () => {
  let nohemi: Font;

  beforeAll(() => {
    nohemi = loadFont('Nohemi-VF.ttf');
  });

  function expectRegionInsideGlyph(
    region: { points: Array<{ x: number; y: number }> },
    glyphBBox: { minX: number; minY: number; maxX: number; maxY: number }
  ) {
    expect(region.points.length).toBeGreaterThanOrEqual(3);
    const bbox = regionBBox(
      region as unknown as Parameters<typeof regionBBox>[0]
    );
    // Allow a 10% margin: stroke regions are clip masks, so spilling slightly
    // beyond the glyph bbox is fine — the glyph fill clips the overshoot.
    // The check exists to catch coordinate-space bugs (e.g., screen vs design
    // unit confusion), not to demand strict containment.
    const w = glyphBBox.maxX - glyphBBox.minX;
    const h = glyphBBox.maxY - glyphBBox.minY;
    const marginX = w * 0.1;
    const marginY = h * 0.1;
    expect(bbox.minX).toBeGreaterThanOrEqual(glyphBBox.minX - marginX);
    expect(bbox.maxX).toBeLessThanOrEqual(glyphBBox.maxX + marginX);
    expect(bbox.minY).toBeGreaterThanOrEqual(glyphBBox.minY - marginY);
    expect(bbox.maxY).toBeLessThanOrEqual(glyphBBox.maxY + marginY);
  }

  it('emits stroke regions for both Nohemi H stems', () => {
    const glyph = glyphFor(nohemi, 'H');
    const stems = detect(nohemi, 'H', 'stem');
    expect(stems).toHaveLength(2);
    for (const stem of stems) {
      expect(stem.region).toBeDefined();
      expect(stem.region!.kind).toBe('stroke');
      expectRegionInsideGlyph(stem.region!, glyph.bbox);
      // The rect's geometric center must lie inside the polygon (ensures
      // a non-empty intersection with the glyph fill at clip time).
      const c = centerOf(stem.shape);
      expect(pointInPolygon(c, stem.region!.points)).toBe(true);
    }
  });

  it('emits a stroke region for the Nohemi H crossbar', () => {
    const glyph = glyphFor(nohemi, 'H');
    const bars = detect(nohemi, 'H', 'crossbar');
    expect(bars).toHaveLength(1);
    expect(bars[0].region?.kind).toBe('stroke');
    expectRegionInsideGlyph(bars[0].region!, glyph.bbox);
  });

  it('emits a stroke region for the Nohemi T stem', () => {
    const glyph = glyphFor(nohemi, 'T');
    const stems = detect(nohemi, 'T', 'stem');
    expect(stems).toHaveLength(1);
    expect(stems[0].region?.kind).toBe('stroke');
    expectRegionInsideGlyph(stems[0].region!, glyph.bbox);
  });

  it('emits a stroke region for the Nohemi O bowl', () => {
    const glyph = glyphFor(nohemi, 'O');
    const bowls = detect(nohemi, 'O', 'bowl');
    expect(bowls).toHaveLength(1);
    expect(bowls[0].region?.kind).toBe('stroke');
    expectRegionInsideGlyph(bowls[0].region!, glyph.bbox);
  });

  it('emits an enclosed region for the Nohemi O counter', () => {
    const glyph = glyphFor(nohemi, 'O');
    const counters = detect(nohemi, 'O', 'counter');
    expect(counters).toHaveLength(1);
    expect(counters[0].region?.kind).toBe('enclosed');
    expectRegionInsideGlyph(counters[0].region!, glyph.bbox);
  });

  it('emits a stroke region for the Nohemi i tittle', () => {
    const glyph = glyphFor(nohemi, 'i');
    const tittles = detect(nohemi, 'i', 'tittle');
    expect(tittles).toHaveLength(1);
    expect(tittles[0].region?.kind).toBe('stroke');
    expectRegionInsideGlyph(tittles[0].region!, glyph.bbox);
  });

  it('traces the actual Nohemi tittle contour, not a circle approximation', () => {
    // Nohemi's tittle is a 4-sided geometric square. Extracting the actual
    // contour produces a small-vertex polygon (≤ 12); falling back to a
    // 32-sided circle approximation would inflate the count and produce a
    // visibly round overlay where the contour is square.
    const tittles = detect(nohemi, 'i', 'tittle');
    expect(tittles).toHaveLength(1);
    expect(tittles[0].region!.points.length).toBeLessThanOrEqual(12);
    expect(tittles[0].region!.points.length).toBeGreaterThanOrEqual(3);
  });

  it('emits an enclosed region for the Nohemi e eye', () => {
    const glyph = glyphFor(nohemi, 'e');
    const eyes = detect(nohemi, 'e', 'eye');
    expect(eyes).toHaveLength(1);
    expect(eyes[0].region?.kind).toBe('enclosed');
    expectRegionInsideGlyph(eyes[0].region!, glyph.bbox);
  });

  it('emits an enclosed region for the Nohemi e counter', () => {
    const glyph = glyphFor(nohemi, 'e');
    const counters = detect(nohemi, 'e', 'counter');
    expect(counters).toHaveLength(1);
    expect(counters[0].region?.kind).toBe('enclosed');
    expectRegionInsideGlyph(counters[0].region!, glyph.bbox);
  });

  it('emits stroke regions for Nohemi E arms', () => {
    const arms = detect(nohemi, 'E', 'arm');
    expect(arms).toHaveLength(3);
    for (const arm of arms) {
      expect(arm.region?.kind).toBe('stroke');
    }
  });
});

describe('phase 4 + 5 region polygons (centerline corridors and projections)', () => {
  let newsreader: Font;
  let nohemiP: Font;

  beforeAll(() => {
    newsreader = loadFont('Newsreader-VF.ttf');
    nohemiP = loadFont('Nohemi-VF.ttf');
  });

  function expectRegionInsideGlyph(
    region: { points: Array<{ x: number; y: number }> },
    glyphBBox: { minX: number; minY: number; maxX: number; maxY: number }
  ) {
    expect(region.points.length).toBeGreaterThanOrEqual(3);
    const bbox = regionBBox(
      region as unknown as Parameters<typeof regionBBox>[0]
    );
    const w = glyphBBox.maxX - glyphBBox.minX;
    const h = glyphBBox.maxY - glyphBBox.minY;
    const marginX = w * 0.1;
    const marginY = h * 0.1;
    expect(bbox.minX).toBeGreaterThanOrEqual(glyphBBox.minX - marginX);
    expect(bbox.maxX).toBeLessThanOrEqual(glyphBBox.maxX + marginX);
    expect(bbox.minY).toBeGreaterThanOrEqual(glyphBBox.minY - marginY);
    expect(bbox.maxY).toBeLessThanOrEqual(glyphBBox.maxY + marginY);
  }

  it('emits a stroke corridor region for the Newsreader S spine', () => {
    const glyph = glyphFor(newsreader, 'S');
    const spines = detect(newsreader, 'S', 'spine');
    expect(spines.length).toBeGreaterThan(0);
    const spine = spines[0];
    expect(spine.region?.kind).toBe('stroke');
    // Corridor must wrap the centerline on BOTH sides → at minimum 6 vertices
    // (3-sample centerline → 6-vertex offset polygon). Catches a regression
    // where the corridor collapses to a 1-pixel polyline.
    expect(spine.region!.points.length).toBeGreaterThanOrEqual(6);
    expectRegionInsideGlyph(spine.region!, glyph.bbox);
  });

  it('emits a stroke corridor region for the Newsreader Q tail', () => {
    const glyph = glyphFor(newsreader, 'Q');
    const tails = detect(newsreader, 'Q', 'tail');
    expect(tails.length).toBeGreaterThan(0);
    const withRegion = tails.filter((t) => t.region);
    expect(withRegion.length).toBeGreaterThan(0);
    for (const tail of withRegion) {
      expect(tail.region?.kind).toBe('stroke');
      expect(tail.region!.points.length).toBeGreaterThanOrEqual(4);
      expectRegionInsideGlyph(tail.region!, glyph.bbox);
    }
    // Q tail must extend below baseline — corridor bbox must include
    // descent territory or it's pointing at the wrong stroke.
    const tailRegion = withRegion[0].region!;
    const bbox = regionBBox(
      tailRegion as unknown as Parameters<typeof regionBBox>[0]
    );
    expect(bbox.minY).toBeLessThan(0);
  });

  it('emits a closed stroke corridor for the Newsreader g loop', () => {
    const glyph = glyphFor(newsreader, 'g');
    const loops = detect(newsreader, 'g', 'loop');
    expect(loops.length).toBeGreaterThan(0);
    const loop = loops[0];
    expect(loop.region?.kind).toBe('stroke');
    // Closed corridor on a ring of N samples produces 2N vertices.
    // 8 ring samples → 16; we already see 48 in real data, so 12 is a
    // safe lower bound.
    expect(loop.region!.points.length).toBeGreaterThanOrEqual(12);
    expectRegionInsideGlyph(loop.region!, glyph.bbox);
  });

  it('emits an empty mouth channel for the Nohemi e aperture', () => {
    const glyph = glyphFor(nohemiP, 'e');
    const apertures = detect(nohemiP, 'e', 'aperture');
    expect(apertures).toHaveLength(1);
    const aperture = apertures[0];
    expect((aperture.debug as { side?: string })?.side).toBe('right');
    expect(aperture.region?.kind).toBe('enclosed');
    const bounds = regionBBox(aperture.region!);
    const width = glyph.bbox.maxX - glyph.bbox.minX;
    expect(bounds.minX).toBeGreaterThan(glyph.bbox.minX + width * 0.7);
    expect(bounds.maxX).toBeGreaterThan(glyph.bbox.maxX - width * 0.05);
    expect(bounds.maxY - bounds.minY).toBeGreaterThan(0);
    expect(
      pointInPolygon(
        {
          x: glyph.bbox.minX + width * 0.5,
          y: glyph.bbox.minY + (glyph.bbox.maxY - glyph.bbox.minY) * 0.2,
        },
        aperture.region!.points
      )
    ).toBe(false);
  });

  it('emits a stroke projection region for the Newsreader g ear', () => {
    const glyph = glyphFor(newsreader, 'g');
    const ears = detect(newsreader, 'g', 'ear');
    expect(ears.length).toBeGreaterThan(0);
    const withRegion = ears.filter((e) => e.region);
    // The projection helper requires ≥ 3 vertices; ear contours on
    // Newsreader g produce that. If a future detector change produces a
    // sparser contour the helper may return [] and this test will catch
    // the regression rather than silently dropping the highlight.
    expect(withRegion.length).toBeGreaterThan(0);
    expect(withRegion[0].region?.kind).toBe('stroke');
    expectRegionInsideGlyph(withRegion[0].region!, glyph.bbox);
  });

  it('produces a stroke projection region whenever finial fires on Newsreader s', () => {
    // Newsreader s reliably fires multiple finial instances. At least one
    // must carry a polygon; a regression that drops every region would
    // fail this even though the detector keeps returning instances.
    const finials = detect(newsreader, 's', 'finial');
    expect(finials.length).toBeGreaterThan(0);
    const withRegion = finials.filter((f) => f.region);
    expect(withRegion.length).toBeGreaterThan(0);
    const glyph = glyphFor(newsreader, 's');
    for (const f of withRegion) {
      expect(f.region?.kind).toBe('stroke');
      expectRegionInsideGlyph(f.region!, glyph.bbox);
    }
  });

  it('attaches a polygon to each actual Newsreader L serif', () => {
    const serifs = detect(newsreader, 'L', 'serif');
    expect(serifs.length).toBeGreaterThan(0);
    const glyph = glyphFor(newsreader, 'L');
    for (const serif of serifs) {
      expect(serif.region?.kind).toBe('stroke');
      expectRegionInsideGlyph(serif.region!, glyph.bbox);
    }
  });
});
