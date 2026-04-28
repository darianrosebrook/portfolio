import { describe, it, expect } from 'vitest';
import {
  processBrandTokens,
  processDensityTokens,
  type CollectionContext,
} from '@/utils/designTokens/generators/global';

function makeContext(): CollectionContext {
  return {
    definedVars: new Set<string>(),
    referencedVars: new Set<string>(),
  };
}

describe('processBrandTokens', () => {
  it('emits a light-vars entry for a token with no theme extensions', () => {
    const lightVars: Record<string, string> = {};
    const darkVars: Record<string, string> = {};

    processBrandTokens(
      {
        $brand: { name: 'Test', description: 'fixture', accent: '#000' },
        color: {
          accent: {
            $type: 'color',
            $value: '#ff0000',
          },
        },
      },
      [],
      makeContext(),
      lightVars,
      darkVars
    );

    expect(lightVars['--semantic-color-accent']).toBe('#ff0000');
    // D10: without an explicit dark extension, darkVars must be empty so the
    // unconditional [data-brand="…"] block covers dark mode without duplication.
    expect(darkVars).toEqual({});
  });

  it('skips dark-vars entry when only design.paths.light is present', () => {
    const lightVars: Record<string, string> = {};
    const darkVars: Record<string, string> = {};

    processBrandTokens(
      {
        color: {
          accent: {
            $type: 'color',
            $value: '#abcdef',
            $extensions: {
              'design.paths.light': '#abcdef',
            },
          },
        },
      },
      [],
      makeContext(),
      lightVars,
      darkVars
    );

    expect(lightVars['--semantic-color-accent']).toBe('#abcdef');
    expect(darkVars).toEqual({});
  });

  it('emits dark-vars entry only when design.paths.dark is explicitly provided', () => {
    const lightVars: Record<string, string> = {};
    const darkVars: Record<string, string> = {};

    processBrandTokens(
      {
        color: {
          accent: {
            $type: 'color',
            $value: '#111111',
            $extensions: {
              'design.paths.light': '#fafafa',
              'design.paths.dark': '#0a0a0a',
            },
          },
        },
      },
      [],
      makeContext(),
      lightVars,
      darkVars
    );

    expect(lightVars['--semantic-color-accent']).toBe('#fafafa');
    expect(darkVars['--semantic-color-accent']).toBe('#0a0a0a');
  });

  it('builds CSS var names under the semantic.* namespace from nested paths', () => {
    const lightVars: Record<string, string> = {};
    const darkVars: Record<string, string> = {};

    processBrandTokens(
      {
        color: {
          background: {
            primary: {
              $type: 'color',
              $value: '#ffffff',
            },
          },
        },
      },
      [],
      makeContext(),
      lightVars,
      darkVars
    );

    expect(lightVars['--semantic-color-background-primary']).toBe('#ffffff');
  });

  it('skips $-prefixed metadata keys at every nesting level', () => {
    const lightVars: Record<string, string> = {};
    const darkVars: Record<string, string> = {};

    processBrandTokens(
      {
        $brand: { name: 'Skip me' },
        $description: 'should not emit a CSS var',
        color: {
          $description: 'group description',
          accent: {
            $type: 'color',
            $value: '#abc',
          },
        },
      },
      [],
      makeContext(),
      lightVars,
      darkVars
    );

    expect(Object.keys(lightVars)).toEqual(['--semantic-color-accent']);
    // None of the metadata keys leaked into a CSS var name.
    expect(Object.keys(lightVars).some((k) => k.includes('brand'))).toBe(false);
    expect(Object.keys(lightVars).some((k) => k.includes('description'))).toBe(
      false
    );
  });

  it('rewrites token references {core.color.x} into var(--core-color-x) and tracks them as referenced', () => {
    const lightVars: Record<string, string> = {};
    const darkVars: Record<string, string> = {};
    const context = makeContext();

    processBrandTokens(
      {
        color: {
          accent: {
            $type: 'color',
            $value: '{core.color.blue.500}',
          },
        },
      },
      [],
      context,
      lightVars,
      darkVars
    );

    expect(lightVars['--semantic-color-accent']).toBe(
      'var(--core-color-blue-500)'
    );
    expect(context.referencedVars.has('--core-color-blue-500')).toBe(true);
  });
});

describe('processDensityTokens', () => {
  it('emits light-vars and skips dark-vars when no design.paths.dark extension exists', () => {
    const lightVars: Record<string, string> = {};
    const darkVars: Record<string, string> = {};

    processDensityTokens(
      {
        $density: { name: 'compact', description: 'tight', base: '4px' },
        spacing: {
          gutter: {
            $type: 'dimension',
            $value: '4px',
          },
        },
      },
      [],
      makeContext(),
      lightVars,
      darkVars
    );

    expect(lightVars['--semantic-spacing-gutter']).toBe('4px');
    expect(darkVars).toEqual({});
  });

  it('emits dark-vars when design.paths.dark is explicitly provided', () => {
    const lightVars: Record<string, string> = {};
    const darkVars: Record<string, string> = {};

    processDensityTokens(
      {
        spacing: {
          gutter: {
            $type: 'dimension',
            $value: '4px',
            $extensions: {
              'design.paths.light': '4px',
              'design.paths.dark': '6px',
            },
          },
        },
      },
      [],
      makeContext(),
      lightVars,
      darkVars
    );

    expect(lightVars['--semantic-spacing-gutter']).toBe('4px');
    expect(darkVars['--semantic-spacing-gutter']).toBe('6px');
  });
});
