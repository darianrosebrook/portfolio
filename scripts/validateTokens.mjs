#!/usr/bin/env node
/**
 * Minimal DTCG-like validator for design tokens JSON.
 * Checks:
 *  - Reference syntax must be a whole value: {path.to.token}
 *  - Referenced path must exist and point to a node with $value
 *  - $type: "number" must have numeric $value (not string)
 *  - Flags calc()/rgba() with embedded refs as unsupported interpolation
 */

import fs from 'node:fs';
import path from 'node:path';

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: node scripts/validateTokens.mjs <path-to-tokens.json>');
  process.exit(2);
}

const absPath = path.isAbsolute(inputPath)
  ? inputPath
  : path.join(process.cwd(), inputPath);

/** @typedef {{
 *   path: string,
 *   node: any,
 *   parentType?: string
 * }} TokenNode
 */

/**
 * Read and parse JSON file.
 */
function readJson(file) {
  const raw = fs.readFileSync(file, 'utf8');
  return JSON.parse(raw);
}

/**
 * Build a map of all addressable nodes by dot-path and return list of token nodes.
 * A token node is any object with a $value property.
 */
function indexNodes(root) {
  /** @type {Record<string, any>} */
  const byPath = {};
  /** @type {TokenNode[]} */
  const tokens = [];

  /**
   * @param {any} node
   * @param {string[]} segs
   * @param {string|undefined} inheritedType
   */
  function walk(node, segs, inheritedType) {
    const currentPath = segs.join('.');
    if (typeof node !== 'object' || node === null) return;
    byPath[currentPath] = node;

    const thisType =
      typeof node.$type === 'string' ? node.$type : inheritedType;
    const keys = Object.keys(node);
    const isToken = Object.prototype.hasOwnProperty.call(node, '$value');
    if (isToken) {
      tokens.push({
        path: currentPath || '<root>',
        node,
        parentType: thisType,
      });
    }
    for (const key of keys) {
      if (key.startsWith('$')) continue; // skip meta keys
      walk(node[key], segs.concat(key), thisType);
    }
  }
  walk(root, [], undefined);
  return { byPath, tokens };
}

/**
 * Resolve a reference path like core.color.neutral.500 to a node with $value.
 */
function resolveRef(byPath, refPath) {
  const node = byPath[refPath];
  if (!node) return { ok: false, reason: 'path-not-found' };
  if (typeof node !== 'object' || node === null)
    return { ok: false, reason: 'not-an-object' };
  if (!Object.prototype.hasOwnProperty.call(node, '$value'))
    return { ok: false, reason: 'not-a-token' };
  return { ok: true };
}

/**
 * Detects a single-token reference value formatted as "{path.to.token}".
 */
function parseRefValue(value) {
  if (typeof value !== 'string') return { isRef: false };
  const trimmed = value.trim();
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}'))
    return { isRef: false };
  const inner = trimmed.slice(1, -1).trim();
  if (!inner) return { isRef: false };
  // basic sanity: no spaces, only token-like path segments
  if (/\s/.test(inner)) return { isRef: false };
  return { isRef: true, path: inner };
}

/**
 * Checks if a string value contains an embedded {ref} alongside other characters.
 */
function hasInterpolatedRef(value) {
  if (typeof value !== 'string') return false;
  const match = value.match(/\{[^}]+\}/g);
  if (!match) return false;
  // a pure ref is exactly one match that equals the whole string
  if (match.length === 1 && match[0] === value.trim()) return false;
  return true;
}

function isNumeric(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Validate tokens and collect issues.
 */
function validate(doc) {
  const { byPath, tokens } = indexNodes(doc);
  /** @type {{path: string, code: string, message: string, details?: any}[]} */
  const issues = [];

  for (const t of tokens) {
    const { path: tPath, node, parentType } = t;
    const value = node.$value;
    const type = typeof node.$type === 'string' ? node.$type : parentType;

    // number type must be numeric value
    if (type === 'number' && !isNumeric(value)) {
      issues.push({
        path: tPath,
        code: 'type.number.nonNumericValue',
        message: 'Token with $type "number" must have numeric $value',
        details: { value },
      });
    }

    // interpolation not allowed
    if (typeof value === 'string' && hasInterpolatedRef(value)) {
      issues.push({
        path: tPath,
        code: 'ref.interpolationNotAllowed',
        message:
          'Interpolated references are not allowed; value must be a single {ref}',
        details: { value },
      });
    }

    // if value is a pure {ref}, verify it exists and points to a token
    const ref = parseRefValue(value);
    if (ref.isRef) {
      const res = resolveRef(byPath, ref.path);
      if (!res.ok) {
        issues.push({
          path: tPath,
          code: 'ref.unresolved',
          message: `Unresolved reference: {${ref.path}}`,
          details: { reason: res.reason },
        });
      }
    }

    // also scan $extensions for bad refs or interpolation
    if (node.$extensions && typeof node.$extensions === 'object') {
      for (const [extKey, extVal] of Object.entries(node.$extensions)) {
        if (typeof extVal === 'string') {
          if (hasInterpolatedRef(extVal)) {
            issues.push({
              path: `${tPath}.$extensions.${extKey}`,
              code: 'ref.interpolationNotAllowed',
              message:
                'Interpolated references are not allowed inside $extensions',
              details: { value: extVal },
            });
          } else {
            const extRef = parseRefValue(extVal);
            if (extRef.isRef) {
              const res = resolveRef(byPath, extRef.path);
              if (!res.ok) {
                issues.push({
                  path: `${tPath}.$extensions.${extKey}`,
                  code: 'ref.unresolved',
                  message: `Unresolved reference: {${extRef.path}}`,
                  details: { reason: res.reason },
                });
              }
            }
          }
        } else if (typeof extVal === 'object' && extVal !== null) {
          // shallow scan nested objects for string values with refs
          for (const [k, v] of Object.entries(extVal)) {
            if (typeof v === 'string') {
              if (hasInterpolatedRef(v)) {
                issues.push({
                  path: `${tPath}.$extensions.${extKey}.${k}`,
                  code: 'ref.interpolationNotAllowed',
                  message:
                    'Interpolated references are not allowed inside $extensions',
                  details: { value: v },
                });
              } else {
                const nestedRef = parseRefValue(v);
                if (nestedRef.isRef) {
                  const res = resolveRef(byPath, nestedRef.path);
                  if (!res.ok) {
                    issues.push({
                      path: `${tPath}.$extensions.${extKey}.${k}`,
                      code: 'ref.unresolved',
                      message: `Unresolved reference: {${nestedRef.path}}`,
                      details: { reason: res.reason },
                    });
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return issues;
}

function main() {
  try {
    const doc = readJson(absPath);
    const issues = validate(doc);
    if (issues.length === 0) {
      console.log('OK: No issues found by custom validator.');
      process.exit(0);
    }
    console.log(`Found ${issues.length} issue(s):`);
    for (const issue of issues) {
      console.log(`- [${issue.code}] ${issue.path}: ${issue.message}`);
      if (issue.details) {
        console.log(`  details: ${JSON.stringify(issue.details)}`);
      }
    }
    process.exit(1);
  } catch (err) {
    console.error(
      'Failed to validate:',
      err instanceof Error ? err.message : err
    );
    process.exit(2);
  }
}

main();
