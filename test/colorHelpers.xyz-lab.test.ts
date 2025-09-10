import { describe, it, expect } from 'vitest';

import {
  type RGB,
  type XYZ,
  type LAB,
  D65_WHITE_POINT,
  sRgbToLinearRgbChannel,
  linearRgbToSRgbChannel,
  rgbToXyz,
  xyzToRgb,
  xyzToLab,
  labToXyz,
} from '../utils/helpers/colorHelpers';

// Utility: compare numbers with tolerance in absolute delta
function closeTo(a: number, b: number, tol: number) {
  expect(Math.abs(a - b)).toBeLessThanOrEqual(tol);
}

describe('RGB/XYZ/LAB conversion helpers', () => {
  describe('gamma channel conversions', () => {
    it('sRGB → linear → sRGB round-trips typical values', () => {
      const samples = [0, 12, 25, 64, 128, 192, 255];
      for (const v of samples) {
        const lin = sRgbToLinearRgbChannel(v);
        const back = linearRgbToSRgbChannel(lin);
        // allow 1 intensity value tolerance due to rounding
        closeTo(back, v, 1);
      }
    });
  });

  describe('RGB ↔ XYZ', () => {
    // Reference values from the standard sRGB ↔ XYZ (D65) matrices
    const cases: { rgb: RGB; xyz: XYZ }[] = [
      {
        rgb: { r: 255, g: 255, b: 255 },
        xyz: {
          x: D65_WHITE_POINT.x,
          y: D65_WHITE_POINT.y,
          z: D65_WHITE_POINT.z,
        },
      },
      {
        rgb: { r: 255, g: 0, b: 0 },
        xyz: { x: 0.4124564, y: 0.2126729, z: 0.0193339 },
      },
      {
        rgb: { r: 0, g: 255, b: 0 },
        xyz: { x: 0.3575761, y: 0.7151522, z: 0.119192 },
      },
      {
        rgb: { r: 0, g: 0, b: 255 },
        xyz: { x: 0.1804375, y: 0.072175, z: 0.9503041 },
      },
    ];

    it('rgbToXyz matches reference within tolerance', () => {
      for (const { rgb, xyz } of cases) {
        const out = rgbToXyz(rgb);
        closeTo(out.x, xyz.x, 1e-4);
        closeTo(out.y, xyz.y, 1e-4);
        closeTo(out.z, xyz.z, 1e-4);
      }
    });

    it('xyzToRgb inverts rgbToXyz within tolerance', () => {
      for (const { rgb } of cases) {
        const xyz = rgbToXyz(rgb);
        const back = xyzToRgb(xyz);
        // integer channels with ±1 tolerance
        closeTo(back.r, rgb.r, 1);
        closeTo(back.g, rgb.g, 1);
        closeTo(back.b, rgb.b, 1);
      }
    });
  });

  describe('XYZ ↔ LAB', () => {
    const cases: { lab: LAB; xyz: XYZ }[] = [
      {
        // D65 white → L* = 100, a* = 0, b* = 0
        lab: { l: 100, a: 0, b: 0 },
        xyz: {
          x: D65_WHITE_POINT.x,
          y: D65_WHITE_POINT.y,
          z: D65_WHITE_POINT.z,
        },
      },
      {
        // Neutral middle gray is approximate; verify round-trip stability
        lab: { l: 53.389, a: 0, b: 0 },
        xyz: { x: 0.20344, y: 0.21404, z: 0.23305 },
      },
    ];

    it('xyzToLab matches expected for white within tolerance', () => {
      const white = {
        x: D65_WHITE_POINT.x,
        y: D65_WHITE_POINT.y,
        z: D65_WHITE_POINT.z,
      };
      const lab = xyzToLab(white);
      closeTo(lab.l, 100, 1e-2);
      closeTo(lab.a, 0, 1e-2);
      closeTo(lab.b, 0, 1e-2);
    });

    it('labToXyz inverts xyzToLab within tolerance', () => {
      for (const { xyz } of cases) {
        const lab = xyzToLab(xyz);
        const back = labToXyz(lab);
        closeTo(back.x, xyz.x, 1e-3);
        closeTo(back.y, xyz.y, 1e-3);
        closeTo(back.z, xyz.z, 1e-3);
      }
    });
  });

  describe('Random round-trip stability', () => {
    it('RGB → XYZ → LAB → XYZ → RGB stays close', () => {
      function randChan() {
        return Math.floor(Math.random() * 256);
      }
      for (let i = 0; i < 50; i++) {
        const rgb: RGB = { r: randChan(), g: randChan(), b: randChan() };
        const xyz = rgbToXyz(rgb);
        const lab = xyzToLab(xyz);
        const xyz2 = labToXyz(lab);
        const rgb2 = xyzToRgb(xyz2);
        closeTo(rgb2.r, rgb.r, 2);
        closeTo(rgb2.g, rgb.g, 2);
        closeTo(rgb2.b, rgb.b, 2);
      }
    });
  });
});
