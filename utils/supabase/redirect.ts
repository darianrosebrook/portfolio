/**
 * Returns a same-origin redirect path from an untrusted `next` value.
 *
 * Allows local absolute paths such as `/dashboard?tab=articles` and rejects
 * protocol-relative or external URLs.
 */
export function getSafeRedirectPath(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return '/';
  }

  return next;
}
