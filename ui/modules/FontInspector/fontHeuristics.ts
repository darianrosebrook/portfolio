/**
 * Font-classification heuristics used by the inspector to derive
 * `DetectionContext` flags. Pure functions so they can be unit-tested
 * without spinning up the full inspector component or fontkit instance.
 */

/**
 * Names of bundled / recommended serif fonts whose `fullName` /
 * `familyName` string doesn't contain the substring "serif". Without this
 * allowlist, the inspector hides every serif toggle on these fonts even
 * though detection works.
 *
 * Match is by lowercase prefix because fontkit's `fullName` typically
 * includes weight / style / optical-size suffixes
 * (e.g. "Newsreader 16pt Regular"), making exact-string Set lookup
 * fragile.
 */
const KNOWN_SERIF_PREFIXES = ['newsreader', 'libre baskerville', 'lora'];

/**
 * Returns true when the given font name describes a serif typeface.
 *
 * Order of checks:
 *   1. Known-serif prefix allowlist (handles fonts whose name doesn't
 *      contain the literal substring "serif").
 *   2. Substring fallback: name contains "serif" AND NOT "sans" / "grotesk"
 *      (catches generic cases like "PT Serif", "Crimson Text Serif").
 *
 * The function lowercases internally, so callers can pass the raw
 * `fontInstance.fullName || fontInstance.familyName` directly.
 */
export function isSerifFont(fontName: string): boolean {
  const lc = fontName.toLowerCase();
  if (KNOWN_SERIF_PREFIXES.some((p) => lc.startsWith(p))) return true;
  return (
    lc.includes('serif') && !lc.includes('sans') && !lc.includes('grotesk')
  );
}
