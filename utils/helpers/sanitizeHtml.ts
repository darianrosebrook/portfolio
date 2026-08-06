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

/** Matches href/src/xlink:href attributes so their value can be inspected as a whole. */
const URL_ATTR =
  /(\s(?:href|src|xlink:href)\s*=\s*)(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;

/**
 * Browsers ignore tab/newline/carriage-return characters when parsing a URL
 * scheme (e.g. `jav\tascript:` still runs as `javascript:`), so a naive
 * substring check for "javascript:" can be bypassed by injecting one of
 * these characters into the scheme. Strip them before the scheme check.
 */
function stripSchemeObfuscation(value: string): string {
  return value.replace(/[\t\n\r]+/g, '').trim();
}

function isDangerousUrl(value: string): boolean {
  const cleaned = stripSchemeObfuscation(value);
  return /^javascript:/i.test(cleaned) || /^data:text\/html/i.test(cleaned);
}

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
    .replace(URL_ATTR, (match, prefix, dq, sq, unquoted) => {
      const value = dq ?? sq ?? unquoted ?? '';
      return isDangerousUrl(value) ? `${prefix}"#"` : match;
    });
}
