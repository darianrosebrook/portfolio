import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import {
  AUTH_RETURN_TO_COOKIE,
  getSafeRedirectPath,
} from '@/utils/supabase/redirect';
import { getTrustedRedirectOrigin } from '@/utils/supabase/redirectOrigin';
import { getAuthErrorPath } from '@/app/auth/error-path';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = getSafeRedirectPath(searchParams.get('next'));
  const redirectOrigin = getTrustedRedirectOrigin(request);

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        const response = NextResponse.redirect(`${redirectOrigin}${next}`);
        response.cookies.set(AUTH_RETURN_TO_COOKIE, '', {
          path: '/',
          maxAge: 0,
        });
        return response;
      }
      console.error('[Auth Callback] Exchange failed:', error.message);
    } catch (err) {
      console.error(
        '[Auth Callback] Exchange failed:',
        err instanceof Error ? err.message : 'Unknown error'
      );
    }
  }

  return NextResponse.redirect(`${redirectOrigin}${getAuthErrorPath(next)}`);
}
