/**
 * DetectionContext memoization tests.
 *
 * `buildDetectionContext` runs geometry-based serif detection that casts rays
 * against I/l/i/L test glyphs. That work is font-level, not glyph-level, so it
 * must be memoized per-font — otherwise building a cache for every glyph in an
 * alphabet re-runs the same four-glyph probe 26 times.
 *
 * These tests assert the memoization contract directly via object identity:
 * two `buildGeometryCache` calls for different glyphs of the same font must
 * share one `DetectionContext` reference.
 */

import { describe, expect, it } from 'vitest';
import { buildGeometryCache } from '@/utils/typeAnatomy/geometryCache';
import { glyphFor, loadFont } from '@/test/utils/fixtures/fontFixtures';

describe('DetectionContext memoization (per-font)', () => {
  it('returns the same DetectionContext reference for multiple glyphs of one font', () => {
    const font = loadFont('Nohemi-VF.ttf');
    const ctxA = buildGeometryCache(glyphFor(font, 'H'), font).context;
    const ctxB = buildGeometryCache(glyphFor(font, 'O'), font).context;

    // Identity check — memoized, not rebuilt per glyph.
    expect(ctxA).toBe(ctxB);
  });

  it('does not share context across different fonts', () => {
    const nohemi = loadFont('Nohemi-VF.ttf');
    const newsreader = loadFont('Newsreader-VF.ttf');

    const ctxSans = buildGeometryCache(glyphFor(nohemi, 'H'), nohemi).context;
    const ctxSerif = buildGeometryCache(
      glyphFor(newsreader, 'H'),
      newsreader
    ).context;

    expect(ctxSans).not.toBe(ctxSerif);
  });

  it('keeps isSerif classification stable across glyphs of the same font', () => {
    const newsreader = loadFont('Newsreader-VF.ttf');

    const fromH = buildGeometryCache(glyphFor(newsreader, 'H'), newsreader)
      .context.isSerif;
    const fromO = buildGeometryCache(glyphFor(newsreader, 'O'), newsreader)
      .context.isSerif;

    expect(fromH).toBe(fromO);
  });
});
