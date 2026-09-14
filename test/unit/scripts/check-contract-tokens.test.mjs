import { describe, it, expect } from 'vitest';
import {
  dotPathToCssVar,
  contractTokenToCssVar,
  parseEmittedVars,
  fallbacksMatch,
} from '../../../scripts/check-contract-tokens.mjs';

describe('dotPathToCssVar', () => {
  it('converts dotted token paths to kebab-case css vars', () => {
    expect(dotPathToCssVar('button.color.background.default')).toBe(
      '--button-color-background-default'
    );
    expect(dotPathToCssVar('walkthrough.button.secondary.paddingX')).toBe(
      '--walkthrough-button-secondary-padding-x'
    );
  });

  it('hyphenates uppercase runs like the generator (paddingYMobile)', () => {
    expect(dotPathToCssVar('dialog.spacing.body.paddingYMobile')).toBe(
      '--dialog-spacing-body-padding-y-mobile'
    );
  });
});

describe('contractTokenToCssVar', () => {
  it('maps a contract token name to the generated --ds- prefixed var', () => {
    expect(
      contractTokenToCssVar('button.color.background.default', 'button')
    ).toBe('--ds-button-color-background-default');
    expect(
      contractTokenToCssVar('alert.color.foreground.onColor', 'alert')
    ).toBe('--ds-alert-color-foreground-on-color');
  });

  it('passes through tokens that do not start with the component prefix', () => {
    expect(contractTokenToCssVar('shared.size.gap', 'button')).toBe(
      '--shared-size-gap'
    );
  });

  it('maps box-model.* names to the shared slot pool regardless of prefix', () => {
    expect(
      contractTokenToCssVar('box-model.padding-block-start', 'button')
    ).toBe('--ds-box-model-padding-block-start');
    expect(contractTokenToCssVar('box-model.min-height', 'dialog')).toBe(
      '--ds-box-model-min-height'
    );
  });
});

describe('parseEmittedVars', () => {
  const css = `[data-ds-component="Button"] {
  --ds-button-color-background-default: var(--semantic-color-action-background-primary-default, #d9292b);
  --ds-button-size-radius: var(--semantic-shape-button-radius, 8px);
  --ds-button-size-gap-default: var(--core-spacing-size-04);
  --ds-button-text-weight: 500;
}`;

  it('extracts var declarations with target and fallback', () => {
    const vars = parseEmittedVars(css);
    expect(vars.get('--ds-button-color-background-default')).toEqual({
      value: 'var(--semantic-color-action-background-primary-default, #d9292b)',
      reference: '--semantic-color-action-background-primary-default',
      fallback: '#d9292b',
    });
  });

  it('reports vars without fallback as fallback null', () => {
    const vars = parseEmittedVars(css);
    expect(vars.get('--ds-button-size-gap-default')).toEqual({
      value: 'var(--core-spacing-size-04)',
      reference: '--core-spacing-size-04',
      fallback: null,
    });
  });

  it('reports literal assignments with no reference', () => {
    const vars = parseEmittedVars(css);
    expect(vars.get('--ds-button-text-weight')).toEqual({
      value: '500',
      reference: null,
      fallback: null,
    });
  });
});

describe('fallbacksMatch', () => {
  it('compares case- and whitespace-insensitively', () => {
    expect(fallbacksMatch('#D9292B', ' #d9292b ')).toBe(true);
    expect(fallbacksMatch('8px', '8px')).toBe(true);
    expect(fallbacksMatch('#d9292b', '#aeaeae')).toBe(false);
  });

  it('normalizes equivalent hex shorthand', () => {
    expect(fallbacksMatch('#ffffff', '#fff')).toBe(true);
    expect(fallbacksMatch('#000000', '#000')).toBe(true);
  });

  it('treats a missing emitted fallback as a mismatch', () => {
    expect(fallbacksMatch('#d9292b', null)).toBe(false);
  });
});
