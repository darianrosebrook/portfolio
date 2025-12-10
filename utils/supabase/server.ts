import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env } from '@/utils/env';

/**
 * Supabase client factory for server-side operations.
 *
 * Creates a Supabase client instance configured for server-side usage
 * with automatic cookie handling for authentication state. Uses environment
 * variables for URL and anonymous key configuration.
 *
 * @returns Promise resolving to Supabase client instance for server operations
 *
 * @example
 * ```typescript
 * // In a server component or API route
 * import { createClient } from '@/utils/supabase/server';
 *
 * const supabase = await createClient();
 * const { data: { user } } = await supabase.auth.getUser();
 * ```
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
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
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              // Ensure cookies are NOT httpOnly so browser client can read them
              cookieStore.set(name, value, {
                ...options,
                httpOnly: false,
              })
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
