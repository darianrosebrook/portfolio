import { env } from '@/utils/env';

/**
 * Resolve a trusted redirect origin after OAuth code exchange.
 *
 * `NEXT_PUBLIC_SITE_URL`, when set, always wins — `x-forwarded-host` is never
 * trusted in that case, since it's an unauthenticated, spoofable request
 * header. Only the Vercel-preview-URL case falls back to checking
 * `x-forwarded-host` against that one allowlisted host (prevents open
 * redirects via header spoofing on preview deployments).
 */
export function getTrustedRedirectOrigin(request: Request): string {
  const { origin } = new URL(request.url);

  if (env.NEXT_PUBLIC_SITE_URL) {
    try {
      return new URL(env.NEXT_PUBLIC_SITE_URL).origin;
    } catch {
      // invalid site URL config — fall through to Vercel/forwarded-host handling
    }
  }

  if (env.NEXT_PUBLIC_VERCEL_URL) {
    const vercelHost = env.NEXT_PUBLIC_VERCEL_URL.replace(/^https?:\/\//, '');
    const vercelOrigin = `https://${vercelHost}`;
    const allowedHost = vercelHost.toLowerCase();

    const forwardedHost = request.headers.get('x-forwarded-host');
    if (forwardedHost) {
      const host = forwardedHost.split(',')[0]?.trim().toLowerCase();
      if (host === allowedHost) {
        return `https://${host}`;
      }
    }

    return vercelOrigin;
  }

  // Local / unset config: use the request origin only (ignore forwarded host)
  return origin;
}
