import { describe, it, expect } from 'vitest';

import {
  rgbToLab,
  deltaE76,
  deltaE2000,
  oklchToRgb,
  oklchToRgbClipped,
  type RGB,
} from '../utils/helpers/colorHelpers';

describe('Color difference ΔE', () => {
  it('deltaE2000 is ~0 for identical colors and <= deltaE76 typically', () => {
    const a: RGB = { r: 50, g: 100, b: 150 };
    const b: RGB = { r: 50, g: 100, b: 150 };
    const la = rgbToLab(a);
    const lb = rgbToLab(b);
    expect(deltaE2000(la, lb)).toBeCloseTo(0, 6);

    const c: RGB = { r: 55, g: 98, b: 140 };
    const lc = rgbToLab(c);
    const de76 = deltaE76(la, lc);
    const de00 = deltaE2000(la, lc);
    expect(de00).toBeLessThanOrEqual(de76 + 1e-6); // often smaller or similar
  });
});

describe('OKLCH gamut clipping', () => {
  it('produces in-gamut RGB by reducing chroma when necessary', () => {
    // A high-chroma yellow at mid L often goes out of sRGB gamut
    const L = 0.8;
    const c = 0.4;
    const h = 100;
    const unclipped = oklchToRgb(L, c, h);
    const clipped = oklchToRgbClipped(L, c, h);
    const inGamut = (rgb: RGB) =>
      rgb.r >= 0 &&
      rgb.r <= 255 &&
      rgb.g >= 0 &&
      rgb.g <= 255 &&
      rgb.b >= 0 &&
      rgb.b <= 255;

    expect(inGamut(clipped)).toBe(true);
    // If the unclipped was already in gamut, clipped should be identical or very close
    if (inGamut(unclipped)) {
      expect(Math.abs(clipped.r - unclipped.r)).toBeLessThanOrEqual(2);
      expect(Math.abs(clipped.g - unclipped.g)).toBeLessThanOrEqual(2);
      expect(Math.abs(clipped.b - unclipped.b)).toBeLessThanOrEqual(2);
    }
  });
});
