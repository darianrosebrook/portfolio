/**
 * Tests for the feature detection orchestration layer.
 * Covers detectFeature, detectFeatures, and getAvailableFeatures.
 */
import { describe, it, expect } from 'vitest';
import {
  detectFeature,
  detectFeatures,
  getAvailableFeatures,
} from '@/utils/typeAnatomy/detector';
import {
  mockGlyphFromPath,
  mockNonDrawableGlyph,
  mockFont,
  standardMetrics,
} from '../fixtures/mockGlyph';
import { DONUT, CIRCLE } from '../fixtures/svgPaths';

describe('detector orchestration', () => {
  const metrics = standardMetrics;

  describe('detectFeature', () => {
    it('returns found: true on Counter for a donut polygon', () => {
      // Counter is the canonical positive case for synthetic donut geometry —
      // the inner polygon's enclosed region surfaces through the detector.
      // (Bowl, despite the donut's visual appearance, returns false on this
      // synthetic path because hasBowl uses heuristics calibrated for real
      // typefaces; that's exercised in feature-accuracy.test.ts on Nohemi O.)
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);

      const result = detectFeature('Counter', glyph, metrics);

      expect(result.found).toBe(true);
    });

    it('returns found: false for unknown feature names', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      const result = detectFeature('UnknownFeature', glyph, metrics);

      expect(result.found).toBe(false);
    });

    it('normalizes detector return shape to a DetectionResult object', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);

      const result = detectFeature('Counter', glyph, metrics);

      // Even when found is true, result must be a plain object with the
      // documented contract (`found`, optional `shape`/`location`).
      expect(result).toBeTypeOf('object');
      expect(result.found).toBe(true);
    });

    it('forwards a renderable shape on Counter detection', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);

      const result = detectFeature('Counter', glyph, metrics);

      expect(result.found).toBe(true);
      expect(result.shape).toBeDefined();
      expect(result.shape?.type).toBe('polyline');
    });

    it('returns found: false when detector throws', () => {
      // Create a glyph that might cause detector to fail
      const glyph = mockNonDrawableGlyph('empty');

      const result = detectFeature('Bowl', glyph, metrics);

      // Should handle gracefully and return found: false
      expect(result.found).toBe(false);
    });

    it('does not detect a tittle on a donut (no disconnected mark above x-height)', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);
      const font = mockFont({ unitsPerEm: 1000 });

      // Tittle requires a disconnected mark contour above x-height.
      // A donut is one closed shape — must reject.
      const result = detectFeature('Tittle', glyph, metrics, font);

      expect(result.found).toBe(false);
    });

    it('detects a stem on a donut polygon when font is supplied', () => {
      // hasStem fires on the donut polygon's vertical extent. This proves the
      // orchestrator threads font through to the detector — without font,
      // Stem rejects unconditionally (covered by the next test).
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);
      const font = mockFont();

      const result = detectFeature('Stem', glyph, metrics, font);

      expect(result.found).toBe(true);
    });

    it('returns found: false for Stem when no font provided', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);

      const result = detectFeature('Stem', glyph, metrics);

      expect(result.found).toBe(false);
    });

    it('case sensitivity: feature names are case-sensitive', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);

      const resultLower = detectFeature('bowl', glyph, metrics);
      detectFeature('Bowl', glyph, metrics);

      // 'bowl' (lowercase) should not match 'Bowl'
      // The actual feature name is 'Bowl'
      expect(resultLower.found).toBe(false); // Unknown feature
    });
  });

  describe('detectFeatures', () => {
    it('returns Map of feature names to DetectionResults', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);
      const featureNames = ['Bowl', 'Counter', 'Eye'];

      const results = detectFeatures(featureNames, glyph, metrics);

      expect(results).toBeInstanceOf(Map);
      expect(results.size).toBe(3);
    });

    it('includes all requested features in result map', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);
      const featureNames = ['Bowl', 'Stem', 'Apex'];

      const results = detectFeatures(featureNames, glyph, metrics);

      expect(results.has('Bowl')).toBe(true);
      expect(results.has('Stem')).toBe(true);
      expect(results.has('Apex')).toBe(true);
    });

    it('each result is a valid DetectionResult', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);
      const featureNames = ['Bowl', 'Counter'];

      const results = detectFeatures(featureNames, glyph, metrics);

      results.forEach((result) => {
        expect(result).toHaveProperty('found');
        expect(typeof result.found).toBe('boolean');
      });
    });

    it('returns mixed positive/negative DetectionResults for a donut', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);
      const font = mockFont();
      const featureNames = ['Counter', 'Tittle', 'Apex'];

      const results = detectFeatures(featureNames, glyph, metrics, font);

      // Counter fires on the donut's enclosed region; Tittle and Apex
      // require structural features the donut does not have.
      expect(results.get('Counter')?.found).toBe(true);
      expect(results.get('Tittle')?.found).toBe(false);
      expect(results.get('Apex')?.found).toBe(false);
    });

    it('handles empty feature names array', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      const results = detectFeatures([], glyph, metrics);

      expect(results).toBeInstanceOf(Map);
      expect(results.size).toBe(0);
    });

    it('handles unknown features in batch', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);
      const featureNames = ['Bowl', 'UnknownFeature', 'Counter'];

      const results = detectFeatures(featureNames, glyph, metrics);

      expect(results.get('UnknownFeature')?.found).toBe(false);
    });
  });

  describe('getAvailableFeatures', () => {
    it('returns array of feature names', () => {
      const features = getAvailableFeatures();

      expect(Array.isArray(features)).toBe(true);
      expect(features.length).toBeGreaterThan(0);
    });

    it('includes expected common features', () => {
      const features = getAvailableFeatures();

      const expectedFeatures = [
        'Bowl',
        'Stem',
        'Counter',
        'Apex',
        'Vertex',
        'Serif',
        'Arm',
        'Bar',
        'Tittle',
        'Terminal',
        'Tail',
        'Loop',
        'Eye',
      ];

      for (const expected of expectedFeatures) {
        expect(features).toContain(expected);
      }
    });

    it('returns strings for all feature names', () => {
      const features = getAvailableFeatures();

      features.forEach((feature) => {
        expect(typeof feature).toBe('string');
        expect(feature.length).toBeGreaterThan(0);
      });
    });

    it('features are unique', () => {
      const features = getAvailableFeatures();
      const uniqueFeatures = new Set(features);

      expect(uniqueFeatures.size).toBe(features.length);
    });

    it('includes all detector mappings', () => {
      const features = getAvailableFeatures();

      // Should have a substantial number of features
      expect(features.length).toBeGreaterThanOrEqual(25);
    });
  });

  describe('integration: full detection workflow', () => {
    it('non-drawable glyph returns false for all features', () => {
      const glyph = mockNonDrawableGlyph('null-path');

      const features = getAvailableFeatures();
      const results = detectFeatures(features, glyph, metrics);

      results.forEach((result) => {
        expect(result.found).toBe(false);
      });
    });
  });
});
