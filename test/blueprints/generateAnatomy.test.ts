import { describe, it, expect } from 'vitest';
import {
  parseAnatomy,
  getAnatomyData,
  getComponentContract,
  type ComponentContract,
} from '@/app/blueprints/component-standards/_lib/generateAnatomy';
import type { ComponentItem } from '@/app/blueprints/component-standards/_lib/componentsData';

/**
 * Tests for FEAT-201 anatomy derivation. These pin the acceptance criteria the
 * doc UI depends on:
 *   A1 — one part per structural anatomy entry
 *   A2 — Type column: slot-name -> Slot, prop-name -> prop type, else Part
 *   A5 — components with no contract anatomy fall back to null (planned/not-defined)
 *
 * parseAnatomy is pure (no fs) and carries the classification + description
 * logic, so it is the primary surface. getAnatomyData is covered for the A5
 * null path via a component with no resolvable contract.
 */

/** A representative compound contract exercising every classify/describe branch. */
function dialogContract(): ComponentContract {
  return {
    name: 'Dialog',
    layer: 'compound',
    anatomy: ['root', 'title', 'closeButton', 'size', 'decoration'],
    slots: {
      title: { required: true, selector: '[data-dialog-title]' },
      closeButton: { required: false },
    },
    props: {
      styled: {
        members: [
          {
            name: 'size',
            type: 'DialogSize',
            description: 'Controls the overall dialog size.',
          },
        ],
      },
    },
  };
}

describe('parseAnatomy — A1: one row per authored anatomy entry', () => {
  it('emits one part per authored entry, in order, dropping nothing', () => {
    const contract = dialogContract();
    const parts = parseAnatomy(contract.anatomy!, contract);
    expect(parts.map((p) => p.name)).toEqual(contract.anatomy);
  });

  it('keeps structural regions whose names contain a state word as a substring', () => {
    // Regression: a prior substring-based filter silently dropped these real
    // contract parts (interactive/focusable/hoverable/loadingText) because
    // their names contain "active"/"focus"/"hover"/"loading". The anatomy
    // array is authored source-of-truth, so every entry must survive.
    const parts = parseAnatomy(
      ['root', 'interactive', 'focusable', 'hoverable', 'loadingText'],
      null
    );
    expect(parts.map((p) => p.name)).toEqual([
      'root',
      'interactive',
      'focusable',
      'hoverable',
      'loadingText',
    ]);
  });

  it('preserves a size-named entry rather than filtering it', () => {
    const parts = parseAnatomy(['track', 'small', 'large', 'thumb'], null);
    expect(parts.map((p) => p.name)).toEqual([
      'track',
      'small',
      'large',
      'thumb',
    ]);
  });

  it('assigns root level 0 with no parent and children level 1 parented to root', () => {
    const parts = parseAnatomy(['root', 'body'], null);
    expect(parts[0]).toMatchObject({ name: 'root', level: 0, parent: undefined });
    expect(parts[1]).toMatchObject({ name: 'body', level: 1, parent: 'root' });
  });
});

describe('parseAnatomy — A2: Type column classification', () => {
  it('classifies the root part as root', () => {
    const [root] = parseAnatomy(['root'], dialogContract());
    expect(root.type).toEqual({ kind: 'root' });
  });

  it('classifies a part matching a slot name as slot, carrying required', () => {
    const parts = parseAnatomy(['title', 'closeButton'], dialogContract());
    expect(parts.find((p) => p.name === 'title')?.type).toEqual({
      kind: 'slot',
      required: true,
    });
    expect(parts.find((p) => p.name === 'closeButton')?.type).toEqual({
      kind: 'slot',
      required: false,
    });
  });

  it('classifies a part matching a prop member as prop, carrying name and type', () => {
    const [size] = parseAnatomy(['size'], dialogContract());
    expect(size.type).toEqual({
      kind: 'prop',
      propName: 'size',
      propType: 'DialogSize',
    });
  });

  it('classifies an unmatched part as a plain part', () => {
    const [decoration] = parseAnatomy(['decoration'], dialogContract());
    expect(decoration.type).toEqual({ kind: 'part' });
  });

  it('prefers slot over prop when a name matches both', () => {
    const contract: ComponentContract = {
      name: 'X',
      layer: 'primitive',
      slots: { overlap: { required: true } },
      props: {
        styled: {
          members: [
            { name: 'overlap', type: 'string', description: 'a prop too' },
          ],
        },
      },
    };
    const [part] = parseAnatomy(['overlap'], contract);
    expect(part.type).toEqual({ kind: 'slot', required: true });
  });

  it('classifies every non-root part as a plain part when no contract is given', () => {
    const parts = parseAnatomy(['root', 'body', 'footer'], null);
    expect(parts.find((p) => p.name === 'root')?.type).toEqual({ kind: 'root' });
    expect(parts.find((p) => p.name === 'body')?.type).toEqual({ kind: 'part' });
    expect(parts.find((p) => p.name === 'footer')?.type).toEqual({
      kind: 'part',
    });
  });
});

describe('parseAnatomy — description derivation', () => {
  it('uses the slot selector for a slot that declares one', () => {
    const [title] = parseAnatomy(['title'], dialogContract());
    expect(title.description).toBe('Slot rendered into [data-dialog-title].');
  });

  it('uses the prop member description for a prop-matched part', () => {
    const [size] = parseAnatomy(['size'], dialogContract());
    expect(size.description).toBe('Controls the overall dialog size.');
  });

  it('gives root a container-specific default description', () => {
    const [root] = parseAnatomy(['root'], null);
    expect(root.description).toBe(
      'Outermost container that hosts the component.'
    );
  });

  it('humanizes camelCase part names in the default description', () => {
    const [icon] = parseAnatomy(['iconLeading'], null);
    expect(icon.description).toBe('Icon leading region of the component.');
  });
});

describe('getAnatomyData — A5: fallback when no contract anatomy', () => {
  function componentWithoutContract(): ComponentItem {
    return {
      component: 'Nonexistent',
      id: 'nonexistent',
      slug: 'nonexistent',
      layer: 'primitives',
      alternativeNames: [],
      normalizedAliases: [],
      category: 'test',
      description: '',
      a11y: { pitfalls: [] },
      status: 'Planned',
    };
  }

  it('returns null for a component with no resolvable contract path', () => {
    expect(getAnatomyData(componentWithoutContract())).toBeNull();
  });
});

describe('getAnatomyData — end-to-end against the real Tabs contract on disk', () => {
  const tabs: ComponentItem = {
    component: 'Tabs',
    id: 'tabs',
    slug: 'tabs',
    layer: 'composers',
    alternativeNames: [],
    normalizedAliases: [],
    category: 'navigation',
    description: '',
    a11y: { pitfalls: [] },
    status: 'Built',
    paths: { component: 'ui/components/Tabs' },
  };

  it('surfaces every authored anatomy entry, dropping none', () => {
    const contract = getComponentContract(tabs);
    const parts = getAnatomyData(tabs);
    expect(contract?.anatomy).toBeDefined();
    expect(parts).not.toBeNull();
    // Nothing is filtered: one row per authored entry, in order.
    expect(parts!.map((p) => p.name)).toEqual(contract!.anatomy);
  });

  it('includes the state-decorated rows the old substring filter dropped', () => {
    const names = getAnatomyData(tabs)!.map((p) => p.name);
    // These live in ui/components/Tabs/Tabs.contract.json and were previously
    // removed because their names contain "active"/"disabled".
    expect(names).toEqual(
      expect.arrayContaining([
        'tabActive',
        'tabDisabled',
        'panelActive',
        'panelInactive',
      ])
    );
  });

  it('classifies a base part that is a declared slot as a slot', () => {
    const parts = getAnatomyData(tabs)!;
    // 'tab' is declared in Tabs.contract.json slots.
    expect(parts.find((p) => p.name === 'tab')?.type?.kind).toBe('slot');
  });
});
