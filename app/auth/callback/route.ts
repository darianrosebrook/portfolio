import { NextResponse } from 'next/server';
// The client you created from the Server-Side Auth instructions
import { env } from '@/utils/env';
import { createClient } from '@/utils/supabase/server';

// Force Node.js runtime instead of Edge to avoid DNS resolution issues
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/';

  if (code) {
    try {
      const supabase = await createClient();
      console.log('[Auth Callback] Exchanging code for session...');
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('[Auth Callback] Exchange error:', error.message);
      } else {
        console.log('[Auth Callback] Exchange successful, redirecting...');
        const forwardedHost = request.headers.get('x-forwarded-host'); // original origin before load balancer
        const isLocalEnv = env.nodeEnv === 'development';
        if (isLocalEnv) {
          // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
          return NextResponse.redirect(`${origin}${next}`);
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`);
        } else {
          return NextResponse.redirect(`${origin}${next}`);
        }
      }
    } catch (err) {
      console.error(
        '[Auth Callback] Network error:',
        err instanceof Error ? err.message : err
      );
    }
  } else {
    console.error('[Auth Callback] No code provided');
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
