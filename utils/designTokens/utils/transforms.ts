/**
 * Built-in Design Token Transforms
 *
 * Common transformation functions for different token types.
 */

import {
  parseCssColorToRgb,
  formatHsl,
  formatOklch,
} from '../../helpers/colorFormat';
import { rgbToHex, rgbToHsl, rgbToOklch } from '../../helpers/colorHelpers';
import type { Transform, ResolveContext } from './types';

/**
 * Built-in transforms for common token types
 */
export const builtInTransforms: Transform[] = [
  // Dimension transform: numbers to CSS units
  {
    match: ({ type }) => type === 'dimension',
    apply: (value, ctx) => {
      if (typeof value === 'number') {
        const unit = ctx.config.unitPreferences?.dimension ?? 'px';
        return `${value}${unit}`;
      }
      return value;
    },
  },

  // Duration transform: numbers to time units
  {
    match: ({ type }) => type === 'duration',
    apply: (value, ctx) => {
      if (typeof value === 'number') {
        const unit = ctx.config.unitPreferences?.duration ?? 'ms';
        return unit === 's' ? `${value / 1000}s` : `${value}ms`;
      }
      return value;
    },
  },

  // Color transform: normalize color formats
  {
    match: ({ type }) => type === 'color',
    apply: (value, ctx) => {
      if (typeof value !== 'string') return value;
      const target = ctx.config.unitPreferences?.color ?? 'hex';
      const rgb = parseCssColorToRgb(value);
      if (!rgb) return value; // leave unknown formats intact
      switch (target) {
        case 'rgb':
          return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        case 'hsl': {
          const hsl = rgbToHsl(rgb);
          return formatHsl(hsl);
        }
        case 'oklch': {
          const oklch = rgbToOklch(rgb);
          return formatOklch(oklch.L, oklch.c, oklch.h);
        }
        case 'hex':
        default:
          return rgbToHex(rgb);
      }
    },
  },

  // Border transform: add default border style
  {
    match: ({ path }) => path.endsWith('.border'),
    apply: (value) => {
      if (typeof value === 'string' && !value.includes(' ')) {
        return `1px solid ${value}`;
      }
      return value;
    },
  },

  // Typography transform: convert typography objects to CSS
  {
    match: ({ type }) => type === 'typography',
    apply: (value) => {
      if (typeof value === 'object' && value !== null) {
        const typo = value as Record<string, unknown>;
        const parts: string[] = [];

        if (typo.fontFamily) parts.push(`font-family: ${typo.fontFamily}`);
        if (typo.fontSize) parts.push(`font-size: ${typo.fontSize}`);
        if (typo.fontWeight) parts.push(`font-weight: ${typo.fontWeight}`);
        if (typo.lineHeight) parts.push(`line-height: ${typo.lineHeight}`);
        if (typo.letterSpacing)
          parts.push(`letter-spacing: ${typo.letterSpacing}`);

        return parts.join('; ');
      }
      return value;
    },
  },
];
