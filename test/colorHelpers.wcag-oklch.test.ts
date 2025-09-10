import { describe, it, expect } from 'vitest';

import {
  type RGB,
  hexToRgb,
  relativeLuminance,
  contrastRatio,
  contrastRatioHex,
  rgbToOklch,
  oklchToRgb,
  deltaE76,
  rgbToLab,
} from '../utils/helpers/colorHelpers';

describe('WCAG luminance and contrast', () => {
  it('computes relative luminance for known colors', () => {
    const white: RGB = { r: 255, g: 255, b: 255 };
    const black: RGB = { r: 0, g: 0, b: 0 };
    expect(relativeLuminance(white)).toBeCloseTo(1, 5);
    expect(relativeLuminance(black)).toBeCloseTo(0, 5);
  });

  it('computes WCAG contrast ratio correctly', () => {
    const white: RGB = { r: 255, g: 255, b: 255 };
    const black: RGB = { r: 0, g: 0, b: 0 };
    expect(contrastRatio(white, black)).toBeCloseTo(21, 5);
    expect(contrastRatioHex('#ffffff', '#000000')).toBeCloseTo(21, 5);
    expect(contrastRatioHex('#000000', '#ffffff')).toBeCloseTo(21, 5);
  });

  it('returns null for invalid hex input', () => {
    expect(contrastRatioHex('#zzz', '#000')).toBeNull();
  });
});

describe('OKLCH convenience conversions', () => {
  it('round-trips RGB ↔ OKLCH ↔ RGB closely', () => {
    const samples: RGB[] = [
      { r: 255, g: 0, b: 0 },
      { r: 0, g: 255, b: 0 },
      { r: 0, g: 0, b: 255 },
      { r: 200, g: 120, b: 40 },
      { r: 10, g: 100, b: 254 },
    ];
    for (const rgb of samples) {
      const oklch = rgbToOklch(rgb);
      const back = oklchToRgb(oklch.L, oklch.c, oklch.h);
      expect(Math.abs(back.r - rgb.r)).toBeLessThanOrEqual(2);
      expect(Math.abs(back.g - rgb.g)).toBeLessThanOrEqual(2);
      expect(Math.abs(back.b - rgb.b)).toBeLessThanOrEqual(2);
    }
  });
});

describe('Color difference (ΔE76)', () => {
  it('is zero for identical colors and increases with difference', () => {
    const a: RGB = { r: 128, g: 64, b: 192 };
    const b: RGB = { r: 128, g: 64, b: 192 };
    const c: RGB = { r: 140, g: 60, b: 180 };
    const la = rgbToLab(a);
    const lb = rgbToLab(b);
    const lc = rgbToLab(c);
    expect(deltaE76(la, lb)).toBeCloseTo(0, 6);
    expect(deltaE76(la, lc)).toBeGreaterThan(0);
  });
});
