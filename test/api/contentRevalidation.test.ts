import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Public content pages are cached for an hour (FEAT-220), so an author's write is
 * invisible until something invalidates the cache. These pin the two halves of
 * that contract:
 *
 *  - a successful write invalidates the routes the change can be seen on
 *  - a failed write invalidates nothing
 *
 * The second matters more than it looks. Revalidating after a rejected write
 * discards a good cache entry and re-renders from the database, so a validation
 * error becomes a way to force origin load.
 */

const revalidatePathMock = vi.hoisted(() => vi.fn());

vi.mock('next/cache', () => ({
  revalidatePath: revalidatePathMock,
  revalidateTag: vi.fn(),
}));

beforeEach(() => {
  revalidatePathMock.mockClear();
});

async function load() {
  return import('@/utils/supabase/revalidateContent');
}

describe('revalidatePublicArticlePaths', () => {
  it('invalidates the list and every article detail instance', async () => {
    const { revalidatePublicArticlePaths } = await load();

    revalidatePublicArticlePaths();

    const calls = revalidatePathMock.mock.calls;
    expect(calls).toContainEqual(['/articles']);
    // The 'page' form invalidates all instances of the dynamic route. Per-slug
    // invalidation is insufficient: the detail page derives prev/next links from
    // neighbouring published_at values, so publishing one article changes the
    // footer links on other already-cached articles.
    expect(calls).toContainEqual(['/articles/[slug]', 'page']);
  });

  it('does not invalidate unrelated routes', async () => {
    const { revalidatePublicArticlePaths } = await load();

    revalidatePublicArticlePaths();

    const flat = revalidatePathMock.mock.calls.flat();
    expect(flat).not.toContain('/');
    expect(flat).not.toContain('/work');
    expect(flat).not.toContain('/work/[slug]');
  });
});

describe('revalidatePublicCaseStudyPaths', () => {
  it('invalidates every case study detail instance', async () => {
    const { revalidatePublicCaseStudyPaths } = await load();

    revalidatePublicCaseStudyPaths();

    expect(revalidatePathMock.mock.calls).toContainEqual([
      '/work/[slug]',
      'page',
    ]);
  });

  it('does not invalidate /work, which reads no Supabase data', async () => {
    const { revalidatePublicCaseStudyPaths } = await load();

    revalidatePublicCaseStudyPaths();

    // app/work/page.tsx is static metadata plus a client component; invalidating
    // it would be churn with no possible effect.
    expect(revalidatePathMock.mock.calls.flat()).not.toContain('/work');
  });

  it('does not invalidate article routes', async () => {
    const { revalidatePublicCaseStudyPaths } = await load();

    revalidatePublicCaseStudyPaths();

    expect(revalidatePathMock.mock.calls.flat()).not.toContain('/articles');
  });
});

describe('failure isolation', () => {
  it('a revalidation error never propagates to the caller', async () => {
    const { revalidatePublicArticlePaths } = await load();
    revalidatePathMock.mockImplementationOnce(() => {
      throw new Error('cache backend unavailable');
    });

    // The write already committed by the time we revalidate. Throwing here would
    // turn a successful save into a 500 and invite the author to retry a write
    // that already landed.
    expect(() => revalidatePublicArticlePaths()).not.toThrow();
  });
});

/**
 * Which handlers invalidate, asserted at the call site rather than only on the
 * helper. Source-level because standing up the full Supabase/auth/schema mock
 * chain for four routes would test the mocks more than the routes; what matters is
 * a small, stable structural fact per handler.
 */
describe('write handlers wire revalidation correctly', () => {
  const routes = {
    articlesCollection: 'app/api/articles/route.ts',
    articlesItem: 'app/api/articles/[slug]/route.ts',
    caseStudiesCollection: 'app/api/case-studies/route.ts',
    caseStudiesItem: 'app/api/case-studies/[slug]/route.ts',
  } as const;

  async function readRoute(rel: string): Promise<string> {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    return readFileSync(join(process.cwd(), rel), 'utf8');
  }

  /** Strip comments so assertions are about executable code, not prose. */
  function stripComments(src: string): string {
    return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  }

  /**
   * Body of one exported handler, up to the next `export async function`.
   * Comments are removed first — the handlers carry doc comments that name the
   * revalidation helpers explicitly, and those must not count as call sites.
   */
  function handlerBody(rawSrc: string, method: string): string {
    const src = stripComments(rawSrc);
    const start = src.indexOf(`export async function ${method}(`);
    expect(start, `${method} handler not found`).toBeGreaterThan(-1);
    const rest = src.slice(start + 1);
    const next = rest.indexOf('export async function ');
    return next === -1 ? rest : rest.slice(0, next);
  }

  it('article POST, PUT and DELETE each invalidate', async () => {
    const collection = await readRoute(routes.articlesCollection);
    const item = await readRoute(routes.articlesItem);

    expect(handlerBody(collection, 'POST')).toContain(
      'revalidatePublicArticlePaths()'
    );
    for (const method of ['PUT', 'DELETE']) {
      expect(
        handlerBody(item, method),
        `${method} must invalidate: it can publish, unpublish or remove an article`
      ).toContain('revalidatePublicArticlePaths()');
    }
  });

  it('case study POST, PUT and DELETE each invalidate', async () => {
    const collection = await readRoute(routes.caseStudiesCollection);
    const item = await readRoute(routes.caseStudiesItem);

    expect(handlerBody(collection, 'POST')).toContain(
      'revalidatePublicCaseStudyPaths()'
    );
    for (const method of ['PUT', 'DELETE']) {
      expect(handlerBody(item, method)).toContain(
        'revalidatePublicCaseStudyPaths()'
      );
    }
  });

  it('PATCH does not invalidate — it only writes draft-only fields', async () => {
    // Autosave. Its schema admits only working* fields and is_dirty, so no public
    // page can change; invalidating here would evict the cache on every keystroke
    // batch. Pinned so the apparent omission is not "fixed" later.
    for (const rel of [routes.articlesItem, routes.caseStudiesItem]) {
      const body = handlerBody(await readRoute(rel), 'PATCH');
      expect(body).not.toMatch(/revalidatePublic\w+Paths\(\)/);
    }
  });

  it('GET handlers never invalidate', async () => {
    for (const rel of Object.values(routes)) {
      const src = await readRoute(rel);
      if (!src.includes('export async function GET(')) continue;
      expect(handlerBody(src, 'GET')).not.toMatch(
        /revalidatePublic\w+Paths\(\)/
      );
    }
  });

  it('invalidation always follows the error returns, never precedes them', async () => {
    // A revalidate placed before the error checks would fire on failed writes,
    // discarding a good cache entry and re-rendering from the database — turning a
    // rejected write into a way to force origin load.
    const item = await readRoute(routes.articlesItem);
    const put = handlerBody(item, 'PUT');

    const lastErrorReturn = Math.max(
      put.lastIndexOf('status: 500'),
      put.lastIndexOf('status: 404')
    );
    const revalidateAt = put.indexOf('revalidatePublicArticlePaths()');

    expect(revalidateAt).toBeGreaterThan(lastErrorReturn);
  });
});
