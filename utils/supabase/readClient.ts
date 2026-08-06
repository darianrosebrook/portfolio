import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { env } from '@/utils/env';

/**
 * Cookieless Supabase client for public, cacheable reads.
 *
 * The cookie-based server client (`./server`) calls `next/headers` `cookies()`,
 * and that single call opts the entire route out of static rendering. This client
 * reads no cookies and carries no session, so pages using it can be prerendered
 * and served via ISR (`export const revalidate`).
 *
 * Use this ONLY for public, published content. It authenticates as the anon role
 * with the publishable key, so RLS applies: the content policies are
 * `status = 'published' OR auth.uid() = author`, and with no session
 * `auth.uid()` is null — the client can therefore only ever reach published rows.
 * That makes RLS a second, independent guard behind each query's explicit
 * `.eq('status', 'published')` filter.
 *
 * Never use the secret/service-role key here. That key bypasses RLS, and because
 * these reads are written into a shared cache, a single over-broad row would be
 * served to every visitor. Draft- or author-scoped reads must keep using the
 * cookie-based server client so the caller's own session governs the request.
 *
 * Deliberately not re-exported from `utils/supabase/index.ts`: keeping it off the
 * barrel makes it harder to reach for in an authenticated code path by accident.
 *
 * @returns A Supabase client bound to the publishable (anon) key, holding no
 *   session and refreshing no token.
 *
 * @example
 * ```typescript
 * import { createReadClient } from '@/utils/supabase/readClient';
 * import { PUBLIC_ARTICLE_SELECT } from '@/utils/supabase/contentAccess';
 *
 * const supabase = createReadClient();
 * const { data } = await supabase
 *   .from('articles')
 *   .select(PUBLIC_ARTICLE_SELECT)
 *   .eq('status', 'published');
 * ```
 */
export function createReadClient() {
  return createSupabaseClient(
    env.nextPublicSupabaseUrl,
    env.nextPublicSupabasePublishableKey,
    {
      auth: {
        // Nothing to persist or refresh — this client is stateless and always
        // operates as the anon role.
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export default createReadClient;
