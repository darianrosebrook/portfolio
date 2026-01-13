import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
// The client you created from the Server-Side Auth instructions
import { env } from '@/utils/env';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// Force Node.js runtime instead of Edge to avoid DNS resolution issues
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/';

  if (code) {
    try {
      const cookieStore = await cookies();

      // Create a supabase client that can set cookies on the response
      const supabase = createServerClient(
        env.nextPublicSupabaseUrl,
        env.nextPublicSupabaseAnonKey,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(
              cookiesToSet: {
                name: string;
                value: string;
                options: CookieOptions;
              }[]
            ) {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, {
                  ...options,
                  // Ensure cookies are accessible to browser JS
                  httpOnly: false,
                });
              });
            },
          },
        }
      );

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('[Auth Callback] Exchange error:', error.message);
      } else {
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
