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

  // Check for actual auth token cookies (not just code-verifier)
  const hasAuthTokenCookies = supabaseCookies.some(
    (c) => c.name.includes('-auth-token') && !c.name.includes('code-verifier')
  );

  // Create supabase client for cookie management (not used directly but needed for cookie handlers)
  const _supabase = createServerClient(
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
  // Note: As of Next.js 16, proxy runs on Node.js runtime (not Edge)
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!hasAuthTokenCookies) {
      // No auth cookies, redirect to home
      console.log('[Proxy] No auth cookies, redirecting from dashboard');
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    // We have cookies - trust them and let the client validate
    console.log('[Proxy] Auth cookies present, allowing dashboard access');
  }

  // For non-protected routes, just pass through
  // The client-side will handle session validation
  return supabaseResponse;
}
