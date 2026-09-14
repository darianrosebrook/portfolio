import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const read = (rel) => fs.readFileSync(path.resolve(root, rel), 'utf8');

/* Visual no-op oracle: the pre-adoption computed layout values, captured from
 * the generated tokens.css literals at adoption time. Every migrated slot
 * declaration must terminate in the identical literal, so default-theme
 * rendering is unchanged by construction. */

const SLOT = (slot, decl) => ({ slot, decl });

const BUTTON_SLOTS = [
  SLOT('padding-block-start', 'var(--core-spacing-size-03, 4px)'),
  SLOT('padding-block-end', 'var(--core-spacing-size-03, 4px)'),
  SLOT('padding-inline-start', 'var(--core-spacing-size-03, 4px)'),
  SLOT('padding-inline-end', 'var(--core-spacing-size-03, 4px)'),
  SLOT('gap', 'var(--core-spacing-size-04, 8px)'),
  SLOT('min-width', 'var(--semantic-control-size-md-height, 32px)'),
  SLOT('min-height', 'var(--semantic-control-size-md-height, 32px)'),
  SLOT('width', 'fit-content'),
];

const CARD_SLOTS = [
  SLOT('padding-block-start', 'var(--core-spacing-size-06, 16px)'),
  SLOT('padding-block-end', 'var(--core-spacing-size-06, 16px)'),
  SLOT('padding-inline-start', 'var(--core-spacing-size-06, 16px)'),
  SLOT('padding-inline-end', 'var(--core-spacing-size-06, 16px)'),
];

const INPUT_SLOTS = [
  SLOT('padding-block-start', '0'),
  SLOT('padding-block-end', '0'),
  SLOT('padding-inline-start', 'var(--core-spacing-size-05, 12px)'),
  SLOT('padding-inline-end', 'var(--core-spacing-size-05, 12px)'),
  SLOT('height', 'var(--semantic-control-size-lg-height, 48px)'),
  SLOT('width', '100%'),
];

const FIELD_SLOTS = [
  SLOT('gap', 'var(--semantic-spacing-density-compact-sm, 8px)'),
  SLOT(
    'padding-block-start',
    'var(--semantic-spacing-density-compact-sm, 8px)'
  ),
  SLOT('padding-block-end', 'var(--semantic-spacing-density-compact-sm, 8px)'),
  SLOT(
    'padding-inline-start',
    'var(--semantic-spacing-density-compact-md, 12px)'
  ),
  SLOT(
    'padding-inline-end',
    'var(--semantic-spacing-density-compact-md, 12px)'
  ),
];

const DIALOG_SLOTS = [SLOT('width', 'auto'), SLOT('max-width', 'none')];

const CASES = [
  ['Button', BUTTON_SLOTS],
  ['Card', CARD_SLOTS],
  ['Input', INPUT_SLOTS],
  ['Field', FIELD_SLOTS],
  ['Dialog', DIALOG_SLOTS],
];

describe.each(CASES)('%s box-model slot defaults', (component, slots) => {
  const tokensCss = read(`ui/components/${component}/${component}.tokens.css`);

  it.each(slots)(
    'declares --ds-box-model-$slot with the pre-adoption value',
    ({ slot, decl }) => {
      expect(tokensCss).toContain(`--ds-box-model-${slot}: ${decl};`);
    }
  );
});

describe('box-model consumers in component css', () => {
  it('Button consumes gap, min-height and padding slots', () => {
    const css = read('ui/components/Button/Button.css');
    expect(css).toContain('gap: var(--ds-box-model-gap)');
    expect(css).toContain('min-height: var(--ds-box-model-min-height)');
    expect(css).toContain(
      'padding-block: var(--ds-box-model-padding-block-start)'
    );
  });

  it('Button size variants re-declare slots', () => {
    const css = read('ui/components/Button/Button.css');
    expect(css).toMatch(
      /--ds-box-model-min-height:\s*var\(--ds-button-size-min-small/
    );
    expect(css).toMatch(
      /--ds-box-model-gap:\s*var\(--ds-button-size-gap-large/
    );
  });

  it('Card consumes padding slots and container query re-declares them', () => {
    const css = read('ui/components/Card/Card.css');
    expect(css).toContain(
      'padding-block: var(--ds-box-model-padding-block-start)'
    );
    expect(css).toMatch(
      /--ds-box-model-padding-block-start:\s*calc\(\s*var\(--ds-card-size-padding-default\)\s*\*\s*0\.75\s*\)/
    );
  });

  it('Input consumes slots via logical properties', () => {
    const css = read('ui/components/Input/Input.css');
    expect(css).toContain('inline-size: var(--ds-box-model-width)');
    expect(css).toContain('block-size: var(--ds-box-model-height)');
  });

  it('Field root consumes the gap slot and control consumes padding slots', () => {
    const css = read('ui/components/Field/Field.css');
    expect(css).toContain('gap: var(--ds-box-model-gap)');
    expect(css).toContain(
      'padding-block: var(--ds-box-model-padding-block-start)'
    );
  });

  it('Dialog panel consumes width slots and size variants re-declare them', () => {
    const css = read('ui/components/Dialog/Dialog.css');
    expect(css).toContain('width: var(--ds-box-model-width)');
    expect(css).toContain('max-width: var(--ds-box-model-max-width)');
    expect(css).toMatch(
      /--ds-box-model-width:\s*var\(--ds-dialog-size-md-width/
    );
    expect(css).toMatch(
      /--ds-box-model-width:\s*var\(--ds-dialog-size-full-width/
    );
  });
});

describe('no component-prefixed box-model vars leak', () => {
  it.each(CASES)('%s emits no --ds-<component>-box-model vars', (component) => {
    const tokensCss = read(
      `ui/components/${component}/${component}.tokens.css`
    );
    expect(tokensCss).not.toMatch(
      new RegExp(`--ds-${component.toLowerCase()}-box-model-`)
    );
  });
});
