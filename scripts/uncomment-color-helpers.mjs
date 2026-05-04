#!/usr/bin/env node

/**
 * Script to help uncomment color helper functions in phases
 * Usage: node scripts/uncomment-color-helpers.mjs [phase]
 *
 * Phases:
 * 1 - Basic conversions (RGB, HEX, HSL)
 * 2 - HSV conversions
 * 3 - Advanced color spaces (LAB, LCH, XYZ)
 * 4 - OKLab color space
 * 5 - CIECAM02 (optional)
 */

import fs from 'fs';
import path from 'path';

const COLOR_HELPERS_PATH = 'utils/helpers/colorHelpers.ts';

const PHASES = {
  1: {
    name: 'Basic Conversions',
    description: 'RGB, HEX, HSL conversions',
    functions: [
      'RGB interface',
      'HSL interface',
      'hexToRgb function',
      'rgbToHex function',
      'rgbToHsl function',
      'hslToRgb function',
    ],
  },
  2: {
    name: 'HSV Conversions',
    description: 'RGB ↔ HSV conversions',
    functions: ['rgbToHsv function', 'hsvToRgb function'],
  },
  3: {
    name: 'Advanced Color Spaces',
    description: 'LAB, LCH, XYZ conversions',
    functions: [
      'LAB interface',
      'LCH interface',
      'XYZ interface',
      'D65_WHITE_POINT constant',
      'KAPPA constant',
      'EPSILON constant',
      'sRgbToLinearRgbChannel function',
      'linearRgbToSRgbChannel function',
      'rgbToXyz function',
      'xyzToLab function',
      'labToXyz function',
      'xyzToRgb function',
      'rgbToLab function',
      'labToRgb function',
      'rgbToLch function',
      'lchToRgb function',
    ],
  },
  4: {
    name: 'OKLab Color Space',
    description: 'OKLab and OKLCh conversions',
    functions: [
      'rgbToOklab function',
      'oklabToRgb function',
      'oklabToOklch function',
      'oklchToOklab function',
    ],
  },
  5: {
    name: 'CIECAM02',
    description: 'CIECAM02 color appearance model',
    functions: ['CIECAM02 class', 'rgbToCam02JCh function'],
  },
};

function readFile() {
  try {
    return fs.readFileSync(COLOR_HELPERS_PATH, 'utf8');
  } catch (error) {
    console.error(`Error reading ${COLOR_HELPERS_PATH}:`, error.message);
    process.exit(1);
  }
}

function writeFile(content) {
  try {
    fs.writeFileSync(COLOR_HELPERS_PATH, content, 'utf8');
    console.log(`✅ Updated ${COLOR_HELPERS_PATH}`);
  } catch (error) {
    console.error(`Error writing ${COLOR_HELPERS_PATH}:`, error.message);
    process.exit(1);
  }
}

function uncommentPhase(content, phase) {
  const phaseInfo = PHASES[phase];
  if (!phaseInfo) {
    console.error(
      `Invalid phase: ${phase}. Available phases: ${Object.keys(PHASES).join(', ')}`
    );
    process.exit(1);
  }

  console.log(`\n🚀 Uncommenting Phase ${phase}: ${phaseInfo.name}`);
  console.log(`📝 ${phaseInfo.description}`);
  console.log(`\nFunctions to uncomment:`);
  phaseInfo.functions.forEach((func) => console.log(`  - ${func}`));

  // Simple approach: uncomment all lines that start with '//' and contain function/interface definitions
  let modified = content;
  let uncommentedCount = 0;

  // For phase 1, uncomment basic interfaces and functions
  if (phase === 1) {
    // Uncomment RGB interface
    modified = modified.replace(
      /^\/\/ export interface RGB \{[\s\S]*?^\/\/ \}/gm,
      (match) => match.replace(/^\/\/ /gm, '')
    );

    // Uncomment HSL interface
    modified = modified.replace(
      /^\/\/ export interface HSL \{[\s\S]*?^\/\/ \}/gm,
      (match) => match.replace(/^\/\/ /gm, '')
    );

    // Uncomment hexToRgb function
    modified = modified.replace(
      /^\/\/ export function hexToRgb\([\s\S]*?^\/\/ \}/gm,
      (match) => match.replace(/^\/\/ /gm, '')
    );

    // Uncomment rgbToHex function
    modified = modified.replace(
      /^\/\/ export function rgbToHex\([\s\S]*?^\/\/ \}/gm,
      (match) => match.replace(/^\/\/ /gm, '')
    );

    // Uncomment rgbToHsl function
    modified = modified.replace(
      /^\/\/ export function rgbToHsl\([\s\S]*?^\/\/ \}/gm,
      (match) => match.replace(/^\/\/ /gm, '')
    );

    // Uncomment hslToRgb function
    modified = modified.replace(
      /^\/\/ export function hslToRgb\([\s\S]*?^\/\/ \}/gm,
      (match) => match.replace(/^\/\/ /gm, '')
    );
  }

  // For phase 2, uncomment HSV functions
  if (phase === 2) {
    // Uncomment rgbToHsv function
    modified = modified.replace(
      /^\/\/ export function rgbToHsv\([\s\S]*?^\/\/ \}/gm,
      (match) => match.replace(/^\/\/ /gm, '')
    );

    // Uncomment hsvToRgb function
    modified = modified.replace(
      /^\/\/ export function hsvToRgb\([\s\S]*?^\/\/ \}/gm,
      (match) => match.replace(/^\/\/ /gm, '')
    );
  }

  // For phase 3, uncomment advanced color space functions
  if (phase === 3) {
    // Uncomment LAB, LCH, XYZ interfaces
    modified = modified.replace(
      /^\/\/ export interface LAB \{[\s\S]*?^\/\/ \}/gm,
      (match) => match.replace(/^\/\/ /gm, '')
    );
    modified = modified.replace(
      /^\/\/ export interface LCH \{[\s\S]*?^\/\/ \}/gm,
      (match) => match.replace(/^\/\/ /gm, '')
    );
    modified = modified.replace(
      /^\/\/ export interface XYZ \{[\s\S]*?^\/\/ \}/gm,
      (match) => match.replace(/^\/\/ /gm, '')
    );

    // Uncomment constants
    modified = modified.replace(
      /^\/\/ const D65_WHITE_POINT: XYZ = \{[\s\S]*?^\/\/ \};/gm,
      (match) => match.replace(/^\/\/ /gm, '')
    );
    modified = modified.replace(
      /^\/\/ const KAPPA = [\s\S]*?^\/\/ const EPSILON = [\s\S]*?^\/\/ \}/gm,
      (match) => match.replace(/^\/\/ /gm, '')
    );

    // Uncomment internal functions
    const internalFunctions = [
      'sRgbToLinearRgbChannel',
      'linearRgbToSRgbChannel',
      'rgbToXyz',
      'xyzToLab',
      'labToXyz',
      'xyzToRgb',
    ];

    internalFunctions.forEach((funcName) => {
      const regex = new RegExp(
        `^\/\/ function ${funcName}\\([\\s\\S]*?^\/\/ \\}`,
        'gm'
      );
      modified = modified.replace(regex, (match) =>
        match.replace(/^\/\/ /gm, '')
      );
    });

    // Uncomment public functions
    const publicFunctions = ['rgbToLab', 'labToRgb', 'rgbToLch', 'lchToRgb'];

    publicFunctions.forEach((funcName) => {
      const regex = new RegExp(
        `^\/\/ export function ${funcName}\\([\\s\\S]*?^\/\/ \\}`,
        'gm'
      );
      modified = modified.replace(regex, (match) =>
        match.replace(/^\/\/ /gm, '')
      );
    });
  }

  // For phase 4, uncomment OKLab functions
  if (phase === 4) {
    const oklabFunctions = [
      'rgbToOklab',
      'oklabToRgb',
      'oklabToOklch',
      'oklchToOklab',
    ];

    oklabFunctions.forEach((funcName) => {
      const regex = new RegExp(
        `^\/\/ export function ${funcName}\\([\\s\\S]*?^\/\/ \\}`,
        'gm'
      );
      modified = modified.replace(regex, (match) =>
        match.replace(/^\/\/ /gm, '')
      );
    });
  }

  // For phase 5, uncomment CIECAM02
  if (phase === 5) {
    // Uncomment CIECAM02 class
    modified = modified.replace(
      /^\/\/ class CIECAM02 \{[\s\S]*?^\/\/ \}/gm,
      (match) => match.replace(/^\/\/ /gm, '')
    );

    // Uncomment rgbToCam02JCh function
    modified = modified.replace(
      /^\/\/ export function rgbToCam02JCh\([\s\S]*?^\/\/ \}/gm,
      (match) => match.replace(/^\/\/ /gm, '')
    );
  }

  // Count uncommented lines
  const originalCommented = (content.match(/^\/\/ /gm) || []).length;
  const newCommented = (modified.match(/^\/\/ /gm) || []).length;
  uncommentedCount = originalCommented - newCommented;

  return { content: modified, uncommentedCount };
}

function showStatus() {
  const content = readFile();
  const totalLines = content.split('\n').length;
  const commentedLines = (content.match(/^\/\/ /gm) || []).length;
  const uncommentedLines = totalLines - commentedLines;

  console.log('\n📊 Current Status:');
  console.log(`  Total lines: ${totalLines}`);
  console.log(`  Commented lines: ${commentedLines}`);
  console.log(`  Uncommented lines: ${uncommentedLines}`);
  console.log(
    `  Progress: ${((uncommentedLines / totalLines) * 100).toFixed(1)}%`
  );
}

function showHelp() {
  console.log('\n🎨 Color Helpers Uncommenting Tool');
  console.log('\nUsage:');
  console.log('  node scripts/uncomment-color-helpers.mjs [phase]');
  console.log('\nAvailable phases:');
  Object.entries(PHASES).forEach(([phase, info]) => {
    console.log(`  ${phase} - ${info.name}: ${info.description}`);
  });
  console.log('\nCommands:');
  console.log('  status - Show current uncommenting status');
  console.log('  help - Show this help message');
  console.log('\nExample:');
  console.log(
    '  node scripts/uncomment-color-helpers.mjs 1  # Start with basic conversions'
  );
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help') {
    showHelp();
    return;
  }

  if (command === 'status') {
    showStatus();
    return;
  }

  const phase = parseInt(command);
  if (isNaN(phase)) {
    console.error(`Invalid command: ${command}`);
    showHelp();
    return;
  }

  const content = readFile();
  const { content: modified, uncommentedCount } = uncommentPhase(
    content,
    phase
  );

  writeFile(modified);

  console.log(`\n✅ Uncommented ${uncommentedCount} lines`);
  console.log('\n🧪 Next steps:');
  console.log('1. Run tests to validate the uncommented functions:');
  console.log(`   npm test test/colorHelpers.test.ts`);
  console.log('2. Fix any issues before proceeding to the next phase');
  console.log('3. Run the next phase when ready:');
  console.log(`   node scripts/uncomment-color-helpers.mjs ${phase + 1}`);

  showStatus();
}

main();
