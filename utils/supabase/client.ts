import { createBrowserClient } from '@supabase/ssr';
import { env } from '@/utils/env';

/**
 * Creates a Supabase client for the browser.
 * @returns {SupabaseClient} A Supabase client instance.
 */
export const createClient = () =>
  createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
