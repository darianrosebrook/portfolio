/**
 * Glyph feature hints for UI suggestions.
 *
 * These are UI suggestions, NOT expected anatomy truth.
 * Use for suggested ordering and defaults for a given glyph; current
 * geometry determines which features are present and available.
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
    { id: 'finial' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  b: [
    { id: 'bowl', defaultOn: true },
    { id: 'stem', defaultOn: true },
    { id: 'counter' },
    { id: 'spur' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  c: [
    { id: 'counter', defaultOn: true },
    { id: 'aperture', defaultOn: true },
    { id: 'finial' },
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
    { id: 'bowl' },
    { id: 'finial' },
  ],
  f: [
    { id: 'crossbar', defaultOn: true },
    { id: 'stem', defaultOn: true },
    { id: 'arm' },
    { id: 'finial' },
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
    { id: 'counter', defaultOn: true },
    { id: 'stem', defaultOn: true },
    { id: 'shoulder' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  n: [
    { id: 'counter', defaultOn: true },
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
    { id: 'arm' },
    { id: 'ear' },
    { id: 'finial' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  s: [
    { id: 'spine', defaultOn: true },
    { id: 'aperture' },
    { id: 'finial' },
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
    { id: 'counter', defaultOn: true },
    { id: 'aperture', defaultOn: true },
    { id: 'finial' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  D: [
    { id: 'bowl', defaultOn: true },
    { id: 'stem', defaultOn: true },
    { id: 'counter' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  E: [
    { id: 'counter', defaultOn: true },
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
    { id: 'counter', defaultOn: true },
    { id: 'aperture', defaultOn: true },
    { id: 'finial' },
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
    { id: 'finial' },
    { id: 'serif', gate: (ctx) => ctx.isSerif },
  ],
  T: [
    { id: 'arm', defaultOn: true },
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

const LIGATURE_COMPONENTS: Record<string, string[]> = {
  æ: ['a', 'e'],
  Æ: ['A', 'E'],
  œ: ['o', 'e'],
  Œ: ['O', 'E'],
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
  const decomposed = Array.from(char.normalize('NFKD'));
  const base = decomposed.find((part) => !/\p{Mark}/u.test(part)) ?? char;
  const components =
    LIGATURE_COMPONENTS[base] ??
    decomposed.filter((part) => !/\p{Mark}/u.test(part));
  const known = components.flatMap((part) => GLYPH_FEATURE_HINTS[part] ?? []);
  const hints =
    GLYPH_FEATURE_HINTS[char] ?? (known.length ? known : DEFAULT_HINTS);
  const hasAccent = decomposed.some((part) => /\p{Mark}/u.test(part));
  const suggested = hasAccent ? [...hints, { id: 'accent' as const }] : hints;
  const seen = new Set<FeatureID>();

  // Filter by gate functions
  return suggested
    .filter((hint) => {
      if (!hint.gate) return true;
      return hint.gate(ctx);
    })
    .filter((hint) => {
      if (seen.has(hint.id)) return false;
      seen.add(hint.id);
      return true;
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
