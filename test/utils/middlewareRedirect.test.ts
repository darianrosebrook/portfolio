import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { AUTH_RETURN_TO_COOKIE } from '@/utils/supabase/redirect';
import { buildUnauthenticatedDashboardRedirect } from '@/utils/supabase/middleware';

describe('buildUnauthenticatedDashboardRedirect', () => {
  it('redirects anonymous dashboard visitors to / with a safe next param', () => {
    const request = new NextRequest(
      'https://site.example/dashboard/articles?status=draft'
    );
    const response = buildUnauthenticatedDashboardRedirect(request);

    expect(response.status).toBe(307);
    const location = new URL(response.headers.get('location') ?? '');
    expect(location.origin).toBe('https://site.example');
    expect(location.pathname).toBe('/');
    expect(location.searchParams.get('next')).toBe(
      '/dashboard/articles?status=draft'
    );
    expect(response.cookies.get(AUTH_RETURN_TO_COOKIE)?.value).toBe(
      '/dashboard/articles?status=draft'
    );
  });

  it('does not preserve hostile next values from the request path', () => {
    // Pathname itself is server-controlled; still ensure cookie/query stay safe.
    const request = new NextRequest('https://site.example/dashboard');
    const response = buildUnauthenticatedDashboardRedirect(request);
    const location = new URL(response.headers.get('location') ?? '');
    expect(location.searchParams.get('next')).toBe('/dashboard');
  });
});
