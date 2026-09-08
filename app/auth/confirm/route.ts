import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import {
  AUTH_RETURN_TO_COOKIE,
  getSafeRedirectPath,
} from '@/utils/supabase/redirect';
import { getTrustedRedirectOrigin } from '@/utils/supabase/redirectOrigin';
import { getAuthErrorPath } from '@/app/auth/error-path';

const EMAIL_OTP_TYPES: ReadonlySet<string> = new Set<EmailOtpType>([
  'email',
  'signup',
  'invite',
  'magiclink',
  'recovery',
  'email_change',
]);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = getSafeRedirectPath(searchParams.get('next'));
  const redirectOrigin = getTrustedRedirectOrigin(request);

  if (token_hash && type && EMAIL_OTP_TYPES.has(type)) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.verifyOtp({
        type: type as EmailOtpType,
        token_hash,
      });
      if (!error) {
        const response = NextResponse.redirect(`${redirectOrigin}${next}`);
        response.cookies.set(AUTH_RETURN_TO_COOKIE, '', {
          path: '/',
          maxAge: 0,
        });
        return response;
      }
      console.error('[Auth Confirmation] Verification failed:', error.message);
    } catch (err) {
      console.error(
        '[Auth Confirmation] Verification failed:',
        err instanceof Error ? err.message : 'Unknown error'
      );
    }
  }

  return NextResponse.redirect(`${redirectOrigin}${getAuthErrorPath(next)}`);
}
