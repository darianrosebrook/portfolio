import { describe, it, expect } from 'vitest';
import {
  isStructuredShadowValue,
  shadowValueToCSS,
} from '../../../utils/designTokens/utils/transforms';

const level1 = {
  offsetX: { value: 0, unit: 'px' },
  offsetY: { value: 1, unit: 'px' },
  blur: { value: 3, unit: 'px' },
  color: { colorSpace: 'srgb', components: [0, 0, 0], alpha: 0.12 },
};

const withSpread = {
  offsetX: { value: 0, unit: 'px' },
  offsetY: { value: 2, unit: 'px' },
  blur: { value: 4, unit: 'px' },
  spread: { value: 8, unit: 'px' },
  color: { colorSpace: 'srgb', components: [0, 0, 0], alpha: 1 },
};

describe('isStructuredShadowValue', () => {
  it('accepts a single shadow composite', () => {
    expect(isStructuredShadowValue(level1)).toBe(true);
  });

  it('accepts an array of shadow composites', () => {
    expect(isStructuredShadowValue([level1, withSpread])).toBe(true);
  });

  it('rejects colors, dimensions, strings, and random objects', () => {
    expect(isStructuredShadowValue(level1.color)).toBe(false);
    expect(isStructuredShadowValue(level1.offsetX)).toBe(false);
    expect(isStructuredShadowValue('0px 1px 3px black')).toBe(false);
    expect(isStructuredShadowValue({ foo: 1 })).toBe(false);
    expect(isStructuredShadowValue(null)).toBe(false);
  });
});

describe('shadowValueToCSS', () => {
  it('serializes offsetX offsetY blur color', () => {
    expect(shadowValueToCSS(level1)).toBe('0px 1px 3px #0000001f');
  });

  it('includes spread when present', () => {
    expect(shadowValueToCSS(withSpread)).toBe('0px 2px 4px 8px #000000');
  });

  it('joins multi-shadow arrays with a comma', () => {
    expect(shadowValueToCSS([level1, withSpread])).toBe(
      '0px 1px 3px #0000001f, 0px 2px 4px 8px #000000'
    );
  });
});
