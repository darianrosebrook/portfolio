/**
 * Tests for structural feature detectors: stem, arm, bar, leg.
 *
 * Real-font correctness lives in test/typeAnatomy/feature-accuracy.test.ts
 * (e.g., H stems, T arms, M stems on Nohemi). The legacy hasStem heuristic
 * over-fires on synthetic primitives — the pinned values document that.
 *
 * The Crossbar orchestrator block at the bottom is a contract test: it
 * proves the orchestrator forwards rect-typed shapes (not the legacy line
 * type) for the Crossbar feature on a synthetic H built from M/L/Z commands.
 */
import { describe, it, expect } from 'vitest';
import { hasStem } from '@/utils/typeAnatomy/stem';
import { hasArm } from '@/utils/typeAnatomy/arm';
import { hasBar } from '@/utils/typeAnatomy/bar';
import { hasLeg } from '@/utils/typeAnatomy/leg';
import { detectFeature } from '@/utils/typeAnatomy/detector';
import {
  mockGlyphFromPath,
  mockNonDrawableGlyph,
  mockFont,
  standardMetrics,
} from '../../fixtures/mockGlyph';
import {
  VERTICAL_STEM,
  HORIZONTAL_BAR,
  CIRCLE,
  DONUT,
  EMPTY_PATH,
} from '../../fixtures/svgPaths';

describe('structural features (synthetic geometry)', () => {
  const metrics = standardMetrics;
  const font = mockFont();

  describe('hasStem', () => {
    it('detects a stem in a vertical-stem polygon', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);
      expect(hasStem(glyph, metrics, font)).toBe(true);
    });

    it('rejects a horizontal bar', () => {
      const glyph = mockGlyphFromPath(HORIZONTAL_BAR.d, HORIZONTAL_BAR.bbox);
      expect(hasStem(glyph, metrics, font)).toBe(false);
    });

    it('over-fires on a polygon circle (legacy heuristic limitation)', () => {
      // The hasStem heuristic accepts any glyph with sufficient vertical
      // extent; circle polygons match. Real stem accuracy on Nohemi H/T/E/M
      // is in feature-accuracy.test.ts.
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);
      expect(hasStem(glyph, metrics, font)).toBe(true);
    });

    it('returns false for non-drawable glyph', () => {
      expect(hasStem(mockNonDrawableGlyph('null-path'), metrics, font)).toBe(
        false
      );
    });

    it('returns false for empty glyph', () => {
      expect(hasStem(mockNonDrawableGlyph('empty'), metrics, font)).toBe(false);
    });

    it('hasStem rejects the synthetic stem at unitsPerEm=2000 (threshold-scaled)', () => {
      // hasStem's stroke-width threshold scales with unitsPerEm; the
      // synthetic 60-wide stem passes at the default 1000 but fails at 2000.
      // Real-font stem detection is verified at the font's native unitsPerEm
      // in feature-accuracy.test.ts.
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);
      const font2000 = mockFont({ unitsPerEm: 2000 });
      expect(hasStem(glyph, metrics, font2000)).toBe(false);
    });

    it('orchestrator returns found: true for Stem on a vertical stem', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);
      expect(detectFeature('Stem', glyph, metrics, font).found).toBe(true);
    });

    it('orchestrator returns found: false for Stem when no font is supplied', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);
      expect(detectFeature('Stem', glyph, metrics).found).toBe(false);
    });
  });

  describe('hasArm', () => {
    it('rejects a vertical stem', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);
      expect(hasArm(glyph, metrics)).toBe(false);
    });

    it('rejects a polygon circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);
      expect(hasArm(glyph, metrics)).toBe(false);
    });

    it('returns false for non-drawable glyph', () => {
      expect(hasArm(mockNonDrawableGlyph('null-path'), metrics)).toBe(false);
    });
  });

  describe('hasBar', () => {
    it('rejects a vertical stem', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);
      expect(hasBar(glyph, metrics)).toBe(false);
    });

    it('rejects a polygon circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);
      expect(hasBar(glyph, metrics)).toBe(false);
    });

    it('rejects a polygon donut', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);
      expect(hasBar(glyph, metrics)).toBe(false);
    });

    it('returns false for non-drawable glyph', () => {
      expect(hasBar(mockNonDrawableGlyph('null-path'), metrics)).toBe(false);
    });

    /**
     * Synthetic-H crossbar contract test.
     *
     * The Crossbar feature was historically emitted as a `line` shape and
     * later changed to `rect`. The orchestrator-side path forwards the
     * detector's shape unchanged. This test pins both:
     *   1. The synthetic H produces a successful detection (found=true).
     *   2. The forwarded shape is `rect` with positive width and height.
     * Together they guard against silent regression to a `line` shape (which
     * the visual overlay renderer would silently drop).
     */
    it('forwards a rect-typed Crossbar shape from the orchestrator on a synthetic H', () => {
      const hGlyph = {
        id: 0,
        name: 'H',
        codePoints: [72],
        path: {
          toSVG: () => '',
          commands: [
            { command: 'moveTo', args: [-200, 0] },
            { command: 'lineTo', args: [-120, 0] },
            { command: 'lineTo', args: [-120, 700] },
            { command: 'lineTo', args: [-200, 700] },
            { command: 'closePath', args: [] },
            { command: 'moveTo', args: [120, 0] },
            { command: 'lineTo', args: [200, 0] },
            { command: 'lineTo', args: [200, 700] },
            { command: 'lineTo', args: [120, 700] },
            { command: 'closePath', args: [] },
            { command: 'moveTo', args: [-120, 320] },
            { command: 'lineTo', args: [120, 320] },
            { command: 'lineTo', args: [120, 380] },
            { command: 'lineTo', args: [-120, 380] },
            { command: 'closePath', args: [] },
          ],
        },
        bbox: { minX: -200, minY: 0, maxX: 200, maxY: 700 },
        cbox: { minX: -200, minY: 0, maxX: 200, maxY: 700 },
        advanceWidth: 400,
        render: () => {},
      } as unknown as Parameters<typeof detectFeature>[1];

      const result = detectFeature('Crossbar', hGlyph, metrics, font);

      expect(result.found).toBe(true);
      expect(result.shape?.type).toBe('rect');
      if (result.shape?.type === 'rect') {
        expect(result.shape.width).toBeGreaterThan(0);
        expect(result.shape.height).toBeGreaterThan(0);
      }
      expect(result.location).toBeDefined();
      expect(typeof result.location?.x).toBe('number');
      expect(typeof result.location?.y).toBe('number');
    });

    it('detectCrossbar emits at least one rect-typed FeatureInstance for an H', async () => {
      const { detectCrossbar } = await import(
        '@/utils/typeAnatomy/detectors/crossbar'
      );
      const { buildGeometryCache } = await import(
        '@/utils/typeAnatomy/geometryCache'
      );

      const hGlyph = {
        id: 0,
        name: 'H',
        codePoints: [72],
        path: {
          toSVG: () => '',
          commands: [
            { command: 'moveTo', args: [-200, 0] },
            { command: 'lineTo', args: [-120, 0] },
            { command: 'lineTo', args: [-120, 700] },
            { command: 'lineTo', args: [-200, 700] },
            { command: 'closePath', args: [] },
            { command: 'moveTo', args: [120, 0] },
            { command: 'lineTo', args: [200, 0] },
            { command: 'lineTo', args: [200, 700] },
            { command: 'lineTo', args: [120, 700] },
            { command: 'closePath', args: [] },
            { command: 'moveTo', args: [-120, 320] },
            { command: 'lineTo', args: [120, 320] },
            { command: 'lineTo', args: [120, 380] },
            { command: 'lineTo', args: [-120, 380] },
            { command: 'closePath', args: [] },
          ],
        },
        bbox: { minX: -200, minY: 0, maxX: 200, maxY: 700 },
        cbox: { minX: -200, minY: 0, maxX: 200, maxY: 700 },
        advanceWidth: 400,
        render: () => {},
      } as unknown as Parameters<typeof buildGeometryCache>[0];

      const geo = buildGeometryCache(hGlyph, font);
      const instances = detectCrossbar(geo);

      expect(instances.length).toBeGreaterThan(0);
      for (const inst of instances) {
        expect(inst.shape.type).toBe('rect');
      }
    });
  });

  describe('hasLeg', () => {
    it('rejects a vertical stem', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);
      expect(hasLeg(glyph, metrics)).toBe(false);
    });

    it('rejects a polygon circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);
      expect(hasLeg(glyph, metrics)).toBe(false);
    });

    it('returns false for non-drawable glyph', () => {
      expect(hasLeg(mockNonDrawableGlyph('null-path'), metrics)).toBe(false);
    });

    it('orchestrator returns found: false for Leg on a circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);
      expect(detectFeature('Leg', glyph, metrics).found).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('does not throw on empty path across all structural detectors', () => {
      const glyph = mockGlyphFromPath(EMPTY_PATH.d, EMPTY_PATH.bbox);

      expect(() => hasStem(glyph, metrics, font)).not.toThrow();
      expect(() => hasArm(glyph, metrics)).not.toThrow();
      expect(() => hasBar(glyph, metrics)).not.toThrow();
    });

    it('does not throw on very thin strokes', () => {
      const thinPath = 'M -1 -300 L 1 -300 L 1 300 L -1 300 Z';
      const thinBbox = { minX: -1, minY: -300, maxX: 1, maxY: 300 };
      const glyph = mockGlyphFromPath(thinPath, thinBbox);

      expect(() => hasStem(glyph, metrics, font)).not.toThrow();
    });

    it('does not throw on unusual aspect ratios', () => {
      const widePath = 'M -500 -10 L 500 -10 L 500 10 L -500 10 Z';
      const wideBbox = { minX: -500, minY: -10, maxX: 500, maxY: 10 };
      const glyph = mockGlyphFromPath(widePath, wideBbox);

      expect(() => hasStem(glyph, metrics, font)).not.toThrow();
      expect(() => hasArm(glyph, metrics)).not.toThrow();
    });
  });
});
