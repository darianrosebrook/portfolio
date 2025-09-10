import { describe, it, expect } from 'vitest';

import {
  parseHex,
  formatHex,
  parseRgb,
  formatRgb,
  parseHsl,
  formatHsl,
  parseOklch,
  formatOklch,
  parseCssColorToRgb,
} from '../utils/helpers/colorFormat';

describe('colorFormat parse/format', () => {
  it('parses and formats hex', () => {
    const rgb = parseHex('#ff0000');
    expect(rgb).toEqual({ r: 255, g: 0, b: 0 });
    expect(formatHex(rgb!)).toBe('#ff0000');
  });

  it('parses and formats rgb()', () => {
    const rgb = parseRgb('rgb(10, 20, 30)');
    expect(rgb).toEqual({ r: 10, g: 20, b: 30 });
    expect(formatRgb(rgb!)).toBe('rgb(10, 20, 30)');
  });

  it('parses and formats hsl()', () => {
    const hsl = parseHsl('hsl(120, 50%, 40%)');
    expect(hsl).toEqual({ h: 120, s: 50, l: 40 });
    expect(formatHsl(hsl!)).toBe('hsl(120, 50%, 40%)');
  });

  it('parses and formats oklch()', () => {
    const o = parseOklch('oklch(0.75 0.12 200)');
    expect(o).toEqual({ L: 0.75, c: 0.12, h: 200 });
    expect(formatOklch(0.75, 0.12, 200)).toBe('oklch(0.75 0.12 200)');
  });
});

describe('parseCssColorToRgb', () => {
  it('handles hex, rgb, hsl, and oklch inputs', () => {
    expect(parseCssColorToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
    expect(parseCssColorToRgb('rgb(0, 0, 255)')).toEqual({
      r: 0,
      g: 0,
      b: 255,
    });
    const fromHsl = parseCssColorToRgb('hsl(0, 100%, 50%)');
    expect(fromHsl).toEqual({ r: 255, g: 0, b: 0 });
    const fromOklch = parseCssColorToRgb('oklch(0.6 0.1 30)');
    expect(fromOklch).toBeTruthy();
  });

  it('returns null for invalid strings', () => {
    expect(parseCssColorToRgb('not-a-color')).toBeNull();
  });
});
