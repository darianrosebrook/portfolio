#!/usr/bin/env node

/**
 * Comprehensive Test Suite for W3C Design Tokens Validator
 * Tests using the full validator (schema + custom validation)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the validator
const VALIDATOR_PATH = path.join(__dirname, 'w3c-validator.mjs');
const validatorModule = await import(`file://${VALIDATOR_PATH}`);

// We need to use the validation logic from the CLI script
// Let's create a simple wrapper
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const SCHEMA_PATH = path.join(__dirname, 'w3c-schema-strict.json');
const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
const ajv = new Ajv({ allErrors: true, verbose: true, strict: false });
addFormats(ajv);
const schemaValidate = ajv.compile(schema);

// Custom validation functions (from w3c-validator.mjs)
function performCustomValidations(tokens) {
  const errors = [];
  const warnings = [];
  const tokenRefs = new Map();

  function validateNode(node, path = '') {
    if (!node || typeof node !== 'object') return;

    if (node.$value !== undefined) {
      validateToken(node, path);
    }

    if (node.$type && node.$value === undefined) {
      validateGroup(node, path);
    }

    for (const [key, value] of Object.entries(node)) {
      if (!key.startsWith('$') && typeof value === 'object') {
        validateNode(value, path ? `${path}.${key}` : key);
      }
    }
  }

  function validateToken(token, path) {
    if (!token.$type && !token.$value) {
      warnings.push({
        type: 'missing-type',
        path,
        message: 'Token should have a $type property for better validation',
      });
    }

    if (typeof token.$value === 'string' && token.$value.match(/^\{[^}]+\}$/)) {
      const refPath = token.$value.slice(1, -1);
      tokenRefs.set(path, refPath);

      if (refPath === path) {
        errors.push({
          type: 'circular-reference',
          path,
          message: 'Token cannot reference itself',
        });
      }
    }

    if (token.$type) {
      validateTokenType(token, path);
    }
  }

  function validateGroup(group, path) {
    if (path.length === 0) {
      warnings.push({
        type: 'naming',
        path,
        message: 'Root level groups should have descriptive names',
      });
    }
  }

  function validateTokenType(token, path) {
    const { $type, $value } = token;

    switch ($type) {
      case 'color':
        if (typeof $value === 'object' && $value !== null && !Array.isArray($value)) {
          const colorValue = $value;
          if ('colorSpace' in colorValue) {
            const validColorSpaces = [
              'srgb', 'srgb-linear', 'display-p3', 'a98-rgb',
              'prophoto-rgb', 'rec2020', 'xyz-d50', 'xyz-d65',
              'oklab', 'oklch', 'lab', 'lch'
            ];
            if (!validColorSpaces.includes(colorValue.colorSpace)) {
              errors.push({
                type: 'custom',
                path,
                message: `Invalid colorSpace: "${colorValue.colorSpace}". Must be one of: ${validColorSpaces.join(', ')}`,
              });
            }
          }
          if ('components' in colorValue) {
            const components = colorValue.components;
            if (!Array.isArray(components) || components.length < 3 || components.length > 4) {
              errors.push({
                type: 'custom',
                path,
                message: 'Color components must be an array of 3-4 numbers',
              });
            }
          }
          if ('alpha' in colorValue && (colorValue.alpha < 0 || colorValue.alpha > 1)) {
            errors.push({
              type: 'custom',
              path,
              message: 'Alpha value must be between 0 and 1',
            });
          }
        } else if (
          typeof $value === 'string' &&
          !$value.match(/^(#|rgb|hsl|oklch|\{)/)
        ) {
          warnings.push({
            type: 'color-format',
            path,
            message: 'Color value should be a valid CSS color or token reference',
          });
        }
        break;

      case 'dimension':
        if (typeof $value === 'object' && $value !== null && !Array.isArray($value)) {
          if ('unit' in $value && !['px', 'rem'].includes($value.unit)) {
            errors.push({
              type: 'custom',
              path,
              message: `Invalid dimension unit: "${$value.unit}". Must be "px" or "rem"`,
            });
          }
        } else if (
          typeof $value === 'string' &&
          !$value.match(/^([0-9.-]+(px|rem|em|%|vh|vw)|0|\{|calc\()/)
        ) {
          warnings.push({
            type: 'dimension-format',
            path,
            message: 'Dimension value should include units or be a token reference',
          });
        }
        break;

      case 'number':
        if (
          typeof $value !== 'number' &&
          typeof $value === 'string' &&
          !$value.match(/^(\d+(\.\d+)?|\{)/)
        ) {
          warnings.push({
            type: 'number-format',
            path,
            message: 'Number value should be numeric or a token reference',
          });
        }
        break;
    }
  }

  validateNode(tokens);

  // Check for circular references
  const cycles = detectCircularReferences(tokenRefs);
  errors.push(
    ...cycles.map((cycle) => ({
      type: 'circular-reference',
      path: cycle.join(' -> '),
      message: 'Circular reference detected in token chain',
    }))
  );

  return { errors, warnings };
}

function detectCircularReferences(tokenRefs) {
  const cycles = [];
  const visited = new Set();
  const recursionStack = new Set();

  function dfs(node, path = []) {
    if (recursionStack.has(node)) {
      const cycleStart = path.indexOf(node);
      cycles.push(path.slice(cycleStart).concat(node));
      return;
    }

    if (visited.has(node)) return;

    visited.add(node);
    recursionStack.add(node);
    path.push(node);

    const reference = tokenRefs.get(node);
    if (reference) {
      dfs(reference, [...path]);
    }

    recursionStack.delete(node);
  }

  for (const node of tokenRefs.keys()) {
    if (!visited.has(node)) {
      dfs(node);
    }
  }

  return cycles;
}

function validateTokens(tokens) {
  const schemaValid = schemaValidate(tokens);
  const custom = performCustomValidations(tokens);
  
  return {
    isValid: schemaValid && custom.errors.length === 0,
    schemaValid,
    errors: [
      ...(schemaValid ? [] : (schemaValidate.errors || []).map(e => ({
        type: 'schema',
        path: e.instancePath || 'root',
        message: e.message,
      }))),
      ...custom.errors,
    ],
    warnings: custom.warnings,
  };
}

// Test results tracking
let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;
const failures = [];

function test(name, tokens, shouldPass = true) {
  testsRun++;
  const result = validateTokens(tokens);
  const isValid = result.isValid === shouldPass;
  
  if (isValid) {
    testsPassed++;
    console.log(`✅ ${name}`);
  } else {
    testsFailed++;
    failures.push({ name, result, shouldPass });
    console.log(`❌ ${name}`);
    console.log(`   Expected: ${shouldPass ? 'valid' : 'invalid'}, Got: ${result.isValid ? 'valid' : 'invalid'}`);
    if (result.errors.length > 0) {
      result.errors.slice(0, 3).forEach(err => {
        console.log(`   - ${err.path}: ${err.message}`);
      });
    }
  }
}

console.log('🧪 W3C Design Tokens Validator - Full Test Suite\n');
console.log('='.repeat(60));

// Valid tests
test('Valid basic color token', {
  color: {
    primary: {
      $type: 'color',
      $value: {
        colorSpace: 'srgb',
        components: [0.2, 0.4, 0.8]
      }
    }
  }
}, true);

test('Valid color with alpha channel', {
  color: {
    primary: {
      $type: 'color',
      $value: {
        colorSpace: 'srgb',
        components: [0.2, 0.4, 0.8],
        alpha: 0.9
      }
    }
  }
}, true);

test('Valid dimension token', {
  spacing: {
    small: {
      $type: 'dimension',
      $value: {
        value: 8,
        unit: 'px'
      }
    }
  }
}, true);

test('Valid token reference', {
  color: {
    primary: {
      $type: 'color',
      $value: {
        colorSpace: 'srgb',
        components: [1, 0, 0]
      }
    },
    secondary: {
      $type: 'color',
      $value: '{color.primary}'
    }
  }
}, true);

// Invalid tests - should fail
test('Invalid colorSpace value', {
  color: {
    primary: {
      $type: 'color',
      $value: {
        colorSpace: 'invalid-space',
        components: [1, 0, 0]
      }
    }
  }
}, false);

test('Invalid color components count', {
  color: {
    primary: {
      $type: 'color',
      $value: {
        colorSpace: 'srgb',
        components: [1, 0] // Only 2 components
      }
    }
  }
}, false);

test('Invalid dimension unit', {
  spacing: {
    small: {
      $type: 'dimension',
      $value: {
        value: 8,
        unit: 'em' // Invalid unit
      }
    }
  }
}, false);

test('Invalid alpha value out of range', {
  color: {
    primary: {
      $type: 'color',
      $value: {
        colorSpace: 'srgb',
        components: [1, 0, 0],
        alpha: 1.5 // Out of range
      }
    }
  }
}, false);

test('Missing required $value property', {
  color: {
    primary: {
      $type: 'color'
    }
  }
}, false);

test('Invalid token reference format', {
  color: {
    primary: {
      $type: 'color',
      $value: 'color.primary' // Missing braces
    }
  }
}, false);

test('Self-referencing token', {
  color: {
    primary: {
      $type: 'color',
      $value: '{color.primary}'
    }
  }
}, false);

// Summary
console.log('\n' + '='.repeat(60));
console.log(`\n📊 Test Results:`);
console.log(`   Total tests: ${testsRun}`);
console.log(`   ✅ Passed: ${testsPassed}`);
console.log(`   ❌ Failed: ${testsFailed}`);
console.log(`   Success rate: ${((testsPassed / testsRun) * 100).toFixed(1)}%`);

if (failures.length > 0) {
  console.log(`\n⚠️  Failures:`);
  failures.forEach(f => {
    console.log(`   - ${f.name} (expected ${f.shouldPass ? 'valid' : 'invalid'})`);
  });
}

process.exit(testsFailed > 0 ? 1 : 0);

