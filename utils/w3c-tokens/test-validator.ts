/**
 * Test script for the W3C Design Tokens Validator
 */

import { validateDesignTokens, setDefaultSchema, formatValidationResult } from './w3c-validator';
import schema from './w3c-schema-strict.json';
import fs from 'fs';

// Set the schema
setDefaultSchema(schema);

console.log('Testing W3C Design Tokens Validator\n');
console.log('='.repeat(50));

// Test 1: Valid tokens
console.log('\n1. Testing valid tokens:');
const validTokens = {
  color: {
    primary: {
      $type: 'color' as const,
      $value: {
        colorSpace: 'srgb' as const,
        components: [0.2, 0.4, 0.8] as [number, number, number],
      },
      $description: 'Primary brand color',
    },
  },
  spacing: {
    small: {
      $type: 'dimension' as const,
      $value: {
        value: 8,
        unit: 'px' as const,
      },
    },
  },
};

const validResult = validateDesignTokens(validTokens);
console.log(formatValidationResult(validResult));
console.log(`Valid: ${validResult.isValid}`);

// Test 2: Invalid tokens
console.log('\n2. Testing invalid tokens:');
const invalidTokens = {
  color: {
    primary: {
      $type: 'color' as const,
      $value: {
        colorSpace: 'invalid-space' as any,
        components: [1, 0, 0] as [number, number, number],
      },
    },
  },
};

const invalidResult = validateDesignTokens(invalidTokens);
console.log(formatValidationResult(invalidResult));
console.log(`Valid: ${invalidResult.isValid}`);
console.log(`Errors: ${invalidResult.errors.length}`);

// Test 3: Circular reference
console.log('\n3. Testing circular reference detection:');
const circularTokens = {
  color: {
    primary: {
      $type: 'color' as const,
      $value: '{color.secondary}' as any,
    },
    secondary: {
      $type: 'color' as const,
      $value: '{color.primary}' as any,
    },
  },
};

const circularResult = validateDesignTokens(circularTokens);
console.log(formatValidationResult(circularResult));
console.log(`Valid: ${circularResult.isValid}`);
console.log(`Circular reference errors: ${circularResult.errors.filter(e => e.type === 'circular-reference').length}`);

// Test 4: From file
console.log('\n4. Testing file validation:');
if (fs.existsSync('./test-tokens.json')) {
  const fileContent = fs.readFileSync('./test-tokens.json', 'utf-8');
  const fileTokens = JSON.parse(fileContent);
  const fileResult = validateDesignTokens(fileTokens);
  console.log(formatValidationResult(fileResult));
  console.log(`Valid: ${fileResult.isValid}`);
}

console.log('\n' + '='.repeat(50));
console.log('All tests completed!');

