import { env } from '@/utils/env';

/**
 * Resolve a trusted redirect origin after OAuth code exchange.
 *
 * Prefers configured site / Vercel URLs. Only trusts `x-forwarded-host` when
 * it matches an allowlisted host (prevents open redirects via header spoofing).
 */
export function getTrustedRedirectOrigin(request: Request): string {
  const { origin } = new URL(request.url);

  const configuredOrigins: string[] = [];

  if (env.NEXT_PUBLIC_SITE_URL) {
    try {
      configuredOrigins.push(new URL(env.NEXT_PUBLIC_SITE_URL).origin);
    } catch {
      // ignore invalid site URL
    }
  }

  if (env.NEXT_PUBLIC_VERCEL_URL) {
    const host = env.NEXT_PUBLIC_VERCEL_URL.replace(/^https?:\/\//, '');
    configuredOrigins.push(`https://${host}`);
  }

  const allowedHosts = new Set(
    configuredOrigins.map((o) => new URL(o).host.toLowerCase())
  );

  if (configuredOrigins.length > 0) {
    // Prefer explicit site URL when present
    if (env.NEXT_PUBLIC_SITE_URL) {
      try {
        return new URL(env.NEXT_PUBLIC_SITE_URL).origin;
      } catch {
        // fall through
      }
    }

    const forwardedHost = request.headers.get('x-forwarded-host');
    if (forwardedHost) {
      const host = forwardedHost.split(',')[0]?.trim().toLowerCase();
      if (host && allowedHosts.has(host)) {
        return `https://${host}`;
      }
    }

    return configuredOrigins[0];
  }

  // Local / unset config: use the request origin only (ignore forwarded host)
  return origin;
}
