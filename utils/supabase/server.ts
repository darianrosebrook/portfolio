import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env } from '@/utils/env';

/**
 * Creates a Supabase client for server-side operations.
 * @returns {Promise<SupabaseClient>} A promise that resolves to a Supabase client instance.
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
              cookieStore.set(name, value, options)
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
