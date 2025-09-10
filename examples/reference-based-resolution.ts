/**
 * Example demonstrating reference-based token resolution
 *
 * This shows how the resolver now outputs CSS custom property references
 * instead of resolved values, enabling true "bring your own design system" functionality.
 */

import {
  generate,
  createDefaultConfig,
  formatAsCSS,
} from '../utils/designTokens/componentTokenUtils';

// Example design tokens with semantic structure
const designTokens = {
  semantic: {
    color: {
      background: {
        primary: {
          $value: {
            light: '#ffffff',
            dark: '#1a1a1a',
          },
          $type: 'color',
        },
        secondary: {
          $value: {
            light: '#f8f9fa',
            dark: '#2d2d2d',
          },
          $type: 'color',
        },
      },
      foreground: {
        primary: {
          $value: {
            light: '#212529',
            dark: '#ffffff',
          },
          $type: 'color',
        },
      },
      border: {
        default: {
          $value: {
            light: '#dee2e6',
            dark: '#495057',
          },
          $type: 'color',
        },
      },
    },
    space: {
      sm: { $value: 8, $type: 'dimension' },
      md: { $value: 16, $type: 'dimension' },
      lg: { $value: 24, $type: 'dimension' },
    },
  },
};

// Component tokens that reference semantic tokens
const buttonTokens = {
  prefix: 'button',
  tokens: {
    // Simple references
    background: '{semantic.color.background.primary}',
    foreground: '{semantic.color.foreground.primary}',

    // Interpolation with references
    border: '1px solid {semantic.color.border.default}',
    padding: 'calc({semantic.space.sm} + {semantic.space.sm})',

    // Nested states
    hover: {
      background: '{semantic.color.background.secondary}',
    },
  },
};

console.log('=== Reference-Based Resolution (Default) ===');
const referenceConfig = createDefaultConfig({
  cssVarPrefix: '--button-',
});

const referenceResult = generate(buttonTokens, designTokens, referenceConfig);
console.log('Generated CSS Variables:');
console.log(referenceResult);

console.log('\nCSS Output:');
console.log(formatAsCSS(referenceResult, '.button'));

console.log('\n=== Resolved Values (Legacy Behavior) ===');
const resolvedConfig = createDefaultConfig({
  cssVarPrefix: '--button-',
  resolveToReferences: false, // Disable reference-based resolution
});

const resolvedResult = generate(buttonTokens, designTokens, resolvedConfig);
console.log('Generated CSS Variables:');
console.log(resolvedResult);

console.log('\n=== Benefits of Reference-Based Resolution ===');
console.log(`
1. True "Bring Your Own Design System":
   - Components output references to semantic tokens
   - Design system can override semantic tokens without touching components
   - Enables theme switching at the system level

2. Example CSS Output:
   .button {
     --button-background: var(--semantic-color-background-primary);
     --button-foreground: var(--semantic-color-foreground-primary);
     --button-border: 1px solid var(--semantic-color-border-default);
     --button-padding: calc(var(--semantic-space-sm) + var(--semantic-space-sm));
     --button-hover-background: var(--semantic-color-background-secondary);
   }

3. Design System Override:
   :root {
     --semantic-color-background-primary: #007bff; /* Override for brand */
     --semantic-color-foreground-primary: #ffffff;
   }

4. Theme Switching:
   [data-theme="dark"] {
     --semantic-color-background-primary: #1a1a1a;
     --semantic-color-foreground-primary: #ffffff;
   }
`);

export { designTokens, buttonTokens, referenceConfig, resolvedConfig };
