/**
 * Supabase client factory for browser environment.
 *
 * Creates a Supabase client instance configured for browser-side usage
 * with server-side rendering (SSR) support. Uses environment variables
 * for URL and anonymous key configuration.
 *
 * @returns Supabase client instance for browser operations
 *
 * @example
 * ```typescript
 * import { createClient } from '@/utils/supabase/client';
 *
 * const supabase = createClient();
 * const { data, error } = await supabase.from('articles').select('*');
 * ```
 */
export const createClient = () =>
  createBrowserClient(env.nextPublicSupabaseUrl, env.nextPublicSupabaseAnonKey);
