#!/usr/bin/env node

/**
 * Migration script to port missing tokens from oldDesignTokens.json to semantic.tokens.json
 * This script identifies and helps migrate the 57 critical missing tokens
 */

import fs from 'fs';
import path from 'path';

const OLD_TOKENS_PATH = 'ui/designTokens/oldDesignTokens.json';
const SEMANTIC_TOKENS_PATH = 'ui/designTokens/semantic.tokens.json';

// Helper function to get all token paths with their values
function getAllTokenPathsWithValues(obj, prefix = '') {
  const paths = [];
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && value.$value !== undefined) {
      paths.push({ path: currentPath, token: value });
    } else if (value && typeof value === 'object') {
      paths.push(...getAllTokenPathsWithValues(value, currentPath));
    }
  }
  return paths;
}

// Helper function to set a nested object value by path
function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
}

// Helper function to get a nested object value by path
function getNestedValue(obj, path) {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return null;
    }
  }

  return current;
}

function main() {
  console.log('🔄 Loading token files...');

  // Load both files
  const oldTokens = JSON.parse(fs.readFileSync(OLD_TOKENS_PATH, 'utf8'));
  const semanticTokens = JSON.parse(
    fs.readFileSync(SEMANTIC_TOKENS_PATH, 'utf8')
  );

  console.log('📊 Analyzing missing tokens...');

  // Get all token paths
  const oldPathsWithValues = getAllTokenPathsWithValues(oldTokens);
  const newPaths = getAllTokenPathsWithValues(semanticTokens).map(
    (item) => item.path
  );

  // Find missing tokens
  const missingInNew = oldPathsWithValues.filter(
    (item) => !newPaths.includes(item.path)
  );

  // Focus on critical tokens
  const criticalTokens = missingInNew.filter(
    (item) =>
      item.path.includes('semantic.color.foreground.') ||
      item.path.includes('semantic.color.background.') ||
      item.path.includes('semantic.color.border.') ||
      item.path.includes('semantic.color.status.') ||
      item.path.includes('core.motion.')
  );

  console.log(`\n🎯 Found ${criticalTokens.length} critical missing tokens`);

  // Group tokens by category for better organization
  const grouped = {};
  criticalTokens.forEach(({ path, token }) => {
    const category = path.split('.')[0] + '.' + path.split('.')[1];
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push({ path, token });
  });

  console.log('\n📋 Missing tokens by category:');
  Object.entries(grouped).forEach(([category, tokens]) => {
    console.log(`\n  ${category}: ${tokens.length} tokens`);
    tokens.forEach(({ path, token }) => {
      console.log(`    - ${path}: ${token.$value}`);
    });
  });

  // Generate migration suggestions
  console.log('\n🚀 Migration Recommendations:');
  console.log('\n1. Add these motion tokens to core.tokens.json:');
  const motionTokens = criticalTokens.filter((t) =>
    t.path.startsWith('core.motion')
  );
  motionTokens.forEach(({ path, token }) => {
    console.log(`   ${path}: ${token.$value}`);
  });

  console.log('\n2. Add these semantic tokens to semantic.tokens.json:');
  const semanticColorTokens = criticalTokens.filter((t) =>
    t.path.startsWith('semantic.color')
  );
  semanticColorTokens.forEach(({ path, token }) => {
    console.log(`   ${path}: ${token.$value}`);
  });

  // Create a backup and migration file
  const backupPath = SEMANTIC_TOKENS_PATH + '.backup';
  fs.writeFileSync(backupPath, JSON.stringify(semanticTokens, null, 2));
  console.log(`\n💾 Created backup: ${backupPath}`);

  // Generate a migration patch file
  const migrationData = {
    timestamp: new Date().toISOString(),
    totalMissing: criticalTokens.length,
    categories: Object.keys(grouped),
    tokens: criticalTokens.map(({ path, token }) => ({
      path,
      value: token.$value,
      description: token.$description || '',
      extensions: token.$extensions || {},
    })),
  };

  const migrationPath = 'migration-tokens.json';
  fs.writeFileSync(migrationPath, JSON.stringify(migrationData, null, 2));
  console.log(`📄 Created migration data: ${migrationPath}`);

  console.log('\n✅ Migration analysis complete!');
  console.log('\nNext steps:');
  console.log('1. Review the migration-tokens.json file');
  console.log(
    '2. Add missing tokens to appropriate files (core.tokens.json or semantic.tokens.json)'
  );
  console.log('3. Run npm run tokens:build to regenerate CSS');
  console.log('4. Test your site to ensure all colors are working');
}

main().catch(console.error);
