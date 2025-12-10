#!/usr/bin/env node

/**
 * Comprehensive Test Suite for W3C Design Tokens Validator
 *
 * Tests various scenarios including valid tokens, invalid tokens, edge cases, and error handling.
 * Uses both schema validation AND custom semantic validation for complete DTCG 2025.10 compliance.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load schema and validator
const SCHEMA_PATH = path.join(__dirname, 'w3c-schema-strict.json');
const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);
const schemaValidate = ajv.compile(schema);

// Custom validation (mirrors w3c-validator.mjs logic)
function performCustomValidations(tokens, strictMode = true) {
  const errors = [];

  const allowedColorSpaces = [
    'srgb',
    'srgb-linear',
    'hsl',
    'hwb',
    'lab',
    'lch',
    'oklab',
    'oklch',
    'display-p3',
    'a98-rgb',
    'prophoto-rgb',
    'rec2020',
    'xyz-d65',
    'xyz-d50',
  ];

  function validateNode(node, path = '') {
    if (!node || typeof node !== 'object') return;

    // Check if this is a token (has $value OR has $type which implies it should have $value)
    if ('$value' in node || '$type' in node) {
      validateToken(node, path);
    }

    // Recursively validate children
    for (const [key, value] of Object.entries(node)) {
      if (!key.startsWith('$') && typeof value === 'object') {
        validateNode(value, path ? `${path}.${key}` : key);
      }
    }
  }

  function validateToken(token, path) {
    const { $type, $value } = token;

    // Check for missing $value (but only if there's a $type AND no child tokens)
    // Groups can have $type without $value (for type inheritance)
    if ($type && $value === undefined) {
      // Check if this is a group (has non-$ children) or a token (should have $value)
      const hasChildTokens = Object.keys(token).some((k) => !k.startsWith('$'));
      if (!hasChildTokens) {
        errors.push({ path, message: 'Missing required $value property' });
        return;
      }
      // It's a group with type inheritance, which is valid
      return;
    }

    // Validate based on type
    if (
      $type === 'color' &&
      typeof $value === 'object' &&
      !Array.isArray($value)
    ) {
      // Check colorSpace
      if (
        'colorSpace' in $value &&
        !allowedColorSpaces.includes($value.colorSpace)
      ) {
        errors.push({
          path,
          message: `Invalid colorSpace: "${$value.colorSpace}"`,
        });
      }
      // Check components count
      if ('components' in $value) {
        if (
          !Array.isArray($value.components) ||
          $value.components.length !== 3
        ) {
          errors.push({
            path,
            message: 'Color components must have exactly 3 values',
          });
        }
      }
      // Check alpha range
      if (
        'alpha' in $value &&
        (typeof $value.alpha !== 'number' ||
          $value.alpha < 0 ||
          $value.alpha > 1)
      ) {
        errors.push({
          path,
          message: 'Alpha must be a number between 0 and 1',
        });
      }
    }

    if (
      $type === 'dimension' &&
      typeof $value === 'object' &&
      !Array.isArray($value)
    ) {
      if ('unit' in $value && !['px', 'rem'].includes($value.unit)) {
        errors.push({
          path,
          message: `Invalid dimension unit: "${$value.unit}"`,
        });
      }
    }

    // Check for invalid token reference format (string without braces)
    if (
      $type === 'color' &&
      typeof $value === 'string' &&
      !$value.match(/^\{[^}]+\}$/)
    ) {
      // It's a string but not a valid reference - check if it looks like a reference attempt
      if (
        $value.includes('.') &&
        !$value.startsWith('#') &&
        !$value.startsWith('rgb') &&
        !$value.startsWith('hsl')
      ) {
        errors.push({
          path,
          message: 'Invalid token reference format (missing braces)',
        });
      }
    }
  }

  validateNode(tokens);
  return errors;
}

// Test results tracking
let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;
const failures = [];

function test(name, tokens, shouldPass = true, expectedErrors = []) {
  testsRun++;

  // Run schema validation
  const schemaResult = schemaValidate(tokens);
  const schemaErrors = schemaValidate.errors || [];

  // Run custom semantic validation
  const customErrors = performCustomValidations(tokens, true);

  // Combine results
  const allErrors = [
    ...schemaErrors.map((e) => ({ path: e.instancePath, message: e.message })),
    ...customErrors,
  ];
  const isValid = schemaResult && customErrors.length === 0;
  const testPassed = isValid === shouldPass;

  if (testPassed) {
    testsPassed++;
    console.log(`✅ ${name}`);
  } else {
    testsFailed++;
    failures.push({ name, errors: allErrors, expectedErrors });
    console.log(`❌ ${name}`);
    console.log(
      `   Expected: ${shouldPass ? 'valid' : 'invalid'}, Got: ${isValid ? 'valid' : 'invalid'}`
    );
    if (allErrors.length > 0) {
      allErrors.slice(0, 3).forEach((err) => {
        console.log(`   - ${err.path || 'root'}: ${err.message}`);
      });
    }
  }

  // Reset validator state
  schemaValidate.errors = null;
}

console.log('🧪 W3C Design Tokens Validator Test Suite\n');
console.log('='.repeat(60));

// Test 1: Valid basic color token
test(
  'Valid basic color token',
  {
    color: {
      primary: {
        $type: 'color',
        $value: {
          colorSpace: 'srgb',
          components: [0.2, 0.4, 0.8],
        },
      },
    },
  },
  true
);

// Test 2: Valid color with alpha
test(
  'Valid color with alpha channel',
  {
    color: {
      primary: {
        $type: 'color',
        $value: {
          colorSpace: 'srgb',
          components: [0.2, 0.4, 0.8],
          alpha: 0.9,
        },
      },
    },
  },
  true
);

// Test 3: Valid dimension token
test(
  'Valid dimension token',
  {
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
  true
);

// Test 4: Valid token reference
test(
  'Valid token reference',
  {
    color: {
      primary: {
        $type: 'color',
        $value: {
          colorSpace: 'srgb',
          components: [1, 0, 0],
        },
      },
      secondary: {
        $type: 'color',
        $value: '{color.primary}',
      },
    },
  },
  true
);

// Test 5: Valid typography composite token
test(
  'Valid typography composite token',
  {
    typography: {
      heading: {
        $type: 'typography',
        $value: {
          fontFamily: 'Inter, sans-serif',
          fontSize: {
            value: 24,
            unit: 'px',
          },
          fontWeight: 'bold',
          lineHeight: 1.5,
        },
      },
    },
  },
  true
);

// Test 6: Valid group with type inheritance
test(
  'Valid group with type inheritance',
  {
    spacing: {
      $type: 'dimension',
      small: {
        $value: {
          value: 8,
          unit: 'px',
        },
      },
      medium: {
        $value: {
          value: 16,
          unit: 'px',
        },
      },
    },
  },
  true
);

// Test 7: Invalid colorSpace
test(
  'Invalid colorSpace value',
  {
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
  false
);

// Test 8: Invalid color components (wrong count)
test(
  'Invalid color components count',
  {
    color: {
      primary: {
        $type: 'color',
        $value: {
          colorSpace: 'srgb',
          components: [1, 0], // Only 2 components, need 3-4
        },
      },
    },
  },
  false
);

// Test 9: Invalid dimension unit
test(
  'Invalid dimension unit',
  {
    spacing: {
      small: {
        $type: 'dimension',
        $value: {
          value: 8,
          unit: 'em', // Only px and rem are valid
        },
      },
    },
  },
  false
);

// Test 10: Missing required $value
test(
  'Missing required $value property',
  {
    color: {
      primary: {
        $type: 'color',
        // Missing $value
      },
    },
  },
  false
);

// Test 11: Invalid token reference format
test(
  'Invalid token reference format',
  {
    color: {
      primary: {
        $type: 'color',
        $value: 'color.primary', // Missing braces
      },
    },
  },
  false
);

// Test 12: Valid shadow token
test(
  'Valid shadow token',
  {
    shadow: {
      elevation: {
        $type: 'shadow',
        $value: {
          offsetX: {
            value: 0,
            unit: 'px',
          },
          offsetY: {
            value: 4,
            unit: 'px',
          },
          blur: {
            value: 8,
            unit: 'px',
          },
          spread: {
            value: 0,
            unit: 'px',
          },
          color: {
            colorSpace: 'srgb',
            components: [0, 0, 0],
            alpha: 0.1,
          },
        },
      },
    },
  },
  true
);

// Test 13: Valid border token
test(
  'Valid border token',
  {
    border: {
      default: {
        $type: 'border',
        $value: {
          color: {
            colorSpace: 'srgb',
            components: [0, 0, 0],
          },
          width: {
            value: 1,
            unit: 'px',
          },
          style: 'solid',
        },
      },
    },
  },
  true
);

// Test 14: Valid transition token (DTCG 2025.10 format)
test(
  'Valid transition token',
  {
    transition: {
      default: {
        $type: 'transition',
        $value: {
          duration: {
            value: 200,
            unit: 'ms',
          },
          timingFunction: [0.4, 0, 0.2, 1],
        },
      },
    },
  },
  true
);

// Test 15: Valid gradient token
test(
  'Valid gradient token',
  {
    gradient: {
      primary: {
        $type: 'gradient',
        $value: [
          {
            color: {
              colorSpace: 'srgb',
              components: [1, 0, 0],
            },
            position: 0,
          },
          {
            color: {
              colorSpace: 'srgb',
              components: [0, 0, 1],
            },
            position: 1,
          },
        ],
      },
    },
  },
  true
);

// Test 16: Invalid alpha value (out of range)
test(
  'Invalid alpha value out of range',
  {
    color: {
      primary: {
        $type: 'color',
        $value: {
          colorSpace: 'srgb',
          components: [1, 0, 0],
          alpha: 1.5, // Should be 0-1
        },
      },
    },
  },
  false
);

// Test 17: Valid fontWeight token (numeric)
test(
  'Valid fontWeight token (numeric)',
  {
    typography: {
      bold: {
        $type: 'fontWeight',
        $value: 700,
      },
    },
  },
  true
);

// Test 18: Valid fontWeight token (named)
test(
  'Valid fontWeight token (named)',
  {
    typography: {
      bold: {
        $type: 'fontWeight',
        $value: 'bold',
      },
    },
  },
  true
);

// Test 19: Valid fontFamily token
test(
  'Valid fontFamily token',
  {
    typography: {
      base: {
        $type: 'fontFamily',
        $value: 'Inter, system-ui, sans-serif',
      },
    },
  },
  true
);

// Test 20: Valid duration token (DTCG 2025.10 format)
test(
  'Valid duration token',
  {
    timing: {
      fast: {
        $type: 'duration',
        $value: {
          value: 150,
          unit: 'ms',
        },
      },
    },
  },
  true
);

// Test 21: Valid cubicBezier token
test(
  'Valid cubicBezier token',
  {
    easing: {
      default: {
        $type: 'cubicBezier',
        $value: [0.4, 0, 0.2, 1],
      },
    },
  },
  true
);

// Test 22: Valid number token
test(
  'Valid number token',
  {
    scale: {
      base: {
        $type: 'number',
        $value: 1.5,
      },
    },
  },
  true
);

// Test 23: Valid strokeStyle token
test(
  'Valid strokeStyle token',
  {
    border: {
      dashed: {
        $type: 'strokeStyle',
        $value: 'dashed',
      },
    },
  },
  true
);

// Test 24: Complex nested structure
test(
  'Complex nested token structure',
  {
    color: {
      palette: {
        primary: {
          base: {
            $type: 'color',
            $value: {
              colorSpace: 'srgb',
              components: [0.2, 0.4, 0.8],
            },
          },
          light: {
            $type: 'color',
            $value: '{color.palette.primary.base}',
          },
        },
      },
    },
    spacing: {
      $type: 'dimension',
      scale: {
        xs: { $value: { value: 4, unit: 'px' } },
        sm: { $value: { value: 8, unit: 'px' } },
        md: { $value: { value: 16, unit: 'px' } },
      },
    },
  },
  true
);

// Test 25: Token with description
test(
  'Token with description',
  {
    color: {
      primary: {
        $type: 'color',
        $value: {
          colorSpace: 'srgb',
          components: [1, 0, 0],
        },
        $description: 'Primary brand color',
      },
    },
  },
  true
);

// Test 26: Token with extensions
test(
  'Token with extensions',
  {
    color: {
      primary: {
        $type: 'color',
        $value: {
          colorSpace: 'srgb',
          components: [1, 0, 0],
        },
        $extensions: {
          custom: {
            theme: 'light',
          },
        },
      },
    },
  },
  true
);

// Summary
console.log('\n' + '='.repeat(60));
console.log(`\n📊 Test Results:`);
console.log(`   Total tests: ${testsRun}`);
console.log(`   ✅ Passed: ${testsPassed}`);
console.log(`   ❌ Failed: ${testsFailed}`);
console.log(`   Success rate: ${((testsPassed / testsRun) * 100).toFixed(1)}%`);

if (failures.length > 0) {
  console.log(`\n⚠️  Failures:`);
  failures.forEach((f) => {
    console.log(`   - ${f.name}`);
  });
}

process.exit(testsFailed > 0 ? 1 : 0);
