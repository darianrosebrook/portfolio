import { revalidatePath } from 'next/cache';

/**
 * Cache invalidation for the public content routes.
 *
 * `/articles`, `/articles/[slug]` and `/work/[slug]` are cached with an hourly
 * `revalidate` window (FEAT-220), so without an explicit invalidation an author's
 * change stays invisible for up to an hour. Call the matching helper after a write
 * has actually succeeded.
 *
 * Centralised so the path literals live in one place: a new write route that
 * forgets to invalidate serves stale content silently, and the fix is easier to
 * apply consistently when there is one function to call.
 */

/**
 * Swallow cache-layer failures. By the time these run the write has committed;
 * turning a cache miss into a 500 would tell the author their save failed and
 * invite them to repeat a write that already landed. Worst case the content is
 * stale until the revalidate window expires.
 */
function safeRevalidate(path: string, type?: 'page' | 'layout'): void {
  try {
    if (type) {
      revalidatePath(path, type);
    } else {
      revalidatePath(path);
    }
  } catch (error) {
    console.error(`revalidatePath failed for ${path}:`, error);
  }
}

/**
 * Invalidate the routes an article change can be seen on.
 *
 * Uses the `'page'` form for the detail route so every cached instance is
 * invalidated, not just the edited slug. That is required rather than cautious:
 * `app/articles/[slug]/page.tsx` derives its prev/next links from neighbouring
 * `published_at` values, so publishing or unpublishing one article changes the
 * footer links on other already-cached articles.
 */
export function revalidatePublicArticlePaths(): void {
  safeRevalidate('/articles');
  safeRevalidate('/articles/[slug]', 'page');
}

/**
 * Invalidate the routes a case-study change can be seen on.
 *
 * Only the detail route: `app/work/page.tsx` is static metadata plus a client
 * component and reads no Supabase data, so it has nothing to refresh.
 */
export function revalidatePublicCaseStudyPaths(): void {
  safeRevalidate('/work/[slug]', 'page');
}
