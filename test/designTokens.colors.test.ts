import { describe, it, expect } from 'vitest';
import {
  generate,
  createDefaultConfig,
} from '../utils/designTokens/componentTokenUtils';

const tokens = {
  semantic: {
    color: {
      brand: {
        primary: { $value: 'hsl(210, 100%, 50%)', $type: 'color' },
        accent: { $value: 'oklch(0.7 0.15 30)', $type: 'color' },
      },
    },
  },
};

describe('Design tokens color normalization', () => {
  it('normalizes to hex when resolveToReferences=false and target=hex', () => {
    const config = createDefaultConfig({
      resolveToReferences: false,
      unitPreferences: { color: 'hex', dimension: 'px', duration: 'ms' },
    });
    const componentTokens = {
      prefix: 'test',
      tokens: {
        brandPrimary: '{semantic.color.brand.primary}',
        brandAccent: '{semantic.color.brand.accent}',
      },
    };
    const result = generate(componentTokens, tokens, config);
    expect(result['--test-brandPrimary']).toMatch(/^#([0-9a-f]{6})$/i);
    expect(result['--test-brandAccent']).toMatch(/^#([0-9a-f]{6})$/i);
  });

  it('normalizes to hsl when configured', () => {
    const config = createDefaultConfig({
      resolveToReferences: false,
      unitPreferences: { color: 'hsl', dimension: 'px', duration: 'ms' },
    });
    const componentTokens = {
      prefix: 'test',
      tokens: {
        brandPrimary: '{semantic.color.brand.primary}',
      },
    };
    const result = generate(componentTokens, tokens, config);
    expect(result['--test-brandPrimary']).toMatch(/^hsl\(/i);
  });

  it('normalizes to oklch when configured', () => {
    const config = createDefaultConfig({
      resolveToReferences: false,
      unitPreferences: { color: 'oklch', dimension: 'px', duration: 'ms' },
    });
    const componentTokens = {
      prefix: 'test',
      tokens: {
        brandAccent: '{semantic.color.brand.accent}',
      },
    };
    const result = generate(componentTokens, tokens, config);
    expect(result['--test-brandAccent']).toMatch(/^oklch\(/i);
  });
});
