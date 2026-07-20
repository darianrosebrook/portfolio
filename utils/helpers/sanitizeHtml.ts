/**
 * Minimal HTML sanitizer for CMS TipTap output.
 *
 * Strips scriptable surfaces without adding a DOM dependency. TipTap HTML is
 * expected to be a constrained tag set; this is defense-in-depth at the render
 * boundary.
 */

/** Remove element + inner content for high-risk containers */
const FORBIDDEN_BLOCKS =
  /<(?:script|style|iframe|object|embed)\b[^>]*>[\s\S]*?<\/(?:script|style|iframe|object|embed)\s*>/gi;

/** Remove void / self-closing high-risk tags */
const FORBIDDEN_VOID_TAGS =
  /<\/?(?:link|meta|base|form|input|button|textarea|select)(?:\s[^>]*)?\/?>/gi;

const EVENT_HANDLER_ATTR = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;

const DANGEROUS_URL_ATTR =
  /(\s(?:href|src|xlink:href)\s*=\s*)(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*'|[^\s>]*javascript:[^\s>]*)/gi;

const DATA_SCRIPT_ATTR =
  /(\s(?:href|src)\s*=\s*)(?:"\s*data:text\/html[^"]*"|'\s*data:text\/html[^']*')/gi;

/**
 * Sanitize HTML produced from TipTap before injecting into the DOM.
 */
export function sanitizeCmsHtml(html: string): string {
  if (!html) {
    return '';
  }

  return html
    .replace(FORBIDDEN_BLOCKS, '')
    .replace(FORBIDDEN_VOID_TAGS, '')
    .replace(EVENT_HANDLER_ATTR, '')
    .replace(DANGEROUS_URL_ATTR, '$1"#"')
    .replace(DATA_SCRIPT_ATTR, '$1"#"');
}
