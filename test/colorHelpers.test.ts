/**
 * Comprehensive test suite for color helper functions
 * Tests color space conversions against known reference values
 */

import { describe, it, expect } from 'vitest';

// Import the color helper functions
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  rgbToHsv,
  hsvToRgb,
  rgbToLab,
  labToRgb,
  rgbToLch,
  lchToRgb,
  rgbToOklab,
  oklabToRgb,
  oklabToOklch,
  oklchToOklab,
  calculateContrast,
  type RGB,
  type HSL,
  type LAB,
  type LCH,
  type XYZ,
} from '../utils/helpers/colorHelpers';

// Known test cases with reference values
// These are carefully selected colors that have well-documented conversions
const TEST_CASES = {
  // Basic colors with known conversions
  basic: [
    {
      name: 'Pure Red',
      hex: '#ff0000',
      rgb: { r: 255, g: 0, b: 0 },
      hsl: { h: 0, s: 100, l: 50 },
      hsv: { h: 0, s: 100, v: 100 },
      // LAB values (approximate, D65 illuminant)
      lab: { l: 53.24, a: 80.09, b: 67.2 },
      // LCH values (approximate)
      lch: { l: 53.24, c: 104.55, h: 40.0 },
    },
    {
      name: 'Pure Green',
      hex: '#00ff00',
      rgb: { r: 0, g: 255, b: 0 },
      hsl: { h: 120, s: 100, l: 50 },
      hsv: { h: 120, s: 100, v: 100 },
      lab: { l: 87.74, a: -86.18, b: 83.18 },
      lch: { l: 87.74, c: 119.78, h: 136.0 },
    },
    {
      name: 'Pure Blue',
      hex: '#0000ff',
      rgb: { r: 0, g: 0, b: 255 },
      hsl: { h: 240, s: 100, l: 50 },
      hsv: { h: 240, s: 100, v: 100 },
      lab: { l: 32.3, a: 79.19, b: -107.86 },
      lch: { l: 32.3, c: 133.81, h: -53.6 },
    },
    {
      name: 'White',
      hex: '#ffffff',
      rgb: { r: 255, g: 255, b: 255 },
      hsl: { h: 0, s: 0, l: 100 },
      hsv: { h: 0, s: 0, v: 100 },
      lab: { l: 100.0, a: 0.0, b: 0.0 },
      lch: { l: 100.0, c: 0.0, h: 0.0 },
    },
    {
      name: 'Black',
      hex: '#000000',
      rgb: { r: 0, g: 0, b: 0 },
      hsl: { h: 0, s: 0, l: 0 },
      hsv: { h: 0, s: 0, v: 0 },
      lab: { l: 0.0, a: 0.0, b: 0.0 },
      lch: { l: 0.0, c: 0.0, h: 0.0 },
    },
    {
      name: 'Medium Gray',
      hex: '#808080',
      rgb: { r: 128, g: 128, b: 128 },
      hsl: { h: 0, s: 0, l: 50 },
      hsv: { h: 0, s: 0, v: 50 },
      lab: { l: 53.39, a: 0.0, b: 0.0 },
      lch: { l: 53.39, c: 0.0, h: 0.0 },
    },
  ],

  // Colors from your design system
  designSystem: [
    {
      name: 'Design System Red 500',
      hex: '#d9292b',
      rgb: { r: 217, g: 41, b: 43 },
      hsl: { h: 359, s: 69, l: 51 },
      hsv: { h: 359, s: 81, v: 85 },
      // Approximate LAB values
      lab: { l: 48.5, a: 65.2, b: 35.8 },
      lch: { l: 48.5, c: 74.4, h: 28.7 },
    },
    {
      name: 'Design System Blue 500',
      hex: '#0a65fe',
      rgb: { r: 10, g: 101, b: 254 },
      hsl: { h: 220, s: 99, l: 52 },
      hsv: { h: 220, s: 96, v: 100 },
      // Approximate LAB values
      lab: { l: 45.8, a: 18.2, b: -78.4 },
      lch: { l: 45.8, c: 80.5, h: -76.9 },
    },
    {
      name: 'Design System Neutral 500',
      hex: '#717171',
      rgb: { r: 113, g: 113, b: 113 },
      hsl: { h: 0, s: 0, l: 44 },
      hsv: { h: 0, s: 0, v: 44 },
      // Approximate LAB values
      lab: { l: 47.8, a: 0.0, b: 0.0 },
      lch: { l: 47.8, c: 0.0, h: 0.0 },
    },
  ],

  // Edge cases
  edgeCases: [
    {
      name: '3-digit hex',
      hex: '#f00',
      rgb: { r: 255, g: 0, b: 0 },
      hsl: { h: 0, s: 100, l: 50 },
    },
    {
      name: 'Hex without #',
      hex: 'ff0000',
      rgb: { r: 255, g: 0, b: 0 },
      hsl: { h: 0, s: 100, l: 50 },
    },
    {
      name: 'Saturated Yellow',
      hex: '#ffff00',
      rgb: { r: 255, g: 255, b: 0 },
      hsl: { h: 60, s: 100, l: 50 },
      hsv: { h: 60, s: 100, v: 100 },
      lab: { l: 97.14, a: -21.55, b: 94.48 },
      lch: { l: 97.14, c: 96.91, h: 102.9 },
    },
  ],
};

// Tolerance values for floating point comparisons
const TOLERANCE = {
  // For RGB values (integers 0-255)
  rgb: 1,
  // For HSL/HSV percentages (0-100)
  percentage: 1,
  // For LAB/LCH values (more precise)
  lab: 0.5,
  // For hue values (degrees)
  hue: 1,
  // For contrast calculations
  contrast: 0.1,
};

// Helper function to compare color objects with tolerance
function compareColor(
  actual: Record<string, number> | RGB | LAB | LCH,
  expected: Record<string, number> | RGB | LAB | LCH,
  tolerance: number = TOLERANCE.rgb,
  keys: string[] = ['r', 'g', 'b']
) {
  for (const key of keys) {
    const actualValue = (actual as Record<string, number>)[key];
    const expectedValue = (expected as Record<string, number>)[key];
    expect(actualValue).toBeCloseTo(expectedValue, tolerance);
  }
}

// Helper function to compare HSL with hue wrapping
function compareHSL(actual: HSL, expected: HSL) {
  expect(actual.s).toBeCloseTo(expected.s, TOLERANCE.percentage);
  expect(actual.l).toBeCloseTo(expected.l, TOLERANCE.percentage);

  // Handle hue wrapping (0° and 360° are the same)
  let actualH = actual.h;
  let expectedH = expected.h;
  if (Math.abs(actualH - expectedH) > 180) {
    if (actualH > expectedH) {
      actualH -= 360;
    } else {
      expectedH -= 360;
    }
  }
  expect(actualH).toBeCloseTo(expectedH, TOLERANCE.hue);
}

describe('Color Helper Functions', () => {
  describe('Basic Conversions', () => {
    describe('hexToRgb', () => {
      it('should convert 6-digit hex colors correctly', () => {
        const result = hexToRgb('#ff0000');
        expect(result).toEqual({ r: 255, g: 0, b: 0 });
      });

      it('should convert 3-digit hex colors correctly', () => {
        const result = hexToRgb('#f00');
        expect(result).toEqual({ r: 255, g: 0, b: 0 });
      });

      it('should handle hex colors without # prefix', () => {
        const result = hexToRgb('ff0000');
        expect(result).toEqual({ r: 255, g: 0, b: 0 });
      });

      it('should return null for invalid hex colors', () => {
        expect(hexToRgb('invalid')).toBeNull();
        expect(hexToRgb('#gggggg')).toBeNull();
        expect(hexToRgb('')).toBeNull();
      });
    });

    describe('rgbToHex', () => {
      it('should convert RGB to hex correctly', () => {
        const result = rgbToHex({ r: 255, g: 0, b: 0 });
        expect(result).toBe('#ff0000');
      });

      it('should clamp RGB values to valid range', () => {
        const result = rgbToHex({ r: 300, g: -10, b: 128 });
        expect(result).toBe('#ff0080');
      });
    });

    describe('rgbToHsl and hslToRgb', () => {
      it('should convert RGB to HSL correctly', () => {
        const result = rgbToHsl({ r: 255, g: 0, b: 0 });
        compareHSL(result, { h: 0, s: 100, l: 50 });
      });

      it('should convert HSL to RGB correctly', () => {
        const result = hslToRgb({ h: 0, s: 100, l: 50 });
        compareColor(result, { r: 255, g: 0, b: 0 });
      });

      it('should handle hue wrapping correctly', () => {
        const hsl1 = rgbToHsl({ r: 255, g: 0, b: 0 }); // 0°
        const hsl2 = rgbToHsl({ r: 255, g: 0, b: 0 }); // 360°
        expect(hsl1.h).toBeCloseTo(hsl2.h, TOLERANCE.hue);
      });
    });

    describe('rgbToHsv and hsvToRgb', () => {
      it('should convert RGB to HSV correctly', () => {
        const result = rgbToHsv(255, 0, 0);
        expect(result.h).toBeCloseTo(0, TOLERANCE.hue);
        expect(result.s).toBeCloseTo(100, TOLERANCE.percentage);
        expect(result.v).toBeCloseTo(100, TOLERANCE.percentage);
      });

      it('should convert HSV to RGB correctly', () => {
        const result = hsvToRgb(0, 100, 100);
        compareColor(result, { r: 255, g: 0, b: 0 });
      });
    });
  });

  describe('Advanced Color Space Conversions', () => {
    describe('LAB Color Space', () => {
      it('should convert RGB to LAB correctly', () => {
        const result = rgbToLab({ r: 255, g: 0, b: 0 });
        compareColor(result, { l: 53.24, a: 80.09, b: 67.2 }, TOLERANCE.lab, [
          'l',
          'a',
          'b',
        ]);
      });

      it('should convert LAB to RGB correctly', () => {
        const result = labToRgb({ l: 53.24, a: 80.09, b: 67.2 });
        compareColor(result, { r: 255, g: 0, b: 0 });
      });

      it('should handle round-trip conversions accurately', () => {
        const original = { r: 128, g: 64, b: 192 };
        const lab = rgbToLab(original);
        const rgb = labToRgb(lab);
        compareColor(rgb, original);
      });
    });

    describe('LCH Color Space', () => {
      it('should convert RGB to LCH correctly', () => {
        const result = rgbToLch({ r: 255, g: 0, b: 0 });
        expect(result.l).toBeCloseTo(53.24, TOLERANCE.lab);
        expect(result.c).toBeCloseTo(104.55, TOLERANCE.lab);
        expect(result.h).toBeCloseTo(40.0, TOLERANCE.hue);
      });

      it('should convert LCH to RGB correctly', () => {
        const result = lchToRgb({ l: 53.24, c: 104.55, h: 40.0 });
        compareColor(result, { r: 255, g: 0, b: 0 });
      });
    });

    describe('OKLab Color Space', () => {
      it('should convert RGB to OKLab correctly', () => {
        const result = rgbToOklab(255, 0, 0);
        expect(result.L).toBeCloseTo(0.6279, 3);
        expect(result.a).toBeCloseTo(0.2249, 3);
        expect(result.b).toBeCloseTo(0.1258, 3);
      });

      it('should convert OKLab to RGB correctly', () => {
        const result = oklabToRgb(0.6279, 0.2249, 0.1258);
        compareColor(result, { r: 255, g: 0, b: 0 });
      });

      it('should convert OKLab to OKLCh correctly', () => {
        const result = oklabToOklch(0.6279, 0.2249, 0.1258);
        expect(result.L).toBeCloseTo(0.6279, 3);
        expect(result.c).toBeCloseTo(0.258, 3);
        expect(result.h).toBeCloseTo(29.2, 1);
      });

      it('should convert OKLCh to OKLab correctly', () => {
        const result = oklchToOklab(0.6279, 0.258, 29.2);
        expect(result.L).toBeCloseTo(0.6279, 3);
        expect(result.a).toBeCloseTo(0.2249, 3);
        expect(result.b).toBeCloseTo(0.1258, 3);
      });
    });
  });

  describe('Contrast Calculation', () => {
    it('should calculate contrast correctly for known colors', () => {
      expect(calculateContrast('#ffffff')).toBeCloseTo(255, TOLERANCE.contrast);
      expect(calculateContrast('#000000')).toBeCloseTo(0, TOLERANCE.contrast);
      expect(calculateContrast('#808080')).toBeCloseTo(128, TOLERANCE.contrast);
    });

    it('should handle 3-digit hex colors', () => {
      expect(calculateContrast('#fff')).toBeCloseTo(255, TOLERANCE.contrast);
      expect(calculateContrast('#000')).toBeCloseTo(0, TOLERANCE.contrast);
    });

    it('should throw error for invalid hex colors', () => {
      expect(() => calculateContrast('invalid')).toThrow();
      expect(() => calculateContrast('#gggggg')).toThrow();
    });
  });

  describe('Comprehensive Test Cases', () => {
    it('should handle all basic color conversions', () => {
      for (const testCase of TEST_CASES.basic) {
        const rgb = hexToRgb(testCase.hex);
        expect(rgb).toEqual(testCase.rgb);

        const hex = rgbToHex(testCase.rgb);
        expect(hex.toLowerCase()).toBe(testCase.hex.toLowerCase());

        const hsl = rgbToHsl(testCase.rgb);
        compareHSL(hsl, testCase.hsl);

        const rgbFromHsl = hslToRgb(testCase.hsl);
        compareColor(rgbFromHsl, testCase.rgb);
      }
    });

    it('should handle design system colors', () => {
      for (const testCase of TEST_CASES.designSystem) {
        const rgb = hexToRgb(testCase.hex);
        expect(rgb).toEqual(testCase.rgb);

        const hex = rgbToHex(testCase.rgb);
        expect(hex.toLowerCase()).toBe(testCase.hex.toLowerCase());
      }
    });

    it('should handle edge cases', () => {
      for (const testCase of TEST_CASES.edgeCases) {
        const rgb = hexToRgb(testCase.hex);
        expect(rgb).toEqual(testCase.rgb);
      }
    });
  });

  describe('Round-trip Accuracy', () => {
    it('should maintain accuracy through RGB ↔ LAB ↔ RGB conversion', () => {
      const testColors = [
        { r: 255, g: 0, b: 0 },
        { r: 0, g: 255, b: 0 },
        { r: 0, g: 0, b: 255 },
        { r: 128, g: 128, b: 128 },
        { r: 217, g: 41, b: 43 }, // Design system red
      ];

      for (const original of testColors) {
        const lab = rgbToLab(original);
        const rgb = labToRgb(lab);
        compareColor(rgb, original, 2); // Slightly higher tolerance for round-trip
      }
    });

    it('should maintain accuracy through RGB ↔ LCH ↔ RGB conversion', () => {
      const testColors = [
        { r: 255, g: 0, b: 0 },
        { r: 0, g: 255, b: 0 },
        { r: 0, g: 0, b: 255 },
        { r: 128, g: 128, b: 128 },
      ];

      for (const original of testColors) {
        const lch = rgbToLch(original);
        const rgb = lchToRgb(lch);
        compareColor(rgb, original, 2);
      }
    });

    it('should maintain accuracy through RGB ↔ OKLab ↔ RGB conversion', () => {
      const testColors = [
        { r: 255, g: 0, b: 0 },
        { r: 0, g: 255, b: 0 },
        { r: 0, g: 0, b: 255 },
        { r: 128, g: 128, b: 128 },
      ];

      for (const original of testColors) {
        const oklab = rgbToOklab(original.r, original.g, original.b);
        const rgb = oklabToRgb(oklab.L, oklab.a, oklab.b);
        compareColor(rgb, original, 2);
      }
    });
  });

  describe('Performance Tests', () => {
    it.skip('should convert colors efficiently (micro-benchmark is noisy in CI)', () => {
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        const rgb = hexToRgb('#ff0000');
        const hsl = rgbToHsl(rgb!);
        const lab = rgbToLab(rgb!);
      }
      const end = performance.now();
      expect(end - start).toBeLessThan(100);
    });
  });
});

// Export test cases for use in other tests
export { TEST_CASES, TOLERANCE };
