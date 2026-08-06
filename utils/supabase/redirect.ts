/**
 * Cookie used to preserve deep links across OAuth when the login UI omits `next`.
 */
export const AUTH_RETURN_TO_COOKIE = 'auth_return_to';

/**
 * Returns a same-origin redirect path from an untrusted `next` value.
 *
 * Uses the WHATWG URL parser against a fixed base so backslash and
 * tab/CR/LF smuggling cannot produce an off-origin redirect when the
 * result is later resolved with `new URL(next, origin)` or concatenated.
 */
const REDIRECT_BASE = 'https://redirect.invalid';

export function getSafeRedirectPath(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return '/';
  }

  let url: URL;
  try {
    url = new URL(next, REDIRECT_BASE);
  } catch {
    return '/';
  }

  // Backslash / control-char smuggling changes the origin under WHATWG rules.
  if (url.origin !== REDIRECT_BASE) {
    return '/';
  }

  const path = `${url.pathname}${url.search}${url.hash}`;
  return path.startsWith('/') ? path : '/';
}
