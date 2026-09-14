#!/usr/bin/env node
// Generate component-scoped CSS custom properties from component token JSON files
//
// Every `{semantic.*}` / `{core.*}` reference is emitted as
// `var(--semantic-x, <literal>)` where the literal is the token's
// default-theme value resolved from app/designTokens.scss (first assignment
// wins; later theme/brand blocks are overrides, not defaults). Components
// stay renderable even if the global token stylesheet fails to load, and
// contract `fallback` values become observable at runtime.
//
// Ordering: run `npm run tokens:global` (or `tokens:build`) before this
// script so fallback literals reflect the current token sources.
// Usage: node utils/designTokens/generateCSSTokens.mjs

import fs from 'fs';
import path from 'path';
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..', '..');

const COMPONENTS_DIR = path.join(projectRoot, 'ui');
const SYSTEM_TOKENS_PATH = path.join(COMPONENTS_DIR, 'designTokens.json');
const GLOBAL_TOKENS_SCSS_PATH = path.join(
  projectRoot,
  'app',
  'designTokens.scss'
);

/**
 * Convert DTCG 1.0 structured color value to CSS string
 */
function colorValueToCSS(colorValue) {
  const { colorSpace, components, alpha } = colorValue;
  const hasAlpha = alpha !== undefined && alpha < 1;

  // Convert to RGB first for most color spaces
  let rgb = null;

  if (colorSpace === 'srgb' && components.length >= 3) {
    rgb = {
      r: Math.round(components[0] * 255),
      g: Math.round(components[1] * 255),
      b: Math.round(components[2] * 255),
    };
  }

  if (!rgb) {
    // Fallback: construct CSS color string directly
    return `${colorSpace}(${components.join(' ')}${
      hasAlpha ? ` / ${alpha}` : ''
    })`;
  }

  // Convert to hex (default format for component tokens)
  const toHex = (n) => n.toString(16).padStart(2, '0');
  const hex = `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  return hasAlpha && alpha !== undefined
    ? hex + toHex(Math.round(alpha * 255))
    : hex;
}

/**
 * Convert DTCG 1.0 structured dimension value to CSS string
 */
function dimensionValueToCSS(dimensionValue) {
  return `${dimensionValue.value}${dimensionValue.unit}`;
}

/**
 * Check if value is a structured color value
 */
function isStructuredColorValue(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    'colorSpace' in value &&
    'components' in value &&
    Array.isArray(value.components)
  );
}

/**
 * Check if value is a structured dimension value
 */
function isStructuredDimensionValue(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    'value' in value &&
    'unit' in value &&
    typeof value.value === 'number' &&
    typeof value.unit === 'string'
  );
}

/**
 * Determine if a token path belongs to semantic or core namespace based on patterns
 * This matches the logic in utils/designTokens/core/index.ts
 */
function determineNamespace(tokenPath) {
  // Already prefixed
  if (tokenPath.startsWith('core.')) return 'core';
  if (tokenPath.startsWith('semantic.')) return 'semantic';

  // Core token patterns (these are primitives/palettes)
  const corePatterns = [
    /^color\.(mode|palette|datavis)/, // color.mode.*, color.palette.*, color.datavis.*
    /^typography\.(fontFamily|weight|ramp|lineHeight|letterSpacing|features)/, // typography.fontFamily.*, typography.weight.*, etc.
    /^spacing\.size/, // spacing.size.*
    /^elevation\.(level|offset|blur|spread)/, // elevation.level.*, elevation.offset.*, etc.
    /^opacity\.(50|100|200|300|400|500|600|700|800|900|full)/, // opacity.50, opacity.100, etc.
    /^dimension\.(breakpoint|tapTarget|actionMinHeight)/, // dimension.breakpoint.*, etc.
    /^shape\.(radius|borderWidth|borderStyle|border\.width|border\.style)/, // shape.radius.*, shape.borderWidth.*, shape.border.width.*, etc.
    /^motion\.(duration|easing|keyframes|delay|stagger)/, // motion.duration.*, motion.easing.*, etc.
    /^scale\./, // scale.*
    /^density\./, // density.*
    /^layer\./, // layer.*
    /^layout\./, // layout.*
    /^icon\./, // icon.*
    /^effect\./, // effect.*
  ];

  // If it matches core patterns, it's core
  if (corePatterns.some((pattern) => pattern.test(tokenPath))) {
    return 'core';
  }

  // Everything else is semantic (foreground, background, border, action, feedback, etc.)
  return 'semantic';
}

/**
 * Convert token path to CSS custom property name with namespace prefix
 * This matches the logic in utils/designTokens/core/index.ts
 */
function tokenPathToCSSVar(tokenPath, prefix = '--') {
  // Determine namespace
  const namespace = determineNamespace(tokenPath);

  // Remove namespace prefix if present (we'll add it back)
  const pathWithoutNamespace = tokenPath.replace(/^(core|semantic)\./, '');

  // Convert path to CSS variable format
  const cssVarName = pathWithoutNamespace
    .replace(/\./g, '-') // Convert dots to hyphens first
    .replace(/[A-Z]/g, (m) => '-' + m.toLowerCase()) // Convert camelCase
    .replace(/[\s_]/g, '-') // Convert spaces and underscores
    .replace(/[^a-z0-9-]/g, '') // Remove any remaining invalid characters
    .replace(/-+/g, '-'); // Collapse multiple hyphens into one

  // Add namespace prefix if determined
  const namespacePrefix = namespace ? `${namespace}-` : '';

  return prefix + namespacePrefix + cssVarName;
}

/**
 * Convert a token reference string like "{semantic.color.background.primary}"
 * into a CSS variable reference using the same naming convention as the global generator.
 * Also handles DTCG 1.0 structured values (color and dimension objects).
 */
/**
 * Build a fallback resolver over generated global-token CSS
 * (app/designTokens.scss).
 *
 * Resolution rule: the FIRST assignment of a custom property in file order is
 * its default value. The file declares layers in cascade order
 * (core, semantic, theme, brand), so first occurrence = default theme, while
 * later occurrences are [data-theme] / [data-brand] overrides that must NOT
 * leak into fallback literals.
 *
 * Returns a function (cssVarName) => literal | null. Chains of the form
 * `--a: var(--b)` are chased; `--a: var(--b, <lit>)` falls back to <lit> when
 * --b is absent. Garbage literals (`[object Object]`, `undefined`, `NaN`)
 * resolve to null so they are never emitted.
 */
function buildFallbackResolver(scssContent) {
  if (!scssContent || typeof scssContent !== 'string') {
    return () => null;
  }

  const firstAssignment = new Map();
  const assignmentRe = /--([a-zA-Z][a-zA-Z0-9-]+):\s*([^;]+);/g;
  for (const [, name, raw] of scssContent.matchAll(assignmentRe)) {
    if (!firstAssignment.has(name)) {
      firstAssignment.set(name, raw.trim());
    }
  }

  const GARBAGE_RE = /\[object Object\]|undefined|NaN/;
  const VAR_RE = /^var\(\s*--([a-zA-Z][a-zA-Z0-9-]+)\s*(?:,\s*(.+))?\)$/;
  const MAX_CHAIN_DEPTH = 12;

  function resolve(varName, seen = new Set()) {
    const name = String(varName).replace(/^--/, '');
    if (seen.has(name) || seen.size >= MAX_CHAIN_DEPTH) return null;
    seen.add(name);

    const raw = firstAssignment.get(name);
    if (raw === undefined) return null;

    const varMatch = raw.match(VAR_RE);
    if (varMatch) {
      const chained = resolve(`--${varMatch[1]}`, seen);
      if (chained !== null) return chained;
      if (varMatch[2] !== undefined) {
        const literal = varMatch[2].trim();
        return GARBAGE_RE.test(literal) ? null : literal;
      }
      return null;
    }

    // Multi-var shorthands (e.g. `var(--a) var(--b)`) have no single literal.
    if (raw.startsWith('var(')) return null;
    return GARBAGE_RE.test(raw) ? null : raw;
  }

  return resolve;
}

function refToCssVar(value, resolveFallback = null) {
  // Handle DTCG 1.0 structured values
  if (isStructuredColorValue(value)) {
    return colorValueToCSS(value);
  }

  if (isStructuredDimensionValue(value)) {
    return dimensionValueToCSS(value);
  }

  // Handle string values (references or literals)
  if (typeof value === 'string') {
    const refMatch = value.match(/^\{([^}]+)\}$/);
    if (!refMatch) return value; // literal value (number/dimension/string)
    const tokenPath = refMatch[1];

    // Use the same CSS variable naming convention as the global generator
    // This now includes namespace prefixes (--semantic- or --core-)
    const cssVarName = tokenPathToCSSVar(tokenPath);

    const fallbackLiteral =
      typeof resolveFallback === 'function'
        ? resolveFallback(cssVarName)
        : null;
    if (fallbackLiteral !== null && fallbackLiteral !== undefined) {
      return `var(${cssVarName}, ${fallbackLiteral})`;
    }
    return `var(${cssVarName})`;
  }

  // Handle numbers and other primitives
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  // Fallback: convert to string
  return String(value);
}

/**
 * Convert camelCase string to kebab-case
 * Example: "paddingY" -> "padding-y", "maxWidth" -> "max-width"
 */
function camelToKebab(str) {
  return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

/**
 * Normalize a path segment array to kebab-case
 * Converts camelCase keys to kebab-case for CSS custom property naming
 */
function normalizePathToKebab(pathSegments) {
  return pathSegments.map((segment) => camelToKebab(segment)).join('-');
}

/**
 * Walk a nested token object producing a grouped structure with flat tokens
 * Returns: { groups: { groupName: { tokens: {}, path: [] } }, flat: {} }
 */
function flattenTokens(obj, prefixSegments) {
  const groups = {};
  const flat = {};

  for (const [key, val] of Object.entries(obj)) {
    const nextPath = [...prefixSegments, key];

    // Check if this is a structured DTCG 1.0 value (don't flatten these)
    if (isStructuredColorValue(val) || isStructuredDimensionValue(val)) {
      const tokenName = normalizePathToKebab(nextPath);
      flat[tokenName] = val;
      continue;
    }

    if (val && typeof val === 'object' && !Array.isArray(val)) {
      // This is a group - recurse and collect its tokens
      const result = flattenTokens(val, nextPath);

      // If this is a top-level group (depth 1), create a group entry
      if (prefixSegments.length === 0) {
        const groupTokens = {};
        Object.entries(result.flat).forEach(([tokenName, tokenValue]) => {
          groupTokens[tokenName] = tokenValue;
          flat[tokenName] = tokenValue;
        });

        groups[key] = {
          tokens: groupTokens,
          path: nextPath,
        };
      } else {
        // Nested object - merge into parent
        Object.assign(flat, result.flat);
        Object.assign(groups, result.groups);
      }
    } else {
      // Leaf token - normalize to kebab-case
      const tokenName = normalizePathToKebab(nextPath);
      flat[tokenName] = val;
    }
  }

  return { groups, flat };
}

/**
 * The box-model slot pool: the shared, component-agnostic layout override
 * surface (adopted from the FSDS design system's box-model primitive).
 * Component tokens.json files declare defaults for these slots under a
 * reserved top-level `boxModel` group; the generator emits them as shared
 * `--ds-box-model-<slot>` custom properties instead of component-prefixed
 * ones, so consumers can override layout uniformly across components.
 *
 * Longhand-only by design: shorthand and axis slots (padding, padding-block,
 * padding-inline) are deliberately excluded to avoid the
 * shorthand-vs-longhand cascade confusion the FSDS implementation documents.
 */
const BOX_MODEL_SLOTS = [
  'padding-block-start',
  'padding-block-end',
  'padding-inline-start',
  'padding-inline-end',
  'gap',
  'width',
  'min-width',
  'max-width',
  'height',
  'min-height',
  'max-height',
];

const BOX_MODEL_NAME_PREFIX = 'box-model-';

/**
 * Map a flattened token name to its emitted custom-property name.
 * Component tokens get the `--ds-<component>-` prefix; names under the
 * reserved `boxModel` group (flattened to `box-model-<slot>`) map to the
 * shared slot pool. Unknown slot names fail loud.
 */
function cssVarNameFor(cssVarPrefix, name) {
  if (name.startsWith(BOX_MODEL_NAME_PREFIX)) {
    const slot = name.slice(BOX_MODEL_NAME_PREFIX.length);
    if (!BOX_MODEL_SLOTS.includes(slot)) {
      throw new Error(
        `Unknown box-model slot "${slot}". Valid slots: ${BOX_MODEL_SLOTS.join(', ')}.`
      );
    }
    return `--ds-box-model-${slot}`;
  }
  return `--ds-${cssVarPrefix}-${name}`;
}

/**
 * Build CSS content for a component's tokens — emits an unlayered rule
 * scoped to `[data-ds-component="Pascal"]`. Custom properties are
 * prefixed with `--ds-<component>-` per the migration playbook, except
 * the reserved boxModel group which emits shared `--ds-box-model-*`
 * slot names.
 *
 * Intentionally NOT wrapped in `@layer components`. Unlayered rules
 * beat the unlayered CSS reset (`* { padding: 0; min-height: 0; }`)
 * via specificity, where `[data-ds-component="X"].class` (0,2,1)
 * out-specifies the universal selector (0,0,0). Putting the component
 * rules in a layer would lose that specificity battle because layered
 * rules always lose to unlayered ones, regardless of selector weight.
 *
 */
function buildCssForComponent({
  cssVarPrefix,
  pascalComponent,
  tokenData,
  resolveFallback = null,
}) {
  const { groups, flat } = tokenData;
  // Body lines live at column 2 (one level inside the selector).
  const body = [];

  // Process groups first
  if (Object.keys(groups).length > 0) {
    Object.entries(groups).forEach(([groupName, groupData]) => {
      const groupTitle = groupName.charAt(0).toUpperCase() + groupName.slice(1);
      body.push(`  /* === ${groupTitle} Tokens === */`);

      Object.entries(groupData.tokens).forEach(([name, raw]) => {
        body.push(
          `  ${cssVarNameFor(cssVarPrefix, name)}: ${refToCssVar(raw, resolveFallback)};`
        );
      });

      body.push('');
    });
  }

  // Top-level tokens that aren't in any group
  const topLevelTokens = {};
  for (const [key, val] of Object.entries(flat)) {
    let inGroup = false;
    for (const groupData of Object.values(groups)) {
      if (key in groupData.tokens) {
        inGroup = true;
        break;
      }
    }
    if (!inGroup) {
      topLevelTokens[key] = val;
    }
  }

  if (Object.keys(topLevelTokens).length > 0) {
    if (Object.keys(groups).length > 0) {
      body.push('  /* === Other Tokens === */');
    }
    Object.entries(topLevelTokens).forEach(([name, raw]) => {
      body.push(
        `  ${cssVarNameFor(cssVarPrefix, name)}: ${refToCssVar(raw, resolveFallback)};`
      );
    });
  } else if (Object.keys(groups).length === 0) {
    Object.entries(flat).forEach(([name, raw]) => {
      body.push(
        `  ${cssVarNameFor(cssVarPrefix, name)}: ${refToCssVar(raw, resolveFallback)};`
      );
    });
  }

  // Trim trailing blank
  if (body[body.length - 1] === '') {
    body.pop();
  }

  return [`[data-ds-component="${pascalComponent}"] {`, ...body, `}`].join(
    '\n'
  );
}

/**
 * Infer the component className from the token file content or filename
 * We prefer the JSON `prefix` field; falls back to folder name in kebab/camel to match SCSS class convention used locally.
 */
function inferClassName(prefix, folderName) {
  if (prefix) return String(prefix);
  return folderName;
}

function findTokenJsonFiles(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  const results = [];
  for (const entry of items) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findTokenJsonFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.tokens.json')) {
      results.push(full);
    }
  }
  return results;
}

function run() {
  // Validate system tokens exist (not strictly required for ref mode)
  if (!fs.existsSync(SYSTEM_TOKENS_PATH)) {
    console.warn(
      '[tokens] Warning: ui/designTokens/designTokens.json not found. Proceeding with reference output.'
    );
  }

  let resolveFallback = null;
  if (fs.existsSync(GLOBAL_TOKENS_SCSS_PATH)) {
    resolveFallback = buildFallbackResolver(
      fs.readFileSync(GLOBAL_TOKENS_SCSS_PATH, 'utf8')
    );
  } else {
    console.warn(
      '[tokens] Warning: app/designTokens.scss not found — emitting without fallback literals. Run `npm run tokens:global` first.'
    );
  }
  const unresolvedRefs = [];

  const trackFallbacks = (prefix) => (cssVarName) => {
    const literal = resolveFallback ? resolveFallback(cssVarName) : null;
    if (literal === null) unresolvedRefs.push(`${prefix}: ${cssVarName}`);
    return literal;
  };

  const tokenFiles = findTokenJsonFiles(COMPONENTS_DIR);
  if (tokenFiles.length === 0) {
    console.log('[tokens] No component token files found.');
    return;
  }

  let generatedCount = 0;
  for (const filePath of tokenFiles) {
    try {
      const folder = path.dirname(filePath);
      const folderName = path.basename(folder);
      const raw = fs.readFileSync(filePath, 'utf8');
      const json = JSON.parse(raw);
      const prefix = json.prefix;
      const tokens = json.tokens || {};

      if (!prefix || !tokens || typeof tokens !== 'object') {
        console.warn(
          `[tokens] Skipping ${path.relative(projectRoot, filePath)} — missing prefix or tokens.`
        );
        continue;
      }

      const tokenData = flattenTokens(tokens, []);
      const pascalComponent = toPascalCase(prefix);
      const css = buildCssForComponent({
        cssVarPrefix: prefix,
        pascalComponent,
        tokenData,
        resolveFallback: trackFallbacks(prefix),
      });

      const filePrefix =
        pascalComponent === folderName ? folderName : capitalize(prefix);
      const outPath = path.join(folder, `${filePrefix}.tokens.css`);
      const banner = `/* AUTO-GENERATED: Do not edit directly.\n * Source: ${path.relative(projectRoot, filePath)}\n */\n`;
      fs.writeFileSync(outPath, banner + css + '\n', 'utf8');
      generatedCount += 1;
      console.log(`[tokens] Generated ${path.relative(projectRoot, outPath)}`);
    } catch (err) {
      console.error(`[tokens] Failed processing ${filePath}:`, err);
    }
  }

  if (unresolvedRefs.length > 0) {
    console.warn(
      `[tokens] Warning: ${unresolvedRefs.length} reference(s) had no resolvable default — emitted without fallback:`
    );
    for (const ref of unresolvedRefs.slice(0, 20)) {
      console.warn(`[tokens]   ${ref}`);
    }
    if (unresolvedRefs.length > 20) {
      console.warn(`[tokens]   … and ${unresolvedRefs.length - 20} more`);
    }
  }

  console.log(`[tokens] Completed. Generated ${generatedCount} file(s).`);
}

export {
  refToCssVar,
  tokenPathToCSSVar,
  buildFallbackResolver,
  buildCssForComponent,
  flattenTokens,
  cssVarNameFor,
  BOX_MODEL_SLOTS,
};

function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toPascalCase(str) {
  return String(str)
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => capitalize(part))
    .join('');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
