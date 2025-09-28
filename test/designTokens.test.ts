/**
 * Test suite for the enhanced design token resolution system
 */

import { describe, it, expect } from 'vitest';
import {
  generate,
  createDefaultConfig,
  formatAsCSS,
} from '../utils/designTokens/utils/componentTokenUtils';
import { builtInTransforms } from '../utils/designTokens/utils/transforms';

// Mock design tokens for testing
const mockTokens = {
  semantic: {
    color: {
      bg: {
        primary: {
          $value: {
            light: '#ffffff',
            dark: '#000000',
          },
          $type: 'color',
        },
        secondary: {
          $value: '#f5f5f5',
          $type: 'color',
        },
      },
      fg: {
        primary: {
          $value: {
            light: '#000000',
            dark: '#ffffff',
          },
          $type: 'color',
        },
      },
      border: {
        default: {
          $value: '#e0e0e0',
          $type: 'color',
        },
      },
    },
    space: {
      xs: { $value: 4, $type: 'dimension' },
      sm: { $value: 8, $type: 'dimension' },
      md: { $value: 16, $type: 'dimension' },
      lg: { $value: 24, $type: 'dimension' },
    },
    duration: {
      fast: { $value: 150, $type: 'duration' },
      normal: { $value: 300, $type: 'duration' },
    },
  },
  brand: {
    button: {
      bg: '#007bff',
    },
  },
};

describe('Enhanced Design Token Resolution', () => {
  it('should resolve simple token references', () => {
    const config = createDefaultConfig();
    const componentTokens = {
      prefix: 'button',
      tokens: {
        background: '{semantic.color.bg.primary}',
        foreground: '{semantic.color.fg.primary}',
      },
    };

    const result = generate(componentTokens, mockTokens, config);

    expect(result['--button-background']).toBe(
      'var(--semantic-color-bg-primary)'
    );
    expect(result['--button-foreground']).toBe(
      'var(--semantic-color-fg-primary)'
    );
  });

  it('should support theme selection', () => {
    const config = createDefaultConfig({ theme: 'dark' });
    const componentTokens = {
      prefix: 'button',
      tokens: {
        background: '{semantic.color.bg.primary}',
        foreground: '{semantic.color.fg.primary}',
      },
    };

    const result = generate(componentTokens, mockTokens, config);

    expect(result['--button-background']).toBe(
      'var(--semantic-color-bg-primary)'
    );
    expect(result['--button-foreground']).toBe(
      'var(--semantic-color-fg-primary)'
    );
  });

  it('should support multi-fallback resolution', () => {
    const config = createDefaultConfig();
    const componentTokens = {
      prefix: 'button',
      tokens: {
        background:
          '{semantic.color.bg.missing} || {brand.button.bg} || #fallback',
        border: '{semantic.color.border.default}',
      },
    };

    const result = generate(componentTokens, mockTokens, config);

    expect(result['--button-background']).toBe(
      'var(--semantic-color-bg-missing, var(--brand-button-bg, #fallback))'
    );
    expect(result['--button-border']).toBe(
      'var(--semantic-color-border-default)'
    );
  });

  it('should support interpolation in strings', () => {
    const config = createDefaultConfig();
    const componentTokens = {
      prefix: 'button',
      tokens: {
        border: '1px solid {semantic.color.border.default}',
        padding: 'calc({semantic.space.sm} * 2)',
      },
    };

    const result = generate(componentTokens, mockTokens, config);

    expect(result['--button-border']).toBe(
      '1px solid var(--semantic-color-border-default)'
    );
    expect(result['--button-padding']).toBe(
      'calc(var(--semantic-space-sm) * 2)'
    );
  });

  it('should apply dimension transforms', () => {
    const config = createDefaultConfig({
      unitPreferences: { dimension: 'rem' },
    });
    const componentTokens = {
      prefix: 'button',
      tokens: {
        padding: '{semantic.space.md}',
        margin: '{semantic.space.lg}',
      },
    };

    const result = generate(componentTokens, mockTokens, config);

    expect(result['--button-padding']).toBe('var(--semantic-space-md)');
    expect(result['--button-margin']).toBe('var(--semantic-space-lg)');
  });

  it('should apply duration transforms', () => {
    const config = createDefaultConfig({
      unitPreferences: { duration: 's' },
    });
    const componentTokens = {
      prefix: 'button',
      tokens: {
        transition: '{semantic.duration.fast}',
        animation: '{semantic.duration.normal}',
      },
    };

    const result = generate(componentTokens, mockTokens, config);

    expect(result['--button-transition']).toBe('var(--semantic-duration-fast)');
    expect(result['--button-animation']).toBe(
      'var(--semantic-duration-normal)'
    );
  });

  it('should support custom CSS variable prefixes', () => {
    const config = createDefaultConfig({
      cssVarPrefix: '--ds-',
    });
    const componentTokens = {
      prefix: 'button',
      tokens: {
        background: '{semantic.color.bg.secondary}',
      },
    };

    const result = generate(componentTokens, mockTokens, config);

    expect(result['--ds-button-background']).toBe(
      'var(--semantic-color-bg-secondary)'
    );
  });

  it('should support camelCase naming', () => {
    const config = createDefaultConfig({
      nameCase: 'camel',
    });
    const componentTokens = {
      prefix: 'button',
      tokens: {
        background: '{semantic.color.bg.secondary}',
      },
    };

    const result = generate(componentTokens, mockTokens, config);

    expect(result['buttonBackground']).toBe(
      'var(--semantic-color-bg-secondary)'
    );
  });

  it('should format as CSS declarations', () => {
    const cssVars = {
      '--button-background': '#ffffff',
      '--button-foreground': '#000000',
    };

    const css = formatAsCSS(cssVars, '.button');

    expect(css).toContain('.button {');
    expect(css).toContain('--button-background: #ffffff;');
    expect(css).toContain('--button-foreground: #000000;');
  });

  it('should handle circular references gracefully', () => {
    const circularTokens = {
      a: { $value: '{b}', $type: 'color' },
      b: { $value: '{a}', $type: 'color' },
    };

    const config = createDefaultConfig();
    const componentTokens = {
      prefix: 'test',
      tokens: {
        color: '{a}',
      },
    };

    const result = generate(componentTokens, circularTokens, config);

    // Should not throw and should handle gracefully
    expect(result['--test-color']).toBeDefined();
  });

  it('should provide built-in transforms', () => {
    expect(builtInTransforms).toHaveLength(5);

    const dimensionTransform = builtInTransforms.find((t: any) =>
      t.match({ type: 'dimension' })
    );
    expect(dimensionTransform).toBeDefined();

    const colorTransform = builtInTransforms.find((t: any) =>
      t.match({ type: 'color' })
    );
    expect(colorTransform).toBeDefined();
  });

  it('should support custom transforms', () => {
    const customTransform = {
      match: ({ path }: { path: string }) => path === 'custom',
      apply: (value: unknown) => `custom-${value}`,
    };

    const config = createDefaultConfig({
      transforms: [...builtInTransforms, customTransform],
    });

    const componentTokens = {
      prefix: 'test',
      tokens: {
        custom: 42, // Use a number instead of string
      },
    };

    const result = generate(componentTokens, mockTokens, config);

    expect(result['--test-custom']).toBe('custom-42');
  });

  it('should support resolved values when resolveToReferences is false', () => {
    const config = createDefaultConfig({
      resolveToReferences: false,
    });
    const componentTokens = {
      prefix: 'button',
      tokens: {
        background: '{semantic.color.bg.primary}',
        foreground: '{semantic.color.fg.primary}',
      },
    };

    const result = generate(componentTokens, mockTokens, config);

    expect(result['--button-background']).toBe('#ffffff');
    expect(result['--button-foreground']).toBe('#000000');
  });

  it('should emit nested var() fallback chains from multi-fallback syntax', () => {
    const config = createDefaultConfig({
      emitVarFallbackChain: true,
    });
    const componentTokens = {
      prefix: 'button',
      tokens: {
        background:
          '{semantic.color.bg.missing} || {brand.button.bg} || #fallback',
        border: '{semantic.color.border.missing} || #e0e0e0',
      },
    };

    const result = generate(componentTokens, mockTokens, config);

    expect(result['--button-background']).toBe(
      'var(--semantic-color-bg-missing, var(--brand-button-bg, #fallback))'
    );
    expect(result['--button-border']).toBe(
      'var(--semantic-color-border-missing, #e0e0e0)'
    );
  });

  it('should support $extensions-based theme overrides', () => {
    const tokensWithExtensions = {
      ...mockTokens,
      semantic: {
        ...mockTokens.semantic,
        color: {
          ...mockTokens.semantic.color,
          bg: {
            ...mockTokens.semantic.color.bg,
            primary: {
              $value: {
                light: '#ffffff',
                dark: '#000000',
              },
              $type: 'color',
              $extensions: {
                'design.paths': {
                  dark: '#1a1a1a',
                },
              },
            },
          },
        },
      },
    };

    const config = createDefaultConfig({
      theme: 'dark',
    });
    const componentTokens = {
      prefix: 'button',
      tokens: {
        background: '{semantic.color.bg.primary}',
      },
    };

    const result = generate(componentTokens, tokensWithExtensions, config);

    expect(result['--button-background']).toBe(
      'var(--semantic-color-bg-primary)'
    );
  });

  it('should support ref-map output format', () => {
    const config = createDefaultConfig({
      output: 'ref-map',
    });
    const componentTokens = {
      prefix: 'button',
      tokens: {
        background: '{semantic.color.bg.primary}',
        padding: '{semantic.space.md}',
        custom: 42,
      },
    };

    const result = generate(componentTokens, mockTokens, config);

    expect(result['--button-background']).toBe('{semantic.color.bg.primary}');
    expect(result['--button-padding']).toBe('{semantic.space.md}');
    expect(result['--button-custom']).toBe('button.custom');
  });

  it('should support emitVarsOnly flag', () => {
    const config = createDefaultConfig({
      emitVarsOnly: true,
    });
    const componentTokens = {
      prefix: 'button',
      tokens: {
        background: '{semantic.color.bg.primary}',
        padding: '{semantic.space.md}',
        custom: 42,
      },
    };

    const result = generate(componentTokens, mockTokens, config);

    expect(result['--button-background']).toBe('');
    expect(result['--button-padding']).toBe('');
    expect(result['--button-custom']).toBe('');
  });

  it('should support custom system token prefix', () => {
    const config = createDefaultConfig({
      systemTokenPrefix: '--ds-',
    });
    const componentTokens = {
      prefix: 'button',
      tokens: {
        background: '{semantic.color.bg.primary}',
      },
    };

    const result = generate(componentTokens, mockTokens, config);

    expect(result['--button-background']).toBe(
      'var(--component-test-ds-semantic-color-bg-primary)'
    );
  });

  it('should support custom reference namespace function', () => {
    const config = createDefaultConfig({
      referenceNamespace: (path: string) =>
        `--custom-${path.replace(/\./g, '-')}`,
    });
    const componentTokens = {
      prefix: 'button',
      tokens: {
        background: '{semantic.color.bg.primary}',
      },
    };

    const result = generate(componentTokens, mockTokens, config);

    expect(result['--button-background']).toBe(
      'var(--component-test-custom-semantic-color-bg-primary)'
    );
  });

  it('should handle complex nested fallback chains with interpolation', () => {
    const config = createDefaultConfig({
      emitVarFallbackChain: true,
    });
    const componentTokens = {
      prefix: 'card',
      tokens: {
        border:
          '1px solid {semantic.color.border.missing} || {semantic.color.border.default} || #ccc',
        padding:
          'calc({semantic.space.missing} || {semantic.space.md} || 16px)',
      },
    };

    const result = generate(componentTokens, mockTokens, config);

    expect(result['--card-border']).toBe(
      '1px solid var(--semantic-color-border-missing, var(--semantic-color-border-default, #ccc))'
    );
    expect(result['--card-padding']).toBe(
      'calc(var(--semantic-space-missing, var(--semantic-space-md, 16px)))'
    );
  });

  it('should handle platform and brand selection', () => {
    const tokensWithPlatform = {
      ...mockTokens,
      semantic: {
        ...mockTokens.semantic,
        space: {
          ...mockTokens.semantic.space,
          md: {
            $value: {
              web: 16,
              mobile: 12,
            },
            $type: 'dimension',
          },
        },
      },
    };

    const config = createDefaultConfig({
      platform: 'rn',
    });
    const componentTokens = {
      prefix: 'button',
      tokens: {
        padding: '{semantic.space.md}',
      },
    };

    const result = generate(componentTokens, tokensWithPlatform, config);

    expect(result['--button-padding']).toBe('var(--semantic-space-md)');
  });

  it('should support ref-map output format', () => {
    const config = createDefaultConfig({
      output: 'ref-map',
    });
    const componentTokens = {
      prefix: 'button',
      tokens: {
        background: '{semantic.color.bg.primary}',
        padding: 16,
        border: '1px solid {semantic.color.border.default}',
      },
    };

    const result = generate(componentTokens, mockTokens, config);

    expect(result['--button-background']).toBe('{semantic.color.bg.primary}');
    expect(result['--button-padding']).toBe('button.padding');
    expect(result['--button-border']).toBe(
      '1px solid {semantic.color.border.default}'
    );
  });

  it('should support emitVarsOnly mode', () => {
    const config = createDefaultConfig({
      emitVarsOnly: true,
    });
    const componentTokens = {
      prefix: 'button',
      tokens: {
        background: '{semantic.color.bg.primary}',
        foreground: '{semantic.color.fg.primary}',
      },
    };

    const result = generate(componentTokens, mockTokens, config);

    expect(result['--button-background']).toBe('');
    expect(result['--button-foreground']).toBe('');
  });

  it('should support $extensions theme overrides', () => {
    const tokensWithExtensions = {
      semantic: {
        color: {
          bg: {
            primary: {
              $value: '#ffffff',
              $type: 'color',
              $extensions: {
                'design.paths.dark': '{core.color.dark}',
                'design.paths.hc': '{core.color.black}',
              },
            },
          },
        },
      },
      core: {
        color: {
          dark: { $value: '#1a1a1a', $type: 'color' },
          black: { $value: '#000000', $type: 'color' },
        },
      },
    };

    const config = createDefaultConfig({
      theme: 'dark',
      resolveToReferences: false, // Get resolved values to test extension override
    });
    const componentTokens = {
      prefix: 'button',
      tokens: {
        background: '{semantic.color.bg.primary}',
      },
    };

    const result = generate(componentTokens, tokensWithExtensions, config);

    expect(result['--button-background']).toBe('#1a1a1a');
  });

  it('should handle complex interpolation with fallback chains', () => {
    const config = createDefaultConfig({
      emitVarFallbackChain: true,
    });
    const componentTokens = {
      prefix: 'button',
      tokens: {
        boxShadow:
          '0 2px 4px {semantic.color.shadow.default} || rgba(0,0,0,0.1)',
        // Simpler test case - single reference with fallback in each calc()
        padding: 'calc({semantic.space.sm} || 8px)',
        margin: 'calc({semantic.space.md} || 16px)',
      },
    };

    const result = generate(componentTokens, mockTokens, config);

    expect(result['--button-boxShadow']).toBe(
      '0 2px 4px var(--semantic-color-shadow-default, rgba(0,0,0,0.1))'
    );
    expect(result['--button-padding']).toBe(
      'calc(var(--semantic-space-sm, 8px))'
    );
    expect(result['--button-margin']).toBe(
      'calc(var(--semantic-space-md, 16px))'
    );
  });
});
