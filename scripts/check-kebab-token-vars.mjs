#!/usr/bin/env node
/**
 * Fail component SCSS when generated-token references use camelCase segments.
 *
 * Component token generators may preserve a historical camelCase component
 * prefix, such as `--profileFlag-*`. The generated token path segments after
 * that prefix are kebab-case. This guard catches drift such as
 * `--button-focus-outlineWidth`, which does not resolve against generated SCSS.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const componentsDir = path.join(rootDir, 'ui', 'components');
const varCallPattern = /var\(\s*(--[A-Za-z0-9_-]+)(?=\s*[,)]|\s*$)/g;

function findScssFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findScssFiles(entryPath));
      continue;
    }
    if (
      entry.isFile() &&
      entry.name.endsWith('.scss') &&
      !entry.name.endsWith('.tokens.generated.scss')
    ) {
      files.push(entryPath);
    }
  }
  return files;
}

function hasCamelCaseAfterPrefix(tokenName) {
  const parts = tokenName.replace(/^--/, '').split('-');
  if (parts.length <= 1) {
    return false;
  }

  return parts.slice(1).some((part) => /[a-z0-9][A-Z]/.test(part));
}

const failures = [];

for (const scssFile of findScssFiles(componentsDir)) {
  const content = fs.readFileSync(scssFile, 'utf8');
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    let match;
    while ((match = varCallPattern.exec(line)) !== null) {
      const tokenName = match[1];
      if (hasCamelCaseAfterPrefix(tokenName)) {
        failures.push({
          file: path.relative(rootDir, scssFile),
          line: index + 1,
          tokenName,
        });
      }
    }
    varCallPattern.lastIndex = 0;
  });
}

if (failures.length === 0) {
  console.log('Component token variables use kebab-case path segments.');
  process.exit(0);
}

console.error(
  `Found ${failures.length} camelCase component token reference(s):`
);
for (const failure of failures) {
  console.error(
    `  ${failure.file}:${failure.line} - ${failure.tokenName}`
  );
}

process.exit(1);
