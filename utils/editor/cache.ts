/**
 * Next.js 15 Cache Configuration Utilities
 * Provides cache control headers and revalidation helpers
 */

import { revalidatePath } from 'next/cache';

/**
 * Cache control header values for different use cases
 */
export const CacheHeaders = {
  /**
   * For editor GET requests - short cache, stale-while-revalidate
   * Allows fast reads while ensuring fresh data
   */
  EDITOR_GET: 'private, max-age=60, stale-while-revalidate=300',

  /**
   * For mutation responses - no cache
   * Ensures mutations are never cached
   */
  MUTATION: 'no-cache, no-store, must-revalidate',

  /**
   * For public article/case study pages - longer cache
   * Published content changes less frequently
   */
  PUBLIC_CONTENT: 'public, max-age=300, stale-while-revalidate=3600',

  /**
   * For listing pages - moderate cache
   * Lists update more frequently than individual items
   */
  LIST: 'public, max-age=180, stale-while-revalidate=600',
} as const;

/**
 * Revalidates editor-related paths after mutations
 * Note: This must be called from a Server Action or Route Handler
 */
export function revalidateEditorPaths(
  entity: 'articles' | 'case-studies'
): void {
  const basePath = entity === 'articles' ? 'articles' : 'case-studies';

  // Revalidate editor pages
  revalidatePath(`/dashboard/${basePath}`, 'layout');
  revalidatePath(`/dashboard/${basePath}/[slug]`, 'page');

  // Revalidate public pages if published
  const publicPath = entity === 'articles' ? 'articles' : 'work';
  revalidatePath(`/${publicPath}/[slug]`, 'page');
  revalidatePath(`/${publicPath}`, 'page');
}

/**
 * Creates a NextResponse with appropriate cache headers
 */
export function createCachedResponse(
  data: unknown,
  status: number = 200,
  cacheHeader: string = CacheHeaders.EDITOR_GET
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': cacheHeader,
    },
  });
}

/**
 * Creates a mutation response with no-cache headers
 */
export function createMutationResponse(
  data: unknown,
  status: number = 200
): Response {
  return createCachedResponse(data, status, CacheHeaders.MUTATION);
}
