import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  refToCssVar,
  tokenPathToCSSVar,
  buildFallbackResolver,
  buildCssForComponent,
  flattenTokens,
} from '../../../utils/designTokens/generators/generateCSSTokens.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

/* Fixture mirroring app/designTokens.scss structure: layer order means the
 * FIRST assignment of a var is its default; later brand/theme blocks re-map it.
 * A correct resolver must return the first-occurrence default, never a later
 * brand override. */
const SCSS_FIXTURE = `@layer core, semantic, theme, brand;
@layer core {
  :root {
    --core-color-palette-blue-500: #0a65fe;
    --core-shape-radius-03: 8px;
    --core-shape-radius-full: 9999px;
    --core-color-mode-transparent: #00000000;
  }
}
@layer semantic {
  :root {
    --semantic-color-action-background-primary-default: #d9292b;
    --semantic-shape-button-radius: 8px;
    --semantic-shape-card-radius: var(--core-shape-radius-03, 12px);
    --semantic-spacing-gap: var(--core-shape-radius-03);
    --semantic-elevation-near: [object Object];
  }
}
@layer brand {
  [data-brand="canary"] {
    --semantic-color-action-background-primary-default: var(--core-color-palette-blue-500);
    --semantic-shape-button-radius: var(--core-shape-radius-03);
  }
}
`;

describe('buildFallbackResolver', () => {
  const resolve = buildFallbackResolver(SCSS_FIXTURE);

  it('resolves a directly-assigned literal', () => {
    expect(resolve('--semantic-color-action-background-primary-default')).toBe(
      '#d9292b'
    );
  });

  it('prefers the first occurrence over later brand re-maps', () => {
    // canary re-maps this var to blue-500; the default must stay #d9292b
    expect(resolve('--semantic-color-action-background-primary-default')).toBe(
      '#d9292b'
    );
    expect(resolve('--semantic-shape-button-radius')).toBe('8px');
  });

  it('chases a var() chain to a literal', () => {
    expect(resolve('--semantic-spacing-gap')).toBe('8px');
  });

  it('falls back to the inner literal when the chain target is missing', () => {
    // --semantic-shape-card-radius: var(--core-shape-radius-03, 12px)
    // resolves through core-shape-radius-03 = 8px
    expect(resolve('--semantic-shape-card-radius')).toBe('8px');
  });

  it('returns null for unknown vars', () => {
    expect(resolve('--semantic-does-not-exist')).toBeNull();
  });

  it('refuses to emit garbage literals like [object Object]', () => {
    expect(resolve('--semantic-elevation-near')).toBeNull();
  });

  it('returns null for an empty resolver input', () => {
    expect(
      buildFallbackResolver('')('--semantic-shape-button-radius')
    ).toBeNull();
  });
});

describe('refToCssVar with fallback resolution', () => {
  it('emits a fallback literal for a resolvable reference', () => {
    const resolve = buildFallbackResolver(SCSS_FIXTURE);
    expect(
      refToCssVar('{semantic.color.action.background.primary.default}', resolve)
    ).toBe('var(--semantic-color-action-background-primary-default, #d9292b)');
  });

  it('emits core-namespace references with fallbacks', () => {
    const resolve = buildFallbackResolver(SCSS_FIXTURE);
    expect(refToCssVar('{core.shape.radius.full}', resolve)).toBe(
      'var(--core-shape-radius-full, 9999px)'
    );
  });

  it('emits no fallback when the reference is unresolvable', () => {
    const resolve = buildFallbackResolver(SCSS_FIXTURE);
    expect(refToCssVar('{semantic.color.absent.token}', resolve)).toBe(
      'var(--semantic-color-absent-token)'
    );
  });

  it('keeps literal values untouched', () => {
    expect(refToCssVar('transparent', null)).toBe('transparent');
    expect(refToCssVar('4px', null)).toBe('4px');
  });
});

describe('tokenPathToCSSVar', () => {
  it('namespaces semantic and core paths', () => {
    expect(tokenPathToCSSVar('semantic.shape.button.radius')).toBe(
      '--semantic-shape-button-radius'
    );
    expect(tokenPathToCSSVar('core.shape.radius.full')).toBe(
      '--core-shape-radius-full'
    );
  });

  it('infers core namespace for primitive patterns', () => {
    expect(tokenPathToCSSVar('shape.radius.03')).toBe('--core-shape-radius-03');
    expect(tokenPathToCSSVar('spacing.size.04')).toBe('--core-spacing-size-04');
  });
});

describe('buildCssForComponent fallback emission', () => {
  it('emits scoped vars with fallback literals end to end', () => {
    const resolve = buildFallbackResolver(SCSS_FIXTURE);
    const tokenData = flattenTokens(
      {
        size: {
          radius: '{semantic.shape.button.radius}',
          minWidth: '{semantic.shape.absent.radius}',
        },
      },
      []
    );
    const css = buildCssForComponent({
      cssVarPrefix: 'button',
      pascalComponent: 'Button',
      tokenData,
      resolveFallback: resolve,
    });
    expect(css).toContain(
      '--ds-button-size-radius: var(--semantic-shape-button-radius, 8px);'
    );
    expect(css).toContain(
      '--ds-button-size-min-width: var(--semantic-shape-absent-radius);'
    );
    expect(css.startsWith('[data-ds-component="Button"] {')).toBe(true);
  });
});

describe('brand reachability of committed component tokens', () => {
  const readCommitted = (rel) =>
    fs.readFileSync(path.resolve(here, rel), 'utf8');

  it('Button radius resolves through the semantic layer', () => {
    const css = readCommitted(
      '../../../ui/components/Button/Button.tokens.css'
    );
    expect(css).toContain(
      '--ds-button-size-radius: var(--semantic-shape-button-radius, 8px);'
    );
  });

  it('Card medium radius resolves through the semantic layer', () => {
    const css = readCommitted('../../../ui/components/Card/Card.tokens.css');
    expect(css).toContain(
      '--ds-card-size-radius-medium: var(--semantic-shape-card-radius, 16px);'
    );
  });

  it('Input radius resolves through the semantic layer', () => {
    const css = readCommitted('../../../ui/components/Input/Input.tokens.css');
    expect(css).toContain(
      '--ds-input-size-radius-default: var(--semantic-shape-input-radius-default, 8px);'
    );
  });

  it('global build emits real shadow literals, not [object Object]', () => {
    const scss = readCommitted('../../../app/designTokens.scss');
    expect(scss).not.toContain('[object Object]');
    expect(scss).toContain('--core-elevation-level-1: 0px 1px 3px #0000001f;');
  });

  it('global build no longer defines the dead singular component vars', () => {
    const scss = readCommitted('../../../app/designTokens.scss');
    expect(scss).not.toMatch(/--semantic-component-[a-z]/);
  });
});
