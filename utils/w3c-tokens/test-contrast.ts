/**
 * Test Contrast Validation
 */

import { validateDesignTokensWithContrast, formatExtendedValidationResult } from './w3c-validator-with-contrast';
import { setDefaultSchema } from './w3c-validator';
import schema from './w3c-schema-strict.json';
import { contrastRatioHex } from './w3c-contrast-validator';

setDefaultSchema(schema);

console.log('🧪 Testing Contrast Validation\n');
console.log('='.repeat(60));

// Test contrast ratio calculation
console.log('\n1. Testing contrast ratio calculations:');
const ratios = [
  { fg: '#000000', bg: '#ffffff', expected: 21 },
  { fg: '#ffffff', bg: '#ffffff', expected: 1 },
  { fg: '#666666', bg: '#ffffff', expected: ~5.9 },
];

ratios.forEach(({ fg, bg, expected }) => {
  const ratio = contrastRatioHex(fg, bg);
  console.log(`   ${fg} on ${bg}: ${ratio?.toFixed(2)} (expected ~${expected})`);
});

// Test contrast validation
console.log('\n2. Testing contrast validation:');

const tokens = {
  color: {
    primary: {
      $type: 'color',
      $value: {
        colorSpace: 'srgb',
        components: [0, 0, 0], // Black
      },
    },
    background: {
      $type: 'color',
      $value: {
        colorSpace: 'srgb',
        components: [1, 1, 1], // White
      },
    },
  },
};

const result = validateDesignTokensWithContrast(tokens, {
  contrastValidation: {
    level: 'AA_NORMAL',
    colorPairs: [
      {
        foreground: '#000000',
        background: '#ffffff',
        context: 'Primary text on background',
        level: 'AA_NORMAL',
      },
      {
        foreground: '#666666',
        background: '#ffffff',
        context: 'Secondary text on background',
        level: 'AA_NORMAL',
      },
      {
        foreground: '#cccccc',
        background: '#ffffff',
        context: 'Disabled text on background',
        level: 'AA_NORMAL',
      },
    ],
  },
});

console.log(formatExtendedValidationResult(result));

if (result.contrast) {
  console.log(`\n📊 Contrast Summary:`);
  console.log(`   Total pairs: ${result.contrast.totalPairs}`);
  console.log(`   ✅ Passing: ${result.contrast.validPairs}`);
  console.log(`   ❌ Failing: ${result.contrast.invalidPairs}`);
}

console.log('\n' + '='.repeat(60));

