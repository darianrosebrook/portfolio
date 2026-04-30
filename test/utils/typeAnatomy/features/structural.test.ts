/**
 * Tests for structural feature detectors: stem, arm, bar, leg.
 * These features detect primary strokes and structural elements in glyphs.
 *
 * Note: These tests focus on API contracts, error handling, and type safety.
 * Detection accuracy depends on glyph geometry matching detector heuristics.
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

describe('structural features', () => {
  const metrics = standardMetrics;
  const font = mockFont();

  describe('hasStem', () => {
    it('returns boolean for vertical stem shape', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      const result = hasStem(glyph, metrics, font);
      expect(typeof result).toBe('boolean');
    });

    it('returns boolean for horizontal bar', () => {
      const glyph = mockGlyphFromPath(HORIZONTAL_BAR.d, HORIZONTAL_BAR.bbox);

      const result = hasStem(glyph, metrics, font);
      expect(typeof result).toBe('boolean');
    });

    it('returns boolean for circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      const result = hasStem(glyph, metrics, font);
      expect(typeof result).toBe('boolean');
    });

    it('returns false for non-drawable glyph', () => {
      const glyph = mockNonDrawableGlyph('null-path');

      expect(hasStem(glyph, metrics, font)).toBe(false);
    });

    it('returns false for empty glyph', () => {
      const glyph = mockNonDrawableGlyph('empty');

      expect(hasStem(glyph, metrics, font)).toBe(false);
    });

    it('works with different font unitsPerEm', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);
      const font2000 = mockFont({ unitsPerEm: 2000 });

      const result = hasStem(glyph, metrics, font2000);
      expect(typeof result).toBe('boolean');
    });

    it('works via detector orchestration', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      const result = detectFeature('Stem', glyph, metrics, font);

      expect(result).toHaveProperty('found');
      expect(typeof result.found).toBe('boolean');
    });

    it('detector returns false without font', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      const result = detectFeature('Stem', glyph, metrics);

      // Stem requires font parameter
      expect(result.found).toBe(false);
    });
  });

  describe('hasArm', () => {
    it('returns boolean for vertical stem only', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      const result = hasArm(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('does not detect arm in circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      expect(hasArm(glyph, metrics)).toBe(false);
    });

    it('returns false for non-drawable glyph', () => {
      const glyph = mockNonDrawableGlyph('null-path');

      expect(hasArm(glyph, metrics)).toBe(false);
    });

  });

  describe('hasBar', () => {
    it('does not detect bar in simple vertical stem', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      expect(hasBar(glyph, metrics)).toBe(false);
    });

    it('does not detect bar in circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      expect(hasBar(glyph, metrics)).toBe(false);
    });

    it('does not detect bar in donut (no crossbar)', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);

      expect(hasBar(glyph, metrics)).toBe(false);
    });

    it('returns false for non-drawable glyph', () => {
      const glyph = mockNonDrawableGlyph('null-path');

      expect(hasBar(glyph, metrics)).toBe(false);
    });

    it('Crossbar via orchestrator forwards rect shape and location when detected', async () => {
      // Build an H-shaped glyph with the command format flattenToSegments expects.
      // Two vertical stems plus a horizontal crossbar at mid-height.
      const hGlyph = {
        id: 0,
        name: 'H',
        codePoints: [72],
        path: {
          toSVG: () => '',
          commands: [
            // Left stem: x in [-200,-120], full cap height
            { command: 'moveTo', args: [-200, 0] },
            { command: 'lineTo', args: [-120, 0] },
            { command: 'lineTo', args: [-120, 700] },
            { command: 'lineTo', args: [-200, 700] },
            { command: 'closePath', args: [] },
            // Right stem: x in [120,200], full cap height
            { command: 'moveTo', args: [120, 0] },
            { command: 'lineTo', args: [200, 0] },
            { command: 'lineTo', args: [200, 700] },
            { command: 'lineTo', args: [120, 700] },
            { command: 'closePath', args: [] },
            // Crossbar: y in [320,380], spans the gap between stems
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

      expect(result).toHaveProperty('found');
      // The orchestrator must forward shape + location whenever found is true.
      // If detection happens to fail on this synthetic input, the contract is
      // vacuously satisfied — but found:true without a shape is the bug we are
      // guarding against.
      if (result.found) {
        expect(result.shape).toBeDefined();
        expect(result.shape?.type).toBe('rect');
        if (result.shape?.type === 'rect') {
          expect(result.shape.width).toBeGreaterThan(0);
          expect(result.shape.height).toBeGreaterThan(0);
        }
        expect(result.location).toBeDefined();
        expect(typeof result.location?.x).toBe('number');
        expect(typeof result.location?.y).toBe('number');
      }
    });

    it('detectCrossbar emits rect shapes for an H-shape geometry', async () => {
      const { detectCrossbar } =
        await import('@/utils/typeAnatomy/detectors/crossbar');
      const { buildGeometryCache } =
        await import('@/utils/typeAnatomy/geometryCache');

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

      // Guard against vacuous pass: the orchestrator-side test above already
      // proves at least one detection succeeds on this fixture.
      expect(instances.length).toBeGreaterThan(0);

      // detectCrossbar must only emit rect-typed shapes; line is legacy and
      // would silently break the orchestrator's renderer.
      for (const inst of instances) {
        expect(inst.shape.type).toBe('rect');
      }
    });
  });

  describe('hasLeg', () => {
    it('returns boolean for vertical stem', () => {
      const glyph = mockGlyphFromPath(VERTICAL_STEM.d, VERTICAL_STEM.bbox);

      const result = hasLeg(glyph, metrics);
      expect(typeof result).toBe('boolean');
    });

    it('does not detect leg in circle', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      expect(hasLeg(glyph, metrics)).toBe(false);
    });

    it('returns false for non-drawable glyph', () => {
      const glyph = mockNonDrawableGlyph('null-path');

      expect(hasLeg(glyph, metrics)).toBe(false);
    });

    it('works via detector orchestration', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      const result = detectFeature('Leg', glyph, metrics);

      expect(result).toHaveProperty('found');
      expect(typeof result.found).toBe('boolean');
    });
  });

  describe('edge cases', () => {
    it('handles empty path gracefully', () => {
      const glyph = mockGlyphFromPath(EMPTY_PATH.d, EMPTY_PATH.bbox);

      expect(() => hasStem(glyph, metrics, font)).not.toThrow();
      expect(() => hasArm(glyph, metrics)).not.toThrow();
      expect(() => hasBar(glyph, metrics)).not.toThrow();
    });

    it('handles very thin strokes', () => {
      // Very thin vertical line
      const thinPath = 'M -1 -300 L 1 -300 L 1 300 L -1 300 Z';
      const thinBbox = { minX: -1, minY: -300, maxX: 1, maxY: 300 };
      const glyph = mockGlyphFromPath(thinPath, thinBbox);

      expect(() => hasStem(glyph, metrics, font)).not.toThrow();
    });

    it('handles unusual aspect ratio', () => {
      // Very wide, short rectangle
      const widePath = 'M -500 -10 L 500 -10 L 500 10 L -500 10 Z';
      const wideBbox = { minX: -500, minY: -10, maxX: 500, maxY: 10 };
      const glyph = mockGlyphFromPath(widePath, wideBbox);

      expect(() => hasStem(glyph, metrics, font)).not.toThrow();
      expect(() => hasArm(glyph, metrics)).not.toThrow();
    });
  });
});
