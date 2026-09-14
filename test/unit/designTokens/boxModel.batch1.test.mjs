import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const read = (rel) => fs.readFileSync(path.resolve(root, rel), 'utf8');

/* Batch-1 visual no-op oracle: slot defaults pinned to the literals each
 * component rendered before adoption (captured from the emitted tokens.css
 * at plan time). If a default drifts, default-theme layout changes. */

const CORE = (n, px) => `var(--core-spacing-size-${n}, ${px})`;

const CASES = [
  ['Checkbox', [{ slot: 'gap', decl: CORE('04', '8px') }]],
  ['Badge', [{ slot: 'gap', decl: CORE('02', '2px') }]],
  ['Select', [{ slot: 'width', decl: '100%' }]],
  [
    'BrandSwitcher',
    [
      { slot: 'gap', decl: 'var(--semantic-spacing-gap-grid-medium, 24px)' },
      { slot: 'padding-block-start', decl: '0' },
      { slot: 'padding-block-end', decl: '0' },
      { slot: 'padding-inline-start', decl: '0' },
      { slot: 'padding-inline-end', decl: '0' },
    ],
  ],
  [
    'Avatar',
    [
      { slot: 'width', decl: CORE('09', '48px') },
      { slot: 'height', decl: CORE('09', '48px') },
    ],
  ],
  ['Table', [{ slot: 'width', decl: '100%' }]],
  [
    'List',
    [
      { slot: 'gap', decl: CORE('04', '8px') },
      { slot: 'padding-block-start', decl: '0' },
      { slot: 'padding-block-end', decl: '0' },
      { slot: 'padding-inline-start', decl: '0' },
      { slot: 'padding-inline-end', decl: '0' },
    ],
  ],
  ['Progress', [{ slot: 'gap', decl: CORE('02', '2px') }]],
  [
    'Postcard',
    [
      { slot: 'padding-block-start', decl: CORE('06', '16px') },
      { slot: 'padding-block-end', decl: CORE('06', '16px') },
      { slot: 'padding-inline-start', decl: CORE('06', '16px') },
      { slot: 'padding-inline-end', decl: CORE('06', '16px') },
    ],
  ],
  [
    'Accordion',
    [
      { slot: 'gap', decl: '0' },
      { slot: 'width', decl: '100%' },
    ],
  ],
  [
    'Breadcrumbs',
    [
      { slot: 'gap', decl: CORE('04', '8px') },
      { slot: 'padding-block-start', decl: CORE('04', '8px') },
      { slot: 'padding-block-end', decl: CORE('04', '8px') },
      { slot: 'padding-inline-start', decl: '0' },
      { slot: 'padding-inline-end', decl: '0' },
    ],
  ],
  ['Details', [{ slot: 'width', decl: 'auto' }]],
  [
    'Walkthrough',
    [
      { slot: 'max-width', decl: '28rem' },
      { slot: 'padding-block-start', decl: CORE('08', '32px') },
      { slot: 'padding-block-end', decl: CORE('08', '32px') },
      { slot: 'padding-inline-start', decl: CORE('08', '32px') },
      { slot: 'padding-inline-end', decl: CORE('08', '32px') },
    ],
  ],
  [
    'Chip',
    [
      { slot: 'gap', decl: CORE('02', '2px') },
      { slot: 'padding-block-start', decl: CORE('02', '2px') },
      { slot: 'padding-block-end', decl: CORE('02', '2px') },
      { slot: 'padding-inline-start', decl: CORE('04', '8px') },
      { slot: 'padding-inline-end', decl: CORE('04', '8px') },
    ],
  ],
  [
    'Switch',
    [
      { slot: 'width', decl: CORE('09', '48px') },
      { slot: 'height', decl: CORE('07', '24px') },
      { slot: 'gap', decl: CORE('04', '8px') },
    ],
  ],
  [
    'Command',
    [
      { slot: 'width', decl: '100%' },
      { slot: 'max-width', decl: '640px' },
    ],
  ],
  [
    'Sheet',
    [
      { slot: 'gap', decl: CORE('04', '8px') },
      { slot: 'padding-block-start', decl: CORE('06', '16px') },
      { slot: 'padding-block-end', decl: CORE('06', '16px') },
      { slot: 'padding-inline-start', decl: CORE('06', '16px') },
      { slot: 'padding-inline-end', decl: CORE('06', '16px') },
      { slot: 'max-width', decl: '100vw' },
      { slot: 'max-height', decl: '100vh' },
    ],
  ],
  [
    'Image',
    [
      { slot: 'width', decl: 'auto' },
      { slot: 'height', decl: 'auto' },
    ],
  ],
];

describe.each(CASES)('%s box-model slots', (component, slots) => {
  const tokensCss = read(`ui/components/${component}/${component}.tokens.css`);
  const css = read(`ui/components/${component}/${component}.css`);

  it.each(slots)('pins $slot to the pre-adoption literal', ({ slot, decl }) => {
    expect(tokensCss).toContain(`--ds-box-model-${slot}: ${decl};`);
  });

  it('consumes at least one slot in component css', () => {
    expect(css).toContain('var(--ds-box-model-');
  });

  it('imports the box-model primitive', () => {
    expect(css).toContain("primitives/boxModel.css'");
  });
});
