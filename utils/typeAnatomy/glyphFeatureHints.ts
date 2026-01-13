/**
 * Glyph feature hints for UI gating.
 *
 * These are UI suggestions, NOT expected anatomy truth.
 * Use for filtering which features to show in the UI for a given glyph,
 * but actual detection determines whether a feature is present.
 */

import type { DetectionContext, FeatureHint, FeatureID } from './types';

/**
 * UI hints for lowercase Latin letters.
 */
const LOWERCASE_HINTS: Record<string, FeatureHint[]> = {
  a: [
    { id: 'bowl', defaultOn: true },
    { id: 'counter', defaultOn: true },
    { id: 'stem' },
    { id: 'aperture' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  b: [
    { id: 'bowl', defaultOn: true },
    { id: 'stem', defaultOn: true },
    { id: 'counter' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  c: [
    { id: 'aperture', defaultOn: true },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  d: [
    { id: 'bowl', defaultOn: true },
    { id: 'stem', defaultOn: true },
    { id: 'counter' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  e: [
    { id: 'eye', defaultOn: true },
    { id: 'counter', defaultOn: true },
    { id: 'crossbar' },
    { id: 'aperture' },
  ],
  f: [
    { id: 'crossbar', defaultOn: true },
    { id: 'stem', defaultOn: true },
    { id: 'arm' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  g: [
    { id: 'bowl', defaultOn: true },
    { id: 'loop', defaultOn: true },
    { id: 'ear' },
    { id: 'tail' },
    { id: 'counter' },
  ],
  h: [
    { id: 'stem', defaultOn: true },
    { id: 'shoulder' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  i: [
    { id: 'tittle', defaultOn: true },
    { id: 'stem', defaultOn: true },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  j: [
    { id: 'tittle', defaultOn: true },
    { id: 'tail', defaultOn: true },
    { id: 'stem' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  k: [
    { id: 'stem', defaultOn: true },
    { id: 'arm' },
    { id: 'leg' },
    { id: 'crotch' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  l: [
    { id: 'stem', defaultOn: true },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  m: [
    { id: 'stem', defaultOn: true },
    { id: 'shoulder' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  n: [
    { id: 'stem', defaultOn: true },
    { id: 'shoulder' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  o: [
    { id: 'bowl', defaultOn: true },
    { id: 'counter', defaultOn: true },
  ],
  p: [
    { id: 'bowl', defaultOn: true },
    { id: 'stem', defaultOn: true },
    { id: 'tail' },
    { id: 'counter' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  q: [
    { id: 'bowl', defaultOn: true },
    { id: 'tail', defaultOn: true },
    { id: 'counter' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  r: [
    { id: 'stem', defaultOn: true },
    { id: 'ear' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  s: [
    { id: 'spine', defaultOn: true },
    { id: 'aperture' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  t: [
    { id: 'crossbar', defaultOn: true },
    { id: 'stem', defaultOn: true },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  u: [
    { id: 'stem', defaultOn: true },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  v: [
    { id: 'vertex', defaultOn: true },
    { id: 'stem' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  w: [
    { id: 'vertex', defaultOn: true },
    { id: 'stem' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  x: [
    { id: 'crotch', defaultOn: true },
    { id: 'stem' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  y: [
    { id: 'tail', defaultOn: true },
    { id: 'crotch' },
    { id: 'stem' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  z: [
    { id: 'arm' },
    { id: 'crossbar' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
};

/**
 * UI hints for uppercase Latin letters.
 */
const UPPERCASE_HINTS: Record<string, FeatureHint[]> = {
  A: [
    { id: 'apex', defaultOn: true },
    { id: 'crossbar', defaultOn: true },
    { id: 'stem' },
    { id: 'crotch' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  B: [
    { id: 'bowl', defaultOn: true },
    { id: 'stem', defaultOn: true },
    { id: 'counter' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  C: [
    { id: 'aperture', defaultOn: true },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  D: [
    { id: 'bowl', defaultOn: true },
    { id: 'stem', defaultOn: true },
    { id: 'counter' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  E: [
    { id: 'arm', defaultOn: true },
    { id: 'crossbar', defaultOn: true },
    { id: 'stem' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  F: [
    { id: 'arm', defaultOn: true },
    { id: 'crossbar', defaultOn: true },
    { id: 'stem' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  G: [
    { id: 'aperture', defaultOn: true },
    { id: 'spur' },
    { id: 'crossbar' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  H: [
    { id: 'crossbar', defaultOn: true },
    { id: 'stem', defaultOn: true },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  I: [
    { id: 'stem', defaultOn: true },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  J: [
    { id: 'stem', defaultOn: true },
    { id: 'tail' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  K: [
    { id: 'stem', defaultOn: true },
    { id: 'arm' },
    { id: 'leg' },
    { id: 'crotch' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  L: [
    { id: 'stem', defaultOn: true },
    { id: 'arm' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  M: [
    { id: 'apex', defaultOn: true },
    { id: 'stem', defaultOn: true },
    { id: 'crotch' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  N: [
    { id: 'apex', defaultOn: true },
    { id: 'stem', defaultOn: true },
    { id: 'crotch' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  O: [
    { id: 'bowl', defaultOn: true },
    { id: 'counter', defaultOn: true },
  ],
  P: [
    { id: 'bowl', defaultOn: true },
    { id: 'stem', defaultOn: true },
    { id: 'counter' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  Q: [
    { id: 'bowl', defaultOn: true },
    { id: 'tail', defaultOn: true },
    { id: 'counter' },
  ],
  R: [
    { id: 'bowl', defaultOn: true },
    { id: 'stem', defaultOn: true },
    { id: 'tail' },
    { id: 'counter' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  S: [
    { id: 'spine', defaultOn: true },
    { id: 'aperture' },
    { id: 'spur' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  T: [
    { id: 'crossbar', defaultOn: true },
    { id: 'stem', defaultOn: true },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  U: [
    { id: 'stem', defaultOn: true },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  V: [
    { id: 'vertex', defaultOn: true },
    { id: 'stem' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  W: [
    { id: 'vertex', defaultOn: true },
    { id: 'apex' },
    { id: 'stem' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  X: [
    { id: 'crotch', defaultOn: true },
    { id: 'stem' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  Y: [
    { id: 'crotch', defaultOn: true },
    { id: 'stem' },
    { id: 'tail' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  Z: [
    { id: 'arm' },
    { id: 'crossbar' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
};

/**
 * Combined hints for all characters.
 */
export const GLYPH_FEATURE_HINTS: Record<string, FeatureHint[]> = {
  ...LOWERCASE_HINTS,
  ...UPPERCASE_HINTS,
};

/**
 * Default hints to show for unknown glyphs.
 * Shows all major features without defaultOn.
 */
const DEFAULT_HINTS: FeatureHint[] = [
  { id: 'stem' },
  { id: 'bowl' },
  { id: 'counter' },
  { id: 'crossbar' },
  { id: 'apex' },
  { id: 'vertex' },
  { id: 'tail' },
  { id: 'tittle' },
  { id: 'serif', gate: (ctx) => ctx.isSerif },
];

/**
 * Gets feature hints for a character.
 *
 * @param char - The character to get hints for
 * @param ctx - Detection context for font-sensitive gates
 * @returns Array of applicable feature hints
 */
export function getFeatureHints(
  char: string,
  ctx: DetectionContext
): FeatureHint[] {
  const hints = GLYPH_FEATURE_HINTS[char] || DEFAULT_HINTS;

  // Filter by gate functions
  return hints.filter((hint) => {
    if (!hint.gate) return true;
    return hint.gate(ctx);
  });
}

/**
 * Gets feature IDs that should be shown by default for a character.
 *
 * @param char - The character
 * @param ctx - Detection context
 * @returns Array of feature IDs with defaultOn=true
 */
export function getDefaultFeatures(
  char: string,
  ctx: DetectionContext
): FeatureID[] {
  const hints = getFeatureHints(char, ctx);
  return hints.filter((h) => h.defaultOn).map((h) => h.id);
}

/**
 * Gets all possible feature IDs for a character.
 *
 * @param char - The character
 * @param ctx - Detection context
 * @returns Array of all applicable feature IDs
 */
export function getAllFeatures(
  char: string,
  ctx: DetectionContext
): FeatureID[] {
  const hints = getFeatureHints(char, ctx);
  return hints.map((h) => h.id);
}

/**
 * Checks if a feature is hinted for a character.
 *
 * @param char - The character
 * @param featureId - The feature ID to check
 * @param ctx - Detection context
 * @returns true if the feature is hinted
 */
export function isFeatureHinted(
  char: string,
  featureId: FeatureID,
  ctx: DetectionContext
): boolean {
  const hints = getFeatureHints(char, ctx);
  return hints.some((h) => h.id === featureId);
}
