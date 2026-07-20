import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getSafeRedirectPath } from '@/utils/supabase/redirect';
import { getTrustedRedirectOrigin } from '@/utils/supabase/redirectOrigin';

// Force Node.js runtime instead of Edge to avoid DNS resolution issues
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = getSafeRedirectPath(searchParams.get('next'));

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('[Auth Callback] Exchange error:', error.message);
      } else {
        const redirectOrigin = getTrustedRedirectOrigin(request);
        return NextResponse.redirect(`${redirectOrigin}${next}`);
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
