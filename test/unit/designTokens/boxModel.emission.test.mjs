import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  buildCssForComponent,
  flattenTokens,
  BOX_MODEL_SLOTS,
} from '../../../utils/designTokens/generators/generateCSSTokens.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

/* The box-model slot pool is the shared layout override surface adopted from
 * the FSDS design system: every component reads the SAME slot names, and each
 * component's tokens.json `boxModel` group supplies its defaults. */

describe('reserved boxModel group emission', () => {
  const tokenData = flattenTokens(
    {
      size: { radius: '{semantic.shape.button.radius}' },
      boxModel: {
        paddingBlockStart: '{core.spacing.size.03}',
        paddingInlineStart: '{core.spacing.size.05}',
        gap: '{core.spacing.size.04}',
        minHeight: '{semantic.control.size.md.height}',
        width: 'fit-content',
      },
    },
    []
  );

  it('emits shared --ds-box-model-* slot names (no component prefix)', () => {
    const css = buildCssForComponent({
      cssVarPrefix: 'button',
      pascalComponent: 'Button',
      tokenData,
    });
    expect(css).toContain(
      '--ds-box-model-padding-block-start: var(--core-spacing-size-03'
    );
    expect(css).toContain(
      '--ds-box-model-padding-inline-start: var(--core-spacing-size-05'
    );
    expect(css).toContain('--ds-box-model-gap: var(--core-spacing-size-04');
    expect(css).toContain(
      '--ds-box-model-min-height: var(--semantic-control-size-md-height'
    );
    expect(css).toContain('--ds-box-model-width: fit-content;');
  });

  it('keeps non-boxModel groups component-prefixed', () => {
    const css = buildCssForComponent({
      cssVarPrefix: 'button',
      pascalComponent: 'Button',
      tokenData,
    });
    expect(css).toContain('--ds-button-size-radius:');
    expect(css).not.toContain('--ds-button-box-model-');
  });

  it('rejects unknown boxModel keys (whitelist of longhand slots)', () => {
    const bad = flattenTokens(
      { boxModel: { padding: '{core.spacing.size.03}' } },
      []
    );
    expect(() =>
      buildCssForComponent({
        cssVarPrefix: 'button',
        pascalComponent: 'Button',
        tokenData: bad,
      })
    ).toThrow(/box-model slot/);
  });

  it('declares exactly the eleven longhand slots', () => {
    expect(BOX_MODEL_SLOTS).toEqual([
      'padding-block-start',
      'padding-block-end',
      'padding-inline-start',
      'padding-inline-end',
      'gap',
      'width',
      'min-width',
      'max-width',
      'height',
      'min-height',
      'max-height',
    ]);
  });
});

describe('box-model primitive stylesheet', () => {
  const primitive = fs.readFileSync(
    path.resolve(here, '../../../ui/primitives/boxModel.css'),
    'utf8'
  );

  it('resets every slot to initial on the zero-specificity component hook', () => {
    for (const slot of BOX_MODEL_SLOTS) {
      expect(primitive).toContain(`--ds-box-model-${slot}: initial;`);
    }
    expect(primitive).toContain(':where([data-ds-component])');
  });
});
