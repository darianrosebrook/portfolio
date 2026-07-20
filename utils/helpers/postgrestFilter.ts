/**
 * Sanitize untrusted strings before interpolating into PostgREST `.or()` /
 * filter expressions.
 *
 * PostgREST filter grammar treats `,` `.` `()` as structural. LIKE / ilike
 * also treats `%` `_` as wildcards. We strip structural metacharacters and
 * escape LIKE wildcards so user input cannot reshape the filter.
 */

const STRUCTURAL_METACHARS = /[,.()]/g;

/**
 * Returns a value safe to embed in an `ilike.%…%` PostgREST filter fragment.
 */
export function sanitizeIlikeQuery(raw: string): string {
  const withoutStructural = raw.replace(STRUCTURAL_METACHARS, ' ').trim();
  // Escape LIKE wildcards and backslashes for PostgREST
  return withoutStructural.replace(/\\/g, '\\\\').replace(/[%_]/g, '\\$&');
}
