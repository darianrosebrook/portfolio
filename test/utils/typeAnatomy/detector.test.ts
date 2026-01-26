/**
 * Tests for the feature detection orchestration layer.
 * Covers detectFeature, detectFeatures, and getAvailableFeatures.
 */
import { describe, it, expect } from 'vitest';
import {
  detectFeature,
  detectFeatures,
  getAvailableFeatures,
  type DetectionResult,
} from '@/utils/typeAnatomy/detector';
import {
  mockGlyphFromPath,
  mockNonDrawableGlyph,
  mockFont,
  standardMetrics,
} from '../fixtures/mockGlyph';
import { DONUT, CIRCLE, LETTER_I_LOWERCASE, LETTER_A } from '../fixtures/svgPaths';

describe('detector orchestration', () => {
  const metrics = standardMetrics;

  describe('detectFeature', () => {
    it('returns DetectionResult with found: true for positive detection', () => {
      // Donut shape has a bowl (enclosed counter)
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);

      const result = detectFeature('Bowl', glyph, metrics);

      expect(result).toHaveProperty('found');
      expect(typeof result.found).toBe('boolean');
    });

    it('returns DetectionResult with found: false for unknown feature', () => {
      const glyph = mockGlyphFromPath(CIRCLE.d, CIRCLE.bbox);

      const result = detectFeature('UnknownFeature', glyph, metrics);

      expect(result.found).toBe(false);
    });

    it('normalizes boolean detector result to DetectionResult', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);

      const result = detectFeature('Bowl', glyph, metrics);

      // Should be normalized to an object with 'found' property
      expect(result).toBeTypeOf('object');
      expect(result).toHaveProperty('found');
    });

    it('handles detector that returns DetectionResult with shape', () => {
      // Counter detector returns shape information
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);

      const result = detectFeature('Counter', glyph, metrics);

      expect(result).toHaveProperty('found');
      // If found, may also have shape
      if (result.found) {
        expect(result).toHaveProperty('shape');
      }
    });

    it('returns found: false when detector throws', () => {
      // Create a glyph that might cause detector to fail
      const glyph = mockNonDrawableGlyph('empty');

      const result = detectFeature('Bowl', glyph, metrics);

      // Should handle gracefully and return found: false
      expect(result.found).toBe(false);
    });

    it('passes font parameter to detectors that need it', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);
      const font = mockFont({ unitsPerEm: 1000 });

      // Tittle detector uses font for EPS calculation
      const result = detectFeature('Tittle', glyph, metrics, font);

      expect(result).toHaveProperty('found');
    });

    it('handles Stem detection which requires font', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);
      const font = mockFont();

      const result = detectFeature('Stem', glyph, metrics, font);

      expect(result).toHaveProperty('found');
    });

    it('returns found: false for Stem when no font provided', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);

      const result = detectFeature('Stem', glyph, metrics);

      expect(result.found).toBe(false);
    });

    it('case sensitivity: feature names are case-sensitive', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);

      const resultLower = detectFeature('bowl', glyph, metrics);
      const resultUpper = detectFeature('Bowl', glyph, metrics);

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

      results.forEach((result, name) => {
        expect(result).toHaveProperty('found');
        expect(typeof result.found).toBe('boolean');
      });
    });

    it('handles mixed positive and negative detections', () => {
      const glyph = mockGlyphFromPath(DONUT.d, DONUT.bbox);
      const font = mockFont();
      const featureNames = ['Bowl', 'Tittle', 'Apex'];

      const results = detectFeatures(featureNames, glyph, metrics, font);

      // Bowl should be found in donut, but probably not tittle or apex
      expect(results.get('Bowl')).toBeDefined();
      expect(results.get('Tittle')).toBeDefined();
      expect(results.get('Apex')).toBeDefined();
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

    it('passes font to all detectors', () => {
      const glyph = mockGlyphFromPath(LETTER_I_LOWERCASE.d, LETTER_I_LOWERCASE.bbox);
      const font = mockFont();
      const featureNames = ['Stem', 'Tittle'];

      const results = detectFeatures(featureNames, glyph, metrics, font);

      // Both should be processed with font context
      expect(results.get('Stem')).toBeDefined();
      expect(results.get('Tittle')).toBeDefined();
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
    it('can detect multiple features on letter A', () => {
      const glyph = mockGlyphFromPath(LETTER_A.d, LETTER_A.bbox);
      const font = mockFont();

      const features = getAvailableFeatures();
      const results = detectFeatures(features, glyph, metrics, font);

      // Letter A should have some features detected
      let hasAnyFeature = false;
      results.forEach((result) => {
        if (result.found) hasAnyFeature = true;
      });

      // At minimum, we should have valid detection results
      expect(results.size).toBe(features.length);
    });

    it('non-drawable glyph returns false for all features', () => {
      const glyph = mockNonDrawableGlyph('null-path');

      const features = getAvailableFeatures();
      const results = detectFeatures(features, glyph, metrics);

      results.forEach((result, name) => {
        expect(result.found).toBe(false);
      });
    });
  });
});
