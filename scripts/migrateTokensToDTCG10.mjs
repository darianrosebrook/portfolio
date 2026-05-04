#!/usr/bin/env node
/**
 * Design Tokens Migration Script
 *
 * Migrates design tokens from legacy format to DTCG 1.0 (2025.10) compliant format:
 * - Converts hex/rgb color strings to structured color objects
 * - Converts dimension strings (e.g., "10px") to structured objects {value, unit}
 * - Converts shadow CSS strings to structured shadow objects
 * - Fixes non-standard $type values (opacity -> number, borderRadius -> dimension, etc.)
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
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Handle 3-digit hex
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16) / 255;
    const g = parseInt(hex[1] + hex[1], 16) / 255;
    const b = parseInt(hex[2] + hex[2], 16) / 255;
    return { colorSpace: 'srgb', components: [r, g, b] };
  }

  // Handle 6-digit hex
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    return { colorSpace: 'srgb', components: [r, g, b] };
  }

  // Handle 8-digit hex (with alpha)
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
  // Match rgba(r, g, b, a) or rgb(r, g, b)
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
  if (dim === '0' || dim === '0px') {
    return { value: 0, unit: 'px' };
  }

  // Match patterns like "10px", "1.5rem", "50%", etc.
  const match = dim.match(/^([\d.]+)(px|rem|em|%|vh|vw|vmin|vmax)$/);
  if (!match) return null;

  return {
    value: parseFloat(match[1]),
    unit: match[2],
  };
}

/**
 * Parse shadow CSS string to structured shadow value
 * Note: This is a simplified parser - complex shadows may need manual review
 */
function parseShadowString(shadowStr) {
  const parts = shadowStr.trim().split(/\s+/);
  if (parts.length < 4) return null;

  let offsetX = { value: 0, unit: 'px' };
  let offsetY = { value: 0, unit: 'px' };
  let blur = { value: 0, unit: 'px' };
  let spread;
  let color = null;
  let inset = false;

  let i = 0;

  // Check for inset keyword
  if (parts[i] === 'inset') {
    inset = true;
    i++;
  }

  // Parse offsetX
  const offsetXMatch = dimensionStringToStructured(parts[i]);
  if (offsetXMatch) {
    offsetX = offsetXMatch;
    i++;
  }

  // Parse offsetY
  const offsetYMatch = dimensionStringToStructured(parts[i]);
  if (offsetYMatch) {
    offsetY = offsetYMatch;
    i++;
  }

  // Parse blur
  const blurMatch = dimensionStringToStructured(parts[i]);
  if (blurMatch) {
    blur = blurMatch;
    i++;
  }

  // Parse spread (optional)
  if (i < parts.length) {
    const spreadMatch = dimensionStringToStructured(parts[i]);
    if (spreadMatch) {
      spread = spreadMatch;
      i++;
    }
  }

  // Parse color (remaining parts)
  const colorStr = parts.slice(i).join(' ');
  if (colorStr) {
    // Try hex first
    color = hexToStructuredColor(colorStr);
    if (!color) {
      // Try rgba/rgb
      color = rgbaToStructuredColor(colorStr);
    }
    if (!color) {
      // Fallback: use black
      color = { colorSpace: 'srgb', components: [0, 0, 0] };
    }
  }

  const result = { offsetX, offsetY, blur, color };
  if (spread) result.spread = spread;
  if (inset) result.inset = inset;

  return result;
}

/**
 * Migrate a token value based on its type
 */
function migrateTokenValue(value, type) {
  if (typeof value === 'string') {
    // Handle color types
    if (type === 'color') {
      // Try hex
      if (value.startsWith('#')) {
        const structured = hexToStructuredColor(value);
        if (structured) return structured;
      }
      // Try rgba/rgb
      if (value.match(/^rgba?\(/)) {
        const structured = rgbaToStructuredColor(value);
        if (structured) return structured;
      }
      // If it's already a reference, keep it
      if (value.match(/^\{[^}]+\}$/)) {
        return value;
      }
    }

    // Handle dimension types
    if (type === 'dimension') {
      const structured = dimensionStringToStructured(value);
      if (structured) return structured;
      // If it's already a reference, keep it
      if (value.match(/^\{[^}]+\}$/)) {
        return value;
      }
    }

    // Handle shadow types
    if (type === 'shadow') {
      // Check if it's a reference first
      if (value.match(/^\{[^}]+\}$/)) {
        return value;
      }
      // Handle multiple shadows (comma-separated)
      if (value.includes(',')) {
        const shadows = value
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s);
        const parsedShadows = shadows
          .map((shadow) => parseShadowString(shadow))
          .filter((s) => s);
        if (parsedShadows.length > 0) {
          return parsedShadows;
        }
      }
      // Try to parse as single shadow string
      const structured = parseShadowString(value);
      if (structured) return structured;
    }

    // Keep string values as-is for other types
    return value;
  }

  // Keep non-string values as-is
  return value;
}

/**
 * Fix non-standard $type values
 */
function fixTokenType(type) {
  if (!type) return type;

  const typeMap = {
    opacity: 'number',
    spacing: 'dimension',
    radius: 'dimension',
    borderRadius: 'dimension',
    elevation: 'shadow',
  };

  return typeMap[type] || type;
}

/**
 * Recursively migrate a token object
 */
function migrateTokenObject(obj) {
  if (Array.isArray(obj)) {
    return obj.map((item) => migrateTokenObject(item));
  }

  if (obj && typeof obj === 'object') {
    const migrated = {};

    for (const [key, value] of Object.entries(obj)) {
      // Skip $schema
      if (key === '$schema') {
        migrated[key] = value;
        continue;
      }

      // Migrate token properties
      if (key === '$type') {
        migrated[key] = fixTokenType(value);
      } else if (key === '$value') {
        const type = obj.$type || '';
        migrated[key] = migrateTokenValue(value, fixTokenType(type) || '');
      } else {
        // Recursively migrate nested objects
        migrated[key] = migrateTokenObject(value);
      }
    }

    return migrated;
  }

  return obj;
}

/**
 * Migrate a token file
 */
function migrateTokenFile(filePath) {
  try {
    console.log(`Migrating: ${path.relative(PROJECT_ROOT, filePath)}`);

    const content = fs.readFileSync(filePath, 'utf8');
    const tokens = JSON.parse(content);

    const migrated = migrateTokenObject(tokens);

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
 * Find all token files to migrate
 */
function findTokenFiles(dir) {
  const files = [];

  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...findTokenFiles(fullPath));
    } else if (
      entry.isFile() &&
      entry.name.endsWith('.tokens.json') &&
      !entry.name.startsWith('_')
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
  const tokensDir = path.join(PROJECT_ROOT, 'ui', 'designTokens');
  const coreDir = path.join(tokensDir, 'core');
  const semanticDir = path.join(tokensDir, 'semantic');

  const files = [];

  // Add core token files
  if (fs.existsSync(coreDir)) {
    files.push(...findTokenFiles(coreDir));
  }

  // Add semantic token files
  if (fs.existsSync(semanticDir)) {
    files.push(...findTokenFiles(semanticDir));
  }

  console.log(`Found ${files.length} token files to migrate\n`);

  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
    if (migrateTokenFile(file)) {
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
