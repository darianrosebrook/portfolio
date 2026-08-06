import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockEnv: {
  NEXT_PUBLIC_SITE_URL?: string;
  NEXT_PUBLIC_VERCEL_URL?: string;
} = {};

vi.mock('@/utils/env', () => ({
  get env() {
    return mockEnv;
  },
}));

async function getTrustedRedirectOrigin(request: Request) {
  const mod = await import('@/utils/supabase/redirectOrigin');
  return mod.getTrustedRedirectOrigin(request);
}

function makeRequest(url: string, forwardedHost?: string): Request {
  const headers = new Headers();
  if (forwardedHost) {
    headers.set('x-forwarded-host', forwardedHost);
  }
  return new Request(url, { headers });
}

describe('getTrustedRedirectOrigin', () => {
  beforeEach(() => {
    delete mockEnv.NEXT_PUBLIC_SITE_URL;
    delete mockEnv.NEXT_PUBLIC_VERCEL_URL;
  });

  it('prefers the configured site URL and ignores a spoofed x-forwarded-host', async () => {
    mockEnv.NEXT_PUBLIC_SITE_URL = 'https://darianrosebrook.com';
    const request = makeRequest(
      'https://internal.example.com/auth/callback',
      'evil.attacker.com'
    );
    expect(await getTrustedRedirectOrigin(request)).toBe(
      'https://darianrosebrook.com'
    );
  });

  it('trusts x-forwarded-host only when it matches the configured Vercel URL', async () => {
    mockEnv.NEXT_PUBLIC_VERCEL_URL = 'my-app-123.vercel.app';
    const request = makeRequest(
      'https://internal.example.com/auth/callback',
      'my-app-123.vercel.app'
    );
    expect(await getTrustedRedirectOrigin(request)).toBe(
      'https://my-app-123.vercel.app'
    );
  });

  it('falls back to the Vercel URL when x-forwarded-host is spoofed', async () => {
    mockEnv.NEXT_PUBLIC_VERCEL_URL = 'my-app-123.vercel.app';
    const request = makeRequest(
      'https://internal.example.com/auth/callback',
      'evil.attacker.com'
    );
    expect(await getTrustedRedirectOrigin(request)).toBe(
      'https://my-app-123.vercel.app'
    );
  });

  it('uses the request origin and ignores x-forwarded-host when nothing is configured', async () => {
    const request = makeRequest(
      'https://internal.example.com/auth/callback',
      'evil.attacker.com'
    );
    expect(await getTrustedRedirectOrigin(request)).toBe(
      'https://internal.example.com'
    );
  });
});
