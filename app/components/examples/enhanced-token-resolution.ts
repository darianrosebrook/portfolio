/**
 * Example demonstrating the enhanced design token resolution system
 *
 * This example shows how to use the new configurable resolver with:
 * - Theme/mode selection
 * - Interpolation and fallbacks
 * - Custom transforms
 * - Different output formats
 */

import {
  generate,
  createDefaultConfig,
  formatAsCSS,
  builtInTransforms,
  type ResolverConfig,
  type Transform,
} from '../../../utils/designTokens/componentTokenUtils';

// Example design tokens with theme support
const exampleTokens = {
  semantic: {
    color: {
      bg: {
        primary: {
          $value: {
            light: '#ffffff',
            dark: '#1a1a1a',
            hc: '#000000',
          },
          $type: 'color',
        },
        secondary: {
          $value: {
            light: '#f8f9fa',
            dark: '#2d2d2d',
            hc: '#ffffff',
          },
          $type: 'color',
        },
      },
      fg: {
        primary: {
          $value: {
            light: '#212529',
            dark: '#ffffff',
            hc: '#ffffff',
          },
          $type: 'color',
        },
        secondary: {
          $value: {
            light: '#6c757d',
            dark: '#adb5bd',
            hc: '#ffffff',
          },
          $type: 'color',
        },
      },
      border: {
        default: {
          $value: {
            light: '#dee2e6',
            dark: '#495057',
            hc: '#ffffff',
          },
          $type: 'color',
        },
        focus: {
          $value: '#0d6efd',
          $type: 'color',
        },
      },
    },
    space: {
      xs: { $value: 4, $type: 'dimension' },
      sm: { $value: 8, $type: 'dimension' },
      md: { $value: 16, $type: 'dimension' },
      lg: { $value: 24, $type: 'dimension' },
      xl: { $value: 32, $type: 'dimension' },
    },
    duration: {
      fast: { $value: 150, $type: 'duration' },
      normal: { $value: 300, $type: 'duration' },
      slow: { $value: 500, $type: 'duration' },
    },
    typography: {
      heading: {
        $value: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '2rem',
          fontWeight: '600',
          lineHeight: '1.2',
        },
        $type: 'typography',
      },
      body: {
        $value: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '1rem',
          fontWeight: '400',
          lineHeight: '1.5',
        },
        $type: 'typography',
      },
    },
  },
  brand: {
    primary: '#0d6efd',
    secondary: '#6c757d',
    success: '#198754',
    warning: '#ffc107',
    danger: '#dc3545',
  },
};

// Example component tokens
const buttonTokens = {
  prefix: 'button',
  tokens: {
    // Simple references
    background: '{semantic.color.bg.primary}',
    foreground: '{semantic.color.fg.primary}',

    // Interpolation with fallbacks
    border: '1px solid {semantic.color.border.default} || {brand.primary}',
    focusRing: '0 0 0 3px {semantic.color.border.focus}',

    // Complex interpolation
    padding: 'calc({semantic.space.sm} + {semantic.space.xs})',
    margin: '{semantic.space.md}',

    // Typography
    font: '{semantic.typography.body}',

    // Transitions
    transition: 'all {semantic.duration.fast} ease-in-out',

    // Nested tokens
    hover: {
      background: '{semantic.color.bg.secondary}',
      transform: 'translateY(-1px)',
    },

    disabled: {
      background: '{semantic.color.bg.secondary}',
      foreground: '{semantic.color.fg.secondary}',
      opacity: '0.6',
    },
  },
};

// Custom transform for button-specific styling
const buttonTransform: Transform = {
  match: ({ path }) => path.includes('button') && path.endsWith('.transform'),
  apply: (value) => {
    if (typeof value === 'string' && value.includes('translateY')) {
      return `${value}; box-shadow: 0 2px 4px rgba(0,0,0,0.1)`;
    }
    return value;
  },
};

// Example 1: Light theme with default settings
console.log('=== Light Theme (Default) ===');
const lightConfig = createDefaultConfig({
  theme: 'light',
  cssVarPrefix: '--ds-',
});

const lightResult = generate(buttonTokens, exampleTokens, lightConfig);
console.log('CSS Variables:', lightResult);
console.log('CSS Output:', formatAsCSS(lightResult, ':root'));

// Example 2: Dark theme with custom transforms
console.log('\n=== Dark Theme with Custom Transforms ===');
const darkConfig = createDefaultConfig({
  theme: 'dark',
  cssVarPrefix: '--ds-',
  transforms: [...builtInTransforms, buttonTransform],
});

const darkResult = generate(buttonTokens, exampleTokens, darkConfig);
console.log('CSS Variables:', darkResult);

// Example 3: High contrast theme with rem units
console.log('\n=== High Contrast Theme with Rem Units ===');
const hcConfig = createDefaultConfig({
  theme: 'hc',
  cssVarPrefix: '--ds-',
  unitPreferences: {
    dimension: 'rem',
    duration: 's',
    color: 'hex',
  },
});

const hcResult = generate(buttonTokens, exampleTokens, hcConfig);
console.log('CSS Variables:', hcResult);

// Example 4: CamelCase naming for JavaScript
console.log('\n=== CamelCase for JavaScript ===');
const jsConfig = createDefaultConfig({
  theme: 'light',
  nameCase: 'camel',
  cssVarPrefix: '', // No CSS prefix for JS
});

const jsResult = generate(buttonTokens, exampleTokens, jsConfig);
console.log('JavaScript Object:', jsResult);

// Example 5: Custom component with complex fallbacks
console.log('\n=== Complex Fallback Example ===');
const complexTokens = {
  prefix: 'card',
  tokens: {
    background: '{semantic.color.bg.missing} || {brand.primary} || #007bff',
    border: '2px solid {semantic.color.border.default} || {brand.secondary}',
    shadow: '0 4px 6px {semantic.color.bg.primary} || rgba(0,0,0,0.1)',
  },
};

const complexResult = generate(complexTokens, exampleTokens, lightConfig);
console.log('Complex Fallbacks:', complexResult);

// Example 6: Performance test with caching
console.log('\n=== Performance Test with Caching ===');
const perfConfig = createDefaultConfig({
  theme: 'light',
  cache: new Map(),
});

const startTime = performance.now();
for (let i = 0; i < 1000; i++) {
  generate(buttonTokens, exampleTokens, perfConfig);
}
const endTime = performance.now();

console.log(`Generated 1000 token sets in ${endTime - startTime}ms`);
console.log(`Cache size: ${perfConfig.cache?.size} entries`);

export {
  exampleTokens,
  buttonTokens,
  lightConfig,
  darkConfig,
  hcConfig,
  jsConfig,
  perfConfig,
};
