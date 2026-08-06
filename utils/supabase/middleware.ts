import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { env } from '../env';
import { AUTH_RETURN_TO_COOKIE, getSafeRedirectPath } from './redirect';

export { AUTH_RETURN_TO_COOKIE };

/**
 * Builds the redirect for an anonymous visitor hitting a protected path.
 * Preserves a safe `next` query param and an httpOnly return-to cookie.
 */
export function buildUnauthenticatedDashboardRedirect(
  request: NextRequest
): NextResponse {
  const returnTo = getSafeRedirectPath(
    `${request.nextUrl.pathname}${request.nextUrl.search}`
  );
  const url = request.nextUrl.clone();
  url.pathname = '/';
  url.search = '';
  if (returnTo !== '/') {
    url.searchParams.set('next', returnTo);
  }

  const response = NextResponse.redirect(url);
  if (returnTo !== '/') {
    response.cookies.set(AUTH_RETURN_TO_COOKIE, returnTo, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: request.nextUrl.protocol === 'https:',
      maxAge: 60 * 10,
    });
  }
  return response;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Create supabase client that can read and write cookies
  const supabase = createServerClient(
    env.nextPublicSupabaseUrl,
    env.nextPublicSupabasePublishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: This call refreshes the session if needed and updates cookies.
  // Use verified claims for route protection; request cookies can be spoofed.
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  // Protect /dashboard routes — fail closed on claims verification errors.
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (claimsError || !claimsData?.claims?.sub) {
      return buildUnauthenticatedDashboardRedirect(request);
    }
  }

  return supabaseResponse;
}
