import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';

import { createClient } from '../../../utils/supabase/server';
import { getSafeRedirectPath } from '../../../utils/supabase/redirect';
import { getTrustedRedirectOrigin } from '../../../utils/supabase/redirectOrigin';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = getSafeRedirectPath(searchParams.get('next'));
  const redirectOrigin = getTrustedRedirectOrigin(request);

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      // String concat pins the host; do not re-parse `next` with new URL().
      return NextResponse.redirect(`${redirectOrigin}${next}`);
    }
  }

  return NextResponse.redirect(`${redirectOrigin}/error`);
}
