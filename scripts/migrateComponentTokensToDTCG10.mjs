#!/usr/bin/env node
/**
 * Component Token Migration Script
 *
 * Migrates literal values in component-level token files to DTCG 1.0 structured format.
 * Component token files use a custom format (prefix + tokens), but literal values
 * within them should be migrated to structured format for consistency.
 *
 * @author @darianrosebrook
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

/**
 * Convert hex color string to structured color value
 */
function hexToStructuredColor(hex) {
  hex = hex.replace(/^#/, '');

  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16) / 255;
    const g = parseInt(hex[1] + hex[1], 16) / 255;
    const b = parseInt(hex[2] + hex[2], 16) / 255;
    return { colorSpace: 'srgb', components: [r, g, b] };
  }

  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    return { colorSpace: 'srgb', components: [r, g, b] };
  }

  if (hex.length === 8) {
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    const alpha = parseInt(hex.substring(6, 8), 16) / 255;
    return { colorSpace: 'srgb', components: [r, g, b], alpha };
  }

  return null;
}

/**
 * Convert rgba/rgb string to structured color value
 */
function rgbaToStructuredColor(rgba) {
  const match = rgba.match(
    /(?:rgba?)\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/
  );
  if (!match) return null;

  const r = parseInt(match[1], 10) / 255;
  const g = parseInt(match[2], 10) / 255;
  const b = parseInt(match[3], 10) / 255;
  const alpha = match[4] ? parseFloat(match[4]) : undefined;

  return {
    colorSpace: 'srgb',
    components: [r, g, b],
    ...(alpha !== undefined && { alpha }),
  };
}

/**
 * Convert dimension string to structured dimension value
 */
function dimensionStringToStructured(dim) {
  // Handle "0" as a special case
  if (dim === '0' || dim === '0px' || dim === '0rem') {
    return { value: 0, unit: 'px' };
  }

  // Match patterns like "10px", "1.5rem", "50%", "-0.125rem", etc.
  const match = dim.match(/^(-?[\d.]+)(px|rem|em|%|vh|vw|vmin|vmax)$/);
  if (!match) return null;

  return {
    value: parseFloat(match[1]),
    unit: match[2],
  };
}

/**
 * Migrate a value in component tokens
 */
function migrateComponentValue(value) {
  if (typeof value === 'string') {
    // Skip references (they start with {)
    if (value.match(/^\{[^}]+\}$/)) {
      return value;
    }

    // Try dimension conversion
    const dim = dimensionStringToStructured(value);
    if (dim) return dim;

    // Try color conversion
    if (value.startsWith('#')) {
      const color = hexToStructuredColor(value);
      if (color) return color;
    }

    if (value.match(/^rgba?\(/)) {
      const color = rgbaToStructuredColor(value);
      if (color) return color;
    }

    // Keep other strings as-is
    return value;
  }

  // Keep numbers and other types as-is
  return value;
}

/**
 * Recursively migrate component token object
 */
function migrateComponentTokens(obj) {
  if (Array.isArray(obj)) {
    return obj.map((item) => migrateComponentTokens(item));
  }

  if (obj && typeof obj === 'object') {
    const migrated = {};

    for (const [key, value] of Object.entries(obj)) {
      // Skip $schema
      if (key === '$schema') {
        migrated[key] = value;
        continue;
      }

      // Recursively migrate nested objects
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        migrated[key] = migrateComponentTokens(value);
      } else {
        // Migrate leaf values
        migrated[key] = migrateComponentValue(value);
      }
    }

    return migrated;
  }

  return obj;
}

/**
 * Migrate a component token file
 */
function migrateComponentTokenFile(filePath) {
  try {
    console.log(`Migrating: ${path.relative(PROJECT_ROOT, filePath)}`);

    const content = fs.readFileSync(filePath, 'utf8');
    const tokens = JSON.parse(content);

    const migrated = migrateComponentTokens(tokens);

    // Write back with pretty formatting
    fs.writeFileSync(
      filePath,
      JSON.stringify(migrated, null, 2) + '\n',
      'utf8'
    );

    return true;
  } catch (error) {
    console.error(`Error migrating ${filePath}:`, error);
    return false;
  }
}

/**
 * Find all component token files
 */
function findComponentTokenFiles(dir) {
  const files = [];

  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...findComponentTokenFiles(fullPath));
    } else if (
      entry.isFile() &&
      entry.name.endsWith('.tokens.json') &&
      !entry.name.includes('generated')
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Main migration function
 */
function main() {
  const componentsDir = path.join(PROJECT_ROOT, 'ui', 'components');

  const files = findComponentTokenFiles(componentsDir);

  console.log(`Found ${files.length} component token files to migrate\n`);

  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
    if (migrateComponentTokenFile(file)) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log(`\nMigration complete:`);
  console.log(`  ✅ Success: ${successCount}`);
  console.log(`  ❌ Failed: ${failCount}`);

  if (failCount > 0) {
    process.exit(1);
  }
}

main();



