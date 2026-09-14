import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const read = (rel) => fs.readFileSync(path.resolve(root, rel), 'utf8');

const CORE = (n, px) => `var(--core-spacing-size-${n}, ${px})`;

const CASES = [
  ['Toast', [{ slot: 'gap', decl: CORE('04', '8px') }]],
  ['Popover', [{ slot: 'gap', decl: CORE('04', '8px') }]],
  [
    'ProfileFlag',
    [
      { slot: 'gap', decl: CORE('03', '4px') },
      { slot: 'width', decl: 'fit-content' },
    ],
  ],
  [
    'Blockquote',
    [
      'padding-block-start',
      'padding-block-end',
      'padding-inline-start',
      'padding-inline-end',
    ].map((s) => ({ slot: s, decl: CORE('05', '12px') })),
  ],
  [
    'OTP',
    [
      'padding-block-start',
      'padding-block-end',
      'padding-inline-start',
      'padding-inline-end',
      'gap',
    ].map((s) => ({ slot: s, decl: CORE('07', '24px') })),
  ],
  [
    'Status',
    [
      'padding-block-start',
      'padding-block-end',
      'padding-inline-start',
      'padding-inline-end',
      'gap',
    ].map((s) => ({ slot: s, decl: CORE('04', '8px') })),
  ],
  ['Tabs', [{ slot: 'gap', decl: CORE('04', '8px') }]],
  [
    'ToggleSwitch',
    [
      { slot: 'gap', decl: '0.25rem' },
      { slot: 'max-height', decl: '1.5rem' },
    ],
  ],
  [
    'Tooltip',
    [
      { slot: 'padding-block-start', decl: CORE('03', '4px') },
      { slot: 'padding-block-end', decl: CORE('03', '4px') },
      { slot: 'padding-inline-start', decl: CORE('04', '8px') },
      { slot: 'padding-inline-end', decl: CORE('04', '8px') },
    ],
  ],
  [
    'Calendar',
    [
      'padding-block-start',
      'padding-block-end',
      'padding-inline-start',
      'padding-inline-end',
    ].map((s) => ({ slot: s, decl: CORE('07', '24px') })),
  ],
  [
    'Links',
    [
      { slot: 'gap', decl: CORE('02', '2px') },
      { slot: 'width', decl: '100%' },
    ],
  ],
  [
    'PageTransition',
    [
      { slot: 'width', decl: '100%' },
      { slot: 'min-height', decl: '0' },
    ],
  ],
  [
    'ShowMore',
    [
      'padding-block-start',
      'padding-block-end',
      'padding-inline-start',
      'padding-inline-end',
    ].map((s) => ({ slot: s, decl: CORE('07', '24px') })),
  ],
  [
    'Shuttle',
    [
      'padding-block-start',
      'padding-block-end',
      'padding-inline-start',
      'padding-inline-end',
    ].map((s) => ({ slot: s, decl: CORE('07', '24px') })),
  ],
  [
    'Text',
    [
      { slot: 'padding-block-start', decl: CORE('02', '2px') },
      { slot: 'padding-block-end', decl: CORE('02', '2px') },
      { slot: 'padding-inline-start', decl: CORE('03', '4px') },
      { slot: 'padding-inline-end', decl: CORE('03', '4px') },
    ],
  ],
];

describe.each(CASES)('%s box-model slots', (component, slots) => {
  const tokensCss = read(`ui/components/${component}/${component}.tokens.css`);
  const css = read(`ui/components/${component}/${component}.css`);

  it.each(slots)('pins $slot to the pre-adoption literal', ({ slot, decl }) => {
    expect(tokensCss).toContain(`--ds-box-model-${slot}: ${decl};`);
  });

  it('consumes at least one slot and imports the primitive', () => {
    expect(css).toContain('var(--ds-box-model-');
    expect(css).toContain("primitives/boxModel.css'");
  });
});
