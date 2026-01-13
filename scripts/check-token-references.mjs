#!/usr/bin/env node
/**
 * Script to find components with broken design token references
 * Checks for mismatches between SCSS variable usage and generated token names
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

function findComponentDirs() {
  const componentsDir = join(rootDir, 'ui/components');
  const dirs = [];

  for (const item of readdirSync(componentsDir)) {
    const itemPath = join(componentsDir, item);
    if (statSync(itemPath).isDirectory()) {
      dirs.push(itemPath);
    }
  }

  return dirs;
}

function getTokenPrefix(componentDir) {
  const componentName = basename(componentDir);
  // Convert PascalCase to kebab-case
  return componentName
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
}

function findTokenFiles(componentDir) {
  const files = [];
  try {
    for (const item of readdirSync(componentDir)) {
      if (item.endsWith('.tokens.generated.scss')) {
        files.push(join(componentDir, item));
      }
    }
  } catch (e) {
    // Directory might not exist or be readable
  }
  return files;
}

function findScssFiles(componentDir) {
  const files = [];
  try {
    for (const item of readdirSync(componentDir)) {
      if (item.endsWith('.module.scss') || item.endsWith('.scss')) {
        files.push(join(componentDir, item));
      }
    }
  } catch (e) {
    // Directory might not exist or be readable
  }
  return files;
}

function extractTokenNames(tokenFile) {
  const content = readFileSync(tokenFile, 'utf-8');
  const tokenNames = new Set();

  // Match CSS variable declarations: --token-name: ...
  const regex = /--([a-z0-9-]+):/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    tokenNames.add(`--${match[1]}`);
  }

  return tokenNames;
}

function extractUsedTokens(scssFile) {
  const content = readFileSync(scssFile, 'utf-8');
  const usedTokens = new Set();

  // Match var(--token-name) or var(--token-name, fallback)
  const regex = /var\((--[a-z0-9-]+)\)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    usedTokens.add(match[1]);
  }

  return usedTokens;
}

function checkComponent(componentDir) {
  const componentName = basename(componentDir);
  const tokenFiles = findTokenFiles(componentDir);
  const scssFiles = findScssFiles(componentDir);

  if (tokenFiles.length === 0 || scssFiles.length === 0) {
    return null; // Skip components without tokens or SCSS
  }

  // Get all available tokens from generated files
  const availableTokens = new Set();
  for (const tokenFile of tokenFiles) {
    const tokens = extractTokenNames(tokenFile);
    tokens.forEach((t) => availableTokens.add(t));
  }

  // Check all SCSS files for broken references
  const brokenRefs = [];
  for (const scssFile of scssFiles) {
    const usedTokens = extractUsedTokens(scssFile);

    for (const usedToken of usedTokens) {
      // Skip semantic/core tokens (they're external)
      if (
        usedToken.startsWith('--semantic-') ||
        usedToken.startsWith('--core-') ||
        usedToken.startsWith('--font-')
      ) {
        continue;
      }

      // Check if token exists in available tokens
      if (!availableTokens.has(usedToken)) {
        // Check if there's a similar token (maybe missing -default suffix)
        const hasSimilar = Array.from(availableTokens).some((available) => {
          return (
            available.includes(usedToken.replace('--', '')) ||
            usedToken.includes(available.replace('--', ''))
          );
        });

        brokenRefs.push({
          file: scssFile.replace(rootDir + '/', ''),
          token: usedToken,
          hasSimilar,
        });
      }
    }
  }

  if (brokenRefs.length > 0) {
    return {
      component: componentName,
      brokenRefs,
    };
  }

  return null;
}

// Main execution
console.log('🔍 Checking for broken design token references...\n');

const componentDirs = findComponentDirs();
const issues = [];

for (const componentDir of componentDirs) {
  const result = checkComponent(componentDir);
  if (result) {
    issues.push(result);
  }
}

if (issues.length === 0) {
  console.log('✅ No broken token references found!');
  process.exit(0);
}

console.log(
  `❌ Found ${issues.length} component(s) with broken token references:\n`
);

for (const issue of issues) {
  console.log(`📦 ${issue.component}:`);
  for (const ref of issue.brokenRefs) {
    const similar = ref.hasSimilar ? ' (similar token exists)' : '';
    console.log(`   ${ref.file}`);
    console.log(`   └─ ${ref.token}${similar}`);
  }
  console.log('');
}

process.exit(1);
