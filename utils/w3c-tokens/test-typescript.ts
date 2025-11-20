/**
 * TypeScript Test Suite for W3C Design Tokens Validator
 */

import { validateDesignTokens, setDefaultSchema } from './w3c-validator';
import schema from './w3c-schema-strict.json';

setDefaultSchema(schema);

interface TestCase {
  name: string;
  tokens: unknown;
  expectValid: boolean;
}

const tests: TestCase[] = [
  {
    name: 'Valid color token',
    tokens: {
      color: {
        primary: {
          $type: 'color',
          $value: {
            colorSpace: 'srgb',
            components: [1, 0, 0],
          },
        },
      },
    },
    expectValid: true,
  },
  {
    name: 'Invalid colorSpace',
    tokens: {
      color: {
        primary: {
          $type: 'color',
          $value: {
            colorSpace: 'invalid-space',
            components: [1, 0, 0],
          },
        },
      },
    },
    expectValid: false,
  },
  {
    name: 'Invalid dimension unit',
    tokens: {
      spacing: {
        small: {
          $type: 'dimension',
          $value: {
            value: 8,
            unit: 'em',
          },
        },
      },
    },
    expectValid: false,
  },
  {
    name: 'Valid dimension token',
    tokens: {
      spacing: {
        small: {
          $type: 'dimension',
          $value: {
            value: 8,
            unit: 'px',
          },
        },
      },
    },
    expectValid: true,
  },
  {
    name: 'Self-referencing token',
    tokens: {
      color: {
        primary: {
          $type: 'color',
          $value: '{color.primary}',
        },
      },
    },
    expectValid: false,
  },
  {
    name: 'Invalid color components count',
    tokens: {
      color: {
        primary: {
          $type: 'color',
          $value: {
            colorSpace: 'srgb',
            components: [1, 0], // Only 2, need 3-4
          },
        },
      },
    },
    expectValid: false,
  },
];

console.log('🧪 TypeScript Validator Test Suite\n');
console.log('='.repeat(60));

let passed = 0;
let failed = 0;

tests.forEach((test) => {
  const result = validateDesignTokens(test.tokens);
  const success = result.isValid === test.expectValid;

  if (success) {
    passed++;
    console.log(`✅ ${test.name}`);
  } else {
    failed++;
    console.log(`❌ ${test.name}`);
    console.log(`   Expected: ${test.expectValid ? 'valid' : 'invalid'}, Got: ${result.isValid ? 'valid' : 'invalid'}`);
    if (result.errors.length > 0) {
      result.errors.slice(0, 2).forEach((err) => {
        console.log(`   - ${err.path}: ${err.message}`);
      });
    }
  }
});

console.log('\n' + '='.repeat(60));
console.log(`\n📊 Results: ${passed}/${tests.length} passed`);

if (failed > 0) {
  process.exit(1);
}

