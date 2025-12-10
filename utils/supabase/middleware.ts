import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { env } from '../env';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Check if we have auth cookies (without making network calls)
  const allCookies = request.cookies.getAll();
  const supabaseCookies = allCookies.filter((c) => c.name.startsWith('sb-'));

  // Debug logging
  if (supabaseCookies.length > 0) {
    console.log('[Middleware] Found Supabase cookies:', {
      count: supabaseCookies.length,
      names: supabaseCookies.map((c) => c.name),
    });
  }

  // Check for actual auth token cookies (not just code-verifier)
  const hasAuthTokenCookies = supabaseCookies.some(
    (c) => c.name.includes('-auth-token') && !c.name.includes('code-verifier')
  );

  const supabase = createServerClient(
    env.nextPublicSupabaseUrl,
    env.nextPublicSupabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            // Ensure cookies are NOT httpOnly so browser client can read them
            supabaseResponse.cookies.set(name, value, {
              ...options,
              httpOnly: false,
            })
          );
        },
      },
    }
  );

  // Only protect /dashboard routes - skip network calls for other routes
  // This avoids Edge Runtime network issues on every request
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!hasAuthTokenCookies) {
      // No auth cookies, redirect to home
      console.log('[Middleware] No auth cookies, redirecting from dashboard');
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    // We have cookies - trust them and let the client validate
    // This avoids network issues in Edge Runtime
    console.log('[Middleware] Auth cookies present, allowing dashboard access');
  }

  // For non-protected routes, just pass through
  // The client-side will handle session validation
  return supabaseResponse;
}
