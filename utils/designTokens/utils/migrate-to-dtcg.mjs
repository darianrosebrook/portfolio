#!/usr/bin/env node

/**
 * DTCG 1.0 Token Migration Script
 *
 * Migrates legacy token files to DTCG 1.0 (2025.10) compliant format.
 * Converts string-based values to structured object format.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

const TOKENS_DIR = path.join(PROJECT_ROOT, 'ui', 'designTokens');

/**
 * Color space mappings for converting legacy color formats to DTCG 1.0 structured values.
 *
 * Maps common CSS color formats (hex, rgb, hsl) to DTCG 1.0 color objects
 * with srgb color space and normalized components (0-1 range).
 */
const COLOR_MAPPINGS = {
  // Hex colors
  hex: (hex) => {
    const cleanHex = hex.replace('#', '');
    const components = [];
    for (let i = 0; i < cleanHex.length; i += 2) {
      components.push(parseInt(cleanHex.substr(i, 2), 16) / 255);
    }
    return {
      colorSpace: 'srgb',
      components,
    };
  },

  // RGB/RGBA colors
  rgb: (rgb) => {
    const match = rgb.match(
      /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/
    );
    if (!match) return null;

    const components = [
      parseInt(match[1]) / 255,
      parseInt(match[2]) / 255,
      parseInt(match[3]) / 255,
    ];

    const result = {
      colorSpace: 'srgb',
      components,
    };

    if (match[4]) {
      result.alpha = parseFloat(match[4]);
    }

    return result;
  },

  // HSL/HSLA colors
  hsl: (hsl) => {
    const match = hsl.match(
      /hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%(?:\s*,\s*([\d.]+))?\s*\)/
    );
    if (!match) return null;

    // Convert HSL to RGB, then to linear RGB components
    const h = parseInt(match[1]) / 360;
    const s = parseInt(match[2]) / 100;
    const l = parseInt(match[3]) / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
    const m = l - c / 2;

    let r, g, b;
    if (h >= 0 && h < 1 / 6) {
      r = c;
      g = x;
      b = 0;
    } else if (h >= 1 / 6 && h < 2 / 6) {
      r = x;
      g = c;
      b = 0;
    } else if (h >= 2 / 6 && h < 3 / 6) {
      r = 0;
      g = c;
      b = x;
    } else if (h >= 3 / 6 && h < 4 / 6) {
      r = 0;
      g = x;
      b = c;
    } else if (h >= 4 / 6 && h < 5 / 6) {
      r = x;
      g = 0;
      b = c;
    } else {
      r = c;
      g = 0;
      b = x;
    }

    const result = {
      colorSpace: 'srgb',
      components: [r + m, g + m, b + m],
    };

    if (match[4]) {
      result.alpha = parseFloat(match[4]);
    }

    return result;
  },
};

/**
 * Convert legacy color value to DTCG 1.0 structured format.
 *
 * @param value - Legacy color value (hex string, rgb(), hsl(), etc.)
 * @returns DTCG 1.0 structured color object or original value if conversion fails
 */
function convertColorValue(value) {
  if (typeof value === 'string') {
    // Try hex first
    if (value.startsWith('#')) {
      return COLOR_MAPPINGS.hex(value);
    }

    // Try rgb/rgba
    if (value.startsWith('rgb')) {
      return COLOR_MAPPINGS.rgb(value);
    }

    // Try hsl/hsla
    if (value.startsWith('hsl')) {
      return COLOR_MAPPINGS.hsl(value);
    }

    // Check for named colors or other formats
    console.warn(`⚠️  Unsupported color format: ${value} - keeping as-is`);
    return value;
  }

  // Already structured
  if (typeof value === 'object' && value.colorSpace) {
    return value;
  }

  // Alias reference
  if (typeof value === 'string' && value.startsWith('{')) {
    return value;
  }

  console.warn(`⚠️  Unknown color value format: ${JSON.stringify(value)}`);
  return value;
}

/**
 * Convert legacy dimension value to DTCG 1.0 structured format.
 *
 * @param value - Legacy dimension value (string like "10px", "1.5rem", etc.)
 * @returns DTCG 1.0 structured dimension object or original value if conversion fails
 */
function convertDimensionValue(value) {
  if (typeof value === 'string') {
    // Check if it's already a DTCG 1.0 unit
    const dtcgMatch = value.match(/^([\d.]+)(px|rem)$/);
    if (dtcgMatch) {
      return {
        value: parseFloat(dtcgMatch[1]),
        unit: dtcgMatch[2],
      };
    }

    // Handle other units - convert to rem where possible
    const otherMatch = value.match(/^(-?[\d.]+)(em|pt|pc|in|cm|mm)$/);
    if (otherMatch) {
      const num = parseFloat(otherMatch[1]);
      const unit = otherMatch[2];
      let converted;

      switch (unit) {
        case 'em':
        case 'rem':
          converted = { value: num, unit: 'rem' };
          break;
        case 'pt':
          converted = { value: num * 1.333, unit: 'px' };
          break;
        case 'pc':
          converted = { value: num * 16, unit: 'px' };
          break;
        case 'in':
          converted = { value: num * 96, unit: 'px' };
          break;
        case 'cm':
          converted = { value: num * 37.795, unit: 'px' };
          break;
        case 'mm':
          converted = { value: num * 3.7795, unit: 'px' };
          break;
        default:
          console.warn(
            `⚠️  Unsupported dimension unit '${unit}' in: ${value} - keeping as-is`
          );
          return value;
      }

      console.log(
        `🔄 Converted ${value} → ${converted.value}${converted.unit}`
      );
      return converted;
    }

    // Handle ch units (character width) - approximate conversion
    const chMatch = value.match(/^(-?[\d.]+)ch$/);
    if (chMatch) {
      const ch = parseFloat(chMatch[1]);
      // Approximate: 1ch ≈ 8px for monospace, but this is rough
      const px = ch * 8;
      console.log(`🔄 Converted ${value} → ${px}px (approximate)`);
      return { value: px, unit: 'px' };
    }

    // Handle vh/vw units - keep as-is since they're not DTCG compliant
    if (value.match(/^[\d.]+(vh|vw|vmin|vmax|%)$/)) {
      console.warn(
        `⚠️  Viewport/percentage unit in ${value} - not DTCG compliant, keeping as-is`
      );
      return value;
    }

    // Alias reference
    if (value.startsWith('{')) {
      return value;
    }

    console.warn(`⚠️  Unknown dimension format: ${value} - keeping as-is`);
    return value;
  }

  // Already structured
  if (typeof value === 'object' && value.value !== undefined && value.unit) {
    return value;
  }

  // Alias reference
  if (typeof value === 'string' && value.startsWith('{')) {
    return value;
  }

  console.warn(`⚠️  Unknown dimension value format: ${JSON.stringify(value)}`);
  return value;
}

/**
 * Convert legacy font weight value to DTCG 1.0 format.
 *
 * @param value - Legacy font weight value (string number or named value)
 * @returns DTCG 1.0 compatible font weight value
 */
function convertFontWeightValue(value) {
  if (typeof value === 'string') {
    const num = parseInt(value);
    if (!isNaN(num)) {
      return num; // DTCG allows numeric values
    }

    // Keep named values as-is
    return value;
  }

  // Already correct format
  if (typeof value === 'number') {
    return value;
  }

  // Alias reference
  if (typeof value === 'string' && value.startsWith('{')) {
    return value;
  }

  return value;
}

/**
 * Recursively process token objects and convert legacy values to DTCG 1.0 format.
 *
 * @param token - Token object to process
 * @param path - Current path in the token tree (for logging)
 * @returns Processed token with DTCG 1.0 compliant values
 */
function processToken(token, path = []) {
  if (!token || typeof token !== 'object') {
    return token;
  }

  const result = { ...token };
  const currentPath = path.join('.');

  // Process $value
  if ('$value' in result) {
    const value = result.$value;
    const type = result.$type;

    switch (type) {
      case 'color':
        result.$value = convertColorValue(value);
        break;
      case 'dimension':
        result.$value = convertDimensionValue(value);
        break;
      case 'fontWeight':
        result.$value = convertFontWeightValue(value);
        break;
      // Other types can stay as-is for now
      default:
        break;
    }
  }

  // Recursively process nested objects
  for (const [key, val] of Object.entries(result)) {
    if (key.startsWith('$')) continue; // Skip metadata
    if (val && typeof val === 'object') {
      result[key] = processToken(val, [...path, key]);
    }
  }

  return result;
}

/**
 * Process a single token file, converting it to DTCG 1.0 format.
 *
 * Creates backup files and logs all conversions performed.
 *
 * @param filePath - Absolute path to the token file to process
 */
function processTokenFile(filePath) {
  console.log(`📄 Processing: ${path.relative(PROJECT_ROOT, filePath)}`);

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const tokens = JSON.parse(content);

    const processed = processToken(tokens);
    const output = JSON.stringify(processed, null, 2);

    // Backup original
    const backupPath = filePath + '.backup';
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(filePath, backupPath);
      console.log(
        `💾 Backup created: ${path.relative(PROJECT_ROOT, backupPath)}`
      );
    }

    // Write updated file
    fs.writeFileSync(filePath, output);
    console.log(`✅ Updated: ${path.relative(PROJECT_ROOT, filePath)}`);
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

/**
 * Find all token files recursively in a directory.
 *
 * @param dir - Directory to search for token files
 * @returns Array of absolute paths to .tokens.json files
 */
function findTokenFiles(dir) {
  const files = [];

  function scan(directory) {
    const items = fs.readdirSync(directory);

    for (const item of items) {
      const fullPath = path.join(directory, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scan(fullPath);
      } else if (item.endsWith('.tokens.json') && !item.endsWith('.backup')) {
        files.push(fullPath);
      }
    }
  }

  scan(dir);
  return files;
}

/**
 * Main migration function that processes all token files in the project.
 *
 * Converts legacy string/number values to DTCG 1.0 structured objects.
 * Creates backup files and provides detailed logging of all conversions.
 */
function migrateTokens() {
  console.log('🚀 Starting DTCG 1.0 Token Migration\n');

  const tokenFiles = findTokenFiles(TOKENS_DIR);

  console.log(`Found ${tokenFiles.length} token files to process:\n`);

  for (const file of tokenFiles) {
    console.log(`  ${path.relative(PROJECT_ROOT, file)}`);
  }

  console.log('\nStarting migration...\n');

  for (const file of tokenFiles) {
    processTokenFile(file);
  }

  console.log('\n🎉 Migration complete!');
  console.log('📋 Next steps:');
  console.log('  1. Run: npm run tokens:build');
  console.log('  2. Run: npm run tokens:validate');
  console.log('  3. Check for any warnings and review conversions');
  console.log('  4. Remove .backup files if migration was successful');
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateTokens();
}

export { processTokenFile, findTokenFiles };
