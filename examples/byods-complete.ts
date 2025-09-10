/**
 * Complete BYODS (Bring Your Own Design System) Example
 *
 * This demonstrates all the enhanced features that enable true headless
 * design system components with robust fallback chains, theme overrides,
 * and multiple output formats.
 */

import {
  generate,
  createDefaultConfig,
  formatAsCSS,
} from '../utils/designTokens/componentTokenUtils';

// Design tokens with $extensions for theme overrides
const designTokens = {
  semantic: {
    color: {
      background: {
        primary: {
          $value: '#ffffff',
          $type: 'color',
          $extensions: {
            'design.paths.dark': '#1a1a1a',
            'design.paths.hc': '#000000',
          },
        },
        secondary: {
          $value: '#f8f9fa',
          $type: 'color',
          $extensions: {
            'design.paths.dark': '#2d2d2d',
            'design.paths.hc': '#ffffff',
          },
        },
      },
      foreground: {
        primary: {
          $value: '#212529',
          $type: 'color',
          $extensions: {
            'design.paths.dark': '#ffffff',
            'design.paths.hc': '#ffffff',
          },
        },
      },
      border: {
        default: {
          $value: '#dee2e6',
          $type: 'color',
          $extensions: {
            'design.paths.dark': '#495057',
            'design.paths.hc': '#ffffff',
          },
        },
      },
    },
    space: {
      sm: { $value: 8, $type: 'dimension' },
      md: { $value: 16, $type: 'dimension' },
      lg: { $value: 24, $type: 'dimension' },
    },
  },
  brand: {
    primary: '#007bff',
    secondary: '#6c757d',
  },
};

// Component tokens with robust fallback chains
const buttonTokens = {
  prefix: 'button',
  tokens: {
    // Multi-level fallbacks: semantic -> brand -> literal
    background:
      '{semantic.color.background.primary} || {brand.primary} || #007bff',
    foreground: '{semantic.color.foreground.primary} || #ffffff',

    // Interpolated fallbacks
    border: '1px solid {semantic.color.border.default} || #ccc',
    boxShadow: '0 2px 4px {semantic.color.shadow.default} || rgba(0,0,0,0.1)',

    // Complex interpolation with fallbacks
    padding: 'calc({semantic.space.sm} || 8px)',
    margin: 'calc({semantic.space.md} || 16px)',

    // States with fallbacks
    hover: {
      background:
        '{semantic.color.background.secondary} || {brand.secondary} || #6c757d',
      transform: 'translateY(-1px)',
    },

    disabled: {
      background: '{semantic.color.background.disabled} || #e9ecef',
      foreground: '{semantic.color.foreground.disabled} || #6c757d',
      opacity: '0.6',
    },
  },
};

console.log('=== 1. Default: CSS Var References with Fallback Chains ===');
const defaultConfig = createDefaultConfig({
  cssVarPrefix: '--btn-',
  emitVarFallbackChain: true,
});

const defaultResult = generate(buttonTokens, designTokens, defaultConfig);
console.log('Generated CSS Variables:');
console.log(JSON.stringify(defaultResult, null, 2));

console.log('\nCSS Output:');
console.log(formatAsCSS(defaultResult, '.button'));

console.log('\n=== 2. Dark Theme with $extensions Override ===');
const darkConfig = createDefaultConfig({
  theme: 'dark',
  cssVarPrefix: '--btn-',
  emitVarFallbackChain: true,
});

const darkResult = generate(buttonTokens, designTokens, darkConfig);
console.log('Dark Theme CSS Variables:');
console.log(JSON.stringify(darkResult, null, 2));

console.log('\n=== 3. Ref-Map Output (for React Native/Cross-Platform) ===');
const refMapConfig = createDefaultConfig({
  output: 'ref-map',
  cssVarPrefix: '--btn-',
});

const refMapResult = generate(buttonTokens, designTokens, refMapConfig);
console.log('Reference Map:');
console.log(JSON.stringify(refMapResult, null, 2));

console.log('\n=== 4. EmitVarsOnly (for Class-Based Mapping) ===');
const emitVarsOnlyConfig = createDefaultConfig({
  emitVarsOnly: true,
  cssVarPrefix: '--btn-',
});

const emitVarsOnlyResult = generate(
  buttonTokens,
  designTokens,
  emitVarsOnlyConfig
);
console.log('Variable Names Only:');
console.log(JSON.stringify(emitVarsOnlyResult, null, 2));

console.log('\n=== 5. Resolved Values (Legacy Mode) ===');
const resolvedConfig = createDefaultConfig({
  resolveToReferences: false,
  theme: 'light',
  cssVarPrefix: '--btn-',
});

const resolvedResult = generate(buttonTokens, designTokens, resolvedConfig);
console.log('Resolved Values:');
console.log(JSON.stringify(resolvedResult, null, 2));

console.log('\n=== BYODS Benefits Demonstrated ===');
console.log(`
🎯 **Nested Fallback Chains**: Runtime-safe fallbacks
   --btn-background: var(--semantic-color-background-primary, var(--brand-primary, #007bff))

🎨 **Theme Override via $extensions**: No component changes needed
   [data-theme="dark"] { --semantic-color-background-primary: #1a1a1a; }

📱 **Cross-Platform Support**: ref-map output for React Native
   { "--btn-background": "{semantic.color.background.primary} || {brand.primary} || #007bff" }

🏗️ **Class-Based Mapping**: emitVarsOnly for external CSS control
   .button { --btn-background: var(--my-custom-bg); }

⚡ **Performance**: Cached resolution with configurable depth limits

🔧 **Headless Components**: True separation of structure and styling
   - Components define token contracts
   - Design systems control values
   - Themes override without touching components
   - Fallbacks ensure robustness

🌐 **Universal**: Works across web, React Native, iOS, Android
`);

export {
  designTokens,
  buttonTokens,
  defaultConfig,
  darkConfig,
  refMapConfig,
  emitVarsOnlyConfig,
  resolvedConfig,
};
