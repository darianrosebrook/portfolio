/**
 * Geometry accuracy tests for typographic anatomy detection.
 *
 * These tests assert anatomical expectations: a feature must be found in the
 * right count, with the right renderable shape family, in the expected region
 * of the glyph. They are separate from API-contract tests that only prove
 * detectors return without throwing.
 *
 * Two describe blocks:
 *   1. "type anatomy geometry accuracy" — assertions that pass today; these
 *      protect detectors that already work and will catch regressions.
 *   2. "known type anatomy accuracy gaps" — assertions that *currently fail*,
 *      wrapped in `it.fails(...)`. They document detector bugs as a living
 *      spec. When a detector is fixed, the matching `it.fails` will start
 *      erroring (because the assertion no longer fails), forcing the engineer
 *      to flip it to a regular `it()` and lock in the fix.
 *
 * If you add a new accuracy assertion, prefer documenting reality (block 2)
 * over a guarded "if-found-then-check" pattern. Silent guards reintroduce
 * the green-when-broken failure mode this suite exists to prevent.
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
    // Exercises the new default-case branch in counter.ts:290 that returns
    // null for unknown SVG path commands (arcs, cubics, etc).
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

  it('finds the eye inside Newsreader a (single-storey)', () => {
    const glyph = glyphFor(newsreader, 'a');
    const eyes = detect(newsreader, 'a', 'eye');

    expect(eyes.length).toBeGreaterThanOrEqual(1);
    const center = normalized(centerOf(eyes[0].shape), glyph.bbox);
    expectInRange(center.x, 0.2, 0.6);
    expectInRange(center.y, 0.1, 0.6);
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
    const tailCenter = normalized(centerOf(tails[0].shape), glyph.bbox);
    expect(tailBBox.minY).toBeLessThan(0);
    expectInRange(tailCenter.x, 0.75, 1);
    expectInRange(tailCenter.y, 0, 0.25);
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
    // The right-side aperture (where e opens) should be present.
    const right = apertures.find((a) => {
      const c = normalized(centerOf(a.shape), glyph.bbox);
      return c.x > 0.7;
    });
    expect(right).toBeDefined();
  });
});

describe('known type anatomy accuracy gaps', () => {
  let nohemi: Font;
  let newsreader: Font;

  beforeAll(() => {
    nohemi = loadFont('Nohemi-VF.ttf');
    newsreader = loadFont('Newsreader-VF.ttf');
  });

  // -- false negatives: detectors return [] on glyphs that have the feature --

  it.fails('detects the lowercase i tittle above the stem (currently 0 found)', () => {
    const glyph = glyphFor(nohemi, 'i');
    const tittles = detect(nohemi, 'i', 'tittle');

    expect(tittles).toHaveLength(1);
    expect(tittles[0].shape.type).toBe('circle');

    const center = normalized(centerOf(tittles[0].shape), glyph.bbox);
    expectInRange(center.x, 0.25, 0.75);
    expectInRange(center.y, 0.75, 1);
  });

  it.fails('detects the lowercase j tittle above the stem (currently 0 found)', () => {
    const tittles = detect(nohemi, 'j', 'tittle');
    expect(tittles).toHaveLength(1);
  });

  it.fails('detects the T arm — its horizontal stroke (currently 0 found)', () => {
    const arms = detect(nohemi, 'T', 'arm');
    expect(arms.length).toBeGreaterThanOrEqual(1);
  });

  it.fails('detects the three E arms — top, middle, bottom (currently 0 found)', () => {
    const arms = detect(nohemi, 'E', 'arm');
    expect(arms.length).toBeGreaterThanOrEqual(3);
  });

  it.fails('detects the V crotch at the bottom apex (currently 0 found)', () => {
    const crotches = detect(nohemi, 'V', 'crotch');
    expect(crotches).toHaveLength(1);
  });

  it.fails('detects the A crotch at the top apex (currently 0 found)', () => {
    const crotches = detect(nohemi, 'A', 'crotch');
    expect(crotches).toHaveLength(1);
  });

  it.fails('detects vertices on Nohemi A (currently 0 found)', () => {
    const vertices = detect(nohemi, 'A', 'vertex');
    expect(vertices.length).toBeGreaterThanOrEqual(2);
  });

  it.fails('detects serifs on Newsreader I (serif font, currently 0 found)', () => {
    const serifs = detect(newsreader, 'I', 'serif');
    expect(serifs.length).toBeGreaterThanOrEqual(2);
  });

  it.fails('detects the spur on Nohemi G (currently 0 found)', () => {
    const spurs = detect(nohemi, 'G', 'spur');
    expect(spurs).toHaveLength(1);
  });

  it.fails('detects the finials on Nohemi c (currently 0 found)', () => {
    const finials = detect(nohemi, 'c', 'finial');
    expect(finials.length).toBeGreaterThanOrEqual(1);
  });

  it.fails('detects the finials on Newsreader c (currently 0 found)', () => {
    const finials = detect(newsreader, 'c', 'finial');
    expect(finials.length).toBeGreaterThanOrEqual(1);
  });

  it.fails('detects the ear on Newsreader a (currently 0 found)', () => {
    const ears = detect(newsreader, 'a', 'ear');
    expect(ears).toHaveLength(1);
  });

  // -- false positives: detector fires where the feature does not exist -----

  it.fails(
    'rejects spurious arms on Nohemi A — A has legs, not arms (currently finds 2)',
    () => {
      const arms = detect(nohemi, 'A', 'arm');
      expect(arms).toHaveLength(0);
    }
  );

  it.fails(
    'finds exactly one apex on Nohemi A (currently finds 2 line shapes near top)',
    () => {
      const apexes = detect(nohemi, 'A', 'apex');
      expect(apexes).toHaveLength(1);
    }
  );

  it.fails(
    'returns a bowl smaller than the full glyph for Nohemi b (currently spans entire bbox)',
    () => {
      const glyph = glyphFor(nohemi, 'b');
      const bowls = detect(nohemi, 'b', 'bowl');

      expect(bowls).toHaveLength(1);
      const bbox = shapeBBox(bowls[0].shape);
      const widthRatio =
        (bbox.maxX - bbox.minX) / (glyph.bbox.maxX - glyph.bbox.minX);
      // b's bowl is on the right side; it should not span the full glyph width.
      expect(widthRatio).toBeLessThan(0.85);
    }
  );

  it.fails(
    'finds exactly one stem on Nohemi b (currently finds 2 — bowl edge counted as stem)',
    () => {
      const stems = detect(nohemi, 'b', 'stem');
      expect(stems).toHaveLength(1);
    }
  );

  it.fails(
    'finds exactly one eye on Newsreader g (currently finds 2 — ear region counted as eye)',
    () => {
      const eyes = detect(newsreader, 'g', 'eye');
      expect(eyes).toHaveLength(1);
    }
  );

  it.fails(
    'does not classify the feet of Newsreader a as finials (currently finds 2 points at y=0)',
    () => {
      const glyph = glyphFor(newsreader, 'a');
      const finials = detect(newsreader, 'a', 'finial');

      // If finial is detected, its center should not be on the baseline (y near 0)
      // — those are feet, not finials.
      for (const f of finials) {
        const center = normalized(centerOf(f.shape), glyph.bbox);
        expect(center.y).toBeGreaterThan(0.1);
      }
    }
  );

  it.fails(
    'finds exactly one aperture on Nohemi c — c only opens on the right (currently finds 2)',
    () => {
      const apertures = detect(nohemi, 'c', 'aperture');
      expect(apertures).toHaveLength(1);
    }
  );

  // -- crossbar geometry bugs (existing) -----------------------------------

  it.fails('does not report a tittle on an uppercase H', () => {
    expect(detect(nohemi, 'H', 'tittle')).toHaveLength(0);
  });

  it.fails(
    'detects one horizontal H crossbar centered between the stems',
    () => {
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
      expectInRange(barCenter.y, 0.35, 0.65);
      expect(widthRatio).toBeGreaterThanOrEqual(0.45);
      expect(heightRatio).toBeLessThanOrEqual(0.2);
    }
  );

  it.fails(
    'detects the A crossbar as a horizontal bar, not a tall vertical region',
    () => {
      const glyph = glyphFor(nohemi, 'A');
      const crossbars = detect(nohemi, 'A', 'crossbar');

      expect(crossbars).toHaveLength(1);
      expect(crossbars[0].shape.type).toBe('rect');

      const barBBox = shapeBBox(crossbars[0].shape);
      const widthRatio =
        (barBBox.maxX - barBBox.minX) / (glyph.bbox.maxX - glyph.bbox.minX);
      const heightRatio =
        (barBBox.maxY - barBBox.minY) / (glyph.bbox.maxY - glyph.bbox.minY);

      expect(widthRatio).toBeGreaterThanOrEqual(0.2);
      expect(heightRatio).toBeLessThanOrEqual(0.15);
    }
  );
});
