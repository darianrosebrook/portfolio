#!/usr/bin/env node

/**
 * W3C Design Tokens Validator CLI
 *
 * Command-line interface for validating design token files against the W3C DTCG 1.0 specification.
 *
 * Usage:
 *   node w3c-validator.mjs <file-or-directory>
 *
 * Example:
 *   node w3c-validator.mjs tokens.json
 *   node w3c-validator.mjs ./tokens/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load schema
const SCHEMA_PATH = path.join(__dirname, 'w3c-schema.json');
let schema;
try {
  const schemaContent = fs.readFileSync(SCHEMA_PATH, 'utf8');
  schema = JSON.parse(schemaContent);
} catch (error) {
  console.error(`[validator] Failed to load schema from ${SCHEMA_PATH}`);
  console.error(`[validator] Error: ${error.message}`);
  process.exit(1);
}

// Initialize validator
const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  strict: false,
  allowUnionTypes: true,
});

addFormats(ajv);
const validate = ajv.compile(schema);

/**
 * Validate a token file against the schema
 */
function validateTokenFile(filePath) {
  const result = {
    isValid: true,
    errors: [],
    warnings: [],
    tokens: null,
    filePath,
  };

  try {
    // Read and parse the file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const tokens = JSON.parse(fileContent);
    result.tokens = tokens;

    // Validate against schema
    const isSchemaValid = validate(tokens);

    if (!isSchemaValid) {
      result.isValid = false;
      result.errors.push(
        ...(validate.errors || []).map((error) => ({
          type: 'schema',
          path: error.instancePath || 'root',
          message: error.message,
          data: error.data,
          schema: error.schema,
        }))
      );
    }

    // Additional custom validations
    const customValidation = performCustomValidations(tokens, filePath);
    result.errors.push(...customValidation.errors);
    result.warnings.push(...customValidation.warnings);

    if (customValidation.errors.length > 0) {
      result.isValid = false;
    }
  } catch (error) {
    result.isValid = false;
    result.errors.push({
      type: 'parse',
      path: 'file',
      message: `Failed to parse JSON: ${error.message}`,
      data: null,
    });
  }

  return result;
}

/**
 * Perform custom validation rules beyond schema validation
 */
function performCustomValidations(tokens, filePath) {
  const errors = [];
  const warnings = [];

  // Track token references for circular dependency detection
  const tokenRefs = new Map();
  const visited = new Set();

  function validateNode(node, path = '') {
    if (!node || typeof node !== 'object') return;

    // Check if this is a token (has $value)
    if (node.$value !== undefined) {
      validateToken(node, path);
    }

    // Check if this is a group (has $type but no $value)
    if (node.$type && node.$value === undefined) {
      validateGroup(node, path);
    }

    // Recursively validate children
    for (const [key, value] of Object.entries(node)) {
      if (!key.startsWith('$') && typeof value === 'object') {
        validateNode(value, path ? `${path}.${key}` : key);
      }
    }
  }

  function validateToken(token, path) {
    // Check for required properties
    if (!token.$type && !token.$value) {
      warnings.push({
        type: 'missing-type',
        path,
        message: 'Token should have a $type property for better validation',
      });
    }

    // Validate token references
    if (typeof token.$value === 'string' && token.$value.match(/^\{[^}]+\}$/)) {
      const refPath = token.$value.slice(1, -1);
      tokenRefs.set(path, refPath);

      // Check for self-reference
      if (refPath === path) {
        errors.push({
          type: 'circular-reference',
          path,
          message: 'Token cannot reference itself',
        });
      }
    }

    // Type-specific validations
    if (token.$type) {
      validateTokenType(token, path);
    }
  }

  function validateGroup(group, path) {
    // Groups should have meaningful names
    if (path.length === 0) {
      warnings.push({
        type: 'naming',
        path,
        message: 'Root level groups should have descriptive names',
      });
    }
  }

  function validateTokenType(token, path) {
    const { $type, $value } = token;

    switch ($type) {
      case 'color':
        if (
          typeof $value === 'string' &&
          !$value.match(/^(#|rgb|hsl|oklch|\{)/)
        ) {
          warnings.push({
            type: 'color-format',
            path,
            message:
              'Color value should be a valid CSS color or token reference',
          });
        }
        break;

      case 'dimension':
        if (
          typeof $value === 'string' &&
          !$value.match(/^([0-9.-]+(px|rem|em|%|vh|vw)|0|\{|calc\()/)
        ) {
          warnings.push({
            type: 'dimension-format',
            path,
            message:
              'Dimension value should include units or be a token reference',
          });
        }
        break;

      case 'number':
        if (
          typeof $value !== 'number' &&
          !$value.toString().match(/^(\d+(\.\d+)?|\{)/)
        ) {
          warnings.push({
            type: 'number-format',
            path,
            message: 'Number value should be numeric or a token reference',
          });
        }
        break;
    }
  }

  // Start validation from root
  validateNode(tokens);

  // Check for circular references
  const circularRefs = detectCircularReferences(tokenRefs);
  errors.push(
    ...circularRefs.map((cycle) => ({
      type: 'circular-reference',
      path: cycle.join(' -> '),
      message: 'Circular reference detected in token chain',
    }))
  );

  return { errors, warnings };
}

/**
 * Detect circular references in token dependencies
 */
function detectCircularReferences(tokenRefs) {
  const cycles = [];
  const visited = new Set();
  const recursionStack = new Set();

  function dfs(node, path = []) {
    if (recursionStack.has(node)) {
      // Found a cycle
      const cycleStart = path.indexOf(node);
      cycles.push(path.slice(cycleStart).concat(node));
      return;
    }

    if (visited.has(node)) return;

    visited.add(node);
    recursionStack.add(node);
    path.push(node);

    const reference = tokenRefs.get(node);
    if (reference) {
      dfs(reference, [...path]);
    }

    recursionStack.delete(node);
  }

  for (const node of tokenRefs.keys()) {
    if (!visited.has(node)) {
      dfs(node);
    }
  }

  return cycles;
}

/**
 * Log validation results in a user-friendly format
 */
function logValidationResult(result) {
  const { isValid, errors, warnings, filePath } = result;
  const fileName = path.basename(filePath);

  if (isValid && warnings.length === 0) {
    console.log(`[validator] ✅ ${fileName} - Valid`);
    return;
  }

  if (warnings.length > 0) {
    console.log(`[validator] ⚠️  ${fileName} - ${warnings.length} warning(s)`);
    warnings.forEach((warning) => {
      console.log(
        `  Warning [${warning.type}] ${warning.path}: ${warning.message}`
      );
    });
  }

  if (!isValid) {
    console.log(`[validator] ❌ ${fileName} - ${errors.length} error(s)`);
    errors.forEach((error) => {
      console.log(`  Error [${error.type}] ${error.path}: ${error.message}`);
    });
  }
}

/**
 * Validate all token files in a directory
 */
function validateTokenDirectory(dirPath) {
  const results = [];

  if (!fs.existsSync(dirPath)) {
    console.error(`[validator] Directory not found: ${dirPath}`);
    return results;
  }

  const files = fs
    .readdirSync(dirPath)
    .filter((file) => file.endsWith('.json') || file.endsWith('.tokens.json'))
    .map((file) => path.join(dirPath, file));

  if (files.length === 0) {
    console.warn(`[validator] No JSON files found in ${dirPath}`);
    return results;
  }

  for (const filePath of files) {
    const result = validateTokenFile(filePath);
    results.push(result);
    logValidationResult(result);
  }

  return results;
}

// CLI interface
const targetPath = process.argv[2];

if (!targetPath) {
  console.error(
    '[validator] Usage: node w3c-validator.mjs <file-or-directory>'
  );
  console.error('[validator] Example: node w3c-validator.mjs tokens.json');
  process.exit(1);
}

if (!fs.existsSync(targetPath)) {
  console.error(`[validator] Target not found: ${targetPath}`);
  process.exit(1);
}

const stats = fs.statSync(targetPath);
let hasErrors = false;

if (stats.isDirectory()) {
  const results = validateTokenDirectory(targetPath);
  hasErrors = results.some((r) => !r.isValid);
} else {
  const result = validateTokenFile(targetPath);
  logValidationResult(result);
  hasErrors = !result.isValid;
}

process.exit(hasErrors ? 1 : 0);
