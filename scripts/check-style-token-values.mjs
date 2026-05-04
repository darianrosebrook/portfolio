#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const targetDirs = [
  'ui/components/AnimatedCard',
  'ui/components/AnimatedSection',
  'ui/components/AnimatedText',
  'ui/components/BrandSwitcher',
  'ui/components/Select',
  'ui/components/Skeleton',
  'ui/components/SlinkyCursor',
  'ui/components/Spinner',
];

const tokenRequiredPropertyPattern =
  /(?:^|-)color$|background|border|box-shadow|caret-color|column-gap|gap|font-size|font-weight|letter-spacing|margin|outline|padding|radius|row-gap|text-shadow|transition|animation/i;

const allowedPrimitiveValues = new Set([
  '0',
  'auto',
  'currentcolor',
  'currentColor',
  'inherit',
  'initial',
  'none',
  'none !important',
  'normal',
  'transparent',
  'unset',
]);

const allowedDimensionValues = new Set(['1px', '100%', '50%', '999px']);

function collectScssFiles(directory) {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectScssFiles(entryPath);
    }

    if (
      entry.isFile() &&
      entry.name.endsWith('.module.scss') &&
      !entry.name.endsWith('.tokens.generated.scss')
    ) {
      return [entryPath];
    }

    return [];
  });
}

function stripInlineComment(line) {
  return line.replace(/\/\/.*$/, '').trim();
}

function hasTokenReference(value) {
  return /var\(\s*--[A-Za-z0-9_-]+/.test(value);
}

function isCustomProperty(property) {
  return property.startsWith('--');
}

function isAllowedPrimitive(value) {
  const normalized = value.trim();

  if (
    allowedPrimitiveValues.has(normalized) ||
    allowedDimensionValues.has(normalized)
  ) {
    return true;
  }

  if (/^calc\([^)]*var\(--/.test(normalized)) {
    return true;
  }

  if (/^[a-z-]+\($/.test(normalized)) {
    return true;
  }

  if (/^center\s*\/\s*contain\s+no-repeat$/.test(normalized)) {
    return true;
  }

  if (/^color-mix\(/.test(normalized) && hasTokenReference(normalized)) {
    return true;
  }

  if (/^repeat\(/.test(normalized) || /^minmax\(/.test(normalized)) {
    return true;
  }

  return false;
}

function shouldCheckProperty(property) {
  return tokenRequiredPropertyPattern.test(property);
}

function analyzeFile(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const findings = [];

  content.split(/\r?\n/).forEach((rawLine, index) => {
    const line = stripInlineComment(rawLine);
    const match = line.match(/^([A-Za-z-]+|--[A-Za-z0-9_-]+)\s*:\s*(.+?);?$/);

    if (!match) {
      return;
    }

    const [, property, rawValue] = match;
    const value = rawValue.replace(/;$/, '').trim();

    if (isCustomProperty(property) || !shouldCheckProperty(property)) {
      return;
    }

    if (hasTokenReference(value) || isAllowedPrimitive(value)) {
      return;
    }

    findings.push({
      file: path.relative(rootDir, filePath),
      line: index + 1,
      property,
      value,
    });
  });

  return findings;
}

const findings = targetDirs
  .flatMap((targetDir) => collectScssFiles(path.join(rootDir, targetDir)))
  .flatMap(analyzeFile);

if (findings.length > 0) {
  console.error('Style token value violations found:');
  findings.forEach((finding) => {
    console.error(
      `${finding.file}:${finding.line} ${finding.property}: ${finding.value}`
    );
  });
  process.exit(1);
}

console.log('Style token value check passed');
