import fs from 'fs';
import path from 'path';
import Ajv, { type AnySchema, type ValidateFunction } from 'ajv';
import { describe, expect, it } from 'vitest';

type ContractFixture = Record<string, unknown>;

const schemaPath = path.resolve(
  process.cwd(),
  'ui/designTokens/component.contract.schema.json'
);

function createValidator(): ValidateFunction {
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8')) as AnySchema;
  return new Ajv({ allErrors: true, strict: false }).compile(schema);
}

function baseContract(overrides: ContractFixture = {}): ContractFixture {
  return {
    name: 'FixtureComponent',
    layer: 'composer',
    anatomy: ['root', 'trigger', 'panel'],
    variants: {},
    states: ['default'],
    a11y: {
      role: 'region',
      labeling: [],
      keyboard: [
        {
          key: 'Enter|Space',
          when: 'trigger',
          then: 'toggle panel',
        },
      ],
      apgPattern: null,
    },
    tokens: {
      root: {
        'fixture.color.background': {
          resolvesTo: 'semantic.color.background.primary',
          fallback: '#ffffff',
          property: 'background-color',
          layer: 'semantic',
        },
      },
    },
    props: {
      styled: {
        members: [
          {
            name: 'open',
            type: 'boolean | undefined',
            description: '',
            required: false,
          },
        ],
      },
    },
    ...overrides,
  };
}

describe('component contract schema', () => {
  it('accepts richer behavioral metadata used by portfolio contracts', () => {
    const validate = createValidator();
    const contract = baseContract({
      description: 'Expandable fixture component.',
      schemaVersion: '1',
      channels: {
        openness: {
          description: 'Whether the panel is open.',
          value: 'open',
          defaultValue: 'defaultOpen',
          onChange: 'onOpenChange',
          valueType: 'boolean',
          notes: 'Controlled and uncontrolled open state.',
        },
      },
      motion: {
        description: 'Panel enter and exit motion.',
        reducedMotion: 'respect',
        reducedMotionStrategy: 'Set duration to 0.',
        transitions: [
          {
            name: 'expand',
            trigger: 'openness=closed->open',
            phase: 'enter',
            properties: ['height', 'opacity'],
            duration: 'fixture.motion.duration',
            easing: null,
          },
        ],
      },
      focus: {
        description: 'Trigger retains focus while toggling.',
        strategy: 'manual',
        initialFocus: 'trigger',
        returnFocus: 'trigger',
        wrap: true,
      },
      dismissal: {
        triggers: [
          {
            event: 'escape',
            enabledBy: 'closeOnEscape',
            defaultEnabled: true,
            description: 'Escape closes the panel.',
          },
        ],
      },
      relationships: [
        {
          from: 'trigger',
          to: 'panel',
          attribute: 'aria-controls',
          description: 'The trigger controls the panel.',
        },
      ],
      a2ui: {
        category: 'navigation',
        usageHints: ['Use for grouped expandable content.'],
        children: {
          allowed: true,
          slot: 'children',
          accepts: ['node-ref'],
        },
      },
    });

    expect(validate(contract)).toBe(true);
  });

  it('accepts recursive token maps with literal values', () => {
    const validate = createValidator();
    const contract = baseContract({
      tokens: {
        root: {
          layout: {
            fixedWidth: {
              literal: '90vw',
              property: 'max-width',
            },
            nested: {
              'fixture.spacing.padding': {
                resolvesTo: 'core.spacing.size.04',
                fallback: '8px',
                property: 'padding',
                layer: 'core',
              },
            },
          },
        },
      },
    });

    expect(validate(contract)).toBe(true);
  });

  it('rejects unsupported root fields while allowing known contract vocabulary', () => {
    const validate = createValidator();
    const contract = baseContract({
      unsupportedPolicy: true,
    });

    expect(validate(contract)).toBe(false);
    expect(validate.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          instancePath: '',
          keyword: 'additionalProperties',
        }),
      ])
    );
  });
});
